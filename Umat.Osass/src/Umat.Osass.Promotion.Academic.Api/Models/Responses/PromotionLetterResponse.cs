namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class PromotionLetterResponse
{
    public string ApplicationId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public string CurrentPosition { get; set; } = string.Empty;
    public string NextPosition { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string LetterDate { get; set; } = string.Empty;
    public string LetterNumber { get; set; } = string.Empty;
    
    // Performance scores
    public double TeachingScore { get; set; }
    public double PublicationScore { get; set; }
    public double ServiceScore { get; set; }
    public double OverallScore { get; set; }
    public string TeachingPerformance { get; set; } = string.Empty;
    public string PublicationPerformance { get; set; } = string.Empty;
    public string ServicePerformance { get; set; } = string.Empty;
    public string OverallPerformance { get; set; } = string.Empty;
    
    // Application details
    public string ApplicationSubmissionDate { get; set; } = string.Empty;
    public string ApprovalDate { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public string ReviewStatus { get; set; } = string.Empty;
    
    // Eligibility
    public int YearsInCurrentPosition { get; set; }
    public int YearsRequired { get; set; }
    
    // Summary
    public string Summary { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    
    // Signatories
    public string ApprovedBy { get; set; } = string.Empty;
    public string ApproverTitle { get; set; } = "UAPC Chairperson";
}
