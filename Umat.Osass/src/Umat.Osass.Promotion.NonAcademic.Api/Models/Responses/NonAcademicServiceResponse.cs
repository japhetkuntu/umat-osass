namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class NonAcademicServiceResponse
{
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public List<NonAcademicServiceResponseData> UniversityCommunity { get; set; } = [];
    public List<NonAcademicServiceResponseData> NationalInternationalCommunity { get; set; } = [];
}

public class NonAcademicServiceResponseData
{
    public string Id { get; set; } = string.Empty;
    public string ServiceTitle { get; set; } = string.Empty;
    public string? ServiceTypeId { get; set; }
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public double Score { get; set; }
    public string? Remark { get; set; }
    public bool IsActing { get; set; }
    public List<string> Evidence { get; set; } = [];
    public double SystemGeneratedScore { get; set; }
}

public class ServicePositionIndicatorResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
    public string ServiceType { get; set; } = string.Empty;
}
