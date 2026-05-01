using Akka.Actor;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Identity.Api.Actors;
using Umat.Osass.Identity.Api.Actors.Messages;

namespace Umat.Osass.Identity.Api.Extensions;

/// <summary>
/// Extension methods for sending emails asynchronously via Akka.NET actors (fire-and-forget).
/// Decouples email dispatch from API request threads to keep response times low.
/// </summary>
public static class ActorEmailExtension
{
    public static void SendEmailAsync(this ActorSystem actorSystem, SendEmailRequest emailRequest)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendEmailMessage(emailRequest), ActorRefs.NoSender);
    }

    public static void SendStaffRegistrationNotificationAsync(this ActorSystem actorSystem, StaffRegistrationPayload payload)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendStaffRegistrationNotificationMessage(payload), ActorRefs.NoSender);
    }
}
