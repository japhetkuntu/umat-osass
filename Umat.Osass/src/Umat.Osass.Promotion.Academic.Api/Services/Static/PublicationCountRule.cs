using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Promotion.Academic.Api.Services.Static;

public class PublicationCountRule : IRule<PromotionApplication>
{
    private readonly int _required;

    public PublicationCountRule(int required)
    {
        _required = required;
    }

    public RuleResult Evaluate(PromotionApplication app)
    {
        var validPublications = app.PublicationCount;

        return validPublications >= _required
            ? RuleResult.Success("Required publication count met")
            : RuleResult.Fail($"Requires at least {_required} valid publications");
    }
}