using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Umat.Osass.WhatsApp.Sdk.Models.Requests;

public class SendTextMessageRequest
{
    [JsonPropertyName("to")]
    [Required]   public string CustomerMobileNumber { get; set; }
    [JsonPropertyName("text")]
    [Required]  public string Message { get; set; }
}