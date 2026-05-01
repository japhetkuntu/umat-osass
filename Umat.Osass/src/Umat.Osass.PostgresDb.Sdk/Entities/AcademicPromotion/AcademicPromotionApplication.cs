using System.ComponentModel.DataAnnotations.Schema;
using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class AcademicPromotionApplication:BaseEntity
{
    public string PromotionPositionId { get; set; }
    public string PromotionPosition { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantName { get; set; }
    public string ApplicantEmail { get; set; }
    public string ApplicantCurrentPosition { get; set; }
    public string ApplicantDepartmentId { get; set; }
    public string ApplicantSchoolId { get; set; }
    public string ApplicantFacultyId { get; set; }
    public string ApplicantDepartmentName { get; set; }
    public string ApplicantSchoolName { get; set; }
    public string ApplicantFacultyName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? SubmissionDate { get; set; }
    public string? ReviewStatus { get; set; }  //Draft, Application Submitted, Department Review, Faculty Review, Faculty Review, External Assessment, UAPC Review, Council Decision;
    public string? ReviewStatusHistory { get; set; } // Draft comma separated of the various review stages it goes through;
    public string ApplicationStatus { get; set; } = ApplicationStatusTypes.Draft; //Draft, Submitted, Under Review, Not Approved, Approved;
    [Column(TypeName = "jsonb")]  public List<string> PerformanceCriteria { get; set; } = [];

    // Required documents uploaded by the applicant before final submission for assessment.
    // Stored as the storage object key (filename); the public URL is composed via IStorageService.GetFileUrl.
    public string? CurriculumVitaeFile { get; set; }
    public DateTime? CurriculumVitaeUploadedAt { get; set; }
    public string? ApplicationLetterFile { get; set; }
    public DateTime? ApplicationLetterUploadedAt { get; set; }
}