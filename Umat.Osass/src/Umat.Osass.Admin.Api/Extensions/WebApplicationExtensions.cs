using System.Net;
using Akka.Actor;
using Microsoft.AspNetCore.Diagnostics;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Extensions;

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

                if (contextFeature is null)
                {
                    return;
                }

                logger.LogError(contextFeature.Error, "Unhadled Exception Occured");

                var errors = Enumerable.Empty<ErrorResponse>();
                if (returnStackTrace)
                {
                    errors = new List<ErrorResponse>()
                    {
                        new(Field: contextFeature.Error?.Message ?? "Exception occured",
                            ErrorMessage: contextFeature.Error?.StackTrace ?? "Exception occured")
                    };
                }

                var response = new ApiResponse<object>(
                    Message: "Ooops, something really bad happened. Please try again later.",
                    Code: 500,
                    Errors: errors);

                var respJson = response.Serialize();

                context.Response.ContentLength = respJson.Length;

                await context.Response.WriteAsync(respJson);
            });
        });
    }
}