namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class PromotionLetterResponse
{
    public string ApplicationId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public string CurrentPosition { get; set; } = string.Empty;
    public string NextPosition { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public string LetterDate { get; set; } = string.Empty;
    public string LetterNumber { get; set; } = string.Empty;

    public double PerformanceAtWorkScore { get; set; }
    public double KnowledgeProfessionScore { get; set; }
    public double ServiceScore { get; set; }
    public double OverallScore { get; set; }
    public string PerformanceAtWorkPerformance { get; set; } = string.Empty;
    public string KnowledgeProfessionPerformance { get; set; } = string.Empty;
    public string ServicePerformance { get; set; } = string.Empty;
    public string OverallPerformance { get; set; } = string.Empty;

    public string ApplicationSubmissionDate { get; set; } = string.Empty;
    public string ApprovalDate { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public string ReviewStatus { get; set; } = string.Empty;

    public int YearsInCurrentPosition { get; set; }
    public int YearsRequired { get; set; }

    public string Summary { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public string ApprovedBy { get; set; } = string.Empty;
}
