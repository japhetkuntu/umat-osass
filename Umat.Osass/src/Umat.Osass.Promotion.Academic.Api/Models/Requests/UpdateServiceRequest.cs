namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

public class UpdateServiceRequest
{
    public List<ServiceRequestData> Services { get; set; } = [];
}

public class ServiceRequestData
{
    public string? Id { get; set; } = null;
    public string ServicePositionId { get; set; } = string.Empty;
    public string? CommitteeName { get; set; }
    public bool? IsActing { get; set; }
    public string? Remark { get; set; }
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}
