namespace Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

public class PendingApplicationResponse
{
    public string ApplicationId { get; set; } = default!;
    public string ApplicantId { get; set; } = default!;
    public string ApplicantName { get; set; } = default!;
    public string ApplicantEmail { get; set; } = default!;
    public string CurrentPosition { get; set; } = default!;
    public string ApplyingForPosition { get; set; } = default!;
    public string UnitName { get; set; } = default!;
    public DateTime SubmissionDate { get; set; }
    public DateTime? ReceivedByCommitteeDate { get; set; }
    public string ReviewStatus { get; set; } = default!;
    public string ApplicationStatus { get; set; } = default!;
    public bool IsResubmission { get; set; }
    public int ResubmissionCount { get; set; }
    public NonAcademicPerformanceSummary ApplicantPerformance { get; set; } = new();
    public int ReviewedByMemberCount { get; set; }
}

public class NonAcademicPerformanceSummary
{
    public string PerformanceAtWorkPerformance { get; set; } = default!;
    public string KnowledgeProfessionPerformance { get; set; } = default!;
    public string ServicePerformance { get; set; } = default!;
    public double TotalPerformanceAtWorkScore { get; set; }
    public double TotalKnowledgeProfessionScore { get; set; }
    public double TotalServiceScore { get; set; }
}

public class ApplicationForAssessmentResponse
{
    public string ApplicationId { get; set; } = default!;
    public string ApplicantId { get; set; } = default!;
    public string ApplicantName { get; set; } = default!;
    public string ApplicantEmail { get; set; } = default!;
    public string CurrentPosition { get; set; } = default!;
    public string ApplyingForPosition { get; set; } = default!;
    public string UnitName { get; set; } = default!;
    public DateTime SubmissionDate { get; set; }
    public string ReviewStatus { get; set; } = default!;
    public string ApplicationStatus { get; set; } = default!;
    public List<string>? PerformanceCriteria { get; set; }
    public PerformanceAtWorkAssessmentData PerformanceAtWork { get; set; } = new();
    public KnowledgeProfessionAssessmentData KnowledgeProfession { get; set; } = new();
    public ServiceAssessmentData Services { get; set; } = new();
    public List<ActivityHistoryItem> ActivityHistory { get; set; } = new();
}

public class PerformanceAtWorkAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? HouPerformance { get; set; }
    public string? AapscPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalCategoriesAssessed { get; set; }
    public List<WorkCategoryAssessment> Categories { get; set; } = new();
}

public class WorkCategoryAssessment
{
    public string CategoryName { get; set; } = default!;
    public string CategoryKey { get; set; } = default!;
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? HouScore { get; set; }
    public string? HouRemarks { get; set; }
    public double? AapscScore { get; set; }
    public string? AapscRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class KnowledgeProfessionAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? HouPerformance { get; set; }
    public string? AapscPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalMaterials { get; set; }
    public List<KnowledgeMaterialAssessment> Materials { get; set; } = new();
}

public class KnowledgeMaterialAssessment
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public int Year { get; set; }
    public string MaterialTypeName { get; set; } = default!;
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double SystemGeneratedScore { get; set; }
    public bool IsPresented { get; set; }
    public List<string> PresentationEvidence { get; set; } = new();
    public double? HouScore { get; set; }
    public string? HouRemarks { get; set; }
    public double? AapscScore { get; set; }
    public string? AapscRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class ServiceAssessmentData
{
    public string? ApplicantPerformance { get; set; }
    public string? HouPerformance { get; set; }
    public string? AapscPerformance { get; set; }
    public string? UapcPerformance { get; set; }
    public int TotalRecords { get; set; }
    public List<ServiceItemAssessment> UniversityServices { get; set; } = new();
    public List<ServiceItemAssessment> NationalInternationalServices { get; set; } = new();
}

public class ServiceItemAssessment
{
    public string Id { get; set; } = default!;
    public string ServiceTitle { get; set; } = default!;
    public string? Role { get; set; }
    public string? Duration { get; set; }
    public bool IsActing { get; set; }
    public double? ApplicantScore { get; set; }
    public string? ApplicantRemarks { get; set; }
    public double? HouScore { get; set; }
    public string? HouRemarks { get; set; }
    public double? AapscScore { get; set; }
    public string? AapscRemarks { get; set; }
    public double? UapcScore { get; set; }
    public string? UapcRemarks { get; set; }
    public List<string> SupportingEvidence { get; set; } = new();
}

public class CommitteeMemberInfoResponse
{
    public string StaffId { get; set; } = default!;
    public string StaffName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public List<NonAcademicCommitteeMembership> Committees { get; set; } = new();
}

public class NonAcademicCommitteeMembership
{
    public string CommitteeType { get; set; } = default!;
    public bool IsChairperson { get; set; }
    public bool CanSubmitReviewedApplication { get; set; }
    public string? UnitId { get; set; }
}

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
    public string ApplicantName { get; set; } = default!;
    public string ActivityType { get; set; } = default!;
    public string Description { get; set; } = default!;
    public DateTime ActivityDate { get; set; }
}

public class ActivityHistoryItem
{
    public string ActivityType { get; set; } = default!;
    public string PerformedBy { get; set; } = default!;
    public string CommitteeLevel { get; set; } = default!;
    public string Description { get; set; } = default!;
    public DateTime ActivityDate { get; set; }
}

public class PromotionValidationResponse
{
    public bool MeetsPerformanceCriteria { get; set; }
    public bool MeetsKnowledgeMaterialRequirement { get; set; }
    public bool MeetsJournalRequirement { get; set; }
    public bool MeetsYearsRequirement { get; set; }
    public bool IsRecommended { get; set; }
    public string Summary { get; set; } = string.Empty;
    public List<string> FailedCriteria { get; set; } = [];
}
