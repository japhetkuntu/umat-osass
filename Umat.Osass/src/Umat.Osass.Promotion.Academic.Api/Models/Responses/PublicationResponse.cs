namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class PublicationResponse
{
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public List<PublicationResponseData> Publications { get; set; } = [];
   
}

public class PublicationResponseData
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public double Score { get; set; }
    public double ApplicantScore { get; set; }
    public string PublicationTypeId { get; set; } = string.Empty;
    public string? Remark { get; set; }
    public bool IsPresented { get; set; } = false;
    public List<string> PresentationEvidence { get; set; } = [];
    public List<string> Evidence { get; set; } = [];
}