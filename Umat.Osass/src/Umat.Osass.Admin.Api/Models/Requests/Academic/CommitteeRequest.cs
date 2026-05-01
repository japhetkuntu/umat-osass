namespace Umat.Osass.Admin.Api.Models.Requests.Academic;

public class CommitteeRequest
{
    public string StaffId { get; set; }
    public string CommitteeType { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public bool IsChairperson { get; set; }
    public string? DepartmentId { get; set; }
    public string? FacultyId { get; set; }
    public string? SchoolId { get; set; }
}
