
using Umat.Osass.Admin.Api.Services.Interfaces.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.NonAcademic;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;
using Umat.Osass.Admin.Api.Services.Providers.Academic;
using Umat.Osass.Admin.Api.Services.Providers.NonAcademic;
using Umat.Osass.Admin.Api.Services.Providers.Shared;
using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.Admin.Api.Extensions;

public static class CustomServiceRegistrationExtension
{
    public static IServiceCollection AddCustomServices(this IServiceCollection services)
    {
        
            services.AddScoped<ISchoolService, SchoolService>();
            services.AddScoped<IFacultyService, FacultyService>();
            services.AddScoped<IDepartmentService, DepartmentService>();
            services.AddScoped<IServicePositionService, ServicePositionService>();
            services.AddScoped<IPublicationIndicatorService, PublicationIndicatorService>();
            services.AddScoped<IKnowledgeMaterialIndicatorService, KnowledgeMaterialIndicatorService>();
            services.AddScoped<IAcademicPositionService, AcademicPositionService>();
            services.AddScoped<IStaffService, StaffService>();
            services.AddScoped<ICommitteeService, CommitteeService>();
            services.AddScoped<IStaffUpdateService, StaffUpdateService>();
            services.AddScoped<INonAcademicPositionService, NonAcademicPositionService>();
            services.AddScoped<INonAcademicCommitteeService, NonAcademicCommitteeService>();
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AdminPolicyTypes.SuperAdminOnly, policy =>
                policy.RequireRole(AdminRoles.SuperAdmin));
        
            options.AddPolicy(AdminPolicyTypes.AdminOrHigher, policy =>
                policy.RequireRole(AdminRoles.SuperAdmin, AdminRoles.Admin));
        
            options.AddPolicy(AdminPolicyTypes.ModeratorOrHigher, policy =>
                policy.RequireRole(AdminRoles.SuperAdmin, AdminRoles.Admin, AdminRoles.Moderator));
        });
        return services;
    }
}