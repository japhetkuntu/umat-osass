namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class FacultyResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string SchoolId { get; set; }
    public string SchoolName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}