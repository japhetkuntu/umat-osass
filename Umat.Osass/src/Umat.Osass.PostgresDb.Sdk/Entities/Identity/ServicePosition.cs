namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class ServicePosition:BaseEntity
{
    public string Name { get; set; }
    public double Score { get; set; }
    public string ServiceType { get; set; } // Administrative Experience, Statutory Committee, Non-statutory committee, national & International Committee
    
}