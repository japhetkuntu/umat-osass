using Umat.Osass.AcademicPromotion.Sdk.Services;

namespace Umat.Osass.Tests;

public class AcademicPerformanceComputationTests
{
    [Theory]
    [InlineData(100, PerformanceRating.High)]
    [InlineData(80, PerformanceRating.High)]
    [InlineData(79.99, PerformanceRating.Good)]
    [InlineData(60, PerformanceRating.Good)]
    [InlineData(59.99, PerformanceRating.Adequate)]
    [InlineData(50, PerformanceRating.Adequate)]
    [InlineData(49.99, PerformanceRating.Inadequate)]
    [InlineData(0, PerformanceRating.Inadequate)]
    public void Teaching_UsesThresholds_80_60_50(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputePerformanceForTeaching(score));

    [Theory]
    [InlineData(90, PerformanceRating.High)]
    [InlineData(89.99, PerformanceRating.Good)]
    [InlineData(70, PerformanceRating.Good)]
    [InlineData(69.99, PerformanceRating.Adequate)]
    [InlineData(50, PerformanceRating.Adequate)]
    [InlineData(49.99, PerformanceRating.Inadequate)]
    [InlineData(0, PerformanceRating.Inadequate)]
    public void Publications_UsesThresholds_90_70_50(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputePerformanceForPublications(score));

    [Theory]
    [InlineData(100, PerformanceRating.High)]
    [InlineData(99.99, PerformanceRating.Good)]
    [InlineData(50, PerformanceRating.Good)]
    [InlineData(49.99, PerformanceRating.Adequate)]
    [InlineData(30, PerformanceRating.Adequate)]
    [InlineData(29.99, PerformanceRating.Inadequate)]
    [InlineData(0, PerformanceRating.Inadequate)]
    public void Service_UsesThresholds_100_50_30(double score, string expected) =>
        Assert.Equal(expected, PerformanceComputationService.ComputeServicePerformance(score));

    [Theory]
    [InlineData(-1)]
    [InlineData(-0.01)]
    [InlineData(double.MinValue)]
    [InlineData(double.NegativeInfinity)]
    [InlineData(double.NaN)]
    public void NegativeOrNaNScores_AreInadequate_AndDoNotThrow(double score)
    {
        Assert.Equal(PerformanceRating.Inadequate, PerformanceComputationService.ComputePerformanceForTeaching(score));
        Assert.Equal(PerformanceRating.Inadequate, PerformanceComputationService.ComputePerformanceForPublications(score));
        Assert.Equal(PerformanceRating.Inadequate, PerformanceComputationService.ComputeServicePerformance(score));
    }

    [Theory]
    [InlineData(101)]
    [InlineData(1000)]
    [InlineData(double.MaxValue)]
    [InlineData(double.PositiveInfinity)]
    public void ScoresAboveMaximum_AreHigh_AndDoNotThrow(double score)
    {
        Assert.Equal(PerformanceRating.High, PerformanceComputationService.ComputePerformanceForTeaching(score));
        Assert.Equal(PerformanceRating.High, PerformanceComputationService.ComputePerformanceForPublications(score));
        Assert.Equal(PerformanceRating.High, PerformanceComputationService.ComputeServicePerformance(score));
    }

    [Fact]
    public void RatingStrings_MatchContract()
    {
        Assert.Equal("High", PerformanceRating.High);
        Assert.Equal("Good", PerformanceRating.Good);
        Assert.Equal("Adequate", PerformanceRating.Adequate);
        Assert.Equal("Inadequate", PerformanceRating.Inadequate);
    }
}
