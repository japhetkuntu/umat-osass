namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

/// <summary>
/// Request to submit committee scores for an application
/// </summary>
public class SubmitAssessmentScoresRequest
{
    public required string ApplicationId { get; set; }
    
    /// <summary>
    /// Teaching category scores
    /// </summary>
    public TeachingAssessmentScores? TeachingScores { get; set; }
    
    /// <summary>
    /// Publication scores (list of publication record ids with scores)
    /// </summary>
    public List<RecordScore>? PublicationScores { get; set; }
    
    /// <summary>
    /// Service scores (list of service record ids with scores)
    /// </summary>
    public List<RecordScore>? ServiceScores { get; set; }
    
    /// <summary>
    /// Overall remarks for this assessment
    /// </summary>
    public string? OverallRemarks { get; set; }
}

public class TeachingAssessmentScores
{
    public CategoryScore? LectureLoad { get; set; }
    public CategoryScore? AbilityToAdaptToTeaching { get; set; }
    public CategoryScore? RegularityAndPunctuality { get; set; }
    public CategoryScore? QualityOfLectureMaterial { get; set; }
    public CategoryScore? PerformanceOfStudentInExam { get; set; }
    public CategoryScore? AbilityToCompleteSyllabus { get; set; }
    public CategoryScore? QualityOfExamQuestionAndMarkingScheme { get; set; }
    public CategoryScore? PunctualityInSettingExamQuestion { get; set; }
    public CategoryScore? SupervisionOfProjectWorkAndThesis { get; set; }
    public CategoryScore? StudentReactionToAndAssessmentOfTeaching { get; set; }
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
/// Request to return an application to the applicant for modifications
/// </summary>
public class ReturnApplicationRequest
{
    public required string ApplicationId { get; set; }
    public required string ReturnReason { get; set; }
    public string? DetailedComments { get; set; }
    
    /// <summary>
    /// Specific categories that need attention
    /// </summary>
    public List<string>? CategoriesRequiringAttention { get; set; }
}

/// <summary>
/// Request to advance application to the next committee level
/// </summary>
public class AdvanceApplicationRequest
{
    public required string ApplicationId { get; set; }
    public string? Recommendation { get; set; }
}

/// <summary>
/// Request to add a comment to an application (for non-chairperson members)
/// </summary>
public class AddAssessmentCommentRequest
{
    public required string ApplicationId { get; set; }
    public required string Category { get; set; } // Teaching, Publication, Service, Overall
    public string? RecordId { get; set; } // Optional: specific record ID
    public required string Comment { get; set; }
}
