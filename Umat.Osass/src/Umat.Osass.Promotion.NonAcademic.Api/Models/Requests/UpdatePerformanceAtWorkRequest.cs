namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;

/// <summary>
/// Update request for Performance at Work — 10 assessed categories.
/// Submit only the fields you want to update; omit nulls to leave unchanged.
/// </summary>
public class UpdatePerformanceAtWorkRequest
{
    public PerformanceWorkRequestData? AccuracyOnSchedule { get; set; }
    public PerformanceWorkRequestData? QualityOfWork { get; set; }
    public PerformanceWorkRequestData? PunctualityAndRegularity { get; set; }
    public PerformanceWorkRequestData? KnowledgeOfProcedures { get; set; }
    public PerformanceWorkRequestData? AbilityToWorkOnOwn { get; set; }
    public PerformanceWorkRequestData? AbilityToWorkUnderPressure { get; set; }
    public PerformanceWorkRequestData? AdditionalResponsibility { get; set; }
    public PerformanceWorkRequestData? HumanRelations { get; set; }
    public PerformanceWorkRequestData? InitiativeAndForesight { get; set; }
    public PerformanceWorkRequestData? AbilityToInspireAndMotivate { get; set; }
}

public class PerformanceWorkRequestData
{
    public string? Id { get; set; }
    public required double Score { get; set; }
    public string? Remark { get; set; }
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}
