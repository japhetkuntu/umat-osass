using Umat.Osass.Admin.Api.Models.Requests.Shared;
using Umat.Osass.Admin.Api.Services.Providers.Shared;

namespace Umat.Osass.Tests;

public class ScoreConfigurationValidationTests
{
    [Theory]
    [InlineData(0, true)]
    [InlineData(100, true)]
    [InlineData(-1, false)]
    [InlineData(double.NaN, false)]
    [InlineData(double.PositiveInfinity, false)]
    [InlineData(double.NegativeInfinity, false)]
    public void EverySharedScoreConfigurationRejectsInvalidMaxima(double score, bool expected)
    {
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new ServicePositionRequest { Score = score }));
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new PublicationIndicatorRequest { Score = score }));
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new KnowledgeMaterialIndicatorRequest { Score = score }));
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new PublicationIndicatorRequest { ScoreForPresentation = score }));
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new KnowledgeMaterialIndicatorRequest { ScoreForPresentation = score }));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(0.5, true)]
    [InlineData(1, true)]
    [InlineData(-0.1, false)]
    [InlineData(1.1, false)]
    [InlineData(double.NaN, false)]
    [InlineData(double.PositiveInfinity, false)]
    public void BothDesignationMultipliersMustBeFiniteAndBounded(double value, bool expected)
    {
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new ServiceCategoryRequest { ActingScoreMultiplier = value }));
        Assert.Equal(expected, ScoreConfigurationValidation.IsValid(new ServiceCategoryRequest { FullTimeScoreMultiplier = value }));
    }

    [Fact]
    public void FiniteComponentsCannotConfigureAnInfiniteCombinedMaximum()
    {
        Assert.False(ScoreConfigurationValidation.IsValid(new PublicationIndicatorRequest { Score = double.MaxValue, ScoreForPresentation = double.MaxValue }));
        Assert.False(ScoreConfigurationValidation.IsValid(new KnowledgeMaterialIndicatorRequest { Score = double.MaxValue, ScoreForPresentation = double.MaxValue }));
    }
}
