namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class OverallOverview
{
    public PerformanceAtWorkOverview? PerformanceAtWork { get; set; }
    public KnowledgeProfessionOverview? KnowledgeProfession { get; set; }
    public ServiceOverview? Service { get; set; }
}

public class PerformanceAtWorkOverview
{
    public string Performance { get; set; } = string.Empty;
    public double AverageScore { get; set; }
    public int TotalCategoriesAssessed { get; set; }
}

public class KnowledgeProfessionOverview
{
    public string Performance { get; set; } = string.Empty;
    public int TotalMaterialsAdded { get; set; }
    public double TotalSystemGeneratedScore { get; set; }
    public double TotalApplicantScore { get; set; }
}

public class ServiceOverview
{
    public string Performance { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public double UniversityCommunityScore { get; set; }
    public double NationalInternationalScore { get; set; }
}
