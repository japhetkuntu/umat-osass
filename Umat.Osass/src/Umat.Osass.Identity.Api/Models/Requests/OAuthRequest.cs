namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class OAuthRequest
    {
        public string AccessToken { get; set; }
        public string AuthType { get; set; } // e.g., "Google", "Facebook"
    }
}