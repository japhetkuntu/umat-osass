namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class StaffUpdate : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = "low";
    public bool IsVisible { get; set; } = true;
    public DateTime? PublishedAt { get; set; }
}
