namespace Umat.Osass.Admin.Api.Models.Responses;

public class AuditLogResponse
{
    public string Id { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string PerformedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Parsed from Metadata JSON
    public string? HttpMethod { get; set; }
    public string? RequestPath { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? PerformedByName { get; set; }
    public string? PerformedByEmail { get; set; }
    public string? PerformedByRole { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public int? StatusCode { get; set; }
}
