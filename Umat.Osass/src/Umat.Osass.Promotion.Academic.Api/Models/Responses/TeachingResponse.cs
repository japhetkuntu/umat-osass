namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class TeachingResponse
{
    public int CompletedCategories { get; set; } = 0;
    public double? AverageScore { get; set; }
    public string? PerformanceLevel { get; set; } = "Not assessed";
    public TeachingResponseData? LectureLoad { get; set; } = null;
    public TeachingResponseData? AbilityToAdaptToTeaching { get; set; } = null;
    public TeachingResponseData? RegularityAndPunctuality { get; set; } = null;
    public TeachingResponseData? QualityOfLectureMaterial { get; set; } = null;
    public TeachingResponseData? PerformanceOfStudentInExam { get; set; } = null;
    public TeachingResponseData? AbilityToCompleteSyllabus { get; set; } = null;
    public TeachingResponseData? QualityOfExamQuestionAndMarkingScheme { get; set; } = null;
    public TeachingResponseData? PunctualityInSettingExamQuestion { get; set; } = null;
    public TeachingResponseData? SupervisionOfProjectWorkAndThesis { get; set; } = null;
    public TeachingResponseData? StudentReactionToAndAssessmentOfTeaching { get; set; } = null;
}

public class TeachingResponseData
{
    public string Id { get; set; } = string.Empty;
    public double Score { get; set; }
    public string? Remark { get; set; }
    public List<string> Evidence { get; set; } = [];
}