namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class ApplicationDocumentsResponse
{
    public string ApplicationId { get; set; } = string.Empty;

    public string CurriculumVitaeUrl { get; set; } = string.Empty;
    public string CurriculumVitaeFileName { get; set; } = string.Empty;
    public DateTime? CurriculumVitaeUploadedAt { get; set; }

    public string ApplicationLetterUrl { get; set; } = string.Empty;
    public string ApplicationLetterFileName { get; set; } = string.Empty;
    public DateTime? ApplicationLetterUploadedAt { get; set; }
}
