using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

/// <summary>
/// Area 1: Performance at Work — 10 assessed categories, scored out of 100.
/// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
/// </summary>
public class PerformanceAtWorkRecord : NonAcademicPerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantUnitId { get; set; }
    public string Status { get; set; }
    public int TotalCategoriesAssessed { get; set; }

    [Column(TypeName = "jsonb")] public PerformanceWorkData? AccuracyOnSchedule { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? QualityOfWork { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? PunctualityAndRegularity { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? KnowledgeOfProcedures { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? AbilityToWorkOnOwn { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? AbilityToWorkUnderPressure { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? AdditionalResponsibility { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? HumanRelations { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? InitiativeAndForesight { get; set; }
    [Column(TypeName = "jsonb")] public PerformanceWorkData? AbilityToInspireAndMotivate { get; set; }
}

public class PerformanceWorkData : NonAcademicScoreAndRemark
{
}
