namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class ServiceResponse
{
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public List<ServiceResponseData> Services { get; set; } = [];
}

public class ServiceResponseData
{
    public string Id { get; set; } = string.Empty;
    public string ServicePositionId { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string PositionName { get; set; } = string.Empty;
    public string? CommitteeName { get; set; }
    public bool? IsActing { get; set; }
    public double Score { get; set; }
    public double SystemGeneratedScore { get; set; }
    public string? Remark { get; set; }
    public List<string> Evidence { get; set; } = [];
}
