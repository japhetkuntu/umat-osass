namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class ServicePosition:BaseEntity
{
    public string Name { get; set; }
    public double Score { get; set; }
    public string CategoryId { get; set; }
}