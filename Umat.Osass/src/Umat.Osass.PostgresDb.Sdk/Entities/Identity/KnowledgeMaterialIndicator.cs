namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class KnowledgeMaterialIndicator : BaseEntity
{
    public string Name { get; set; } = string.Empty;  // e.g., "Journal Article (Refereed)"
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; } = 0;
}
