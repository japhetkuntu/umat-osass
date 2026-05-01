using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Promotion.Academic.Api.Services.Static;

public class YearsInRankRule : IRule<PromotionApplication>
{
    public RuleResult Evaluate(PromotionApplication app)
    {
        var years = (DateTime.UtcNow - app.DateOfLastPromotion).TotalDays / 365;

        return years >= 3
            ? RuleResult.Success("Minimum years in rank satisfied")
            : RuleResult.Fail("Minimum of 3 years in current rank not met");
    }
}