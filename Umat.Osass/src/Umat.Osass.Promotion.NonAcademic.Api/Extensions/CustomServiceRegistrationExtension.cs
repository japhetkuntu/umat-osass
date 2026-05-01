using Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

namespace Umat.Osass.Promotion.NonAcademic.Api.Extensions;

public static class CustomServiceRegistrationExtension
{
    public static IServiceCollection AddCustomServices(this IServiceCollection services)
    {
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<IPerformanceAtWorkService, PerformanceAtWorkService>();
        services.AddScoped<IKnowledgeProfessionService, KnowledgeProfessionService>();
        services.AddScoped<INonAcademicServiceCategoryService, NonAcademicServiceCategoryService>();
        services.AddScoped<IAssessmentService, AssessmentService>();
        services.AddScoped<IStaffUpdateService, StaffUpdateService>();
        return services;
    }
}
