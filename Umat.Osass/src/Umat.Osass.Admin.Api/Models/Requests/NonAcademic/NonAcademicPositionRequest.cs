namespace Umat.Osass.Admin.Api.Models.Requests.NonAcademic;

public class NonAcademicPositionRequest
{
    public string? Name { get; set; }

    // e.g. ["High,High,Adequate","Good,Good,Good"]  (PerformanceAtWork, Knowledge, Service)
    public List<string> PerformanceCriteria { get; set; } = [];
    public int? MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; }
    public int? MinimumNumberOfKnowledgeMaterials { get; set; }
    public int? MinimumNumberOfJournals { get; set; }

    // Registry, Finance, Library, Works, Estate, ICT — null means any unit
    public string? UnitType { get; set; }
}
