using System.Security.Cryptography;
using System.Text;
using StackExchange.Redis;

namespace Umat.Osass.Identity.Api.Extensions;

public static class AccountAttemptGuard
{
    public static async Task<bool> AllowAsync(IDatabase database, string scope, string email, int limit, int seconds)
    {
        var identity = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(email.Trim().ToLowerInvariant())));
        var count = (long)await database.ScriptEvaluateAsync(
            "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return count",
            new RedisKey[] { $"account-rate:{scope}:{identity}" }, new RedisValue[] { seconds });
        return count <= limit;
    }
}
