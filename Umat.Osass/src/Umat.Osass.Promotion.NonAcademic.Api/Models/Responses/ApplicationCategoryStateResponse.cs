using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class ApplicationCategoryStateResponse
{
    public string PerformanceAtWorkCategoryStatus { get; set; } = string.Empty;
    public string KnowledgeProfessionCategoryStatus { get; set; } = string.Empty;
    public string ServiceCategoryStatus { get; set; } = string.Empty;
    public int NumberOfRecordsForPerformanceAtWork { get; set; }
    public int NumberOfRecordsForKnowledgeProfession { get; set; }
    public int NumberOfRecordsForService { get; set; }
    public string PerformanceAtWorkPerformance { get; set; } = PerformanceTypes.NotStarted;
    public string KnowledgeProfessionPerformance { get; set; } = PerformanceTypes.NotStarted;
    public string ServicePerformance { get; set; } = PerformanceTypes.NotStarted;
    public string PerformanceAtWorkCategoryId { get; set; } = string.Empty;
    public string KnowledgeProfessionCategoryId { get; set; } = string.Empty;
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
