using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Umat.Osass.PostgresDb.Sdk.Extensions;

public static class DatabaseMigration
{
    private const long LockKey = 571599066418877;

    public static async Task MigrateAsync(DbContext context, Func<Task>? seed = null,
        CancellationToken cancellationToken = default)
    {
        var connectionString = context.Database.GetConnectionString()
            ?? throw new InvalidOperationException("A PostgreSQL connection is required for migrations.");
        var builder = new NpgsqlConnectionStringBuilder(connectionString) { Pooling = false };
        await using var lockConnection = new NpgsqlConnection(builder.ConnectionString);
        await lockConnection.OpenAsync(cancellationToken);
        await using var acquire = new NpgsqlCommand("SELECT pg_advisory_lock(@key)", lockConnection);
        acquire.Parameters.AddWithValue("key", LockKey);
        acquire.CommandTimeout = 300;
        await acquire.ExecuteNonQueryAsync(cancellationToken);
        try
        {
            await context.Database.MigrateAsync(cancellationToken);
            if (seed != null)
                await seed();
        }
        finally
        {
            await using var release = new NpgsqlCommand("SELECT pg_advisory_unlock(@key)", lockConnection);
            release.Parameters.AddWithValue("key", LockKey);
            await release.ExecuteNonQueryAsync(CancellationToken.None);
        }
    }
}
