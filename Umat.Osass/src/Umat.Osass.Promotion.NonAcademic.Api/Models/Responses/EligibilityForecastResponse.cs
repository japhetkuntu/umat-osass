namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class EligibilityForecastResponse
{
    public string ApplicantName { get; set; } = string.Empty;
    public string CurrentPosition { get; set; } = string.Empty;
    public DateTime LastPromotionDate { get; set; }
    public List<NonAcademicPromotionMilestone> Milestones { get; set; } = [];
    public NonAcademicPromotionMilestone? NextEligibleMilestone { get; set; }
}

public class NonAcademicPromotionMilestone
{
    public int MilestoneOrder { get; set; }
    public string TargetPosition { get; set; } = string.Empty;
    public string PreviousPosition { get; set; } = string.Empty;
    public int MinimumYearsRequired { get; set; }
    public int CurrentYearsInRank { get; set; }
    public int RemainingYearsRequired { get; set; }
    public DateTime? EstimatedEligibilityDate { get; set; }
    public bool IsEligible { get; set; }
    public bool IsLocked { get; set; }
    public bool HasUploadedData { get; set; }
    public List<string> PerformanceCriteriaOptions { get; set; } = [];
    public int MinimumKnowledgeMaterials { get; set; }
    public int CurrentKnowledgeMaterials { get; set; }
    public int KnowledgeMaterialsGap { get; set; }
    public int MinimumJournals { get; set; }
    public int CurrentJournals { get; set; }
    public int JournalsGap { get; set; }
    public List<string> RequiredActions { get; set; } = [];
}
