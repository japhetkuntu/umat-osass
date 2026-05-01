namespace Umat.Osass.PostgresDb.Sdk.Entities.Identity;

public class Staff : BaseEntity
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string StaffId { get; set; }
    public string Position { get; set; } // lecturer/ senior lecturer, associate professor, professor, registrar, senior librarian etc.
    public string PreviousPosition { get; set; }
    public DateTime LastAppointmentOrPromotionDate { get; set; }
    public string Title { get; set; } // Dr. Mr. Prof. etc.
    public string StaffCategory { get; set; } // Academic, Non-Academic
    public string? UniversityRole { get; set; } // vice chancellor, pro vice chancellor etc.
    public string Password { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string DepartmentId { get; set; }
    public string? FacultyId { get; set; }
    public string SchoolId { get; set; } // a staff can be in multiple schools example, vice chancellor, pro vice chancellors, registrar etc.
    
}

