namespace Umat.Osass.Promotion.Academic.Api.Services.Static;

public class RuleResult
{
    private RuleResult(bool passed, string message)
    {
        Passed = passed;
        Message = message;
    }

    public bool Passed { get; }
    public string Message { get; }

    public static RuleResult Success(string message)
    {
        return new RuleResult(true, message);
    }

    public static RuleResult Fail(string message)
    {
        return new RuleResult(false, message);
    }
}