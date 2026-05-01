using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class LoginRequest
    {
        [Required]
         [EmailAddress(ErrorMessage = "Invalid email address format.")]
         public string Email { get; set; }
        [Required] public string Password { get; set; }
    }
}