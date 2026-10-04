using StackExchange.Redis;
using Umat.Osass.Identity.Api.Extensions;

namespace Umat.Osass.Tests;

public class ResetAttemptGuardTests
{
    [Fact]
    public async Task SuccessfulChallengeCanBeConsumedOnlyOnceUnderConcurrency()
    {
        using var connection = await ConnectionMultiplexer.ConnectAsync("127.0.0.1:16389,abortConnect=true");
        var database = connection.GetDatabase();
        var key = $"osass-test:reset:{Guid.NewGuid():N}";
        try
        {
            await database.StringSetAsync(key, "{\"Otp\":\"123456\"}", TimeSpan.FromMinutes(1));
            var results = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ =>
                ResetAttemptGuard.ConsumeAsync<Challenge>(database, key, "123456", "Otp")));
            Assert.Single(results.Where(result => result != null));
            Assert.False(await database.KeyExistsAsync(key));
            Assert.Null(await ResetAttemptGuard.ConsumeAsync<Challenge>(database, key, "123456", "Otp"));
        }
        finally
        {
            await database.KeyDeleteAsync(new RedisKey[] { key, $"{key}:attempts" });
        }
    }

    [Fact]
    public async Task FiveWrongAttemptsInvalidateChallengeAndCounterExpires()
    {
        using var connection = await ConnectionMultiplexer.ConnectAsync("127.0.0.1:16389,abortConnect=true");
        var database = connection.GetDatabase();
        var key = $"osass-test:reset:{Guid.NewGuid():N}";
        try
        {
            await database.StringSetAsync(key, "{\"Otp\":\"123456\"}", TimeSpan.FromMinutes(1));
            for (var attempt = 1; attempt <= 5; attempt++)
            {
                Assert.Null(await ResetAttemptGuard.ConsumeAsync<Challenge>(database, key, "wrong", "Otp"));
                Assert.Equal(attempt < 5, await database.KeyExistsAsync(key));
            }
            Assert.Equal(5, (int)await database.StringGetAsync($"{key}:attempts"));
            var ttl = await database.KeyTimeToLiveAsync($"{key}:attempts");
            Assert.NotNull(ttl);
            Assert.InRange(ttl.Value.TotalSeconds, 1700, 1800);
            Assert.Null(await ResetAttemptGuard.ConsumeAsync<Challenge>(database, key, "123456", "Otp"));
        }
        finally
        {
            await database.KeyDeleteAsync(new RedisKey[] { key, $"{key}:attempts" });
        }
    }

    public sealed class Challenge
    {
        public string? Otp { get; set; }
    }
}
