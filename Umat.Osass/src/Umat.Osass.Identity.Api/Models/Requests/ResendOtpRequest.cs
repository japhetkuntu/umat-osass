using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class ResendOtpRequest
{
    [Required, RegularExpression("^[a-fA-F0-9]{32}$")] public string UniqueId { get; set; }
}
