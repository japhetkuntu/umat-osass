using Umat.Osass.Promotion.Domain;

namespace Umat.Osass.AcademicPromotion.Sdk.Services;


public static class PerformanceRating
{
    public const string High = PerformanceGrade.High;
    public const string Good = PerformanceGrade.Good;
    public const string Adequate = PerformanceGrade.Adequate;
    public const string Inadequate = PerformanceGrade.Inadequate;
}
public static class PerformanceComputationService
{
    public static string ComputePerformanceForTeaching(double totalScore) =>
        PerformanceGrade.Classify(totalScore, PerformanceCategory.AcademicTeaching);


    public static string ComputePerformanceForPublications(double totalPoints) =>
        PerformanceGrade.Classify(totalPoints, PerformanceCategory.AcademicPublications);

    public static string ComputeServicePerformance(double totalPoints) =>
        PerformanceGrade.Classify(totalPoints, PerformanceCategory.AcademicService);
}
