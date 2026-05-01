using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Options;
using Umat.Osass.Email.Sdk.Services.Interfaces;

namespace Umat.Osass.Email.Sdk.Services.Implementations;

public class EmailNotificationService : IEmailNotificationService
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailNotificationService> _logger;
    private readonly EmailConfig _emailConfig;

    public EmailNotificationService(
        IEmailService emailService,
        ILogger<EmailNotificationService> logger,
        IOptions<EmailConfig> emailConfig)
    {
        _emailService = emailService;
        _logger = logger;
        _emailConfig = emailConfig.Value;
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationSubmittedNotificationAsync(
        ApplicationSubmittedPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending application submitted notification to {RecipientEmail}", payload.RecipientEmail);

            var templateId = payload.CommitteeType switch
            {
                "DAPC" => _emailConfig.Templates.ApplicationSubmittedToDapc,
                "FAPC" => _emailConfig.Templates.ApplicationSubmittedToFapc,
                "UAPC" => _emailConfig.Templates.ApplicationSubmittedToUapc,
                _ => throw new ArgumentException($"Invalid committee type: {payload.CommitteeType}")
            };

            if (string.IsNullOrEmpty(templateId))
            {
                _logger.LogWarning("[EmailNotification] Template ID not configured for committee type: {CommitteeType}", payload.CommitteeType);
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = $"Template not configured for {payload.CommitteeType}"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = payload.RecipientName } },
                TemplateId = templateId,
                TemplateVariables = new
                {
                    applicant_name = payload.ApplicantName,
                    applicant_position = payload.ApplicantPosition,
                    target_position = payload.TargetPosition,
                    applied_date = payload.AppliedDate,
                    department_name = payload.DepartmentName,
                    faculty_name = payload.FacultyName,
                    school_name = payload.SchoolName,
                    committee_type = payload.CommitteeType,
                    application_url = payload.ApplicationUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending application submitted notification to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendCommitteeNotificationAsync(
        CommitteeNotificationPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending committee notification to {RecipientEmail}", payload.RecipientEmail);

            // Accept both FAPC (template/business name) and FAPSC (committee role enum value)
            var normalizedType = string.Equals(payload.CommitteeType, "FAPSC", StringComparison.OrdinalIgnoreCase)
                ? "FAPC"
                : payload.CommitteeType;

            var templateId = normalizedType switch
            {
                "DAPC" => _emailConfig.Templates.ApplicationSubmittedToDapc,
                "FAPC" => _emailConfig.Templates.ApplicationSubmittedToFapc,
                "UAPC" => _emailConfig.Templates.ApplicationSubmittedToUapc,
                _ => throw new ArgumentException($"Invalid committee type: {payload.CommitteeType}")
            };

            if (string.IsNullOrEmpty(templateId))
            {
                _logger.LogWarning("[EmailNotification] Template ID not configured for committee type: {CommitteeType}", payload.CommitteeType);
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = $"Template not configured for {payload.CommitteeType}"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = payload.CommitteeMemberName } },
                TemplateId = templateId,
                TemplateVariables = new
                {
                    committee_member_name = payload.CommitteeMemberName,
                    applicant_name = payload.ApplicantName,
                    applicant_position = payload.ApplicantPosition,
                    target_position = payload.TargetPosition,
                    committee_type = payload.CommitteeType,
                    submission_date = payload.SubmissionDate,
                    review_url = payload.ReviewUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending committee notification to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendCommitteeAssignmentNotificationAsync(
        CommitteeAssignmentPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending committee assignment notification to {RecipientEmail}", payload.RecipientEmail);

            if (string.IsNullOrEmpty(_emailConfig.Templates.CommitteeAssignment))
            {
                _logger.LogWarning("[EmailNotification] Committee assignment template not configured");
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = "Template not configured"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = payload.RecipientName } },
                TemplateId = _emailConfig.Templates.CommitteeAssignment,
                TemplateVariables = new
                {
                    staff_name = payload.StaffName,
                    committee_type = payload.CommitteeType,
                    committee_role = payload.CommitteeRole,
                    department_name = payload.DepartmentName,
                    portal_url = payload.PortalUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending committee assignment notification to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationApprovedNotificationAsync(
        ApplicationApprovedPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending application approved notification to {RecipientEmail}", payload.RecipientEmail);

            if (string.IsNullOrEmpty(_emailConfig.Templates.ApplicationApproved))
            {
                _logger.LogWarning("[EmailNotification] Application approved template not configured");
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = "Template not configured"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = payload.ApplicantName } },
                TemplateId = _emailConfig.Templates.ApplicationApproved,
                TemplateVariables = new
                {
                    applicant_name = payload.ApplicantName,
                    current_position = payload.CurrentPosition,
                    new_position = payload.NewPosition,
                    effective_date = payload.EffectiveDate,
                    academic_portal_url = payload.AcademicPortalUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending application approved notification to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendApplicationReturnedNotificationAsync(
        ApplicationReturnedPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending application returned notification to {RecipientEmail}", payload.RecipientEmail);

            if (string.IsNullOrEmpty(_emailConfig.Templates.ApplicationReturned))
            {
                _logger.LogWarning("[EmailNotification] Application returned template not configured");
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = "Template not configured"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = payload.ApplicantName } },
                TemplateId = _emailConfig.Templates.ApplicationReturned,
                TemplateVariables = new
                {
                    applicant_name = payload.ApplicantName,
                    position = payload.Position,
                    return_reason = payload.ReturnReason,
                    returned_date = payload.ReturnedDate,
                    application_url = payload.ApplicationUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending application returned notification to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendStaffRegistrationAsync(
        StaffRegistrationPayload payload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[EmailNotification] Sending staff registration email to {RecipientEmail}", payload.RecipientEmail);

            var templateId = payload.StaffCategory == "Academic"
                ? _emailConfig.Templates.StaffOnboardingAcademic
                : _emailConfig.Templates.StaffOnboardingNonAcademic;

            if (string.IsNullOrEmpty(templateId))
            {
                _logger.LogWarning("[EmailNotification] Staff registration template not configured for category: {StaffCategory}", payload.StaffCategory);
                return new MailtrapResponse<MailtrapSendMessageResponse>
                {
                    IsSuccessful = false,
                    Message = "Template not configured"
                };
            }

            var emailRequest = new SendEmailRequest
            {
                To = new List<EmailContact> { new() { Email = payload.RecipientEmail, Name = $"{payload.FirstName} {payload.LastName}" } },
                TemplateId = templateId,
                TemplateVariables = new
                {
                    staff_id = payload.staffId,
                    first_name = payload.FirstName,
                    last_name = payload.LastName,
                    temporal_password = payload.TemporalPassword,
                    staff_category = payload.StaffCategory,
                    portal_login_url = payload.PortalLoginUrl,
                    password_change_url = payload.PasswordChangeRequiredUrl
                }
            };

            return await _emailService.SendEmail(emailRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailNotification] Error sending staff registration email to {RecipientEmail}", payload.RecipientEmail);
            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = ex.Message
            };
        }
    }

    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendEmailAsync(
        SendEmailRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _emailService.SendEmail(request, cancellationToken);
    }
}
