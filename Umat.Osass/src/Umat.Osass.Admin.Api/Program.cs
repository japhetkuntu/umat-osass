using Mapster;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Options;
using Umat.Osass.Common.Sdk.Options;
using Umat.Osass.Email.Sdk.Extensions;
using Umat.Osass.PostgresDb.Sdk.Extensions;
using Umat.Osass.Storage.Sdk.Extensions;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var services = builder.Services;
const string corsPolicyName = "OsassCors";

config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Host.UseSerilog((context, loggerConfiguration) => loggerConfiguration
    .ReadFrom.Configuration(context.Configuration)
    .WriteTo.Console());

//SDK services registrations
services.AddIdentityPostgresSdk(config, "IdentityConnection");
services.AddAcademicPromotionPostgresSdk(config, "AcademicConnection");
services.AddNonAcademicPromotionPostgresSdk(config, "NonAcademicConnection");
services.AddEmailServiceProvider(config);
services.AddStorageService(config);

//config registration
services.Configure<BearerTokenConfig>(config.GetSection(nameof(BearerTokenConfig)));
services.Configure<ExtraConfig>(config.GetSection(nameof(ExtraConfig)));

//register custom services
services.AddCustomServices();

//Add custom validaiton
services.AddInputModelValidation();

services.AddMapster();
services.AddBearerAuth(config);

var swaggerEnabled = config.GetValue("Swagger:Enabled", builder.Environment.IsDevelopment());
services.AddEndpointsApiExplorer();
if (swaggerEnabled) services.AddSwaggerGen();
services.AddHealthChecks();

var allowedOrigins = (config["Cors:AllowedOrigins"] ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
services.AddCors(options => options.AddPolicy(corsPolicyName, policy =>
{
    if (allowedOrigins.Length > 0)
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    else
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

services.AddHttpClient();
ServiceRegistrationExtensions.AddControllers(services);
services.AddApiVersioning(1);
services.AddActorSystem(c => config.GetSection(nameof(ActorConfig)).Bind(c));

var app = builder.Build();

if (allowedOrigins.Length == 0)
    app.Logger.LogWarning("Cors:AllowedOrigins is not configured; allowing requests from any origin");

app.UseForwardedHeaders();

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseActorSystem();

app.UseExceptionHandler(app.Environment.IsDevelopment());

app.UseRouting();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<Umat.Osass.Admin.Api.Middlewares.AuditLogMiddleware>();

app.UseHttpsRedirection();
app.MapControllers();
app.MapHealthChecks("/health");

await app.RunAsync();
