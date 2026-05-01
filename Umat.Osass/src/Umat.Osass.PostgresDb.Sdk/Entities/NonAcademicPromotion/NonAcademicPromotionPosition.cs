using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

public class NonAcademicPromotionPosition : BaseEntity
{
    public string Name { get; set; }

    // e.g. ["High,High,Adequate","Good,Good,Good"]  (PerformanceAtWork, Knowledge, Service)
    [Column(TypeName = "jsonb")] public List<string> PerformanceCriteria { get; set; } = [];
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; }
    public int MinimumNumberOfKnowledgeMaterials { get; set; }
    public int MinimumNumberOfJournals { get; set; }

    // Registry, Finance, Library, Works, Estate, ICT — null means any unit
    public string? UnitType { get; set; }
}
