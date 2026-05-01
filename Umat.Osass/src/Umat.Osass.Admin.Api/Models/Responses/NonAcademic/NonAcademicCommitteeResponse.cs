namespace Umat.Osass.Admin.Api.Models.Responses.NonAcademic;

public class NonAcademicCommitteeResponse
{
    public string Id { get; set; }
    public string StaffId { get; set; }
    public string? StaffName { get; set; }
    public string? StaffEmail { get; set; }
    public string CommitteeType { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public bool IsChairperson { get; set; }
    public string? UnitId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
