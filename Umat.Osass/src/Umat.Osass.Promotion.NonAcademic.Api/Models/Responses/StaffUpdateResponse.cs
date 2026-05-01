namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class StaffUpdateResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = "low";
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
