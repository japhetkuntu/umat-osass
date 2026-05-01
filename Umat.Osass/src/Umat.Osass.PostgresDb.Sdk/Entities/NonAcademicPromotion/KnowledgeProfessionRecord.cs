using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

/// <summary>
/// Area 2: Knowledge and Profession — up to 10 materials, type-weighted, scored out of 100.
/// High ≥ 90 | Good 70–89.9 | Adequate 50–69.9 | Inadequate &lt; 50
/// Material weights: Journal 30, Conference 20, Book 15, Chapter/Patent/TechReport 10, Report/Memo 6
/// Author weighting: 1-2 authors = 1.0 each; 3+ = 1.0 first/0.5 others; Book principal = 1.0/others = 0.5
/// Presentation bonus: +2 if presented at conference/seminar
/// </summary>
public class KnowledgeProfessionRecord : NonAcademicPerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantUnitId { get; set; }
    public string Status { get; set; }

    [Column(TypeName = "jsonb")]
    public List<KnowledgeProfessionItem> Materials { get; set; } = [];
}

public class KnowledgeProfessionItem : NonAcademicScoreAndRemark
{
    public string Title { get; set; }
    public int Year { get; set; }

    // Journal, Conference, Book, Chapter, Patent, TechnicalReport, Memo
    public string MaterialTypeId { get; set; }
    public string MaterialTypeName { get; set; }

    public int AuthorCount { get; set; } = 1;
    public bool IsFirstAuthor { get; set; } = false;
    public bool IsPrincipalAuthor { get; set; } = false;
    public bool IsPresented { get; set; } = false;
    public double PresentationBonus { get; set; } = 0;
    public double SystemGeneratedScore { get; set; }
    public double AuthorWeightedScore { get; set; }
    public List<string> PresentationEvidence { get; set; } = [];
}
