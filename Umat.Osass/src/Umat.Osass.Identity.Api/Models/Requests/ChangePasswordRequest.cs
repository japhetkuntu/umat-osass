using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class ChangePasswordRequest
    {
        [Required] public string CurrentPassword { get; set; }
        [Required] public string NewPassword { get; set; }
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        [Required] public string ConfirmNewPassword { get; set; }
    }
}