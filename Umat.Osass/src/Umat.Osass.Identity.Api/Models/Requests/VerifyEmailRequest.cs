namespace Umat.Osass.Identity.Api.Models.Requests;

public class VerifyEmailRequest
{
    public string OTP { get; set; }
    public string UniqueId { get; set; }
}