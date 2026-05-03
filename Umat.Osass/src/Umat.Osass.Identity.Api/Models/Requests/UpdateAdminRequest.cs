using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class UpdateAdminRequest
{
    [Required]
    public string FirstName { get; set; } = null!;

    [Required]
    public string LastName { get; set; } = null!;

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    public string Email { get; set; } = null!;

    [Required]
    public string Role { get; set; } = null!;
}
