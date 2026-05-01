using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Admin.Api.Actors.Messages;

public readonly struct SendStaffRegistrationNotificationMessage
{
    public StaffRegistrationPayload Payload { get; }

    public SendStaffRegistrationNotificationMessage(StaffRegistrationPayload payload)
    {
        Payload = payload;
    }
}

public readonly struct SendCommitteeAssignmentNotificationMessage
{
    public CommitteeAssignmentPayload Payload { get; }

    public SendCommitteeAssignmentNotificationMessage(CommitteeAssignmentPayload payload)
    {
        Payload = payload;
    }
}
