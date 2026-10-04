using StackExchange.Redis;
using Umat.Osass.Identity.Api.Extensions;

namespace Umat.Osass.Tests;

public class AccountAttemptGuardTests
{
    [Fact]
    public async Task ConcurrentAttemptsShareAnAccountLimitAcrossAddressVariations()
    {
        using var connection = await ConnectionMultiplexer.ConnectAsync("127.0.0.1:16389,abortConnect=true");
        var database = connection.GetDatabase();
        var scope = $"osass-test:{Guid.NewGuid():N}";
        var email = "test@example.invalid";
        var identity = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(email)));
        var key = $"account-rate:{scope}:{identity}";
        try
        {
            var results = await Task.WhenAll(Enumerable.Range(0, 20).Select(attempt =>
                AccountAttemptGuard.AllowAsync(database, scope,
                    attempt % 2 == 0 ? email : " TEST@EXAMPLE.INVALID ", 10, 60)));
            Assert.Equal(10, results.Count(allowed => allowed));
            Assert.False(await AccountAttemptGuard.AllowAsync(database, scope, email, 10, 60));
            var remaining = await database.KeyTimeToLiveAsync(key);
            Assert.NotNull(remaining);
            Assert.InRange(remaining.Value.TotalSeconds, 50, 60);
        }
        finally
        {
            await database.KeyDeleteAsync(key);
        }
    }
}
