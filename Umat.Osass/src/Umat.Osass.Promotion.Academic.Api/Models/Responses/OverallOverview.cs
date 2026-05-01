namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class OverallOverview
{
    public TeachingOverview? Teaching { get; set; } = null;
    public ServiceOverview? Service { get; set; } = null;
    public PublicationOverview? Publication { get; set; } = null;
}

public class TeachingOverview
{
    public string Performance { get; set; } = string.Empty;
    public double AverageScore { get; set; }
    public int TotalCategoriesAssessed { get; set; }
}

public class PublicationOverview
{
    public string Performance { get; set; } = string.Empty;
    public int TotalPublicationsAdded { get; set; }
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