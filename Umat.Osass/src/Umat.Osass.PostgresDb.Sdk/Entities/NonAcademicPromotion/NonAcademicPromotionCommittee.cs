namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

public class NonAcademicPromotionCommittee : BaseEntity
{
    public string StaffId { get; set; }

    // HOU, AAPSC, UAPC
    public string CommitteeType { get; set; }
    public bool CanSubmitReviewedApplication { get; set; } = false;
    public bool IsChairperson { get; set; } = false;

    // UnitId is set for HOU committee members to scope them to a specific unit
    public string? UnitId { get; set; }
}
