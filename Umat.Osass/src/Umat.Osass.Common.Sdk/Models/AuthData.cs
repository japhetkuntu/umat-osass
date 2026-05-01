namespace Umat.Osass.Common.Sdk.Models;

public class AuthData
{
    public string Email { get; set; }
    public string Name { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string MobileNumber { get; set; }
    public string UserName { get; set; }
    public string Id { get; set; }
    public string OnboardingId { get; set; } // Unique identifier for onboarding
    public string Role { get; set; } 
    public List<string> PropertyIds { get; set; } // Comma-separated property IDs
}