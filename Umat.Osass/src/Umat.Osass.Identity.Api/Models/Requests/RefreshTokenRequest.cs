using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class RefreshTokenRequest
    {
        public string AccessToken { get; set; }
     [Required]   public string RefreshToken { get; set; }
    }
}