namespace Umat.Osass.NonAcademicPromotion.Sdk.Services;

/// <summary>
/// Scoring rules for Knowledge and Profession materials.
/// </summary>
public static class KnowledgeScoringService
{
    // Material base scores
    public const double JournalScore = 30;
    public const double ConferenceScore = 20;
    public const double BookScore = 15;
    public const double ChapterScore = 10;
    public const double PatentScore = 10;
    public const double TechnicalReportScore = 10;
    public const double MemoScore = 6;
    public const double PresentationBonus = 2;

    // Maximum number of materials counted
    public const int MaxMaterials = 10;

    /// <summary>
    /// Gets the base score for a material type.
    /// Material type names match KnowledgeMaterialTypes constants.
    /// </summary>
    public static double GetMaterialBaseScore(string materialType) =>
        materialType.ToLowerInvariant().Trim() switch
        {
            "journal" => JournalScore,
            "conference" => ConferenceScore,
            "book" => BookScore,
            "chapter" => ChapterScore,
            "patent" => PatentScore,
            "technical report" => TechnicalReportScore,
            "memo" => MemoScore,
            _ => 0
        };

    /// <summary>
    /// Computes the author-weighted score for a single material.
    /// Rules:
    ///   1–2 authors: each author gets 1.0 of base score
    ///   3+ authors:  first author gets 1.0, others get 0.5
    ///   Book:        principal author gets 1.0, co-authors get 0.5
    ///   Conference:  +2 bonus if presented
    /// </summary>
    public static double ComputeMaterialScore(
        string materialType,
        int authorCount,
        bool isFirstAuthor,
        bool isPrincipalAuthor,
        bool isPresented)
    {
        double baseScore = GetMaterialBaseScore(materialType);
        if (baseScore == 0) return 0;

        double authorFactor;
        bool isBook = materialType.Equals("Book", StringComparison.OrdinalIgnoreCase);

        if (isBook)
        {
            authorFactor = isPrincipalAuthor ? 1.0 : 0.5;
        }
        else if (authorCount <= 2)
        {
            authorFactor = 1.0;
        }
        else
        {
            authorFactor = isFirstAuthor ? 1.0 : 0.5;
        }

        double score = baseScore * authorFactor;

        bool isConference = materialType.Equals("Conference", StringComparison.OrdinalIgnoreCase);
        if (isConference && isPresented)
            score += PresentationBonus;

        return score;
    }

    /// <summary>
    /// Computes the total Knowledge/Profession score from a list of material scores.
    /// Only the top <see cref="MaxMaterials"/> materials are counted.
    /// </summary>
    public static double ComputeTotalKnowledgeScore(IEnumerable<double> materialScores)
    {
        return materialScores
            .OrderByDescending(s => s)
            .Take(MaxMaterials)
            .Sum();
    }
}
