namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class PromotionHistoryResponse
{
    public string Id { get; set; } = string.Empty;
    public string PromotionPosition { get; set; } = string.Empty;
    public string ApplicantCurrentPosition { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public string ReviewStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? SubmissionDate { get; set; }
    public bool IsActive { get; set; }
    public string? Feedback { get; set; }
    public ApplicationPerformance? Performance { get; set; }
    public string? PromotionLetterUrl { get; set; }
}

public class ApplicationPerformance
{
    public string Teaching { get; set; } = string.Empty;
    public string Publication { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
}
