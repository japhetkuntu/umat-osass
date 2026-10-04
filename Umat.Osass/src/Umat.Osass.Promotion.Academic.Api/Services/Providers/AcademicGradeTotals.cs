using Umat.Osass.Promotion.Domain;
using Umat.Osass.AcademicPromotion.Sdk.Services;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

public static class AcademicGradeTotals
{
    public static IEnumerable<ScoreAndRemark> TeachingItems(TeachingRecord? record) => record == null
        ? Array.Empty<ScoreAndRemark>()
        : new TeachingData?[]
        {
            record.LectureLoad, record.AbilityToAdaptToTeaching, record.RegularityAndPunctuality,
            record.QualityOfLectureMaterial, record.PerformanceOfStudentInExam, record.AbilityToCompleteSyllabus,
            record.QualityOfExamQuestionAndMarkingScheme, record.PunctualityInSettingExamQuestion,
            record.SupervisionOfProjectWorkAndThesis, record.StudentReactionToAndAssessmentOfTeaching
        }.OfType<ScoreAndRemark>();

    public static double Score(ScoreAndRemark item, int maximumStage = 3, double systemScore = 0) =>
        (maximumStage >= 3 ? item.UapcScore : null) ??
        (maximumStage >= 2 ? item.FapcScore : null) ??
        (maximumStage >= 1 ? item.DapcScore : null) ?? item.ApplicantScore ?? systemScore;

    public static double Teaching(TeachingRecord? record, int maximumStage = 3) =>
        TeachingItems(record).Sum(item => Score(item, maximumStage));

    public static double PresentationBonus(PublicationData item) =>
        item.IsPresented && item.PresentationEvidence.Count > 0 ? item.PresentationBonus : 0;

    public static double PublicationScore(PublicationData item, int maximumStage = 3)
    {
        var committeeScore = (maximumStage >= 3 ? item.UapcScore : null) ??
            (maximumStage >= 2 ? item.FapcScore : null) ?? (maximumStage >= 1 ? item.DapcScore : null);
        if (committeeScore.HasValue) return committeeScore.Value;
        var bonus = PresentationBonus(item);
        return item.ApplicantScore.HasValue ? item.ApplicantScore.Value + bonus
            : item.SystemGeneratedScore - item.PresentationBonus + bonus;
    }

    public static double Publications(Publication? record, int maximumStage = 3) =>
        record?.Publications.Sum(item => PublicationScore(item, maximumStage)) ?? 0;

    public static double Services(ServiceRecord? record, int maximumStage = 3) =>
        record?.Services.Sum(item => Score(item, maximumStage, item.SystemGeneratedScore)) ?? 0;

    public static string TeachingPerformance(TeachingRecord? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputePerformanceForTeaching(Teaching(record, maximumStage));

    public static string PublicationPerformance(Publication? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputePerformanceForPublications(Publications(record, maximumStage));

    public static string ServicePerformance(ServiceRecord? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputeServicePerformance(Services(record, maximumStage));
}
