using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class VerifyEmailRequest
{
    [Required, RegularExpression("^[0-9]{6}$")] public string OTP { get; set; }
    [Required, RegularExpression("^[a-fA-F0-9]{32}$")] public string UniqueId { get; set; }
}
