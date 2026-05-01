namespace Umat.Osass.Promotion.Academic.Api.Services.Static;

public interface IRule<T>
{
    RuleResult Evaluate(T context);
}