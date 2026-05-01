using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class ResetPasswordRequest
{
    [Required] public string UniqueId { get; set; }
    [Required] public string OtpCode { get; set; }
    [Required] public string Password { get; set; }
    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; }
}