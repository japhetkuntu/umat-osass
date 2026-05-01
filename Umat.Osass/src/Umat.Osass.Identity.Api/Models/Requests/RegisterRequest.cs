using System.ComponentModel.DataAnnotations;

namespace Umat.Osass.Identity.Api.Models.Requests;

public class RegisterRequest
{
   
    [Required]  [EmailAddress(ErrorMessage = "Invalid email address format.")]
    public string Email { get; set; }
    [Required]      public string FirstName { get; set; }
    [Required]    public string LastName { get; set; }

    [Required]  public string Password { get; set; }
    [Required]  public string ConfirmPassword { get; set; }
   [Required] public string Title { get; set; }
   [Required] public string Rank { get; set; }
   public string StaffCategory { get; set; } // Academic, Non-Academic
   [Required] public string StaffId { get; set; }
    
}


public class AddStaffRequest
{
    
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
     public string Rank { get; set; } // lecturer,senior lecturer, professor, associate professor etc.
   public string Title { get; set; } // Dr. Mrs. Mr. Assoc Prof. Prof etc.
   public string StaffCategory { get; set; } // Academic, Non-Academic
   public string StaffId { get; set; }
   public string DepartmentId { get; set; }
   public string Position { get; set; } // lecturer/ senior lecturer, associate professor, professor, registrar, senior librarian etc.
   public string PreviousPosition { get; set; }
   public DateTime LastAppointmentOrPromotionDate { get; set; }

}