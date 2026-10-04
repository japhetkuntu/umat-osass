using Umat.Osass.Promotion.Domain;

namespace Umat.Osass.NonAcademicPromotion.Sdk.Services;

public static class NonAcademicPerformanceRating
{
    public const string High = PerformanceGrade.High;
    public const string Good = PerformanceGrade.Good;
    public const string Adequate = PerformanceGrade.Adequate;
    public const string Inadequate = PerformanceGrade.Inadequate;
}

public static class PerformanceComputationService
{
    /// <summary>
    /// Area 1: Performance at Work
    /// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
    /// </summary>
    public static string ComputePerformanceAtWork(double totalScore) =>
        PerformanceGrade.Classify(totalScore, PerformanceCategory.NonAcademicWork);

    /// <summary>
    /// Area 2: Knowledge and Profession
    /// High ≥ 90 | Good 70–89.9 | Adequate 50–69.9 | Inadequate &lt; 50
    /// </summary>
    public static string ComputeKnowledgeProfessionPerformance(double totalScore) =>
        PerformanceGrade.Classify(totalScore, PerformanceCategory.NonAcademicKnowledge);

    /// <summary>
    /// Area 3: Service
    /// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
    /// </summary>
    public static string ComputeServicePerformance(double totalScore) =>
        PerformanceGrade.Classify(totalScore, PerformanceCategory.NonAcademicService);
}
