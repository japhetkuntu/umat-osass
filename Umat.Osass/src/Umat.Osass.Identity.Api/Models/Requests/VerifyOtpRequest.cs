using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class VerifyOtpRequest
    {
        [Required] public string VerificationCode { get; set; }
        [Required] public string OtpCode { get; set; }


    }
}