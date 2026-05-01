using System.Net;
using Akka.Actor;
using Microsoft.AspNetCore.Diagnostics;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Promotion.NonAcademic.Api.Extensions;

public static class WebApplicationExtensions
{
    public static void UseActorSystem(this WebApplication app)
    {
        var actorSys = app.Services.GetRequiredService<ActorSystem>();

        _ = actorSys ?? throw new ArgumentNullException(nameof(actorSys));
    }

    public static void UseExceptionHandler(
        this WebApplication app,
        bool returnStackTrace = false)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();

        app.UseExceptionHandler(appError =>
        {
            appError.Run(async context =>
            {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                if (contextFeature is null) return;

                logger.LogError(contextFeature.Error, "Unhandled Exception Occurred");

                var errors = Enumerable.Empty<ErrorResponse>();
                if (returnStackTrace)
                    errors = new List<ErrorResponse>
                    {
                        new(contextFeature.Error?.Message ?? "Exception occurred",
                            contextFeature.Error?.StackTrace ?? "Exception occurred")
                    };

                var response = new ApiResponse<object>(
                    "Ooops, something really bad happened. Please try again later.",
                    500,
                    Errors: errors);

                var respJson = response.Serialize();
                context.Response.ContentLength = respJson.Length;
                await context.Response.WriteAsync(respJson);
            });
        });
    }
}
