using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Actors.Messages;
using Umat.Osass.Email.Sdk.Services.Interfaces;

namespace Umat.Osass.Admin.Api.Actors;

public class SendEmailActor : BaseActor
{
    private readonly ILogger _logger;
        private readonly IServiceProvider _serviceProvider;

    public SendEmailActor(ILogger<SendEmailActor> logger,IServiceProvider serviceProvider)
    {
        ReceiveAsync<SendEmailMessage>(SendEmail);

     _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private async Task SendEmail(SendEmailMessage message)
    {

        try
        {
            var serializedPayload = message.Data.Serialize();
            _logger.LogInformation("Sending email with payload: {payload}", serializedPayload);

            // Publish the email message to the cluster
            var emailService =
                         _serviceProvider.CreateScope().ServiceProvider.GetService<IEmailService>();
            var response = await emailService!.SendEmail(message.Data);
            _logger.LogInformation("Email sent successfully with response: {response}", response);
           

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email with payload: {payload}", message.Data.Serialize());
            throw;
        }

     
    }
}

