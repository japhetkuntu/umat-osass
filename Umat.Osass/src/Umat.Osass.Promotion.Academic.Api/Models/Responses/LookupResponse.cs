namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class PublicationIndicatorResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; } = 0;
}

public class ServiceCategoryWithPositions
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool RequiresDesignation { get; set; }
    public bool RequiresCommitteeName { get; set; }
    public double ActingScoreMultiplier { get; set; }
    public double FullTimeScoreMultiplier { get; set; }
    public int DisplayOrder { get; set; }
    public List<ServicePositionOption> Positions { get; set; } = [];
}

public class ServicePositionOption
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
}
