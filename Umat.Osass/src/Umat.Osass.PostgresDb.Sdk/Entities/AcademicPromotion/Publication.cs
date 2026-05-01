using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class Publication:PerformanceWithBaseEntity
{
    public string PromotionApplicationId { get; set; }
    public string PromotionPositionId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantDepartmentId { get; set; }
    public string ApplicantSchoolId { get; set; }
    public string ApplicantFacultyId { get; set; }
    public string Status { get; set; }
    [Column(TypeName = "jsonb")]
    public List<PublicationData> Publications { get; set; } = [];
    
    
}

public class PublicationData:ScoreAndRemark
{

    public string Title { get; set; }
    public int Year { get; set; }
    public double SystemGeneratedScore { get; set; }
    public string PublicationTypeId { get; set; }
    public string PublicationTypeName { get; set; }
    public bool IsPresented { get; set; } = false;
    public double PresentationBonus { get; set; } = 0;
    public List<string> PresentationEvidence { get; set; } = [];

}