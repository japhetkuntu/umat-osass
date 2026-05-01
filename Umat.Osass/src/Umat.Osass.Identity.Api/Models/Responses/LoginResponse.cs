namespace Umat.Osass.Identity.Api.Models.Responses
{
    public class LoginResponse<T>
    {
        public string AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public T? MetaData { get; set; }
    }


    public class StaffLoginMetaData
    {
        public string Id { get; set; }

        public string Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Position { get; set; } // lecturer/ senior lecturer, associate professor, professor, registrar, senior librarian etc.
        public string Title { get; set; } // Dr. Mr. Prof. etc.
        public string StaffCategory { get; set; } // Academic, Non-Academic
        public string? UniversityRole { get; set; } // vice chancellor, pro vice chancellor etc.
        public string StaffId { get; set; }
    }
    
    public class AdminLoginMetaData
    {
        public string Id { get; set; }

        public string Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string? MobileNumber { get; set; }
        public string Role { get; set; }
    }

    

    public class StaffProfileResponse
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string StaffId { get; set; }
        public string Position { get; set; } // lecturer/ senior lecturer, associate professor, professor, registrar, senior librarian etc.
        public string Rank => Position; // Alias for backwards compatibility
        public string Title { get; set; } // Dr. Mr. Prof. etc.
        public string StaffCategory { get; set; } // Academic, Non-Academic
        public string? UniversityRole { get; set; } // vice chancellor, pro vice chancellor etc.

      

        
    }
    public class AdminProfileResponse
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Role { get; set; }

        
    }
}