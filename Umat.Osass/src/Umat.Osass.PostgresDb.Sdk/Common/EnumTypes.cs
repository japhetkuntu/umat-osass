namespace Umat.Osass.PostgresDb.Sdk.Common;

public class AcademicPromotionApplicationRoles
{
    public const string Applicant = "Applicant";
    public const string DAPC = "DAPC";
    public const string FAPSC = "FAPSC";
    public const string UAPC = "UAPC";
    public const string ExternalAssessor = "ExternalAssessor";
}


public static class AdminRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Moderator = "Moderator";
}

public static class  AcademicPromotionState 
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string DepartmentReview = "Department Review";
    public const string FacultyReview = "Faculty Review";
    public const string UAPCReview = "UAPC Review";
    public const string ExternalAssessment = "External Assessment";
    public const string CouncilApproved = "Council Approved";
    public const string Rejected = "Rejected";
    public const string Appealed = "Appealed";
    public const string Closed = "Closed";
    public const string Returned = "Returned";
    public const string ReturnedForUpdate = "Returned for Update";
}


public static class CommitteeTypes
{
    public const string DAPC = "DAPC";
    public const string FAPSC = "FAPSC";
    public const string UAPC = "UAPC";
}

public static class DepartmentTypes
{
    public const string Academic = "Academic";
    public const string NonAcademic = "NonAcademic";
}


public static class PerformanceTypes
{
    public const string InAdequate = "In Adequate";
    public const string Adequate = "Adequate";
    public const string Good = "Good";
    public const string High = "High";
    public const string NotStarted = "Not Started";
}

public static class ApplicationProgressStates
{
    public const string InProgress = "In Progress";
    public const string Completed = "Completed";
}

public static class ApplicationReviewStatusTypes
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string DepartmentReview = "Department Review";
    public const string FacultyReview = "Faculty Review";
    public const string UAPCReview = "UAPC Review";
    public const string ExternalAssessment = "External Assessment";
    public const string CouncilDecision = "Council Decision";
}

public static class ApplicationStatusTypes
{

    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string UnderReview = "Under Review";
    public const string NotApproved = "Not Approved";
    public const string Approved = "Approved";
    public const string Returned = "Returned";
    
}

public class NonAcademicApplicationRoles
{
    public const string Applicant = "Applicant";
    public const string HOU = "HOU";
    public const string AAPSC = "AAPSC";
    public const string UAPC = "UAPC";
}

public static class NonAcademicCommitteeTypes
{
    public const string HOU = "HOU";
    public const string AAPSC = "AAPSC";
    public const string UAPC = "UAPC";
}

public static class NonAcademicPromotionState
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string HouReview = "HOU Review";
    public const string AapscReview = "AAPSC Review";
    public const string UAPCDecision = "UAPC Decision";
    public const string CouncilApproved = "Council Approved";
    public const string Rejected = "Rejected";
    public const string Returned = "Returned";
    public const string ReturnedForUpdate = "Returned for Update";
    public const string Closed = "Closed";
}

public static class NonAcademicUnitTypes
{
    public const string Registry = "Registry";
    public const string Finance = "Finance";
    public const string InternalAudit = "Internal Audit";
    public const string Library = "Library";
    public const string Works = "Works and Physical Development";
    public const string Estate = "Estate";
    public const string ICT = "ICT";
}

public static class KnowledgeMaterialTypes
{
    public const string Journal = "Journal";
    public const string Conference = "Conference";
    public const string Book = "Book";
    public const string Chapter = "Chapter";
    public const string Patent = "Patent";
    public const string TechnicalReport = "Technical Report";
    public const string Memo = "Memo";
}


