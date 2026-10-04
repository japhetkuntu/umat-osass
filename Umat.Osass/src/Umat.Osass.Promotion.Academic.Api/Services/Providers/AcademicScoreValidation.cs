using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

public static class AcademicScoreValidation
{
    public static bool IsValid(SubmitAssessmentScoresRequest request, TeachingRecord? teaching, Publication? publication, ServiceRecord? service)
    {
        if (request.TeachingScores != null)
        {
            foreach (var property in typeof(TeachingAssessmentScores).GetProperties())
            {
                if (property.GetValue(request.TeachingScores) is not CategoryScore score) continue;
                if (teaching == null || typeof(TeachingRecord).GetProperty(property.Name)?.GetValue(teaching) == null ||
                    !double.IsFinite(score.Score) || score.Score < 0 || score.Score > 10) return false;
            }
        }
        return ValidRecords(request.PublicationScores, publication?.Publications.ToDictionary(item => item.Id, item => item.SystemGeneratedScore)) &&
            ValidRecords(request.ServiceScores, service?.Services.ToDictionary(item => item.Id, item => item.SystemGeneratedScore));
    }

    private static bool ValidRecords(List<RecordScore>? scores, Dictionary<string, double>? bounds) =>
        scores == null || scores.Count == 0 || (bounds != null && scores.Select(score => score.RecordId).Distinct().Count() == scores.Count &&
            scores.All(score => double.IsFinite(score.Score) && score.Score >= 0 && bounds.TryGetValue(score.RecordId, out var maximum) && score.Score <= maximum));
}
