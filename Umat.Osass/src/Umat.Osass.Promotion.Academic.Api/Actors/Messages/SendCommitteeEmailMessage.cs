namespace Umat.Osass.Promotion.Academic.Api.Actors.Messages;

public struct SendCommitteeEmailMessage
{
    public string ApplicationId { get; set; }
    public string ApplicantName { get; set; }
    public string ApplicantEmail { get; set; }
    public string ApplicantPosition { get; set; }
    public string ApplicantDepartmentId { get; set; }
    public string ApplicantDepartmentName { get; set; }
    public string ApplicantFacultyId { get; set; }
    public string ApplicantFacultyName { get; set; }
    public string ApplicantSchoolName { get; set; }
    public string TargetPosition { get; set; }
    public string CommitteeType { get; set; } // DAPC, FAPSC, UAPC (matches AcademicPromotionApplicationRoles)
    public string ReviewUrl { get; set; }

    public SendCommitteeEmailMessage()
    {
        ReviewUrl = "https://academic-portal.umat.edu.gh/review";
    }
}

