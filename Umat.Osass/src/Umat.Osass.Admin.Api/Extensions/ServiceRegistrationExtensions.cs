using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Akka.Actor;
using Akka.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Umat.Osass.Admin.Api.Actors;
using Umat.Osass.Admin.Api.Options;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Common.Sdk.Options;
using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

namespace Umat.Osass.Admin.Api.Extensions;

public static class ServiceRegistrationExtensions
{
      public static IServiceCollection AddBearerAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        Action<BearerTokenConfig> bearerTokenConfigAction = bearerTokenConfig =>
            configuration.GetSection(nameof(BearerTokenConfig)).Bind(bearerTokenConfig);
        var bearerConfig = new BearerTokenConfig();
        bearerTokenConfigAction.Invoke(bearerConfig);

        services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = bearerConfig.Issuer,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKeys = new List<SecurityKey>()
                    {
                        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(bearerConfig.AdminSigningKey))
                    },
                    ValidAudience = bearerConfig.Audience,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    RequireExpirationTime = true
                };
            });
        return services;
    }
     
 public static IServiceCollection AddActorSystem(
        this IServiceCollection services,
        Action<ActorConfig> configure)
    {
        services.Configure(configure);
        var actorConfig = new ActorConfig();
        configure.Invoke(actorConfig);

        var actorSystemName = Regex.Replace(Assembly.GetExecutingAssembly().GetName().Name ?? "ActorSystemName",
            @"[^a-zA-Z\s]+", "");

        services.AddSingleton(sp =>
        {
            var actorSystemSetup = BootstrapSetup
                .Create()
                .And(DependencyResolverSetup
                    .Create(sp));

            var actorSystem = ActorSystem
                .Create(actorSystemName, actorSystemSetup);

            TopLevelActors.RegisterActor<MainActor>(actorSystem);

            //TopLevelActors.RegisterActorWithRouter<SendCallbackActor>(
            //    actorSystem,
            //    actorConfig.SendCallbackActorConfig.NumberOfInstances,
            //    actorConfig.SendCallbackActorConfig.UpperBound);

            return actorSystem;
        });

        return services;
    }

        public static IServiceCollection AddApiVersioning(this IServiceCollection services, int version)
    {
        services.AddApiVersioning(opt =>
        {
            opt.DefaultApiVersion = new ApiVersion(version, 0);
            opt.AssumeDefaultVersionWhenUnspecified = true;
            opt.ReportApiVersions = true;
            opt.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("x-api-version"),
                new MediaTypeApiVersionReader("x-api-version"));
        });

        services.AddVersionedApiExplorer(setup =>
        {
            setup.GroupNameFormat = "'v'VVV";
            setup.SubstituteApiVersionInUrl = true;
        });

        return services;
    }
        public static IServiceCollection AddControllers(this IServiceCollection services)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddControllers(options =>
            {
                options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.WriteIndented = true;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = InvalidModelStateHandler;
            });

        static IActionResult InvalidModelStateHandler(ActionContext context)
        {
            return new BadRequestObjectResult(new ApiResponse<object>(
                Message: "Validation Errors",
                Code: 400,
                Errors: context.ModelState
                    .Where(modelError => modelError.Value?.Errors?.Count > 0)
                    .Select(modelError => new ErrorResponse(
                        Field: modelError.Key,
                        ErrorMessage: modelError.Value?.Errors?.FirstOrDefault()?.ErrorMessage ?? "Invalid Request"))));
        }

        return services;
    }
        
    public static async Task ApplyMigrations(IServiceProvider serviceProvider)
    {
        int maxRetries = 10;
        int delayMs = 5000; // Start with 5 seconds
        int maxDelayMs = 60000; // Cap at 60 seconds

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var identityDb = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
                await identityDb.Database.MigrateAsync();
                var academicDb = scope.ServiceProvider.GetRequiredService<AcademicPromotionDbContext>();
                await academicDb.Database.MigrateAsync();
                var nonAcademicDb = scope.ServiceProvider.GetRequiredService<NonAcademicPromotionDbContext>();
                await nonAcademicDb.Database.MigrateAsync();
                Console.WriteLine("✅ Migrations applied successfully.");
                return; // Success, exit
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️  Migration attempt {attempt}/{maxRetries} failed: {ex.Message}");
                
                if (attempt == maxRetries)
                {
                    Console.WriteLine($"❌ Failed to apply migrations after {maxRetries} attempts.");
                    throw;
                }

                // Wait before retrying with exponential backoff
                await Task.Delay(delayMs);
                delayMs = Math.Min(delayMs * 2, maxDelayMs); // Double delay, max 60s
            }
        }
    }

}