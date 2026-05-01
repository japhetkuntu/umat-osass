using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umat.Osass.Redis.Sdk.Models;
using Umat.Osass.Redis.Sdk.Services;

namespace Umat.Osass.Redis.Sdk.Extensions
{
    public static class RedisExtensionService
    {
        // ServiceCollectionExtensions.cs

        public static IServiceCollection AddRedisDatabase<TConfig>(
            this IServiceCollection services,
            IConfiguration configuration)
            where TConfig : class, IRedisDatabaseConfig
        {
            // Bind configuration
            services.Configure<TConfig>(configuration.GetSection($"Redis:{typeof(TConfig).Name}"));

            // Register the service
            services.AddSingleton<IRedisService<TConfig>, RedisService<TConfig>>();

            return services;
        }
    }

}