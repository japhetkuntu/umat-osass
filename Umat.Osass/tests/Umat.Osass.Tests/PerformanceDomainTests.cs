using Umat.Osass.Promotion.Domain;

namespace Umat.Osass.Tests;

public class PerformanceDomainTests
{
    [Theory]
    [InlineData("In Adequate", "Inadequate", PerformanceLevel.Inadequate)]
    [InlineData(" Inadequate ", "Inadequate", PerformanceLevel.Inadequate)]
    [InlineData("INADEQUATE", "Inadequate", PerformanceLevel.Inadequate)]
    [InlineData("good", "Good", PerformanceLevel.Good)]
    [InlineData("HIGH", "High", PerformanceLevel.High)]
    public void LegacyGradesNormalizeToOneDomainLabel(string input, string expected, PerformanceLevel level)
    {
        Assert.Equal(expected, PerformanceGrade.Normalize(input));
        Assert.Equal(level, PerformanceGrade.Parse(input));
    }

    [Fact]
    public void LegacyCriteriaAndAllCompatibilityConstantsAgree()
    {
        Assert.Equal("Inadequate,Good,High", PerformanceGrade.NormalizeCriteria("In Adequate, good, HIGH"));
        Assert.Equal(PerformanceGrade.Inadequate, Umat.Osass.PostgresDb.Sdk.Common.PerformanceTypes.InAdequate);
        Assert.Equal(PerformanceGrade.Inadequate, Umat.Osass.AcademicPromotion.Sdk.Services.PerformanceRating.Inadequate);
        Assert.Equal(PerformanceGrade.Inadequate, Umat.Osass.NonAcademicPromotion.Sdk.Services.NonAcademicPerformanceRating.Inadequate);
    }

    [Theory]
    [InlineData(PerformanceCategory.AcademicTeaching, 80)]
    [InlineData(PerformanceCategory.AcademicPublications, 90)]
    [InlineData(PerformanceCategory.AcademicService, 100)]
    [InlineData(PerformanceCategory.NonAcademicWork, 70)]
    [InlineData(PerformanceCategory.NonAcademicKnowledge, 90)]
    [InlineData(PerformanceCategory.NonAcademicService, 70)]
    public void CategoryThresholdsStayDistinctAndPreserveClassifierCompatibility(PerformanceCategory category, double high)
    {
        Assert.Equal("High", PerformanceGrade.Classify(high, category));
        Assert.Equal("Good", PerformanceGrade.Classify(high - 0.01, category));
        Assert.Equal("Inadequate", PerformanceGrade.Classify(double.NaN, category));
        Assert.Equal("High", PerformanceGrade.Classify(double.PositiveInfinity, category));
    }
}
