using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Actors.Messages;
using Umat.Osass.Promotion.Academic.Api.Extensions;

namespace Umat.Osass.Promotion.Academic.Api.Actors;

public class SendEmailActor : BaseActor
{
    private readonly ILogger _logger;
    private readonly IServiceProvider _serviceProvider;

    public SendEmailActor(ILogger<SendEmailActor> logger, IServiceProvider serviceProvider)
    {
        ReceiveAsync<SendEmailMessage>(SendEmail);

        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private async Task SendEmail(SendEmailMessage message)
    {
        try
        {
            _logger.LogInformation("Sending email with payload: {payload}", "[redacted]");

            // Publish the email message to the cluster
            var emailService =
                _serviceProvider.CreateScope().ServiceProvider.GetService<IEmailService>();
            var response = await emailService!.SendEmail(message.Data);
            _logger.LogInformation("Email send completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email with payload: {payload}", "[redacted]");
            throw;
        }
    }
}
