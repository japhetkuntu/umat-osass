using System.Text.Json.Serialization;

namespace Umat.Osass.Email.Sdk.Models;

public class SendEmailRequest
{
    
    [JsonPropertyName("to")]
    public List<EmailContact> To { get; set; }

    [JsonPropertyName("cc")] public List<EmailContact> Cc { get; set; } = [];

    [JsonPropertyName("bcc")] public List<EmailContact> Bcc { get; set; } = [];

    [JsonPropertyName("from")]
    public EmailContact From { get; set; } = new() { Email = "customersupport@osass.umat.edu.gh", Name = "customer support" };

    [JsonPropertyName("reply_to")]
    public EmailContact ReplyTo { get; set; } = new() { Email = "noreply@osass.umat.edu.gh", Name = "noreply" };

    [JsonPropertyName("attachments")] public List<Attachment> Attachments { get; set; } = [];

    [JsonPropertyName("custom_variables")]
    public Dictionary<string, string>? CustomVariables { get; set; }
    
    [JsonPropertyName("template_uuid")]
    public string TemplateId { get; set; }
    
    [JsonPropertyName("template_variables")]
    public object TemplateVariables { get; set; }

    [JsonPropertyName("headers")]
    public Dictionary<string, string>? Headers { get; set; }

    [JsonPropertyName("subject")]
    public string? Subject { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }
}

public class EmailContact
{
    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }
    
}

public class Attachment
{
    [JsonPropertyName("content")]
    public string Content { get; set; }

    [JsonPropertyName("filename")]
    public string Filename { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("disposition")]
    public string Disposition { get; set; }
}
