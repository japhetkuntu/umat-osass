using System.Text.Json.Serialization;

namespace Umat.Osass.Email.Sdk.Models;

public class MailtrapSendMessageResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("errors")] public List<string> Errors { get; set; } = [];

    [JsonPropertyName("message_ids")] public List<string> MessageIds { get; set; } = [];


}