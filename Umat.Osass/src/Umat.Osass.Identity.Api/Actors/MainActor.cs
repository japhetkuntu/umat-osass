using Umat.Osass.Identity.Api.Actors.Messages;

namespace Umat.Osass.Identity.Api.Actors;

public class MainActor : BaseActor
{
    public MainActor()
    {
        ReceiveAsync<SendCallbackMessage, SendCallbackActor>();
          ReceiveAsync<SendEmailMessage, SendEmailActor>();
          ReceiveAsync<AddBulkStaffMessage,AddStaffActor>();
          ReceiveAsync<SendStaffRegistrationNotificationMessage, SendNotificationActor>();
    }
}