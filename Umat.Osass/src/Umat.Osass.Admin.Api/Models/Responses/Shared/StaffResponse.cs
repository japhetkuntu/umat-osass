namespace Umat.Osass.Admin.Api.Models.Responses.Shared;

public class StaffResponse
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string StaffId { get; set; }
    public string Position { get; set; }
    public string PreviousPosition { get; set; }
    public DateTime LastAppointmentOrPromotionDate { get; set; }
    public string Title { get; set; }
    public string StaffCategory { get; set; }
    public string? UniversityRole { get; set; }
    public string DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? FacultyId { get; set; }
    public string? FacultyName { get; set; }
    public string SchoolId { get; set; }
    public string? SchoolName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
