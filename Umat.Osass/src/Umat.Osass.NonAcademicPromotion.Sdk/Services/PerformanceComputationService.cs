namespace Umat.Osass.NonAcademicPromotion.Sdk.Services;

public static class NonAcademicPerformanceRating
{
    public const string High = "High";
    public const string Good = "Good";
    public const string Adequate = "Adequate";
    public const string Inadequate = "Inadequate";
}

public static class PerformanceComputationService
{
    /// <summary>
    /// Area 1: Performance at Work
    /// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
    /// </summary>
    public static string ComputePerformanceAtWork(double totalScore) =>
        totalScore switch
        {
            >= 70 => NonAcademicPerformanceRating.High,
            >= 40 and < 70 => NonAcademicPerformanceRating.Good,
            >= 20 and < 40 => NonAcademicPerformanceRating.Adequate,
            _ => NonAcademicPerformanceRating.Inadequate
        };

    /// <summary>
    /// Area 2: Knowledge and Profession
    /// High ≥ 90 | Good 70–89.9 | Adequate 50–69.9 | Inadequate &lt; 50
    /// </summary>
    public static string ComputeKnowledgeProfessionPerformance(double totalScore) =>
        totalScore switch
        {
            >= 90 => NonAcademicPerformanceRating.High,
            >= 70 and < 90 => NonAcademicPerformanceRating.Good,
            >= 50 and < 70 => NonAcademicPerformanceRating.Adequate,
            _ => NonAcademicPerformanceRating.Inadequate
        };

    /// <summary>
    /// Area 3: Service
    /// High ≥ 70 | Good 40–69.9 | Adequate 20–39.9 | Inadequate &lt; 20
    /// </summary>
    public static string ComputeServicePerformance(double totalScore) =>
        totalScore switch
        {
            >= 70 => NonAcademicPerformanceRating.High,
            >= 40 and < 70 => NonAcademicPerformanceRating.Good,
            >= 20 and < 40 => NonAcademicPerformanceRating.Adequate,
            _ => NonAcademicPerformanceRating.Inadequate
        };
}
