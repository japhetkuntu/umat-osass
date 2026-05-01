using Umat.Osass.Admin.Api.Actors.Messages;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Email.Sdk.Services.Interfaces;

namespace Umat.Osass.Admin.Api.Actors;

public class SendNotificationActor : BaseActor
{
    private readonly ILogger<SendNotificationActor> _logger;
    private readonly IServiceProvider _serviceProvider;

    public SendNotificationActor(ILogger<SendNotificationActor> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;

        ReceiveAsync<SendStaffRegistrationNotificationMessage>(HandleStaffRegistration);
        ReceiveAsync<SendCommitteeAssignmentNotificationMessage>(HandleCommitteeAssignment);
    }

    private async Task HandleStaffRegistration(SendStaffRegistrationNotificationMessage message)
    {
        try
        {
            _logger.LogInformation("[SendNotificationActor] Sending staff registration email to {Email}", message.Payload.RecipientEmail);

            using var scope = _serviceProvider.CreateScope();
            var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

            var response = await emailNotificationService.SendStaffRegistrationAsync(message.Payload);
            if (!response.IsSuccessful)
            {
                _logger.LogWarning("[SendNotificationActor] Staff registration email failed for {Email}: {Message}",
                    message.Payload.RecipientEmail, response.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendNotificationActor] Error sending staff registration email to {Email}",
                message.Payload.RecipientEmail);
        }
    }

    private async Task HandleCommitteeAssignment(SendCommitteeAssignmentNotificationMessage message)
    {
        try
        {
            _logger.LogInformation("[SendNotificationActor] Sending committee assignment email to {Email}", message.Payload.RecipientEmail);

            using var scope = _serviceProvider.CreateScope();
            var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

            var response = await emailNotificationService.SendCommitteeAssignmentNotificationAsync(message.Payload);
            if (!response.IsSuccessful)
            {
                _logger.LogWarning("[SendNotificationActor] Committee assignment email failed for {Email}: {Message}",
                    message.Payload.RecipientEmail, response.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendNotificationActor] Error sending committee assignment email to {Email}",
                message.Payload.RecipientEmail);
        }
    }
}
