using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Services.Providers;

namespace Umat.Osass.Tests;

public class AcademicScoreValidationTests
{
    [Theory]
    [InlineData(0, true)]
    [InlineData(10, true)]
    [InlineData(-1, false)]
    [InlineData(11, false)]
    [InlineData(double.NaN, false)]
    [InlineData(double.PositiveInfinity, false)]
    public void TeachingScoresMustReferenceExistingDimensionsAndFitBounds(double score, bool valid)
    {
        var request = new SubmitAssessmentScoresRequest { ApplicationId = "application", TeachingScores = new() { LectureLoad = new() { Score = score } } };
        Assert.Equal(valid, AcademicScoreValidation.IsValid(request, new() { LectureLoad = new() }, null, null));
        Assert.False(AcademicScoreValidation.IsValid(request, new(), null, null));
    }

    [Theory]
    [InlineData(0, "owned", true)]
    [InlineData(12, "owned", true)]
    [InlineData(13, "owned", false)]
    [InlineData(-1, "owned", false)]
    [InlineData(double.NaN, "owned", false)]
    [InlineData(double.PositiveInfinity, "owned", false)]
    [InlineData(1, "foreign", false)]
    public void PublicationAndServiceScoresUseEffectiveItemMaxima(double score, string id, bool valid)
    {
        var publication = new Publication { Publications = new() { new() { Id = "owned", SystemGeneratedScore = 12 } } };
        var service = new ServiceRecord { Services = new() { new() { Id = "owned", SystemGeneratedScore = 12, IsActing = true } } };
        var request = new SubmitAssessmentScoresRequest { ApplicationId = "application", PublicationScores = new() { new() { RecordId = id, Score = score } },
            ServiceScores = new() { new() { RecordId = id, Score = score } } };
        Assert.Equal(valid, AcademicScoreValidation.IsValid(request, null, publication, service));
    }

    [Fact]
    public void InvalidLaterCategoryRejectsEntireBatchAndDuplicateIdsAreRejected()
    {
        var publication = new Publication { Publications = new() { new() { Id = "owned", SystemGeneratedScore = 12 } } };
        var request = new SubmitAssessmentScoresRequest { ApplicationId = "application", TeachingScores = new() { LectureLoad = new() { Score = 10 } },
            PublicationScores = new() { new() { RecordId = "foreign", Score = 1 } } };
        Assert.False(AcademicScoreValidation.IsValid(request, new() { LectureLoad = new() }, publication, null));
        request.PublicationScores = new() { new() { RecordId = "owned", Score = 1 }, new() { RecordId = "owned", Score = 2 } };
        Assert.False(AcademicScoreValidation.IsValid(request, new() { LectureLoad = new() }, publication, null));
    }
}
