using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class OAuthRequest
    {
        [Required] public string AccessToken { get; set; }
        [Required] public string AuthType { get; set; } // e.g., "Google", "Facebook"
    }
}