namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class EligibilityForecastResponse
{
    public string ApplicantName { get; set; } = string.Empty;
    public string CurrentPosition { get; set; } = string.Empty;
    public DateTime LastPromotionDate { get; set; }
    public List<PromotionMilestone> Milestones { get; set; } = [];
    public PromotionMilestone? NextEligibleMilestone { get; set; }
}

public class PromotionMilestone
{
    public int MilestoneOrder { get; set; } // 1, 2, 3 for next 3 levels
    public string TargetPosition { get; set; } = string.Empty;
    public string PreviousPosition { get; set; } = string.Empty;
    
    // Timeline & Eligibility
    public int MinimumYearsRequired { get; set; }
    public int CurrentYearsInRank { get; set; }
    public int RemainingYearsRequired { get; set; }
    public DateTime? EstimatedEligibilityDate { get; set; }
    public bool IsEligible { get; set; }
    public bool IsLocked { get; set; } // Future milestones are locked until promoted to intermediate position
    public bool HasUploadedData { get; set; } // True only when the applicant has uploaded records for this specific target position
    public List<string> PerformanceCriteriaOptions { get; set; } = []; // e.g., ["High,High,Adequate", "Good,Good,Good"]
    public PerformanceGap? PerformanceGap { get; set; }
    
    // Publication Requirements
    public int MinimumPublications { get; set; }
    public int CurrentPublications { get; set; }
    public int PublicationsGap { get; set; }
    
    public int MinimumRefereedJournals { get; set; }
    public int CurrentRefereedJournals { get; set; }
    public int RefereedJournalsGap { get; set; }
    
    // Action Items
    public List<ActionItem> RequiredActions { get; set; } = [];
}

public class PerformanceGap
{
    public string CurrentScores { get; set; } = string.Empty; // "Teaching: 72, Publications: 75, Service: 68"
    public string TargetScores { get; set; } = string.Empty;  // "Teaching: 78+, Publications: 82+, Service: 70+"
    public List<string> AreasForImprovement { get; set; } = []; // ["Teaching", "Publications"]
}

public class ActionItem
{
    public string Category { get; set; } = string.Empty; // "Teaching", "Publications", "Service", "Timeline"
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public int? TargetCount { get; set; } // For publications: how many more needed
    public DateTime? TargetDate { get; set; }
    public int Priority { get; set; } // 1=Critical, 2=Important, 3=Optional
}
