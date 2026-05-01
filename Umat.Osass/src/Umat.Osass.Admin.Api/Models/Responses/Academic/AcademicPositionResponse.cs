namespace Umat.Osass.Admin.Api.Models.Responses.Academic;

public class AcademicPositionResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> PerformanceCriteria { get; set; } 
    public int MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; }
    public int MinimumNumberOfPublications { get; set; }
    public int MinimumNumberOfRefereedJournal { get; set; }
}