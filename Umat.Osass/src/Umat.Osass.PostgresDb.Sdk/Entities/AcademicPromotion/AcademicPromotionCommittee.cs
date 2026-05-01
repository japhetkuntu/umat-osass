namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class AcademicPromotionCommittee:BaseEntity
{
    public string StaffId { get; set; }
    public string CommitteeType { get; set; } // DAPC,FAPC,UAPC etc.
    public bool CanSubmitReviewedApplication { get; set; } = false;
    public bool IsChairperson { get; set; } = false;
    public string? DepartmentId { get; set; }
    public string? FacultyId { get; set; }
    public string? SchoolId { get; set; }

}