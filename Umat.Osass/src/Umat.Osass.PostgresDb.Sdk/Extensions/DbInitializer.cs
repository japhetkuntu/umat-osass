using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;

namespace Umat.Osass.PostgresDb.Sdk.Extensions;

public static class DbInitializer
{
    public static Task SeedAdminUsers(IdentityDbContext context)
    {
        var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
        return SeedAdminUsers(context, configuration);
    }

    public static async Task SeedAdminUsers(IdentityDbContext context, IConfiguration configuration)
    {
        if (await context.Admins.AnyAsync())
            return;

        await context.Admins.AddAsync(CreateBootstrapAdmin(configuration));
        await context.SaveChangesAsync();
    }

    public static Admin CreateBootstrapAdmin(IConfiguration configuration)
    {
        var email = configuration["BootstrapAdmin:Email"];
        var password = configuration["BootstrapAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) ||
            !System.Net.Mail.MailAddress.TryCreate(email, out var address) || address.Address != email ||
            string.IsNullOrWhiteSpace(password) || password.Length < 16 ||
            System.Text.Encoding.UTF8.GetByteCount(password) > 72)
        {
            throw new InvalidOperationException(
                "An empty admin database requires BootstrapAdmin:Email and BootstrapAdmin:Password " +
                "(at least 16 characters, at most 72 UTF-8 bytes). Configure these explicitly before startup.");
        }

        return new Admin
        {
            CreatedBy = "system",
            FirstName = "Bootstrap",
            LastName = "Administrator",
            Email = email,
            Role = "SuperAdmin",
            Password = BCrypt.Net.BCrypt.HashPassword(password)
        };
    }
}
