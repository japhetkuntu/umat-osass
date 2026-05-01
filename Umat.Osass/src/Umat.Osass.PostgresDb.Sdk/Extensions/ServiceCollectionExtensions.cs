using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Repository.Implementation;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.PostgresDb.Sdk.Extensions;

public static class PostgresExtensionService
{
    private static IServiceCollection AddPostgresCore(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionName,
        Action<IServiceCollection> registerRepo)
    {
        services.AddScoped(typeof(IPgRepository<,>), typeof(PgRepository<,>));
      
        registerRepo(services);

        return services;
    }

    public static IServiceCollection AddIdentityPostgresSdk(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionName )
    {
        return services.AddPostgresCore(configuration, connectionName, s =>
        {
            var connectionString = configuration.GetConnectionString(connectionName);
            s.AddDbContext<IdentityDbContext>(options => options.UseNpgsql(connectionString, b =>
            {
               
                b.MigrationsHistoryTable("__EFMigrationsHistory", "identity"); 
            }));
            s.AddScoped(typeof(IIdentityPgRepository<>), typeof(IdentityPgRepository<>));
        });
    }
    
    public static IServiceCollection AddAcademicPromotionPostgresSdk(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionName )
    {
        return services.AddPostgresCore(configuration, connectionName, s =>
        {
            var connectionString = configuration.GetConnectionString(connectionName);
            s.AddDbContext<AcademicPromotionDbContext>(options => options.UseNpgsql(connectionString, b =>
            {
               
                b.MigrationsHistoryTable("__EFMigrationsHistory", "academicPromotion"); 
            }));
            s.AddScoped(typeof(IAcademicPromotionPgRepository<>), typeof(AcademicPromotionPgRepository<>));
        });
    }

    public static IServiceCollection AddNonAcademicPromotionPostgresSdk(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionName)
    {
        return services.AddPostgresCore(configuration, connectionName, s =>
        {
            var connectionString = configuration.GetConnectionString(connectionName);
            s.AddDbContext<NonAcademicPromotionDbContext>(options => options.UseNpgsql(connectionString, b =>
            {
                b.MigrationsHistoryTable("__EFMigrationsHistory", "nonAcademicPromotion");
            }));
            s.AddScoped(typeof(INonAcademicPromotionPgRepository<>), typeof(NonAcademicPromotionPgRepository<>));
        });
    }
}
