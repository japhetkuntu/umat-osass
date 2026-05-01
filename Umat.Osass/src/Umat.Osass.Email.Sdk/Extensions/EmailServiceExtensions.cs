using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Umat.Osass.Email.Sdk.Options;
using Umat.Osass.Email.Sdk.Services.Implementations;
using Umat.Osass.Email.Sdk.Services.Interfaces;


namespace Umat.Osass.Email.Sdk.Extensions;

public static class EmailServiceExtensions
{
    public static IServiceCollection AddEmailServiceProvider(
        this IServiceCollection services, IConfiguration configuration)
    {
        var config = new EmailConfig();

        if (configuration.GetSection(nameof(EmailConfig)).Exists())
        {
            configuration.GetSection(nameof(EmailConfig)).Bind(config);
        }
        else if (configuration.GetSection("MailtrapConfig").Exists())
        {
            configuration.GetSection("MailtrapConfig").Bind(config);
        }

        services.AddSingleton(config);
        services.AddSingleton<IOptions<EmailConfig>>(Microsoft.Extensions.Options.Options.Create(config));
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailNotificationService, EmailNotificationService>();

        return services;
    }
}