using Mapster;
using Microsoft.AspNetCore.HttpLogging;
using Umat.Osass.Common.Sdk.Options;

using Umat.Osass.PostgresDb.Sdk.Extensions;
using Umat.Osass.Redis.Sdk.Extensions;
using Umat.Osass.Identity.Api.Extensions;
using Umat.Osass.Identity.Api.Options;
using Umat.Osass.Identity.Api.Services.Implementations;
using Umat.Osass.Identity.Api.Services.Interfaces;
using Umat.Osass.Email.Sdk.Extensions;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var services = builder.Services;
var corsPolicyName = "ReservEase.Property.PolicyName";



// Load the common configuration file for all environments
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

services.AddScoped<IStaffService, StaffService>();
services.AddScoped<IAdminService, AdminService>();
services.AddScoped<IAuthService, AuthService>();


//SDK services registrations
builder.Services.AddIdentityPostgresSdk(builder.Configuration,"IdentityConnection");
builder.Services.AddEmailServiceProvider(builder.Configuration);
//services.AddNiaServices(builder.Configuration);
services.AddRedisDatabase<IdentityRedisConfig>(builder.Configuration);

//builder.Services.AddFluentValidationAutoValidation();
//builder.Services.AddValidatorsFromAssemblyContaining<CustomerOnboardingRequestValidator>();


//config registration
services.Configure<BearerTokenConfig>(config.GetSection(nameof(BearerTokenConfig)));
services.Configure<ExtraConfig>(config.GetSection(nameof(ExtraConfig)));



// Add logger service to the container.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("/logs/app-log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

// Add custom services to the container.


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
{
    // app.UseSwagger();
    // app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
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

await app.RunAsync();
