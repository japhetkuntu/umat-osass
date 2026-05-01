namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class ScoreAndRemark
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? DapcScore { get; set; }
    public string? DapcRemarks { get; set; }
    public double? FapcScore { get; set; }
    public string? FapcRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}