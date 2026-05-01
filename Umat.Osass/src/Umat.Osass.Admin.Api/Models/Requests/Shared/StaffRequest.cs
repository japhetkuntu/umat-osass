namespace Umat.Osass.Admin.Api.Models.Requests.Shared;

public class StaffRequest
{
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
}
