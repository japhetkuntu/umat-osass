using Akka.Actor;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Actors;
using Umat.Osass.Promotion.NonAcademic.Api.Actors.Messages;

namespace Umat.Osass.Promotion.NonAcademic.Api.Extensions;

/// <summary>
/// Extension methods for sending emails asynchronously via Akka.NET actors.
/// Decouples email sending from business logic so service operations are not blocked by email I/O.
/// </summary>
public static class ActorEmailExtension
{
    /// <summary>
    /// Fire-and-forget: dispatches an application-approved email via the actor system.
    /// </summary>
    public static void SendApplicationApprovedNotificationAsync(this ActorSystem actorSystem, ApplicationApprovedPayload payload)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendApplicationApprovedNotificationMessage(payload), ActorRefs.NoSender);
    }

    /// <summary>
    /// Fire-and-forget: dispatches an application-returned email via the actor system.
    /// </summary>
    public static void SendApplicationReturnedNotificationAsync(this ActorSystem actorSystem, ApplicationReturnedPayload payload)
    {
        if (actorSystem == null) throw new ArgumentNullException(nameof(actorSystem));

        var mainActor = TopLevelActors.GetActor<MainActor>();
        mainActor.Tell(new SendApplicationReturnedNotificationMessage(payload), ActorRefs.NoSender);
    }
}
