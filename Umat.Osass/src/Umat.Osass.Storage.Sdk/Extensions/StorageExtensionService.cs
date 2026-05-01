using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umat.Osass.Storage.Sdk.Options;
using Umat.Osass.Storage.Sdk.Services.Implementations;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Storage.Sdk.Extensions
{
    public static class StorageExtensionService
    {
        public static IServiceCollection AddStorageService(this IServiceCollection services, IConfiguration configuration)
        {
            // Register GCP Storage services here
            services.Configure<StorageConfig>(configuration.GetSection(nameof(StorageConfig)));
            services.AddScoped<IStorageService, StorageService>();
            return services;
        }

    }
}