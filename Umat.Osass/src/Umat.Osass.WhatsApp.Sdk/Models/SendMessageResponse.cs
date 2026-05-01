using System.Text.Json.Serialization;

namespace Umat.Osass.WhatsApp.Sdk.Models;

public class SendMessageResponse
{
    [JsonPropertyName("msgId")]
    public int MessageId { get; set; }
    [JsonPropertyName("jid")]
    public string CustomerId { get; set; }
    [JsonPropertyName("status")]
    public string Status { get; set; }
 


}