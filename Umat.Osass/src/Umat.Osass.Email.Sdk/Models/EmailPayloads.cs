namespace Umat.Osass.Email.Sdk.Models;

/// <summary>
/// Base email payload for all email notifications
/// </summary>
public abstract class BaseEmailPayload
{
    public string RecipientEmail { get; set; }
    public string RecipientName { get; set; }
    public string EmailType { get; set; }
}

/// <summary>
/// Email payload for application submitted to committee (DAPC, FAPC, UAPC)
/// </summary>
public class ApplicationSubmittedPayload : BaseEmailPayload
{
    public string ApplicantName { get; set; }
    public string ApplicantPosition { get; set; }
    public string TargetPosition { get; set; }
    public string AppliedDate { get; set; }
    public string DepartmentName { get; set; }
    public string FacultyName { get; set; }
    public string SchoolName { get; set; }
    public string CommitteeType { get; set; } // DAPC, FAPC, UAPC
    public string ApplicationUrl { get; set; }
}

/// <summary>
/// Email payload for application approval notification
/// </summary>
public class ApplicationApprovedPayload : BaseEmailPayload
{
    public string ApplicantName { get; set; }
    public string CurrentPosition { get; set; }
    public string NewPosition { get; set; }
    public string EffectiveDate { get; set; }
    public string AcademicPortalUrl { get; set; }
}

/// <summary>
/// Email payload for application returned notification
/// </summary>
public class ApplicationReturnedPayload : BaseEmailPayload
{
    public string ApplicantName { get; set; }
    public string Position { get; set; }
    public string ReturnReason { get; set; }
    public string ReturnedDate { get; set; }
    public string ApplicationUrl { get; set; }
}

/// <summary>
/// Email payload for staff registration (temporal password)
/// </summary>
public class StaffRegistrationPayload : BaseEmailPayload
{
    public string staffId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string TemporalPassword { get; set; }
    public string StaffCategory { get; set; } // Academic or Non-Academic
    public string PortalLoginUrl { get; set; }
    public string PasswordChangeRequiredUrl { get; set; }
}

/// <summary>
/// Email payload for committee notification when application is submitted
/// </summary>
public class CommitteeNotificationPayload : BaseEmailPayload
{
    public string CommitteeMemberName { get; set; }
    public string ApplicantName { get; set; }
    public string ApplicantPosition { get; set; }
    public string TargetPosition { get; set; }
    public string CommitteeType { get; set; }
    public string SubmissionDate { get; set; }
    public string ReviewUrl { get; set; }
}

public class CommitteeAssignmentPayload : BaseEmailPayload
{
    public string StaffName { get; set; }
    public string CommitteeType { get; set; }
    public string CommitteeRole { get; set; }
    public string DepartmentName { get; set; }
    public string PortalUrl { get; set; }
}
