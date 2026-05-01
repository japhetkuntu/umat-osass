using Umat.Osass.Promotion.Academic.Api.Actors.Messages;

namespace Umat.Osass.Promotion.Academic.Api.Actors;

public class MainActor : BaseActor
{
    public MainActor()
    {
        ReceiveAsync<SendCallbackMessage, SendCallbackActor>();
        ReceiveAsync<SendCommitteeEmailMessage, SendCommitteeEmailActor>();
        ReceiveAsync<SendApplicationApprovedNotificationMessage, SendApplicationNotificationActor>();
        ReceiveAsync<SendApplicationReturnedNotificationMessage, SendApplicationNotificationActor>();
    }
}