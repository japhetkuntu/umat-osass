using System.ComponentModel.DataAnnotations.Schema;
using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

public class NonAcademicPromotionApplication : BaseEntity
{
    public string PromotionPositionId { get; set; }
    public string PromotionPosition { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantName { get; set; }
    public string ApplicantEmail { get; set; }
    public string ApplicantCurrentPosition { get; set; }
    public string ApplicantUnitId { get; set; }
    public string ApplicantUnitName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? SubmissionDate { get; set; }

    // Draft, Application Submitted, HOU Review, AAPSC Review, UAPC Decision
    public string? ReviewStatus { get; set; }

    // Comma-separated history of review stages
    public string? ReviewStatusHistory { get; set; }

    // Draft, Submitted, Under Review, Not Approved, Approved, Returned
    public string ApplicationStatus { get; set; } = ApplicationStatusTypes.Draft;

    [Column(TypeName = "jsonb")] public List<string> PerformanceCriteria { get; set; } = [];

    // Required documents uploaded by the applicant before final submission for assessment.
    // Stored as the storage object key (filename); the public URL is composed via IStorageService.GetFileUrl.
    public string? CurriculumVitaeFile { get; set; }
    public DateTime? CurriculumVitaeUploadedAt { get; set; }
    public string? ApplicationLetterFile { get; set; }
    public DateTime? ApplicationLetterUploadedAt { get; set; }
}
