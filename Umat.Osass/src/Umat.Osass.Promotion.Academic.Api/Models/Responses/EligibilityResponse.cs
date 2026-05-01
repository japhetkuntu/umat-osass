namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class EligibilityResponse
{
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantCurrentPosition { get; set; } = string.Empty;
    public string ApplicantNextPosition { get; set; } = string.Empty;
    public double TotalNumberOfYearsInCurrentPosition { get; set; }
    public double TotalNumberOfYearsRequiredInNextPosition { get; set; }
    public double RemainingNumberOfYearsRequiredInNextPosition { get; set; }
    public DateTime? EstimatedEligibilityDate { get; set; } = null;
    public bool IsEligibleToApplyForNextPosition { get; set; }
    public ApplicationMetaData? ActiveApplication { get; set; }
    public PositionRequirement? ApplicationRequirment { get; set; }
   
  
}

public class PositionRequirement
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; }
    public List<string> PerformanceCriteria { get; set; } = []; // e.g ["High,High,Adequate","Good,Good,Good"]
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; } //Lecturer, Research Fellow, Senior Lecturer, etc
    public int MinimumNumberOfPublications { get; set; }
    public int MinimumNumberOfRefereedJournal { get; set; }
    
}
public class ApplicationMetaData
{
    public string ApplicationId { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public List<string> PerformanceCriteria { get; set; } = [];
    public DateTime ApplicationStartDate { get; set; }
    public string ApplicationReviewStatus { get; set; } = string.Empty;
}