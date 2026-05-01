namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

public class NonAcademicScoreAndRemark
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? HouScore { get; set; }
    public string? HouRemarks { get; set; }
    public double? AapscScore { get; set; }
    public string? AapscRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
