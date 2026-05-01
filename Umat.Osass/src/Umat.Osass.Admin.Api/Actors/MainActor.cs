using Umat.Osass.Admin.Api.Actors.Messages;

namespace Umat.Osass.Admin.Api.Actors;

public class MainActor : BaseActor
{
    public MainActor()
    {
        ReceiveAsync<SendCallbackMessage, SendCallbackActor>();
        ReceiveAsync<SendEmailMessage, SendEmailActor>();
        ReceiveAsync<SendStaffRegistrationNotificationMessage, SendNotificationActor>();
        ReceiveAsync<SendCommitteeAssignmentNotificationMessage, SendNotificationActor>();
    }
}