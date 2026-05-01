using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Services.Providers;

namespace Umat.Osass.Promotion.Academic.Api.Extensions;

public static class CustomServiceRegistrationExtension
{
    public static IServiceCollection AddCustomServices(this IServiceCollection services)
    {
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<ITeachingCategoryService, TeachingCategoryService>();
        services.AddScoped<IPublicationCategoryService, PublicationCategoryService>();
        services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
        services.AddScoped<IAssessmentService, AssessmentService>();
        services.AddScoped<IStaffUpdateService, StaffUpdateService>();
        return services;
    }
}