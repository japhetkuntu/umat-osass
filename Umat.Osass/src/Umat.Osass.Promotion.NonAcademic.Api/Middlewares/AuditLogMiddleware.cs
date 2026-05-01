using System.Security.Claims;
using System.Text.Json;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Promotion.NonAcademic.Api.Middlewares;

/// <summary>
/// Writes an audit log entry for every authenticated mutating request (POST, PUT, PATCH, DELETE)
/// against the non-academic promotion API. Mirrors the academic middleware so both tiers share
/// the same audit trail format. Runs after the response has been sent and never throws back to the client.
/// </summary>
public class AuditLogMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> WriteMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        try
        {
            if (!WriteMethods.Contains(context.Request.Method)) return;

            var path = context.Request.Path.Value ?? "";
            if (path.Contains("/swagger", StringComparison.OrdinalIgnoreCase) ||
                path.Contains("/health", StringComparison.OrdinalIgnoreCase)) return;

            if (context.User?.Identity?.IsAuthenticated != true) return;

            var actorId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(actorId)) return;

            // Extract entity type from path: /api/v1.0/Applications/submit -> "Applications"
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var entityType = segments.Length >= 3 ? segments[2] : path;
            var entityId = segments.Length >= 4 ? segments[3] : null;

            var userAgent = context.Request.Headers.UserAgent.ToString();
            if (userAgent.Length > 300) userAgent = userAgent[..300];

            var metadata = JsonSerializer.Serialize(new
            {
                httpMethod = context.Request.Method,
                requestPath = path,
                entityType,
                entityId,
                performedByName = context.User.FindFirst(ClaimTypes.Name)?.Value,
                performedByEmail = context.User.FindFirst(ClaimTypes.Email)?.Value,
                performedByRole = context.User.FindFirst(ClaimTypes.Role)?.Value,
                ipAddress = context.Connection.RemoteIpAddress?.ToString(),
                userAgent,
                statusCode = context.Response.StatusCode,
            });

            using var scope = context.RequestServices.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IIdentityPgRepository<AuditLog>>();
            await repo.AddAsync(new AuditLog
            {
                Platform = "non-academic",
                Action = $"{context.Request.Method} {entityType}",
                PerformedByUserId = actorId,
                Metadata = metadata,
            });
        }
        catch
        {
            // Audit failures must never break request flow
        }
    }
}
