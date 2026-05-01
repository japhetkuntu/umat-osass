using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

public class UpdateTeachingRequest
{
    public TeachingRequestData? LectureLoad { get; set; }
    public TeachingRequestData? AbilityToAdaptToTeaching { get; set; }
    public TeachingRequestData? RegularityAndPunctuality { get; set; }
    public TeachingRequestData? QualityOfLectureMaterial { get; set; }
    public TeachingRequestData? PerformanceOfStudentInExam { get; set; }
    public TeachingRequestData? AbilityToCompleteSyllabus { get; set; }
    public TeachingRequestData? QualityOfExamQuestionAndMarkingScheme { get; set; }
    public TeachingRequestData? PunctualityInSettingExamQuestion { get; set; }
    public TeachingRequestData? SupervisionOfProjectWorkAndThesis { get; set; }
    public TeachingRequestData? StudentReactionToAndAssessmentOfTeaching { get; set; }
}

public class TeachingRequestData
{
    public string? Id { get; set; } = null;

    [Required] public double? Score { get; set; } = 0;

    public string? Remark { get; set; }
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}