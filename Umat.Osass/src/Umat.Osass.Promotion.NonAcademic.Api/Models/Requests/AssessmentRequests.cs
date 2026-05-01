namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;

/// <summary>
/// Request to submit committee scores for a non-academic application.
/// </summary>
public class SubmitAssessmentScoresRequest
{
    public required string ApplicationId { get; set; }
    public PerformanceAtWorkAssessmentScores? PerformanceAtWorkScores { get; set; }
    public List<RecordScore>? KnowledgeProfessionScores { get; set; }
    public List<RecordScore>? ServiceScores { get; set; }
    public string? OverallRemarks { get; set; }
}

public class PerformanceAtWorkAssessmentScores
{
    public CategoryScore? AccuracyOnSchedule { get; set; }
    public CategoryScore? QualityOfWork { get; set; }
    public CategoryScore? PunctualityAndRegularity { get; set; }
    public CategoryScore? KnowledgeOfProcedures { get; set; }
    public CategoryScore? AbilityToWorkOnOwn { get; set; }
    public CategoryScore? AbilityToWorkUnderPressure { get; set; }
    public CategoryScore? AdditionalResponsibility { get; set; }
    public CategoryScore? HumanRelations { get; set; }
    public CategoryScore? InitiativeAndForesight { get; set; }
    public CategoryScore? AbilityToInspireAndMotivate { get; set; }
}

public class CategoryScore
{
    public double Score { get; set; }
    public string? Remarks { get; set; }
}

public class RecordScore
{
    public required string RecordId { get; set; }
    public double Score { get; set; }
    public string? Remarks { get; set; }
}

/// <summary>
/// Request to return an application to the applicant for modifications.
/// </summary>
public class ReturnApplicationRequest
{
    public required string ApplicationId { get; set; }
    public required string ReturnReason { get; set; }
    public string? DetailedComments { get; set; }
    public List<string>? CategoriesRequiringAttention { get; set; }
}

/// <summary>
/// Request to advance the application to the next committee level.
/// </summary>
public class AdvanceApplicationRequest
{
    public required string ApplicationId { get; set; }
    public string? Recommendation { get; set; }
}

/// <summary>
/// Request to add a comment (any committee member).
/// </summary>
public class AddAssessmentCommentRequest
{
    public required string ApplicationId { get; set; }
    public required string Category { get; set; }
    public string? RecordId { get; set; }
    public required string Comment { get; set; }
}
