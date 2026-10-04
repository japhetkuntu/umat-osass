namespace Umat.Osass.Promotion.Domain;

public enum PerformanceLevel
{
    Unknown = 0,
    Inadequate = 1,
    Adequate = 2,
    Good = 3,
    High = 4
}

public enum PerformanceCategory
{
    AcademicTeaching,
    AcademicPublications,
    AcademicService,
    NonAcademicWork,
    NonAcademicKnowledge,
    NonAcademicService
}

public static class PerformanceGrade
{
    public const string Inadequate = nameof(PerformanceLevel.Inadequate);
    public const string Adequate = nameof(PerformanceLevel.Adequate);
    public const string Good = nameof(PerformanceLevel.Good);
    public const string High = nameof(PerformanceLevel.High);

    public static PerformanceLevel Parse(string? value) =>
        string.Concat((value ?? string.Empty).Where(character => !char.IsWhiteSpace(character))).ToUpperInvariant() switch
        {
            "INADEQUATE" => PerformanceLevel.Inadequate,
            "ADEQUATE" => PerformanceLevel.Adequate,
            "GOOD" => PerformanceLevel.Good,
            "HIGH" => PerformanceLevel.High,
            _ => PerformanceLevel.Unknown
        };

    public static string Normalize(string? value) => Parse(value) is var level && level != PerformanceLevel.Unknown
        ? level.ToString() : value?.Trim() ?? string.Empty;

    public static string NormalizeCriteria(string? criteria) =>
        string.Join(",", (criteria ?? string.Empty).Split(',').Select(Normalize));

    public static string Classify(double score, PerformanceCategory category)
    {
        var thresholds = category switch
        {
            PerformanceCategory.AcademicTeaching => (High: 80d, Good: 60d, Adequate: 50d),
            PerformanceCategory.AcademicPublications or PerformanceCategory.NonAcademicKnowledge => (High: 90d, Good: 70d, Adequate: 50d),
            PerformanceCategory.AcademicService => (High: 100d, Good: 50d, Adequate: 30d),
            PerformanceCategory.NonAcademicWork or PerformanceCategory.NonAcademicService => (High: 70d, Good: 40d, Adequate: 20d),
            _ => throw new ArgumentOutOfRangeException(nameof(category))
        };
        if (double.IsNaN(score)) return Inadequate;
        return score >= thresholds.High ? High : score >= thresholds.Good ? Good : score >= thresholds.Adequate ? Adequate : Inadequate;
    }
}
