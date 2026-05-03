using Mapster;
using Microsoft.AspNetCore.HttpLogging;
using Serilog;
using Umat.Osass.Common.Sdk.Options;
using Umat.Osass.Email.Sdk.Extensions;
using Umat.Osass.PostgresDb.Sdk.Extensions;
using Umat.Osass.Promotion.NonAcademic.Api.Extensions;
using Umat.Osass.Promotion.NonAcademic.Api.Options;
using Umat.Osass.Redis.Sdk.Extensions;
using Umat.Osass.Storage.Sdk.Extensions;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var services = builder.Services;
var corsPolicyName = "Osass.NonAcademic.PolicyName";

// Load the common configuration file for all environments
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// SDK services registrations
builder.Services.AddNonAcademicPromotionPostgresSdk(builder.Configuration, "NonAcademicConnection");
builder.Services.AddIdentityPostgresSdk(builder.Configuration, "IdentityConnection");
builder.Services.AddEmailServiceProvider(builder.Configuration);
builder.Services.AddStorageService(builder.Configuration);
services.AddRedisDatabase<PromotionRedisConfig>(builder.Configuration);

// config registration
services.Configure<BearerTokenConfig>(config.GetSection(nameof(BearerTokenConfig)));
services.Configure<ExtraConfig>(config.GetSection(nameof(ExtraConfig)));

// register custom services
services.AddCustomServices();

// Add logger service to the container.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("/logs/app-log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddMapster();
builder.Services.AddBearerAuth(config);

services.AddEndpointsApiExplorer();
services.AddSwaggerGen();
services.AddHealthChecks();
services.AddCors(options => options
    .AddPolicy(corsPolicyName, policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod()));

services.AddHttpClient();
ServiceRegistrationExtensions.AddControllers(services);

services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.All;
    options.RequestBodyLogLimit = 4096;
    options.ResponseBodyLogLimit = 4096;
});
services.AddApiVersioning(1);

services.AddActorSystem(c => config.GetSection(nameof(ActorConfig)).Bind(c));

var app = builder.Build();
await ServiceRegistrationExtensions.ApplyMigrations(app.Services);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();
app.UseSwagger();
app.UseSwaggerUI();

app.UseActorSystem();

app.UseExceptionHandler(!app.Environment.IsProduction());

app.UseRouting();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
