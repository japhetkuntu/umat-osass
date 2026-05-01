using Umat.Osass.Promotion.NonAcademic.Api.Actors.Messages;

namespace Umat.Osass.Promotion.NonAcademic.Api.Actors;

public class MainActor : BaseActor
{
    public MainActor()
    {
        ReceiveAsync<SendApplicationApprovedNotificationMessage, SendApplicationNotificationActor>();
        ReceiveAsync<SendApplicationReturnedNotificationMessage, SendApplicationNotificationActor>();
    }
}
