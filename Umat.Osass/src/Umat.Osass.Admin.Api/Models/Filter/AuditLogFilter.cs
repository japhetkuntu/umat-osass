using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Models.Filter;

public class AuditLogFilter : BaseFilter
{
    public string? Platform { get; set; }         // "admin" | "academic" | "non-academic"
    public string? PerformedByUserId { get; set; }
    public string? EntityType { get; set; }       // "Committees", "Staff", etc.
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
