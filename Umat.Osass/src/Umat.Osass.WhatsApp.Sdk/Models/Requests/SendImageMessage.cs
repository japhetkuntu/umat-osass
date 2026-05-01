using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Umat.Osass.WhatsApp.Sdk.Models.Requests;

public class SendImageMessage
{
    [JsonPropertyName("to")]
  [Required]  public string CustomerMobileNumber { get; set; }
    [JsonPropertyName("caption")]
    public string Caption { get; set; }
    [JsonPropertyName("imageUrl")]
    [Required]   public string ImageUrl { get; set; }
}