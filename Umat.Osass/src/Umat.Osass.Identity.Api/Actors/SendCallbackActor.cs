using Akka.Actor;
using Umat.Osass.Identity.Api.Extensions;

namespace Umat.Osass.Identity.Api.Actors;

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
        try
        {
            if (string.IsNullOrEmpty(message.CallbackUrl))
            {
                _logger.LogError("No callback url provided");
                return;
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred sending callback");
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
