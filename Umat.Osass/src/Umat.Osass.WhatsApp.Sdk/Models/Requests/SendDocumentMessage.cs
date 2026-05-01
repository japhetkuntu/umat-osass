using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Umat.Osass.WhatsApp.Sdk.Models.Requests;

public class SendDocumentMessage
{
    [JsonPropertyName("to")]
  [Required]  public string CustomerMobileNumber { get; set; }
    [JsonPropertyName("fileName")]
    [Required]    public string FileName { get; set; }
    [JsonPropertyName("documentUrl")]
    [Required]   public string DocumentUrl { get; set; }
}