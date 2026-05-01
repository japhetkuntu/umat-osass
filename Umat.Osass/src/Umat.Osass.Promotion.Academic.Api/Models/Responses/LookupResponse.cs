namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

public class PublicationIndicatorResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; } = 0;
}

public class ServicePositionResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Score { get; set; }
    public string ServiceType { get; set; } = string.Empty;
}
