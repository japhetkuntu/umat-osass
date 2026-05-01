namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;

/// <summary>
/// Update request for Service category.
/// </summary>
public class UpdateNonAcademicServiceRequest
{
    public List<NonAcademicServiceRequestData> UniversityCommunity { get; set; } = [];
    public List<NonAcademicServiceRequestData> NationalInternationalCommunity { get; set; } = [];
}

public class NonAcademicServiceRequestData
{
    public string? Id { get; set; }
    public required string ServiceTitle { get; set; }
    public string? ServiceTypeId { get; set; }
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public required double Score { get; set; }
    public string? Remark { get; set; }
    public bool IsActing { get; set; } = false;
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}
