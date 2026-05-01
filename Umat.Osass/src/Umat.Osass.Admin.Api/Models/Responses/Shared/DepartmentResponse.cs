namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class DepartmentResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string? FacultyId { get; set; }
    public string? FacultyName { get; set; }
    public string SchoolId { get; set; }
    public string SchoolName { get; set; }
    public string DepartmentType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}