using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Actors.Messages;
using Umat.Osass.Promotion.Academic.Api.Extensions;

namespace Umat.Osass.Promotion.Academic.Api.Actors;

public class SendCommitteeEmailActor : BaseActor
{
    private readonly ILogger _logger;
    private readonly IServiceProvider _serviceProvider;

    public SendCommitteeEmailActor(ILogger<SendCommitteeEmailActor> logger, IServiceProvider serviceProvider)
    {
        ReceiveAsync<SendCommitteeEmailMessage>(SendCommitteeEmail);

        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private async Task SendCommitteeEmail(SendCommitteeEmailMessage message)
    {
        try
        {
            _logger.LogInformation("[SendCommitteeEmailActor] Processing committee notification for application {ApplicationId}", message.ApplicationId);

            using var scope = _serviceProvider.CreateScope();
            var committeeRepository = scope.ServiceProvider.GetService<IAcademicPromotionPgRepository<AcademicPromotionCommittee>>();
            var staffRepository = scope.ServiceProvider.GetService<IIdentityPgRepository<Staff>>();
            var emailNotificationService = scope.ServiceProvider.GetService<IEmailNotificationService>();

            if (committeeRepository == null || staffRepository == null || emailNotificationService == null)
            {
                _logger.LogError("[SendCommitteeEmailActor] Failed to resolve required repositories");
                return;
            }

            // Query committee members for the applicant's department/faculty.
            // Note: the committee role enum uses "FAPSC" for the faculty-level committee.
            var committeeMembers = await committeeRepository.GetAllAsync(c =>
                c.CommitteeType == message.CommitteeType &&
                ((message.CommitteeType == "DAPC" && c.DepartmentId == message.ApplicantDepartmentId) ||
                 (message.CommitteeType == "FAPSC" && c.FacultyId == message.ApplicantFacultyId) ||
                 message.CommitteeType == "UAPC")); // UAPC members are selected regardless of department/faculty

            var promotionCommittees = committeeMembers.ToList();
            if (promotionCommittees.Count == 0)
            {
                _logger.LogWarning("[SendCommitteeEmailActor] No {CommitteeType} committee members found for application {ApplicationId}", 
                    message.CommitteeType, message.ApplicationId);
                return;
            }

            // Fetch staff details to get emails
            var emailContacts = new List<EmailContact>();
            foreach (var member in promotionCommittees)
            {
                var staff = await staffRepository.GetByIdAsync(member.StaffId);
                if (staff != null && !string.IsNullOrEmpty(staff.Email))
                {
                    emailContacts.Add(new EmailContact
                    {
                        Email = staff.Email,
                        Name = $"{staff.FirstName} {staff.LastName}"
                    });
                }
            }

            if (emailContacts.Count == 0)
            {
                _logger.LogWarning("[SendCommitteeEmailActor] No valid email addresses found for {CommitteeType} committee members", message.CommitteeType);
                return;
            }

            foreach (var contact in emailContacts)
            {
                var payload = new CommitteeNotificationPayload
                {
                    RecipientEmail = contact.Email,
                    RecipientName = contact.Name,
                    CommitteeMemberName = contact.Name,
                    ApplicantName = message.ApplicantName,
                    ApplicantPosition = message.ApplicantPosition,
                    TargetPosition = message.TargetPosition,
                    CommitteeType = message.CommitteeType,
                    SubmissionDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    ReviewUrl = message.ReviewUrl
                };

                var response = await emailNotificationService.SendCommitteeNotificationAsync(payload);
                if (response.IsSuccessful)
                {
                    _logger.LogInformation("[SendCommitteeEmailActor] Successfully sent {CommitteeType} committee notification to {Email} for application {ApplicationId}",
                        message.CommitteeType, contact.Email, message.ApplicationId);
                }
                else
                {
                    _logger.LogWarning("[SendCommitteeEmailActor] Failed to send {CommitteeType} committee notification to {Email}: {Message}",
                        message.CommitteeType, contact.Email, response.Message);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendCommitteeEmailActor] Error sending committee email for application {ApplicationId}", message.ApplicationId);
        }
    }
}
