namespace Umat.Osass.NonAcademicPromotion.Sdk.Services;

/// <summary>
/// Scoring rules for Knowledge and Profession materials.
/// Base score and presentation bonus per material type are admin-configured
/// (KnowledgeMaterialIndicator); this service only applies author-weighting on top.
/// </summary>
public static class KnowledgeScoringService
{
    public const double PresentationBonus = 2;

    // Maximum number of materials counted
    public const int MaxMaterials = 10;

    /// <summary>
    /// Computes the author-weighted score for a single material.
    /// Rules:
    ///   1–2 authors: each author gets 1.0 of base score
    ///   3+ authors:  first author gets 1.0, others get 0.5
    ///   Book:        principal author gets 1.0, co-authors get 0.5
    ///   Presented:   + presentationBonus
    /// </summary>
    public static double ComputeMaterialScore(
        double baseScore,
        double presentationBonus,
        bool isBook,
        int authorCount,
        bool isFirstAuthor,
        bool isPrincipalAuthor,
        bool isPresented)
    {
        if (baseScore <= 0) return 0;

        double authorFactor;
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

        if (isPresented)
            score += presentationBonus;

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
