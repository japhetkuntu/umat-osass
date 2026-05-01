namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class Admin:BaseEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
    public DateTime? LastLoginAt { get; set; }
}