using Umat.Osass.NonAcademicPromotion.Sdk.Services;

namespace Umat.Osass.Tests;

public class NonAcademicPerformanceComputationTests
{
    [Theory]
    [InlineData(100, NonAcademicPerformanceRating.High)]
    [InlineData(70, NonAcademicPerformanceRating.High)]
    [InlineData(69.99, NonAcademicPerformanceRating.Good)]
    [InlineData(40, NonAcademicPerformanceRating.Good)]
    [InlineData(39.99, NonAcademicPerformanceRating.Adequate)]
    [InlineData(20, NonAcademicPerformanceRating.Adequate)]
    [InlineData(19.99, NonAcademicPerformanceRating.Inadequate)]
    [InlineData(0, NonAcademicPerformanceRating.Inadequate)]
    [InlineData(-5, NonAcademicPerformanceRating.Inadequate)]
    public void PerformanceAtWork_UsesThresholds_70_40_20(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputePerformanceAtWork(score));

    [Theory]
    [InlineData(100, NonAcademicPerformanceRating.High)]
    [InlineData(90, NonAcademicPerformanceRating.High)]
    [InlineData(89.99, NonAcademicPerformanceRating.Good)]
    [InlineData(70, NonAcademicPerformanceRating.Good)]
    [InlineData(69.99, NonAcademicPerformanceRating.Adequate)]
    [InlineData(50, NonAcademicPerformanceRating.Adequate)]
    [InlineData(49.99, NonAcademicPerformanceRating.Inadequate)]
    [InlineData(-1, NonAcademicPerformanceRating.Inadequate)]
    public void KnowledgeProfession_UsesThresholds_90_70_50(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputeKnowledgeProfessionPerformance(score));

    [Theory]
    [InlineData(100, NonAcademicPerformanceRating.High)]
    [InlineData(70, NonAcademicPerformanceRating.High)]
    [InlineData(69.99, NonAcademicPerformanceRating.Good)]
    [InlineData(40, NonAcademicPerformanceRating.Good)]
    [InlineData(39.99, NonAcademicPerformanceRating.Adequate)]
    [InlineData(20, NonAcademicPerformanceRating.Adequate)]
    [InlineData(19.99, NonAcademicPerformanceRating.Inadequate)]
    [InlineData(-1, NonAcademicPerformanceRating.Inadequate)]
    public void Service_UsesThresholds_70_40_20(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputeServicePerformance(score));

    [Theory]
    [InlineData(double.NaN)]
    [InlineData(double.NegativeInfinity)]
    public void InvalidScores_AreInadequate_AndDoNotThrow(double score)
    {
        Assert.Equal(NonAcademicPerformanceRating.Inadequate, PerformanceComputationService.ComputePerformanceAtWork(score));
        Assert.Equal(NonAcademicPerformanceRating.Inadequate, PerformanceComputationService.ComputeKnowledgeProfessionPerformance(score));
        Assert.Equal(NonAcademicPerformanceRating.Inadequate, PerformanceComputationService.ComputeServicePerformance(score));
    }

    [Fact]
    public void ScoresAboveMaximum_AreHigh()
    {
        Assert.Equal(NonAcademicPerformanceRating.High, PerformanceComputationService.ComputePerformanceAtWork(1000));
        Assert.Equal(NonAcademicPerformanceRating.High, PerformanceComputationService.ComputeKnowledgeProfessionPerformance(1000));
        Assert.Equal(NonAcademicPerformanceRating.High, PerformanceComputationService.ComputeServicePerformance(1000));
    }
}
