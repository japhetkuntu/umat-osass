using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class ResendOtpRequest
{
    [Required] public string UniqueId { get; set; }
}