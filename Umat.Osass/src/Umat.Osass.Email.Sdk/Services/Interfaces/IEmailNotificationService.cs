using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Email.Sdk.Services.Interfaces;

public interface IEmailNotificationService
{
    /// <summary>
    /// Sends email notification for application submission to committee
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationSubmittedNotificationAsync(
        ApplicationSubmittedPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends email notification to committee members
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendCommitteeNotificationAsync(
        CommitteeNotificationPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends email notification when a staff member is assigned to a committee
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendCommitteeAssignmentNotificationAsync(
        CommitteeAssignmentPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends email notification when application is approved
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationApprovedNotificationAsync(
        ApplicationApprovedPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends email notification when application is returned
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationReturnedNotificationAsync(
        ApplicationReturnedPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends staff registration email with temporal password
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendStaffRegistrationAsync(
        StaffRegistrationPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generic method to send email with template
    /// </summary>
    Task<MailtrapResponse<MailtrapSendMessageResponse>> SendEmailAsync(
        SendEmailRequest request,
        CancellationToken cancellationToken = default);
}
