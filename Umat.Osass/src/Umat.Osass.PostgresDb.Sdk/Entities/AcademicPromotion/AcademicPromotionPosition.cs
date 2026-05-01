using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class AcademicPromotionPosition:BaseEntity
{
    public string Name { get; set; }
   
    [Column(TypeName = "jsonb")] public List<string> PerformanceCriteria { get; set; } = new List<string>(); // e.g ["High,High,Adequate","Good,Good,Good"]
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; } //Lecturer, Research Fellow, Senior Lecturer, etc
    public int MinimumNumberOfPublications { get; set; }
    public int MinimumNumberOfRefereedJournal { get; set; }
    
}
