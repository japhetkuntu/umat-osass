using System.Security.Cryptography;
using System.Text;
using StackExchange.Redis;
using Umat.Osass.Identity.Api.Options;
using Umat.Osass.Redis.Sdk.Services;

namespace Umat.Osass.Identity.Api.Extensions;

public class AuthenticationThrottleMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IRedisService<IdentityRedisConfig> redis, IConfiguration configuration)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        if (HttpMethods.IsOptions(context.Request.Method) ||
            (!path.Contains("/login") && !path.Contains("/reset-password") &&
            !path.Contains("/register")))
        {
            await next(context);
            return;
        }

        var address = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var identity = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(address)));
        var key = $"auth-rate:{identity}";
        try
        {
            var attempts = (long)await redis.Database.ScriptEvaluateAsync(
                "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end; return count",
                new RedisKey[] { key });
            if (attempts > configuration.GetValue("AuthSecurity:IpAttemptsPerMinute", 100))
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.Headers.RetryAfter = "60";
                await context.Response.WriteAsJsonAsync(new { message = "Too many attempts. Please try again later." });
                return;
            }
        }
        catch (RedisException)
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            return;
        }

        await next(context);
    }
}
