namespace Umat.Osass.Admin.Api.Models.Responses.NonAcademic;

public class NonAcademicPositionResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> PerformanceCriteria { get; set; }
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; }
    public int MinimumNumberOfKnowledgeMaterials { get; set; }
    public int MinimumNumberOfJournals { get; set; }
    public string? UnitType { get; set; }
}
