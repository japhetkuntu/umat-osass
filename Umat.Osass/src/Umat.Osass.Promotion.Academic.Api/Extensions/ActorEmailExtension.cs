using Akka.Actor;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Actors;
using Umat.Osass.Promotion.Academic.Api.Actors.Messages;

namespace Umat.Osass.Promotion.Academic.Api.Extensions;

/// <summary>
/// Extension methods for sending emails asynchronously via Akka.NET actors.
/// Decouples email sending from business logic to ensure service operations are not blocked by email failures.
/// </summary>
public static class ActorEmailExtension
{
    /// <summary>
    /// Sends an email asynchronously via the actor system (fire-and-forget).
    /// This method does NOT await the email sending operation - it returns immediately.
    /// </summary>
    /// <param name="actorSystem">The Akka.NET actor system</param>
    /// <param name="emailRequest">The email request to send</param>
    /// <remarks>
    /// Email failures will be logged by the SendEmailActor and will not affect the calling service.
    /// Use this method when you want to send notifications without blocking the main operation.
    /// </remarks>
    public static void SendEmailAsync(this ActorSystem actorSystem, SendEmailRequest emailRequest)
    {
        try
        {
            var mainActor = TopLevelActors.GetActor<MainActor>();
            mainActor.Tell(new SendEmailMessage(emailRequest), ActorRefs.NoSender);
        }
        catch (Exception ex)
        {
            // Log but don't throw - calling code should not be affected by actor lookup failures
            // In production, this should use proper logging
            Console.WriteLine($"Failed to send email via actor: {ex.Message}");
        }
    }

    /// <summary>
    /// Sends a committee notification email asynchronously via the actor system (fire-and-forget).
    /// Automatically queries committee members and sends to all relevant members in a single batch email.
    /// </summary>
    /// <param name="actorSystem">The Akka.NET actor system</param>
    /// <param name="message">The committee email message containing application and committee information</param>
    /// <remarks>
    /// This method handles the entire process asynchronously:
    /// 1. Queries committee members by type and department/faculty
    /// 2. Fetches staff email addresses
    /// 3. Sends a single email to all committee members (Mailtrap supports multiple recipients)
    /// Email failures will be logged by the SendCommitteeEmailActor and will not affect the calling service.
    /// </remarks>
    public static void SendCommitteeEmailAsync(this ActorSystem actorSystem, SendCommitteeEmailMessage message)
    {
        try
        {
            var mainActor = TopLevelActors.GetActor<MainActor>();
            mainActor.Tell(message, ActorRefs.NoSender);
        }
        catch (Exception ex)
        {
            // Log but don't throw - calling code should not be affected by actor lookup failures
            Console.WriteLine($"Failed to send committee email via actor: {ex.Message}");
        }
    }

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
