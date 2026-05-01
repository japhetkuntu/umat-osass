namespace Umat.Osass.Admin.Api.Models.Requests.Shared;

public class PublicationIndicatorRequest
{
    public string Name { get; set; }
    public double Score { get; set; }
    public double ScoreForPresentation  { get; set; } = 0;
}