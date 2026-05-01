using FluentValidation.AspNetCore;


namespace Umat.Osass.Admin.Api.Extensions;

public static class ModelInputValidationExtensions
{
    public static IServiceCollection AddInputModelValidation(this IServiceCollection services)
    {
        services.AddFluentValidationAutoValidation();
        services.AddFluentValidationClientsideAdapters();
 
        return services;
    }
}