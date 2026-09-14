namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class ServicePositionResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public double Score { get; set; }
    public string CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}