using Umat.Osass.Admin.Api.Models.Requests.Shared;

namespace Umat.Osass.Admin.Api.Services.Providers.Shared;

public static class ScoreConfigurationValidation
{
    public static bool IsValidScore(double value) => double.IsFinite(value) && value >= 0;
    public static bool IsValidMultiplier(double value) => IsValidScore(value) && value <= 1;

    public static bool IsValid(object request) => request switch
    {
        ServicePositionRequest position => IsValidScore(position.Score),
        PublicationIndicatorRequest indicator => IsValidScore(indicator.Score) && IsValidScore(indicator.ScoreForPresentation) &&
            double.IsFinite(indicator.Score + indicator.ScoreForPresentation),
        KnowledgeMaterialIndicatorRequest indicator => IsValidScore(indicator.Score) && IsValidScore(indicator.ScoreForPresentation) &&
            double.IsFinite(indicator.Score + indicator.ScoreForPresentation),
        ServiceCategoryRequest category => IsValidMultiplier(category.ActingScoreMultiplier) && IsValidMultiplier(category.FullTimeScoreMultiplier),
        _ => false
    };
}
