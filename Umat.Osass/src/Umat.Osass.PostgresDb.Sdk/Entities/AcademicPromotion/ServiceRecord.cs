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
    [Column(TypeName = "jsonb")] public List<ServiceRecordItem> Services { get; set; } = [];
}


public class ServiceRecordItem:ScoreAndRemark
{
        public string ServicePositionId { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string PositionName { get; set; }
        public string? CommitteeName { get; set; }
        public bool? IsActing { get; set; }
        public double SystemGeneratedScore { get; set; }
}
