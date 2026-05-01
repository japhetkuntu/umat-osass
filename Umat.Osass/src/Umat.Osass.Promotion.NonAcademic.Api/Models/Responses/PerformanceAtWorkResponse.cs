namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class PerformanceAtWorkResponse
{
    public int CompletedCategories { get; set; }
    public double? AverageScore { get; set; }
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public PerformanceWorkResponseData? AccuracyOnSchedule { get; set; }
    public PerformanceWorkResponseData? QualityOfWork { get; set; }
    public PerformanceWorkResponseData? PunctualityAndRegularity { get; set; }
    public PerformanceWorkResponseData? KnowledgeOfProcedures { get; set; }
    public PerformanceWorkResponseData? AbilityToWorkOnOwn { get; set; }
    public PerformanceWorkResponseData? AbilityToWorkUnderPressure { get; set; }
    public PerformanceWorkResponseData? AdditionalResponsibility { get; set; }
    public PerformanceWorkResponseData? HumanRelations { get; set; }
    public PerformanceWorkResponseData? InitiativeAndForesight { get; set; }
    public PerformanceWorkResponseData? AbilityToInspireAndMotivate { get; set; }
}

public class PerformanceWorkResponseData
{
    public string Id { get; set; } = string.Empty;
    public double Score { get; set; }
    public string? Remark { get; set; }
    public List<string> Evidence { get; set; } = [];
}
