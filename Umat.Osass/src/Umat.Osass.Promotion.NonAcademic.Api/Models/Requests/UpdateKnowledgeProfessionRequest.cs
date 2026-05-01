namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;

/// <summary>
/// Update request for Knowledge and Profession materials.
/// Up to 10 materials are scored (system ranks by weight, takes top 10).
/// </summary>
public class UpdateKnowledgeProfessionRequest
{
    public List<KnowledgeProfessionRequestData> Materials { get; set; } = [];
}

public class KnowledgeProfessionRequestData
{
    public string? Id { get; set; }
    public required string Title { get; set; }
    public required int Year { get; set; }
    public required string MaterialTypeId { get; set; } // Journal, Conference, Book, Chapter, Patent, TechnicalReport, Memo
    public int AuthorCount { get; set; } = 1;
    public bool IsFirstAuthor { get; set; } = false;
    public bool IsPrincipalAuthor { get; set; } = false;
    public bool IsPresented { get; set; } = false;
    public required double Score { get; set; }
    public string? Remark { get; set; }
    public List<IFormFile> Evidence { get; set; } = [];
    public List<string> RemovedEvidence { get; set; } = [];
    public List<IFormFile> PresentationEvidence { get; set; } = [];
    public List<string> RemovedPresentationEvidence { get; set; } = [];
}
