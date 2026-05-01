namespace Umat.Osass.Promotion.Academic.Api.Models.Responses;

/// <summary>
/// Response for pending applications queue
/// </summary>
public class PendingApplicationResponse
{
    public string ApplicationId { get; set; } = default!;
    public string ApplicantId { get; set; } = default!;
    public string ApplicantName { get; set; } = default!;
    public string ApplicantEmail { get; set; } = default!;
    public string CurrentPosition { get; set; } = default!;
    public string ApplyingForPosition { get; set; } = default!;
    public string DepartmentName { get; set; } = default!;
    public string FacultyName { get; set; } = default!;
    public DateTime SubmissionDate { get; set; }
    public DateTime? ReceivedByCommitteeDate { get; set; }
    public string ReviewStatus { get; set; } = default!;
    public string ApplicationStatus { get; set; } = default!;
    public bool IsResubmission { get; set; }
    public int ResubmissionCount { get; set; }
    
    /// <summary>
    /// Performance summary from applicant's self-assessment
    /// </summary>
    public PerformanceSummary ApplicantPerformance { get; set; } = default!;
    
    /// <summary>
    /// Number of committee members who have reviewed
    /// </summary>
    public int ReviewedByMemberCount { get; set; }
}

public class PerformanceSummary
{
    public string TeachingPerformance { get; set; } = default!;
    public string PublicationPerformance { get; set; } = default!;
    public string ServicePerformance { get; set; } = default!;
    public double TotalTeachingScore { get; set; }
    public double TotalPublicationScore { get; set; }
    public double TotalServiceScore { get; set; }
}

/// <summary>
/// Full application details for assessment
/// </summary>
public class ApplicationForAssessmentResponse
{
    public string ApplicationId { get; set; } = default!;
    public string ApplicantId { get; set; } = default!;
    public string ApplicantName { get; set; } = default!;
    public string ApplicantEmail { get; set; } = default!;
    public string CurrentPosition { get; set; } = default!;
    public string ApplyingForPosition { get; set; } = default!;
    public string DepartmentName { get; set; } = default!;
    public string FacultyName { get; set; } = default!;
    public string SchoolName { get; set; } = default!;
    public DateTime SubmissionDate { get; set; }
    public string ReviewStatus { get; set; } = default!;
    public string ApplicationStatus { get; set; } = default!;
    public List<string>? PerformanceCriteria { get; set; }
    
    /// <summary>
    /// Teaching assessment data with all committee scores
    /// </summary>
    public TeachingAssessmentData Teaching { get; set; } = default!;
    
    /// <summary>
    /// Publication data with all committee scores
    /// </summary>
    public PublicationAssessmentData Publications { get; set; } = default!;
    
    /// <summary>
    /// Service data with all committee scores
    /// </summary>
    public ServiceAssessmentData Services { get; set; } = default!;
    
    /// <summary>
    /// Previous assessments from other committees
    /// </summary>
    public List<PreviousAssessment> PreviousAssessments { get; set; } = new();
    
    /// <summary>
    /// Activity history for this application
    /// </summary>
    public List<ActivityHistoryItem> ActivityHistory { get; set; } = new();
}

public class TeachingAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? DapcPerformance { get; set; }
    public string? FapcPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalCategoriesAssessed { get; set; }
    public List<TeachingCategoryAssessment> Categories { get; set; } = new();
}

public class TeachingCategoryAssessment
{
    public string CategoryName { get; set; } = default!;
    public string CategoryKey { get; set; } = default!;
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? DapcScore { get; set; }
    public string? DapcRemarks { get; set; }
    public double? FapcScore { get; set; }
    public string? FapcRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class PublicationAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? DapcPerformance { get; set; }
    public string? FapcPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalPublications { get; set; }
    public List<PublicationRecordAssessment> Records { get; set; } = new();
}

public class PublicationRecordAssessment
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public int Year { get; set; }
    public string? PublicationType { get; set; }
    public double SystemGeneratedScore { get; set; }
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? DapcScore { get; set; }
    public string? DapcRemarks { get; set; }
    public double? FapcScore { get; set; }
    public string? FapcRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class ServiceAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? DapcPerformance { get; set; }
    public string? FapcPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalServiceRecords { get; set; }
    public List<ServiceRecordAssessment> UniversityService { get; set; } = new();
    public List<ServiceRecordAssessment> NationalInternationalService { get; set; } = new();
}

