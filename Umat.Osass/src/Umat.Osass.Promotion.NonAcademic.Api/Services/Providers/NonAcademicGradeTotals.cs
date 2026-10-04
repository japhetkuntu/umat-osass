using Umat.Osass.Promotion.Domain;
using Umat.Osass.NonAcademicPromotion.Sdk.Services;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

public static class NonAcademicGradeTotals
{
    public static IEnumerable<NonAcademicScoreAndRemark> WorkItems(PerformanceAtWorkRecord? record) => record == null
        ? Array.Empty<NonAcademicScoreAndRemark>()
        : new PerformanceWorkData?[]
        {
            record.AccuracyOnSchedule, record.QualityOfWork, record.PunctualityAndRegularity,
            record.KnowledgeOfProcedures, record.AbilityToWorkOnOwn, record.AbilityToWorkUnderPressure,
            record.AdditionalResponsibility, record.HumanRelations, record.InitiativeAndForesight,
            record.AbilityToInspireAndMotivate
        }.OfType<NonAcademicScoreAndRemark>();

    public static double Score(NonAcademicScoreAndRemark item, int maximumStage = 3, double systemScore = 0) =>
        (maximumStage >= 3 ? item.UapcScore : null) ??
        (maximumStage >= 2 ? item.AapscScore : null) ??
        (maximumStage >= 1 ? item.HouScore : null) ?? item.ApplicantScore ?? systemScore;

    public static double Work(PerformanceAtWorkRecord? record, int maximumStage = 3) =>
        WorkItems(record).Sum(item => Score(item, maximumStage));

    public static double Knowledge(KnowledgeProfessionRecord? record, int maximumStage = 3) =>
        record == null ? 0 : KnowledgeScoringService.ComputeTotalKnowledgeScore(record.Materials.Select(item =>
            (maximumStage >= 3 ? item.UapcScore : null) ?? (maximumStage >= 2 ? item.AapscScore : null) ??
            (maximumStage >= 1 ? item.HouScore : null) ?? item.ApplicantScore ?? item.AuthorWeightedScore));

    public static double Services(NonAcademicServiceRecord? record, int maximumStage = 3) =>
        record?.ServiceToTheUniversity.Concat(record.ServiceToNationalAndInternational)
            .Sum(item => Score(item, maximumStage, item.SystemGeneratedScore ?? 0)) ?? 0;

    public static string WorkPerformance(PerformanceAtWorkRecord? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputePerformanceAtWork(Work(record, maximumStage));

    public static string KnowledgePerformance(KnowledgeProfessionRecord? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputeKnowledgeProfessionPerformance(Knowledge(record, maximumStage));

    public static string ServicePerformance(NonAcademicServiceRecord? record, int maximumStage = 3) =>
        PerformanceComputationService.ComputeServicePerformance(Services(record, maximumStage));
}
