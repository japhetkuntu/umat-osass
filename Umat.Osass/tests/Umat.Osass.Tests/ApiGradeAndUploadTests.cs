using Microsoft.AspNetCore.Http;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.Promotion.Academic.Api.Services.Providers;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

namespace Umat.Osass.Tests;

public class ApiGradeAndUploadTests
{
    private static TeachingRecord Teaching(double score) => new()
    {
        LectureLoad = new() { ApplicantScore = score }, AbilityToAdaptToTeaching = new() { ApplicantScore = score },
        RegularityAndPunctuality = new() { ApplicantScore = score }, QualityOfLectureMaterial = new() { ApplicantScore = score },
        PerformanceOfStudentInExam = new() { ApplicantScore = score }, AbilityToCompleteSyllabus = new() { ApplicantScore = score },
        QualityOfExamQuestionAndMarkingScheme = new() { ApplicantScore = score }, PunctualityInSettingExamQuestion = new() { ApplicantScore = score },
        SupervisionOfProjectWorkAndThesis = new() { ApplicantScore = score }, StudentReactionToAndAssessmentOfTeaching = new() { ApplicantScore = score }
    };

    [Theory]
    [InlineData(10, 100, "High")]
    [InlineData(8, 80, "High")]
    [InlineData(6, 60, "Good")]
    [InlineData(5, 50, "Adequate")]
    [InlineData(1, 10, "Inadequate")]
    public void TeachingUsesSumOfTenDimensions(double score, double expected, string performance)
    {
        var record = Teaching(score);
        Assert.Equal(expected, AcademicGradeTotals.Teaching(record));
        Assert.Equal(performance, AcademicGradeTotals.TeachingPerformance(record));
    }

    [Fact]
    public void AuthoritativeLowCommitteeGradeDoesNotFallBackToHighApplicantScores()
    {
        var record = Teaching(10);
        record.LectureLoad!.DapcScore = 9;
        record.DapcPerformance = "High";
        record.LectureLoad.UapcScore = 0;
        record.UapcPerformance = "Inadequate";
        Assert.Equal(90, AcademicGradeTotals.Teaching(record));
        Assert.Equal("High", AcademicGradeTotals.TeachingPerformance(record));
        record.LectureLoad.UapcScore = null;
        Assert.Equal(99, AcademicGradeTotals.Teaching(record));
        Assert.Equal("High", AcademicGradeTotals.TeachingPerformance(record));
        foreach (var item in AcademicGradeTotals.TeachingItems(record)) item.UapcScore = 0;
        record.UapcPerformance = "High";
        Assert.Equal(0, AcademicGradeTotals.Teaching(record));
        Assert.Equal("Inadequate", AcademicGradeTotals.TeachingPerformance(record));
    }

    [Theory]
    [InlineData(false, false, 20)]
    [InlineData(true, false, 20)]
    [InlineData(false, true, 20)]
    [InlineData(true, true, 27)]
    public void PublicationsAddConfiguredBonusOnlyWithPresentationEvidence(bool presented, bool evidence, double expected)
    {
        var item = new PublicationData { ApplicantScore = 20, IsPresented = presented, PresentationBonus = 7 };
        if (evidence) item.PresentationEvidence.Add("proof.pdf");
        var record = new Publication { Publications = new() { item } };
        Assert.Equal(expected, AcademicGradeTotals.Publications(record));
        item.UapcScore = 0;
        record.UapcPerformance = "Inadequate";
        Assert.Equal(0, AcademicGradeTotals.Publications(record));
        Assert.Equal("Inadequate", AcademicGradeTotals.PublicationPerformance(record));
    }

