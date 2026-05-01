namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class AcademicPromotionResponse
{
    public string Id { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; }
    public DateTime? DateSubmitted { get; set; }
    public string CurrentPosition { get; set; } = string.Empty;
    public string PromotionPosition { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public DateTime? ApplicationDecisionCompletionDate { get; set; }
}