using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

/// <summary>
/// Area 3: Service — University service and National/International service.
/// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
/// </summary>
public class NonAcademicServiceRecord : NonAcademicPerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantUnitId { get; set; }
    public string Status { get; set; }

    [Column(TypeName = "jsonb")] public List<NonAcademicServiceItem> ServiceToTheUniversity { get; set; } = [];
    [Column(TypeName = "jsonb")] public List<NonAcademicServiceItem> ServiceToNationalAndInternational { get; set; } = [];
}

public class NonAcademicServiceItem : NonAcademicScoreAndRemark
{
    public string ServiceTitle { get; set; }
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public string? ServiceTypeId { get; set; }
    public string? ServiceCategory { get; set; } // University or National/International
    public double? SystemGeneratedScore { get; set; }
    public bool IsActing { get; set; } = false;
}
