using System.Text.Json.Serialization;

namespace Umat.Osass.WhatsApp.Sdk.Models;

public class WhatsAppApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool? Success { get; set; }
    [JsonPropertyName("data")]
    public T? Data { get; set; }
    [JsonPropertyName("message")]
    public string Message { get; set; }
    [JsonPropertyName("retry_after")]
    public int RetryIn { get; set; }
    
}