using Akka.Actor;
using Umat.Osass.Admin.Api.Actors;
using Umat.Osass.Admin.Api.Actors.Messages;
using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Admin.Api.Extensions;

public static class ActorEmailExtension
{
    public static void SendEmailAsync(this ActorSystem actorSystem, SendEmailRequest emailRequest)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendEmailMessage(emailRequest), ActorRefs.NoSender);
    }

    /// <summary>
    /// Fire-and-forget: dispatches a staff onboarding/registration email via the actor system.
    /// </summary>
    public static void SendStaffRegistrationNotificationAsync(this ActorSystem actorSystem, StaffRegistrationPayload payload)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendStaffRegistrationNotificationMessage(payload), ActorRefs.NoSender);
    }

    /// <summary>
    /// Fire-and-forget: dispatches a committee assignment email via the actor system.
    /// </summary>
    public static void SendCommitteeAssignmentNotificationAsync(this ActorSystem actorSystem, CommitteeAssignmentPayload payload)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendCommitteeAssignmentNotificationMessage(payload), ActorRefs.NoSender);
    }
}
