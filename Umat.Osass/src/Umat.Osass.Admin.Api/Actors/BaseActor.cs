using Akka.Actor;
using Akka.DependencyInjection;

namespace Umat.Osass.Admin.Api.Actors;

public class BaseActor : ReceiveActor
{
    protected void Publish(object @event)
    {
        Context.Dispatcher.EventStream.Publish(@event);
    }

    protected void ReceiveAsync<TMessage, TActor>(bool poisonPill = false, string? name = null) where TActor : BaseActor
        => ReceiveAsync<TMessage>(async message =>
            await ForwardMessageToChildActor<TMessage, TActor>(message, poisonPill, name));


    protected async Task ForwardMessageToChildActor<TMessage, TActor>(TMessage message, bool poisonPill = false,
        string? name = null)
        where TActor : BaseActor
    {
        var actorRef = CreateChildActor<TActor>(name);

        actorRef.Forward(message);

        if (poisonPill)
        {
            actorRef.Tell(PoisonPill.Instance);
        }

        await Task.CompletedTask;
    }

    protected static IActorRef CreateChildActor<TActor>(string? name) where TActor : BaseActor
    {
        return Context.ActorOf(
            DependencyResolver
                .For(Context.System)
                .Props<TActor>()
                .WithSupervisorStrategy(GetDefaultSupervisorStrategy),
            GetActorName(name));

        static string GetActorName(string? name)
        {
            return
                $"hubtel-{typeof(TActor).Name.ToLower()}{(string.IsNullOrEmpty(name) ? "" : "-" + name.ToLower())}-{Guid.NewGuid():N}";
        }
    }

    private static SupervisorStrategy GetDefaultSupervisorStrategy => new OneForOneStrategy(
        3, TimeSpan.FromSeconds(3), ex =>
        {
            if (!(ex is ActorInitializationException))
                return Directive.Resume;

            Context.System.Terminate().Wait(1000);

            return Directive.Stop;
        });
}