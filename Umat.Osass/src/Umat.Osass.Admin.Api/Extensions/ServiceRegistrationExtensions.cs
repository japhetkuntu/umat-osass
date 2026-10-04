using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Akka.Actor;
using Akka.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.IdentityModel.Tokens;
using Umat.Osass.Admin.Api.Actors;
using Umat.Osass.Admin.Api.Options;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Common.Sdk.Options;

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
        if (string.IsNullOrWhiteSpace(bearerConfig.AdminSigningKey) ||
            bearerConfig.AdminSigningKey == bearerConfig.ApplicantSigningKey ||
            bearerConfig.AdminSigningKey == bearerConfig.SigningKey)
            throw new InvalidOperationException("Admin authentication requires a distinct signing key");

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
                    RoleClaimType = ClaimTypes.Role,
                    NameClaimType = ClaimTypes.Name,
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
}
