using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Identity.Api.Actors.Messages;

public readonly struct SendStaffRegistrationNotificationMessage
{
    public StaffRegistrationPayload Payload { get; }

    public SendStaffRegistrationNotificationMessage(StaffRegistrationPayload payload)
    {
        Payload = payload;
    }
}
