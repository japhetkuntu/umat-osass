namespace Umat.Osass.Email.Sdk.Models;

/// <summary>
/// Represents an email template with subject and body
/// </summary>
public class EmailTemplate
{
    public string Id { get; set; }
    
    public string Subject { get; set; }
    
    public string HtmlBody { get; set; }
    
    public string? TextBody { get; set; }
}

