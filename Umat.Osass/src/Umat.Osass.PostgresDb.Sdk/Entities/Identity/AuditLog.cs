namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class AuditLog:BaseEntity
{
    public string Platform { get; set; } // academic, non-academic, admin etc.
    public string Action { get; set; }
    public string PerformedByUserId { get; set; }
    public string? Metadata { get; set; }
}