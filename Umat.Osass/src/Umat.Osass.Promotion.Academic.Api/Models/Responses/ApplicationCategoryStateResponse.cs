using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class ApplicationCategoryStateResponse
{
    public string TeachingCategoryStatus { get; set; } = string.Empty;
    public string PublicationCategoryStatus { get; set; } = string.Empty;
    public string ServiceCategoryStatus { get; set; } = string.Empty;
    public int NumberOfRecordsForTeaching { get; set; }
    public int NumberOfRecordsForPublication { get; set; }
    public int NumberOfRecordsForService { get; set; }
    public string TeachingPerformance { get; set; } = PerformanceTypes.NotStarted;
    public string ServicePerformance { get; set; } =  PerformanceTypes.NotStarted;
    public string PublicationPerformance { get; set; } =  PerformanceTypes.NotStarted;
    public string TeachingCategoryId { get; set; } = string.Empty;
    public string PublicationCategoryId { get; set; } = string.Empty;
    public string ServiceCategoryId { get; set; } = string.Empty;
    public string ApplicationId { get; set; } = string.Empty;
    public string ApplicationStatus { get; set; } = string.Empty;
    public string ReviewStatus { get; set; } = string.Empty;

    // Required documents (CV & Application Letter)
    public string CurriculumVitaeUrl { get; set; } = string.Empty;
    public string CurriculumVitaeFileName { get; set; } = string.Empty;
    public DateTime? CurriculumVitaeUploadedAt { get; set; }
    public string ApplicationLetterUrl { get; set; } = string.Empty;
    public string ApplicationLetterFileName { get; set; } = string.Empty;
    public DateTime? ApplicationLetterUploadedAt { get; set; }
}