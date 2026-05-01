namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class PublicationIndicator:BaseEntity
{
    public string Name { get; set; } // Refereed Journal, Conference Paper etc.
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; } = 0;
    
}