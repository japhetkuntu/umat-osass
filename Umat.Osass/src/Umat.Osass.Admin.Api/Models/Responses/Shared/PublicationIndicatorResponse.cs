namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class PublicationIndicatorResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public double Score { get; set; }
    public double ScoreForPresentation { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}