namespace Umat.Osass.Admin.Api.Models.Requests.Academic;

public class AcademicPositionRequest
{
    public string? Name { get; set; }
    public List<string> PerformanceCriteria { get; set; } = []; // e.g ["High,High,Adequate","Good,Good,Good"]
    public int? MinimumNumberOfYearsFromLastPromotion { get; set; }
    public string? PreviousPosition { get; set; } //Lecturer, Research Fellow, Senior Lecturer, etc
    public int? MinimumNumberOfPublications { get; set; }
    public int? MinimumNumberOfRefereedJournal { get; set; }
}