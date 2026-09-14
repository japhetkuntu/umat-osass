namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class ServiceCategoryResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool RequiresDesignation { get; set; }
    public bool RequiresCommitteeName { get; set; }
    public double ActingScoreMultiplier { get; set; }
    public double FullTimeScoreMultiplier { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
