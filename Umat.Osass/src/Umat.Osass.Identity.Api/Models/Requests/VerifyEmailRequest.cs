using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class VerifyEmailRequest
{
    [Required] public string OTP { get; set; }
    [Required] public string UniqueId { get; set; }
}