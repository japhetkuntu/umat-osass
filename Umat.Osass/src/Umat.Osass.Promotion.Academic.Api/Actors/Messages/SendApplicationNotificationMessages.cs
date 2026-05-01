using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Promotion.Academic.Api.Actors.Messages;

public readonly struct SendApplicationApprovedNotificationMessage
{
    public ApplicationApprovedPayload Payload { get; }

    public SendApplicationApprovedNotificationMessage(ApplicationApprovedPayload payload)
    {
        Payload = payload;
    }
}

public readonly struct SendApplicationReturnedNotificationMessage
{
    public ApplicationReturnedPayload Payload { get; }

    public SendApplicationReturnedNotificationMessage(ApplicationReturnedPayload payload)
    {
        Payload = payload;
    }
}
