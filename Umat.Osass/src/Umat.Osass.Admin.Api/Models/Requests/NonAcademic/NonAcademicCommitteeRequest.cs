namespace Umat.Osass.Admin.Api.Models.Requests.NonAcademic;

public class NonAcademicCommitteeRequest
{
    public string StaffId { get; set; }

    // HOU, AAPSC, UAPC
    public string CommitteeType { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public bool IsChairperson { get; set; }

    // Required for HOU members — scopes them to a specific unit
    public string? UnitId { get; set; }
}
