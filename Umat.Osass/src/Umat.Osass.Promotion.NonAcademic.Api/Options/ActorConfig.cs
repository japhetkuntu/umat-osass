namespace Umat.Osass.Promotion.NonAcademic.Api.Options;

public abstract class BaseActorConfig
{
    public int NumberOfInstances { get; set; } = 10;
    public int UpperBound { get; set; } = 100;
}

public class ActorConfig
{
    public SendNotificationActorConfig SendNotificationActorConfig { get; set; } = new();
}

public class SendNotificationActorConfig : BaseActorConfig
{
}
