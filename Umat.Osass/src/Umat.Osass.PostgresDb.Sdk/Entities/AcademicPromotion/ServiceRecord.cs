using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class ServiceRecord:PerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantDepartmentId { get; set; }
    public string ApplicantSchoolId { get; set; }
    public string ApplicantFacultyId { get; set; }
    public string Status { get; set; }
    [Column(TypeName = "jsonb")] public List<ServiceRecordsData> ServiceToTheUniversity{ get; set; } = [];
    [Column(TypeName = "jsonb")]   public  List<ServiceRecordsData>  ServiceToNationalAndInternational { get; set; } = [];
    
}


public class ServiceRecordsData:ScoreAndRemark
{
        public string ServiceTitle { get; set; }
        public string? Role { get; set; }
        public string? Duration { get; set; }
        public string? ServiceTypeId { get; set; }
        public double? SystemGeneratedScore { get; set; }
        public bool IsActing { get; set; } = false;
}