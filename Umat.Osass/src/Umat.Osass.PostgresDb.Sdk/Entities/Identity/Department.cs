namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class Department:BaseEntity
{
    public string Name { get; set; }
    public string SchoolId { get; set; }
    public string? FacultyId { get; set; }
    public string DepartmentType { get; set; } // academic or non-academic or all
}