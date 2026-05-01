using Akka.Actor;
using Umat.Osass.Admin.Api.Extensions;

namespace Umat.Osass.Admin.Api.Actors;

public class SendCallbackActor : BaseActor
{
    private readonly ILogger _logger;

    public SendCallbackActor(ILogger<SendCallbackActor> logger)
    {
        ReceiveAsync<SendCallbackMessage>(SendCallback);

        _logger = logger;
    }

    private async Task SendCallback(SendCallbackMessage message)
    {
        var serializedPayload = message.Payload.Serialize();
        try
        {
            if (string.IsNullOrEmpty(message.CallbackUrl))
            {
                _logger.LogError("No callback url provided for {callback_payload}", serializedPayload);
                return;
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred sending callback" +
                                 "\nUrl: {callback_url}" +
                                 "\nPayload: {callback_payload}",
                message.CallbackUrl, serializedPayload);
        }

        Self.Tell(PoisonPill.Instance);
    }
}

public struct SendCallbackMessage
{
    public SendCallbackMessage(string callbackUrl, object payload)
    {
        CallbackUrl = callbackUrl;
        Payload = payload;
    }

    public string CallbackUrl { get; }
    public object Payload { get; }
}