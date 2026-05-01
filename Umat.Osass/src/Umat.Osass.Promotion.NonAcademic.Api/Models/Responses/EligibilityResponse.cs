namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class EligibilityResponse
{
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantCurrentPosition { get; set; } = string.Empty;
    public string ApplicantNextPosition { get; set; } = string.Empty;
    public double TotalNumberOfYearsInCurrentPosition { get; set; }
    public double TotalNumberOfYearsRequiredInNextPosition { get; set; }
    public double RemainingNumberOfYearsRequiredInNextPosition { get; set; }
    public DateTime? EstimatedEligibilityDate { get; set; }
    public bool IsEligibleToApplyForNextPosition { get; set; }
    public ApplicationMetaData? ActiveApplication { get; set; }
    public NonAcademicPositionRequirement? ApplicationRequirment { get; set; }
}

public class NonAcademicPositionRequirement
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> PerformanceCriteria { get; set; } = [];
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; }
    public int MinimumNumberOfKnowledgeMaterials { get; set; }
    public int MinimumNumberOfJournals { get; set; }
}

public class ApplicationMetaData
{
    public string ApplicationId { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public List<string> PerformanceCriteria { get; set; } = [];
    public DateTime ApplicationStartDate { get; set; }
    public string ApplicationReviewStatus { get; set; } = string.Empty;
}
