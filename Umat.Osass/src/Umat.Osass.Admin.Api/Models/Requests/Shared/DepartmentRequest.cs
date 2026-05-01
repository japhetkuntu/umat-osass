namespace Umat.Osass.Admin.Api.Models.Requests.Shared;

public class DepartmentRequest
{
    public string Name { get; set; }
    public string? FacultyId { get; set; }  // For academic departments
    public string? SchoolId { get; set; }   // For non-academic units/sections
    public string DepartmentType { get; set; }
}