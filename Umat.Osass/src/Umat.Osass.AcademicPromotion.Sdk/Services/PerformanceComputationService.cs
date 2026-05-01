namespace Umat.Osass.AcademicPromotion.Sdk.Services;


public static class PerformanceRating
{
    public const string High = "High";
    public const string Good = "Good";
    public const string Adequate = "Adequate";
    public const string Inadequate = "Inadequate";
}
public static class PerformanceComputationService
{
    public static string ComputePerformanceForTeaching(double totalScore) =>
        totalScore switch
        {
            >= 80 => PerformanceRating.High,
            >= 60 and < 90 => PerformanceRating.Good,
            >= 50 and < 70 => PerformanceRating.Adequate,
            >= 0 and < 50 => PerformanceRating.Inadequate,
            _ => throw new ArgumentOutOfRangeException(nameof(totalScore),
                "Total points must be between 0 and 100.")
        };
    
    
    public static string ComputePerformanceForPublications(double totalPoints) =>
        totalPoints switch
        {
            >= 90 => PerformanceRating.High,
            >= 70 and < 90 => PerformanceRating.Good,
            >= 50 and < 70 => PerformanceRating.Adequate,
            >= 0 and < 50 => PerformanceRating.Inadequate,
            _ => throw new ArgumentOutOfRangeException(nameof(totalPoints),
                "Total points must be between 0 and 100.")
        };
    public static string ComputeServicePerformance(double totalPoints) =>
        totalPoints switch
        {
            >= 100 => PerformanceRating.High,
            >= 50 and < 100 => PerformanceRating.Good,
            >= 30 and < 50 => PerformanceRating.Adequate,
            >= 0 and < 30 => PerformanceRating.Inadequate,
            _ => throw new ArgumentOutOfRangeException(nameof(totalPoints),
                "Total points cannot be negative.")
        };
}