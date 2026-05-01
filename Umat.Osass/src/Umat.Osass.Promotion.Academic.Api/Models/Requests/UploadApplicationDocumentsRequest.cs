using Microsoft.AspNetCore.Http;

namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

/// <summary>
/// Multipart upload for an applicant's required documents (CV & Application Letter).
/// Either or both files may be supplied; only the provided files are replaced.
/// Allowed for applications in Draft or Returned status only.
/// </summary>
public class UploadApplicationDocumentsRequest
{
    public IFormFile? CurriculumVitae { get; set; }
    public IFormFile? ApplicationLetter { get; set; }
}
