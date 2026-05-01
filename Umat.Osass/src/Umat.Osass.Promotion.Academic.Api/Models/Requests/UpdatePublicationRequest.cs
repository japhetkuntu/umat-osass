using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Promotion.Academic.Api.Models.Requests;

public class UpdatePublicationRequest
{
    public List<PublicationRequestData> Publications { get; set; } = [];
}

public class PublicationRequestData
{
    public string? Id { get; set; } = null;
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public double Score { get; set; }

    [Required] public string PublicationTypeId { get; set; } = string.Empty;

    public string? Remark { get; set; }
    public bool IsPresented { get; set; } = false;
    public List<IFormFile> PresentationEvidence { get; set; } = [];
    public List<string> RemovedPresentationEvidence { get; set; } = [];
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
}