public class ServiceRecordAssessment
{
    public string Id { get; set; } = default!;
    public string? ServiceTitle { get; set; }
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public string? ServiceType { get; set; }
    public double SystemGeneratedScore { get; set; }
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? DapcScore { get; set; }
    public string? DapcRemarks { get; set; }
    public double? FapcScore { get; set; }
    public string? FapcRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class PreviousAssessment
{
    public string CommitteeLevel { get; set; } = default!;
    public DateTime AssessmentDate { get; set; }
    public string? AssessedBy { get; set; }
    public string? TeachingPerformance { get; set; }
    public string? PublicationPerformance { get; set; }
    public string? ServicePerformance { get; set; }
    public string? OverallRemarks { get; set; }
    public string? Recommendation { get; set; }
}

public class ActivityHistoryItem
{
    public string Id { get; set; } = default!;
    public string ActivityType { get; set; } = default!;
    public string? Description { get; set; }
    public string? PerformedBy { get; set; }
    public string? CommitteeLevel { get; set; }
    public bool IsChairperson { get; set; }
    public DateTime ActivityDate { get; set; }
    public string? CategoryAffected { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public AssessmentActivityDataResponse? AdditionalData { get; set; }
}

/// <summary>
/// Simple paged result wrapper used by API endpoints that return lists with counts
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
}

public class AssessmentActivityDataResponse
{
    public double? PreviousScore { get; set; }
    public double? NewScore { get; set; }
    public string? Remarks { get; set; }
    public string? ReturnReason { get; set; }
}

/// <summary>
/// Committee member's access and permissions
/// </summary>
public class CommitteeMemberInfoResponse
{
    public string StaffId { get; set; } = default!;
    public string StaffName { get; set; } = default!;
    public string? Email { get; set; }
    public List<CommitteeMembership> Committees { get; set; } = new();
}

public class CommitteeMembership
{
    public string CommitteeType { get; set; } = default!;
    public bool IsChairperson { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public string? DepartmentId { get; set; }
    public string? FacultyId { get; set; }
    public string? SchoolId { get; set; }
}

/// <summary>
/// Dashboard statistics for committee member
/// </summary>
public class AssessmentDashboardResponse
{
    public CommitteeMemberInfoResponse MemberInfo { get; set; } = default!;
    public int PendingApplicationsCount { get; set; }
    public int InProgressCount { get; set; }
    public int CompletedThisMonthCount { get; set; }
    public int ReturnedCount { get; set; }
    public List<RecentActivitySummary> RecentActivities { get; set; } = new();
}

public class RecentActivitySummary
{
    public string ApplicationId { get; set; } = default!;
    public string? ApplicantName { get; set; }
    public string ActivityType { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime ActivityDate { get; set; }
}

/// <summary>
/// Promotion validation response with requirements analysis
/// </summary>
public class PromotionValidationResponse
{
    public string ApplicationId { get; set; } = default!;
    public string ApplicantName { get; set; } = default!;
    public string CurrentPosition { get; set; } = default!;
    public string ApplyingForPosition { get; set; } = default!;
    
    /// <summary>
    /// Overall recommendation: Approve, ReturnForUpdate
    /// </summary>
    public string Recommendation { get; set; } = default!;
    
    /// <summary>
    /// Whether all requirements are met
    /// </summary>
    public bool MeetsAllRequirements { get; set; }
    
    /// <summary>
    /// Overall summary message
    /// </summary>
    public string Summary { get; set; } = default!;
    
    /// <summary>
    /// Position requirements
    /// </summary>
    public PositionRequirements Requirements { get; set; } = default!;
    
    /// <summary>
    /// Applicant's current performance against requirements
    /// </summary>
    public ApplicantPerformanceAnalysis Performance { get; set; } = default!;
    
    /// <summary>
    /// Detailed validation items
    /// </summary>
    public List<ValidationItem> ValidationItems { get; set; } = new();
    
    /// <summary>
    /// Strengths identified in the application
    /// </summary>
    public List<string> Strengths { get; set; } = new();
    
    /// <summary>
    /// Areas that need improvement or more evidence
    /// </summary>
    public List<string> AreasForImprovement { get; set; } = new();
}

public class PositionRequirements
{
    public string PositionName { get; set; } = default!;
    public int MinimumYearsFromLastPromotion { get; set; }
    public int MinimumPublications { get; set; }
    public int MinimumRefereedJournals { get; set; }
    public List<string> AcceptablePerformanceCriteria { get; set; } = new();
    public string PerformanceCriteriaDescription { get; set; } = default!;
}

public class ApplicantPerformanceAnalysis
{
    /// <summary>
    /// Years since last promotion
    /// </summary>
    public int YearsSinceLastPromotion { get; set; }
    
    /// <summary>
    /// Total publications submitted
    /// </summary>
    public int TotalPublications { get; set; }
    
    /// <summary>
    /// Number of refereed journal publications
    /// </summary>
    public int RefereedJournalCount { get; set; }
    
    /// <summary>
    /// UAPC or final performance levels
    /// </summary>
    public string TeachingPerformance { get; set; } = default!;
    public string PublicationPerformance { get; set; } = default!;
    public string ServicePerformance { get; set; } = default!;
    
    /// <summary>
    /// Performance combination string (e.g., "High,Good,Adequate")
    /// </summary>
    public string PerformanceCombination { get; set; } = default!;
    
    /// <summary>
    /// Total scores from UAPC assessment
    /// </summary>
    public double TeachingScore { get; set; }
    public double PublicationScore { get; set; }
    public double ServiceScore { get; set; }
}

public class ValidationItem
{
    public string Category { get; set; } = default!;
    public string Requirement { get; set; } = default!;
    public string ActualValue { get; set; } = default!;
    public bool IsMet { get; set; }
    public string? Notes { get; set; }
    public string Severity { get; set; } = "Info"; // Info, Warning, Critical
}
