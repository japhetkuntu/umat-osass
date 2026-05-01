namespace Umat.Osass.Admin.Api.Models.Responses.Academic;

public class CommitteeResponse
{
    public string Id { get; set; }
    public string StaffId { get; set; }
    public string? StaffName { get; set; }
    public string? StaffEmail { get; set; }
    public string CommitteeType { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public bool IsChairperson { get; set; }
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? FacultyId { get; set; }
    public string? FacultyName { get; set; }
    public string? SchoolId { get; set; }
    public string? SchoolName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
