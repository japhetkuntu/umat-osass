using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Email.Sdk.Services.Interfaces;

/// <summary>
/// Generic email service interface supporting multiple email providers
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send an email using the configured email provider
    /// </summary>
    /// <param name="request">Email request containing recipient, template, and variables</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Email response indicating success or failure</returns>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendEmail(
        SendEmailRequest request, 
        CancellationToken cancellationToken = default);
}
