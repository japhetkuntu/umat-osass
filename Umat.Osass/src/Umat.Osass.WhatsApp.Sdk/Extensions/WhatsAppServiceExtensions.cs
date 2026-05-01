using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umat.Osass.WhatsApp.Sdk.Options;
using Umat.Osass.WhatsApp.Sdk.Services.Implementations;
using Umat.Osass.WhatsApp.Sdk.Services.Interfaces;

namespace Umat.Osass.WhatsApp.Sdk.Extensions;

public static class WhatsAppServiceExtensions
{
    public static IServiceCollection AddWhatsAppApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<WhatsAppConfig>(configuration.GetSection(nameof(WhatsAppConfig)));
        services.AddScoped<IWhatsAppService, WhatsAppService>();
        return services;
    }
}