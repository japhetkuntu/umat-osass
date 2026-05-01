namespace Umat.Osass.Identity.Api.Models.Responses;

public class ResetPasswordCache
{
    public string OtpCode { get; set; }
    public string Email { get; set; }
}