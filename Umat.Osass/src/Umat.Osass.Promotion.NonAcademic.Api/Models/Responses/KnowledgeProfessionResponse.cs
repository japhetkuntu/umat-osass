namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class KnowledgeProfessionResponse
{
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public List<KnowledgeProfessionResponseData> Materials { get; set; } = [];
}

public class KnowledgeProfessionResponseData
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public double Score { get; set; }
    public double ApplicantScore { get; set; }
    public double SystemGeneratedScore { get; set; }
    public double AuthorWeightedScore { get; set; }
    public string MaterialTypeId { get; set; } = string.Empty;
    public string MaterialTypeName { get; set; } = string.Empty;
    public bool IsPresented { get; set; }
    public double PresentationBonus { get; set; }
    public string? Remark { get; set; }
    public List<string> PresentationEvidence { get; set; } = [];
    public List<string> Evidence { get; set; } = [];
}

public class KnowledgeMaterialIndicatorResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; }
}
