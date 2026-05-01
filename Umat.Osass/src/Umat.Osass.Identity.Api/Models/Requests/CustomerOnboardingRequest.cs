using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests
{
    public class CustomerOnboardingRequest
    {
       
        [Required] public string? FirstName { get; set; }
        [Required] public string? OtherNames { get; set; }
        [Required]  public string Country { get; set; }
        [Required] public string UserName { get; set; }


    }
}