    [Fact]
    public void NonAcademicKnowledgeUsesTopTenAndPreservesLowFinalGrade()
    {
        var record = new KnowledgeProfessionRecord
        {
            Materials = Enumerable.Range(0, 12).Select(index => new KnowledgeProfessionItem
            {
                AuthorWeightedScore = 32, PresentationBonus = 2, IsPresented = true, PresentationEvidence = new() { "proof.pdf" }
            }).ToList()
        };
        Assert.Equal(320, NonAcademicGradeTotals.Knowledge(record));
        record.Materials[0].UapcScore = 0;
        record.UapcPerformance = "Inadequate";
        Assert.Equal(320, NonAcademicGradeTotals.Knowledge(record));
        foreach (var item in record.Materials) item.UapcScore = 0;
        record.UapcPerformance = "High";
        Assert.Equal(0, NonAcademicGradeTotals.Knowledge(record));
        Assert.Equal("Inadequate", NonAcademicGradeTotals.KnowledgePerformance(record));
    }

    [Fact]
    public async Task PreflightInspectsEveryNestedAttachmentBeforeUpdates()
    {
        using var valid = new MemoryStream("%PDF-valid"u8.ToArray());
        using var invalid = new MemoryStream("disguised"u8.ToArray());
        var request = new Umat.Osass.Promotion.Academic.Api.Models.Requests.UpdateTeachingRequest
        {
            LectureLoad = new() { Evidence = new() { new FormFile(valid, 0, valid.Length, "Evidence", "valid.pdf") } },
            AbilityToAdaptToTeaching = new() { Evidence = new() { new FormFile(invalid, 0, invalid.Length, "Evidence", "invalid.pdf") } }
        };
        var exception = await Assert.ThrowsAsync<InvalidDataException>(() =>
            Umat.Osass.Promotion.Academic.Api.Extensions.ApplicantUploadValidation.ValidateAsync(request));
        Assert.Contains("valid PDF", exception.Message);
    }

    [Fact]
    public async Task NonAcademicPreflightRejectsEmptyNestedAttachments()
    {
        using var empty = new MemoryStream();
        var request = new Umat.Osass.Promotion.NonAcademic.Api.Models.Requests.UpdateKnowledgeProfessionRequest
        {
            Materials = new() { new() { Title = "material", Year = 2026, MaterialTypeId = "journal", Score = 0,
                Evidence = new() { new FormFile(empty, 0, 0, "Evidence", "empty.pdf") } } }
        };
        await Assert.ThrowsAsync<InvalidDataException>(() =>
            Umat.Osass.Promotion.NonAcademic.Api.Extensions.ApplicantUploadValidation.ValidateAsync(request));
    }

    [Fact]
    public void PublicationSystemAndCommitteeScoresAlreadyIncludeTheirBonus()
    {
        var item = new PublicationData { SystemGeneratedScore = 37, PresentationBonus = 7, IsPresented = true,
            PresentationEvidence = new() { "proof.pdf" } };
        var record = new Publication { Publications = new() { item } };
        Assert.Equal(37, AcademicGradeTotals.Publications(record));
        item.DapcScore = 27;
        Assert.Equal(27, AcademicGradeTotals.Publications(record));
        item.FapcScore = 17;
        Assert.Equal(17, AcademicGradeTotals.Publications(record));
        item.UapcScore = 0;
        Assert.Equal(0, AcademicGradeTotals.Publications(record));
        Assert.Equal(27, AcademicGradeTotals.Publications(record, 1));
    }

    [Fact]
    public void ServicesAndWorkUsePerItemTierFallbackPreservingZero()
    {
        var academic = new ServiceRecord { Services = new() { new() { UapcScore = 0, FapcScore = 10, ApplicantScore = 20 },
            new() { DapcScore = 30, ApplicantScore = 50 }, new() { SystemGeneratedScore = 5 } } };
        Assert.Equal(35, AcademicGradeTotals.Services(academic));
        var work = new PerformanceAtWorkRecord { AccuracyOnSchedule = new() { UapcScore = 0, ApplicantScore = 10 },
            QualityOfWork = new() { HouScore = 5, ApplicantScore = 10 }, PunctualityAndRegularity = new() { AapscScore = 7, ApplicantScore = 10 } };
        Assert.Equal(12, NonAcademicGradeTotals.Work(work));
        Assert.Equal("Inadequate", NonAcademicGradeTotals.WorkPerformance(work));
    }
}
