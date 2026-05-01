using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.Promotion.NonAcademic.Api.Actors.Messages;

namespace Umat.Osass.Promotion.NonAcademic.Api.Actors;

public class SendApplicationNotificationActor : BaseActor
{
    private readonly ILogger<SendApplicationNotificationActor> _logger;
    private readonly IServiceProvider _serviceProvider;

    public SendApplicationNotificationActor(ILogger<SendApplicationNotificationActor> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;

        ReceiveAsync<SendApplicationApprovedNotificationMessage>(HandleApproved);
        ReceiveAsync<SendApplicationReturnedNotificationMessage>(HandleReturned);
    }

    private async Task HandleApproved(SendApplicationApprovedNotificationMessage message)
    {
        try
        {
            _logger.LogInformation("[SendApplicationNotificationActor] Sending approval email to {Email}", message.Payload.RecipientEmail);

            using var scope = _serviceProvider.CreateScope();
            var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

            var response = await emailNotificationService.SendApplicationApprovedNotificationAsync(message.Payload);
            if (!response.IsSuccessful)
            {
                _logger.LogWarning("[SendApplicationNotificationActor] Approval email failed for {Email}: {Message}",
                    message.Payload.RecipientEmail, response.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendApplicationNotificationActor] Error sending approval email to {Email}",
                message.Payload.RecipientEmail);
        }
    }

    private async Task HandleReturned(SendApplicationReturnedNotificationMessage message)
    {
        try
        {
            _logger.LogInformation("[SendApplicationNotificationActor] Sending returned email to {Email}", message.Payload.RecipientEmail);

            using var scope = _serviceProvider.CreateScope();
            var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

            var response = await emailNotificationService.SendApplicationReturnedNotificationAsync(message.Payload);
            if (!response.IsSuccessful)
            {
                _logger.LogWarning("[SendApplicationNotificationActor] Returned email failed for {Email}: {Message}",
                    message.Payload.RecipientEmail, response.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendApplicationNotificationActor] Error sending returned email to {Email}",
                message.Payload.RecipientEmail);
        }
    }
}
