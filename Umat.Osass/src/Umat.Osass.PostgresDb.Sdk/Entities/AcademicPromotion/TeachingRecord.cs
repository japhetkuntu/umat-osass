using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class TeachingRecord:PerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantDepartmentId { get; set; }
    public string ApplicantSchoolId { get; set; }
    public string ApplicantFacultyId { get; set; }
    public string Status { get; set; }
    public int TotalCategoriesAssessed { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? LectureLoad { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? AbilityToAdaptToTeaching { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? RegularityAndPunctuality { get; set; }
    [Column(TypeName = "jsonb")]   public TeachingData? QualityOfLectureMaterial { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? PerformanceOfStudentInExam { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? AbilityToCompleteSyllabus { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? QualityOfExamQuestionAndMarkingScheme { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? PunctualityInSettingExamQuestion { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? SupervisionOfProjectWorkAndThesis { get; set; }
    [Column(TypeName = "jsonb")]  public TeachingData? StudentReactionToAndAssessmentOfTeaching { get; set; }
    
}

public class TeachingData:ScoreAndRemark
{

}