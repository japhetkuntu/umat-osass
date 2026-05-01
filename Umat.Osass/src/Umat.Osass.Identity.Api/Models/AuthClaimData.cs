namespace Umat.Osass.Identity.Api.Models;

public class AuthClaimData
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public string MobileNumber { get; set; }
    public string AccountType { get; set; } // e.g., "Buyer", "Seller"
    public string ProfilePicture { get; set; }
    public string SigningKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public string Token { get; set; }
    public string Role { get; set; } // e.g., "Buyer", "Seller", "Admin"
    public string OnboardingId { get; set; } // Unique identifier for onboarding
    public int DurationInHours { get; set; } = 8; // Default token duration in hours
public List<string> PropertyIds { get; set; }
    public string UserName { get; set; }
}