using Umat.Osass.NonAcademicPromotion.Sdk.Services;

namespace Umat.Osass.Tests;

public class KnowledgeScoringServiceTests
{
    private const double Base = 10;
    private const double Bonus = KnowledgeScoringService.PresentationBonus;

    private static double Score(
        double baseScore = Base,
        bool isBook = false,
        int authorCount = 1,
        bool isFirstAuthor = true,
        bool isPrincipalAuthor = true,
        bool isPresented = false) =>
        KnowledgeScoringService.ComputeMaterialScore(
            baseScore, Bonus, isBook, authorCount, isFirstAuthor, isPrincipalAuthor, isPresented);

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void NonPositiveBaseScore_ScoresZero_EvenWhenPresented(double baseScore) =>
        Assert.Equal(0, Score(baseScore: baseScore, isPresented: true));

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    public void OneOrTwoAuthors_EveryAuthorGetsFullScore(int authors)
    {
        Assert.Equal(Base, Score(authorCount: authors, isFirstAuthor: true));
        Assert.Equal(Base, Score(authorCount: authors, isFirstAuthor: false));
    }

    [Fact]
    public void ThreeOrMoreAuthors_FirstGetsFull_OthersGetHalf()
    {
        Assert.Equal(Base, Score(authorCount: 3, isFirstAuthor: true));
        Assert.Equal(Base * 0.5, Score(authorCount: 3, isFirstAuthor: false));
        Assert.Equal(Base * 0.5, Score(authorCount: 7, isFirstAuthor: false));
    }

    [Fact]
    public void Book_PrincipalAuthorGetsFull_CoAuthorsGetHalf_RegardlessOfAuthorOrder()
    {
        Assert.Equal(Base, Score(isBook: true, authorCount: 1, isPrincipalAuthor: true, isFirstAuthor: false));
        Assert.Equal(Base * 0.5, Score(isBook: true, authorCount: 2, isPrincipalAuthor: false, isFirstAuthor: true));
    }

    [Fact]
    public void Presented_AddsBonusAfterAuthorWeighting()
    {
        Assert.Equal(Base + Bonus, Score(isPresented: true));
        Assert.Equal(Base * 0.5 + Bonus, Score(authorCount: 4, isFirstAuthor: false, isPresented: true));
    }

    [Fact]
    public void TotalScore_OfNoMaterials_IsZero() =>
        Assert.Equal(0, KnowledgeScoringService.ComputeTotalKnowledgeScore(Array.Empty<double>()));

    [Fact]
    public void TotalScore_SumsAllMaterials_WhenAtOrBelowTheCap()
    {
        var scores = Enumerable.Repeat(5d, KnowledgeScoringService.MaxMaterials);
        Assert.Equal(5d * KnowledgeScoringService.MaxMaterials, KnowledgeScoringService.ComputeTotalKnowledgeScore(scores));
    }

    [Fact]
    public void TotalScore_CountsOnlyTopMaterials_AboveTheCap()
    {
        // 10 materials worth 10 and 5 worth 1: only the ten best count.
        var scores = Enumerable.Repeat(1d, 5).Concat(Enumerable.Repeat(10d, 10)).ToList();
        Assert.Equal(100, KnowledgeScoringService.ComputeTotalKnowledgeScore(scores));
    }
}
