namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

public class UpdateServiceRequest
{
    public List<ServiceRequestData> UniversityCommunity { get; set; } = [];
    public List<ServiceRequestData> NationalInternationalCommunity { get; set; } = [];
}

public class ServiceRequestData
{
    public string? Id { get; set; } = null;
    public string ServiceTitle { get; set; } = string.Empty;
    public string ServiceTypeId { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public double Score { get; set; }
    public string? Remark { get; set; }
    public bool IsActing { get; set; } = false;
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}