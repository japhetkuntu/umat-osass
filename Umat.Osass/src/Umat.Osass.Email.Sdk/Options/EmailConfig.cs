namespace Umat.Osass.Email.Sdk.Options;

public class EmailConfig
{
    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 1025;
    public bool UseSsl { get; set; } = false;
    public bool UseStartTls { get; set; } = true;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string DefaultSenderName { get; set; } = "OSASS";
    public string DefaultSenderEmail { get; set; } = "noreply@osass.umat.edu.gh";
    public string TemplateDirectory { get; set; } = "Templates";
    //public Dictionary<string, string> TemplateSubjects { get; set; } = new();
    public EmailTemplates Templates { get; set; } = new();
}

public class EmailTemplates
{
    // Identity Service
    public string? Registration { get; set; }
    public string? ResetPassword { get; set; }
    public string? AdminRegister { get; set; }

    // Promotion Application Service
    public string? ApplicationSubmittedToDapc { get; set; }
    public string? ApplicationSubmittedToFapc { get; set; }
    public string? ApplicationSubmittedToUapc { get; set; }
    public string? ApplicationApproved { get; set; }
    public string? ApplicationReturned { get; set; }
    public string? StaffRegistration { get; set; }

    // Staff onboarding
    public string? StaffOnboardingAcademic { get; set; }
    public string? StaffOnboardingNonAcademic { get; set; }
    public string? CommitteeAssignment { get; set; }
}