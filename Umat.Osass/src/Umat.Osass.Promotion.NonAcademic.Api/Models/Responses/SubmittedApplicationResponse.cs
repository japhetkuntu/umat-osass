namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class SubmittedApplicationResponse
{
    public PerformanceAtWorkApplicationResponse? PerformanceAtWorkApplication { get; set; }
    public KnowledgeProfessionApplicationResponse? KnowledgeProfessionApplication { get; set; }
    public ServiceApplicationResponse? ServiceApplication { get; set; }
}

public class PerformanceAtWorkApplicationResponse
{
    public int TotalNumberOfCategoriesAssessed { get; set; }
    public List<PerformanceAtWorkApplicationData> Categories { get; set; } = [];
}

public class PerformanceAtWorkApplicationData
{
    public string Category { get; set; } = string.Empty;
    public string? Remark { get; set; }
    public double Score { get; set; }
}

public class KnowledgeProfessionApplicationResponse
{
    public int TotalNumberOfMaterialsRecorded { get; set; }
    public List<KnowledgeProfessionApplicationData> Materials { get; set; } = [];
}

public class KnowledgeProfessionApplicationData
{
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public string MaterialCategory { get; set; } = string.Empty;
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
