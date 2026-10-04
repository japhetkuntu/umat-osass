using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class ResetPasswordRequest
{
    [Required, RegularExpression("^[a-fA-F0-9]{32}$")] public string UniqueId { get; set; }
    [Required, RegularExpression("^[0-9]{6}$")] public string OtpCode { get; set; }
    [Required, StringLength(72, MinimumLength = 12)] public string Password { get; set; }
    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; }
}
