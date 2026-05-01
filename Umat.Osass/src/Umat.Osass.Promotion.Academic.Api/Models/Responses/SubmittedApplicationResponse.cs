namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class SubmittedApplicationResponse
{
    public TeachingApplicationResponse? TeachingApplication { get; set; } = null;
    public PublicationApplicationResponse? PublicationApplication { get; set; } = null;
    public ServiceApplicationResponse? ServiceApplication { get; set; } = null;
}

public class TeachingApplicationResponse
{
    public int TotalNumberOfCategoriesAssessed { get; set; }
    public List<TeachingApplicationData> TeachingApplicationData { get; set; } = [];
}

public class TeachingApplicationData
{
    public string Category { get; set; } = string.Empty; // lecture load, etc
    public string? Remark { get; set; }
    public double Score { get; set; }
}

public class PublicationApplicationResponse
{
    public int TotalNumberOfPublicationsRecorded { get; set; }
    public List<PublicationApplicationData> PublicationApplicationData { get; set; } = [];
}

public class PublicationApplicationData
{
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PublicationCategory { get; set; } = string.Empty;
    public string? Remark { get; set; }
    public double Score { get; set; }
    public double SystemScore { get; set; }
}

public class ServiceApplicationResponse
{
    public int TotalNumberOfServicesRecorded { get; set; }
    public List<ServiceApplicationData> ServiceToUniversityApplicationData { get; set; } = [];
    public List<ServiceApplicationData> ServiceToNationalInternationApplicationData { get; set; } = [];
}

public class ServiceApplicationData
{
    public string Title { get; set; } = string.Empty;
    public string? Remark { get; set; }
    public double Score { get; set; }
}