namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class ServiceCategory:BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool RequiresDesignation { get; set; }
    public bool RequiresCommitteeName { get; set; }
    public double ActingScoreMultiplier { get; set; } = 0.5;
    public double FullTimeScoreMultiplier { get; set; } = 1.0;
    public int DisplayOrder { get; set; }
}
