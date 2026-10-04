using StackExchange.Redis;
using System.Text.Json;

namespace Umat.Osass.Identity.Api.Extensions;

public static class ResetAttemptGuard
{
    public static async Task<T?> ConsumeAsync<T>(IDatabase database, string challengeKey, string otp, string otpProperty)
    {
        var result = await database.ScriptEvaluateAsync(
            "local value = redis.call('GET', KEYS[2]); if not value then return nil end; local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], 1800) end; if count > 5 then redis.call('DEL', KEYS[2]); return nil end; local data = cjson.decode(value); if data[ARGV[2]] ~= ARGV[1] then if count == 5 then redis.call('DEL', KEYS[2]) end; return nil end; redis.call('DEL', KEYS[2]); return value",
            new RedisKey[] { $"{challengeKey}:attempts", challengeKey },
            new RedisValue[] { otp, otpProperty });
        return result.IsNull ? default : JsonSerializer.Deserialize<T>((string)result!);
    }
}
