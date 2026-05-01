namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class ServiceResponse
{
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public List<ServiceResponseData> UniversityCommunity { get; set; } = [];
    public List<ServiceResponseData> NationalInternationalCommunity { get; set; } = [];
   
}

public class ServiceResponseData
{
    public string Id { get; set; } = string.Empty;
    public string ServiceTitle { get; set; } = string.Empty;
    public string ServiceTypeId { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public double Score { get; set; }
    public string? Remark { get; set; }
    public bool IsActing { get; set; } = false;
    public List<string> Evidence { get; set; } = [];
    public double SystemGeneratedScore { get; set; } = 0;
}