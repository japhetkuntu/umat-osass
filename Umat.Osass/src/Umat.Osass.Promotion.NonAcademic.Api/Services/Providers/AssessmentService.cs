using System.Text.RegularExpressions;
using Akka.Actor;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.NonAcademic.Api.Extensions;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;
using Umat.Osass.NonAcademicPromotion.Sdk.Services;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

public class AssessmentService : IAssessmentService
{
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> _applicationRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionCommittee> _committeeRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicAssessmentActivity> _activityRepository;
    private readonly INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> _knowledgeRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicServiceRecord> _serviceRepository;
    private readonly INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> _performanceRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> _positionRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly IStorageService _storageService;
    private readonly ActorSystem _actorSystem;
    private readonly ILogger<AssessmentService> _logger;

    public AssessmentService(
        ILogger<AssessmentService> logger,
        INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> applicationRepository,
        INonAcademicPromotionPgRepository<NonAcademicPromotionCommittee> committeeRepository,
        INonAcademicPromotionPgRepository<NonAcademicAssessmentActivity> activityRepository,
        INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> knowledgeRepository,
        INonAcademicPromotionPgRepository<NonAcademicServiceRecord> serviceRepository,
        INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> performanceRepository,
        INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> positionRepository,
        IIdentityPgRepository<Staff> staffRepository,
        IStorageService storageService,
        ActorSystem actorSystem)
    {
        _logger = logger;
        _applicationRepository = applicationRepository;
        _committeeRepository = committeeRepository;
        _activityRepository = activityRepository;
        _knowledgeRepository = knowledgeRepository;
        _serviceRepository = serviceRepository;
        _performanceRepository = performanceRepository;
        _positionRepository = positionRepository;
        _staffRepository = staffRepository;
        _storageService = storageService;
        _actorSystem = actorSystem;
    }

    public async Task<IApiResponse<CommitteeMemberInfoResponse>> GetCommitteeMemberInfo(AuthData auth)
    {
        try
        {
            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            if (staff == null)
                return new ApiResponse<CommitteeMemberInfoResponse>("Staff not found", 404);

            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id);
            if (!committees.Any())
                return new ApiResponse<CommitteeMemberInfoResponse>("You are not a member of any assessment committee", 403);

            return new CommitteeMemberInfoResponse
            {
                StaffId = auth.Id,
                StaffName = $"{staff.FirstName} {staff.LastName}",
                Email = staff.Email,
                Committees = committees.Select(c => new NonAcademicCommitteeMembership
                {
                    CommitteeType = c.CommitteeType,
                    IsChairperson = c.IsChairperson,
                    CanSubmitReviewedApplication = c.CanSubmitReviewedApplication,
                    UnitId = c.UnitId
                }).ToList()
            }.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting committee member info for {StaffId}", auth.Id);
            return new ApiResponse<CommitteeMemberInfoResponse>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<AssessmentDashboardResponse>> GetDashboard(AuthData auth)
    {
        try
        {
            var memberInfoRes = await GetCommitteeMemberInfo(auth);
            if (memberInfoRes.Code < 200 || memberInfoRes.Code >= 300)
                return new ApiResponse<AssessmentDashboardResponse>(memberInfoRes.Message, memberInfoRes.Code);

            var memberInfo = memberInfoRes.Data!;
            int pendingCount = 0;

            foreach (var committee in memberInfo.Committees)
            {
                var reviewStatus = GetReviewStatusForCommittee(committee.CommitteeType);
                var applications = await GetApplicationsForCommittee(committee);
                pendingCount += applications.Count(a => a.ReviewStatus == reviewStatus);
            }

            var recentActivities = await _activityRepository.GetAllAsync(a =>
                memberInfo.Committees.Select(c => c.CommitteeType).Contains(a.CommitteeLevel));

            var recentSummaries = recentActivities
                .OrderByDescending(a => a.ActivityDate)
                .Take(10)
                .Select(a => new RecentActivitySummary
                {
                    ApplicationId = a.ApplicationId,
                    ApplicantName = a.ApplicantName,
                    ActivityType = a.ActivityType,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate
                }).ToList();

            return new AssessmentDashboardResponse
            {
                MemberInfo = memberInfo,
                PendingApplicationsCount = pendingCount,
                RecentActivities = recentSummaries
            }.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard for {StaffId}", auth.Id);
            return new ApiResponse<AssessmentDashboardResponse>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetPendingApplications(
        AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<PgPagedResult<PendingApplicationResponse>>($"You are not a member of {committeeType}", 403);

            var reviewStatus = GetReviewStatusForCommittee(committeeType);
            var applications = await GetApplicationsForCommittee(new NonAcademicCommitteeMembership
            {
                CommitteeType = committeeType,
                UnitId = committee.UnitId
            });

            var filtered = applications.Where(a =>
                a.ReviewStatus == reviewStatus &&
                a.ApplicationStatus != ApplicationStatusTypes.Draft);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                filtered = filtered.Where(a =>
                    (a.ApplicantName ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantEmail ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantUnitName ?? string.Empty).ToLower().Contains(term) ||
                    (a.PromotionPosition ?? string.Empty).ToLower().Contains(term));
            }

            var total = filtered.Count();
            var pageIndex = Math.Max(1, page);
            var skip = (pageIndex - 1) * pageSize;
            var pageItems = filtered.OrderByDescending(a => a.SubmissionDate ?? a.CreatedAt).Skip(skip).Take(pageSize).ToList();

            var responses = await BuildPendingResponses(pageItems, committeeType);

            return new PgPagedResult<PendingApplicationResponse>(responses, pageIndex, pageSize, responses.Count, total).ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending applications for {StaffId}", auth.Id);
            return new ApiResponse<PgPagedResult<PendingApplicationResponse>>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetApplicationHistory(
        AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<PgPagedResult<PendingApplicationResponse>>($"You are not a member of {committeeType}", 403);

            var reviewStatus = GetReviewStatusForCommittee(committeeType);
            var applications = await GetApplicationsForCommittee(new NonAcademicCommitteeMembership
            {
                CommitteeType = committeeType,
                UnitId = committee.UnitId
            });

            var filtered = applications.Where(a =>
                a.ReviewStatus != reviewStatus &&
                a.ApplicationStatus != ApplicationStatusTypes.Draft);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                filtered = filtered.Where(a =>
                    (a.ApplicantName ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantEmail ?? string.Empty).ToLower().Contains(term) ||
                    (a.PromotionPosition ?? string.Empty).ToLower().Contains(term));
            }

            var total = filtered.Count();
            var pageIndex = Math.Max(1, page);
            var skip = (pageIndex - 1) * pageSize;
            var pageItems = filtered.OrderByDescending(a => a.SubmissionDate ?? a.CreatedAt).Skip(skip).Take(pageSize).ToList();

            var responses = await BuildPendingResponses(pageItems, committeeType);

            return new PgPagedResult<PendingApplicationResponse>(responses, pageIndex, pageSize, responses.Count, total).ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting application history for {StaffId}", auth.Id);
            return new ApiResponse<PgPagedResult<PendingApplicationResponse>>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<ApplicationForAssessmentResponse>> GetApplicationForAssessment(AuthData auth, string applicationId)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id);
            if (!committees.Any())
                return new ApiResponse<ApplicationForAssessmentResponse>("Not authorized", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<ApplicationForAssessmentResponse>("Application not found", 404);

            var hasAccess = await HasAccessToApplication(auth.Id, application, committees.ToList());
            if (!hasAccess)
                return new ApiResponse<ApplicationForAssessmentResponse>("You do not have access to this application", 403);

            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var activities = await _activityRepository.GetAllAsync(a => a.ApplicationId == applicationId);

            var response = new ApplicationForAssessmentResponse
            {
                ApplicationId = application.Id,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                ApplicantEmail = application.ApplicantEmail,
                CurrentPosition = application.ApplicantCurrentPosition,
                ApplyingForPosition = application.PromotionPosition,
                UnitName = application.ApplicantUnitName,
                SubmissionDate = application.SubmissionDate ?? application.CreatedAt,
                ReviewStatus = application.ReviewStatus ?? string.Empty,
                ApplicationStatus = application.ApplicationStatus,
                PerformanceCriteria = application.PerformanceCriteria,
                PerformanceAtWork = BuildPerformanceAtWorkAssessmentData(performanceRecord),
                KnowledgeProfession = BuildKnowledgeProfessionAssessmentData(knowledgeRecord),
                Services = BuildServiceAssessmentData(serviceRecord),
                ActivityHistory = activities.OrderByDescending(a => a.ActivityDate).Select(a => new ActivityHistoryItem
                {
                    ActivityType = a.ActivityType,
                    PerformedBy = a.PerformedByStaffId,
                    CommitteeLevel = a.CommitteeLevel,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate
                }).ToList()
            };

            return response.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting application for assessment {ApplicationId}", applicationId);
            return new ApiResponse<ApplicationForAssessmentResponse>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> SubmitAssessmentScores(AuthData auth, SubmitAssessmentScoresRequest request)
    {
        try
        {
            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var committeeType = GetCommitteeTypeForReviewStatus(application.ReviewStatus);
            if (committeeType == null)
                return new ApiResponse<bool>("This application is not currently in an active review stage", 400);

            // Verify application has not reached a terminal state (returned, approved, or rejected)
            if (application.ApplicationStatus == ApplicationStatusTypes.Returned
                || application.ApplicationStatus == ApplicationStatusTypes.Approved
                || application.ApplicationStatus == ApplicationStatusTypes.NotApproved)
                return new ApiResponse<bool>("Application has already been processed and cannot be assessed", 400);

            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<bool>($"You are not a member of the {committeeType} committee", 403);
            if (!committee.IsChairperson)
                return new ApiResponse<bool>("Only chairpersons can submit assessment scores", 403);

            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.PromotionApplicationId == request.ApplicationId);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.PromotionApplicationId == request.ApplicationId);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.PromotionApplicationId == request.ApplicationId);

            var ct = committee.CommitteeType.ToUpper();

            if (performanceRecord != null && request.PerformanceAtWorkScores != null)
            {
                ApplyPerformanceScores(performanceRecord, request.PerformanceAtWorkScores, ct);
                var perfTotal = CalculateCommitteePerformanceAtWorkTotal(performanceRecord, ct);
                SetCommitteePerformanceLevel(performanceRecord, ct, PerformanceComputationService.ComputePerformanceAtWork(perfTotal));
            }

            if (knowledgeRecord != null && request.KnowledgeProfessionScores != null)
            {
                ApplyKnowledgeScores(knowledgeRecord, request.KnowledgeProfessionScores, ct);
                var knowTotal = CalculateCommitteeKnowledgeTotal(knowledgeRecord, ct);
                SetCommitteePerformanceLevel(knowledgeRecord, ct, PerformanceComputationService.ComputeKnowledgeProfessionPerformance(knowTotal));
            }

            if (serviceRecord != null && request.ServiceScores != null)
            {
                ApplyServiceScores(serviceRecord, request.ServiceScores, ct);
                var svcTotal = CalculateCommitteeServiceTotal(serviceRecord, ct);
                SetCommitteePerformanceLevel(serviceRecord, ct, PerformanceComputationService.ComputeServicePerformance(svcTotal));
            }

            if (performanceRecord != null) await _performanceRepository.UpdateAsync(performanceRecord);
            if (knowledgeRecord != null) await _knowledgeRepository.UpdateAsync(knowledgeRecord);
            if (serviceRecord != null) await _serviceRepository.UpdateAsync(serviceRecord);

            await LogActivity(application, committee.CommitteeType, auth.Id,
                NonAcademicAssessmentActivityTypes.ScoreSubmitted,
                $"Assessment scores submitted by {auth.FirstName} {auth.LastName}");

            return true.ToOkApiResponse("Assessment scores submitted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting assessment scores for application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("Failed to submit assessment scores", 500);
        }
    }

    public async Task<IApiResponse<bool>> AddAssessmentComment(AuthData auth, AddAssessmentCommentRequest request)
    {
        try
        {
            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var committeeType = GetCommitteeTypeForReviewStatus(application.ReviewStatus);
            if (committeeType == null)
                return new ApiResponse<bool>("This application is not currently in an active review stage", 400);

            // Verify application has not reached a terminal state (returned, approved, or rejected)
            if (application.ApplicationStatus == ApplicationStatusTypes.Returned
                || application.ApplicationStatus == ApplicationStatusTypes.Approved
                || application.ApplicationStatus == ApplicationStatusTypes.NotApproved)
                return new ApiResponse<bool>("Application has already been processed and cannot be commented on", 400);

            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<bool>("You are not a member of the current reviewing committee", 403);

            await LogActivity(application, committee.CommitteeType, auth.Id,
                NonAcademicAssessmentActivityTypes.CommentAdded,
                StripHtml($"[{request.Category}] {request.Comment}"));

            return true.ToOkApiResponse("Comment added successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment for application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("Failed to add comment", 500);
        }
    }

    public async Task<IApiResponse<bool>> ReturnApplication(AuthData auth, ReturnApplicationRequest request)
    {
        try
        {
            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var committeeType = GetCommitteeTypeForReviewStatus(application.ReviewStatus);
            if (committeeType == null)
                return new ApiResponse<bool>("This application is not currently in an active review stage", 400);

            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null || !committee.CanSubmitReviewedApplication)
                return new ApiResponse<bool>("You are not authorized to return applications", 403);

            application.ApplicationStatus = ApplicationStatusTypes.Returned;
            application.ReviewStatus = NonAcademicApplicationReviewStatuses.ReturnedForUpdate;
            application.UpdatedAt = DateTime.UtcNow;
            await _applicationRepository.UpdateAsync(application);

            await LogActivity(application, committee.CommitteeType, auth.Id,
                NonAcademicAssessmentActivityTypes.ApplicationReturned,
                StripHtml($"Application returned: {request.ReturnReason}"));

            try
            {
                var payload = new ApplicationReturnedPayload
                {
                    RecipientEmail = application.ApplicantEmail,
                    RecipientName = application.ApplicantName,
                    ApplicantName = application.ApplicantName,
                    Position = application.ApplicantCurrentPosition,
                    ReturnReason = request.ReturnReason,
                    ReturnedDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    ApplicationUrl = "https://nonacademic-portal.umat.edu.gh/applications"
                };

                _actorSystem.SendApplicationReturnedNotificationAsync(payload);
                _logger.LogInformation("[ReturnApplication] Returned notification dispatched via actor for applicant {ApplicantId}", application.ApplicantId);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "[ReturnApplication] Error dispatching returned notification for applicant {ApplicantId}", application.ApplicantId);
            }

            return true.ToOkApiResponse("Application returned successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error returning application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("Failed to return application", 500);
        }
    }

    public async Task<IApiResponse<bool>> AdvanceApplication(AuthData auth, AdvanceApplicationRequest request)
    {
        try
        {
            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var committeeType = GetCommitteeTypeForReviewStatus(application.ReviewStatus);
            if (committeeType == null)
                return new ApiResponse<bool>("This application is not currently in an active review stage", 400);

            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null || !committee.CanSubmitReviewedApplication)
                return new ApiResponse<bool>("You are not authorized to advance applications", 403);

            var nextReviewStatus = GetNextReviewStatus(committee.CommitteeType);
            if (nextReviewStatus == null)
                return new ApiResponse<bool>("This application cannot be advanced further", 400);

            application.ReviewStatus = nextReviewStatus;
            application.ReviewStatusHistory = string.IsNullOrEmpty(application.ReviewStatusHistory)
                ? nextReviewStatus
                : $"{application.ReviewStatusHistory},{nextReviewStatus}";
            application.UpdatedAt = DateTime.UtcNow;
            await _applicationRepository.UpdateAsync(application);

            await LogActivity(application, committee.CommitteeType, auth.Id,
                NonAcademicAssessmentActivityTypes.ApplicationAdvanced,
                $"Application advanced to {nextReviewStatus}");

            return true.ToOkApiResponse($"Application advanced to {nextReviewStatus}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error advancing application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("Failed to advance application", 500);
        }
    }

    public async Task<IApiResponse<List<ActivityHistoryItem>>> GetActivityHistory(AuthData auth, string applicationId)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id);
            if (!committees.Any())
                return new ApiResponse<List<ActivityHistoryItem>>("Not authorized", 403);

            var activities = await _activityRepository.GetAllAsync(a => a.ApplicationId == applicationId);
            return activities.OrderByDescending(a => a.ActivityDate)
                .Select(a => new ActivityHistoryItem
                {
                    ActivityType = a.ActivityType,
                    PerformedBy = a.PerformedByStaffId,
                    CommitteeLevel = a.CommitteeLevel,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate
                })
                .ToList()
                .ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting activity history for {ApplicationId}", applicationId);
            return new ApiResponse<List<ActivityHistoryItem>>("Failed to get activity history", 500);
        }
    }

    public async Task<IApiResponse<bool>> ApproveApplication(AuthData auth, string applicationId, string? recommendation)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == "UAPC");
            if (committee == null || !committee.CanSubmitReviewedApplication)
                return new ApiResponse<bool>("Only UAPC chairpersons can approve applications", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            if (application.ReviewStatus != NonAcademicApplicationReviewStatuses.UapcDecision)
                return new ApiResponse<bool>("Application is not at UAPC decision stage", 400);

            application.ApplicationStatus = ApplicationStatusTypes.Approved;
            application.ReviewStatus = NonAcademicApplicationReviewStatuses.CouncilApproved;
            application.IsActive = false;
            application.UpdatedAt = DateTime.UtcNow;
            await _applicationRepository.UpdateAsync(application);

            // Update applicant's staff record with new position
            var applicantStaff = await _staffRepository.GetByIdAsync(application.ApplicantId);
            if (applicantStaff != null)
            {
                applicantStaff.PreviousPosition = applicantStaff.Position;
                applicantStaff.Position = application.PromotionPosition;
                applicantStaff.LastAppointmentOrPromotionDate = DateTime.UtcNow;
                await _staffRepository.UpdateAsync(applicantStaff);

                _logger.LogInformation("Staff {StaffId} promoted from {OldPosition} to {NewPosition}",
                    applicantStaff.Id, applicantStaff.PreviousPosition, applicantStaff.Position);
            }
            else
            {
                _logger.LogWarning("Staff record not found for applicant {ApplicantId} during promotion approval", application.ApplicantId);
            }

            await LogActivity(application, "UAPC", auth.Id,
                NonAcademicAssessmentActivityTypes.ApplicationApproved,
                $"Application approved - Promoted to {application.PromotionPosition}. {recommendation ?? string.Empty}");

            try
            {
                var payload = new ApplicationApprovedPayload
                {
                    RecipientEmail = application.ApplicantEmail,
                    RecipientName = application.ApplicantName,
                    ApplicantName = application.ApplicantName,
                    CurrentPosition = application.ApplicantCurrentPosition,
                    NewPosition = application.PromotionPosition,
                    EffectiveDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd"),
                    AcademicPortalUrl = "https://nonacademic-portal.umat.edu.gh"
                };

                _actorSystem.SendApplicationApprovedNotificationAsync(payload);
                _logger.LogInformation("[ApproveApplication] Approval notification dispatched via actor for applicant {ApplicantId}", application.ApplicantId);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "[ApproveApplication] Error dispatching approval notification for applicant {ApplicantId}", application.ApplicantId);
            }

            return true.ToOkApiResponse("Application approved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving application {ApplicationId}", applicationId);
            return new ApiResponse<bool>("Failed to approve application", 500);
        }
    }

    public async Task<IApiResponse<bool>> RejectApplication(AuthData auth, string applicationId, string reason)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == "UAPC");
            if (committee == null || !committee.CanSubmitReviewedApplication)
                return new ApiResponse<bool>("Only UAPC chairpersons can reject applications", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            if (application.ReviewStatus != NonAcademicApplicationReviewStatuses.UapcDecision)
                return new ApiResponse<bool>("Application is not at UAPC decision stage", 400);

            // Return for update - applicant can edit and resubmit
            application.ApplicationStatus = ApplicationStatusTypes.Returned;
            application.ReviewStatus = NonAcademicApplicationReviewStatuses.ReturnedForUpdate;
            application.UpdatedAt = DateTime.UtcNow;
            await _applicationRepository.UpdateAsync(application);

            await LogActivity(application, "UAPC", auth.Id,
                NonAcademicAssessmentActivityTypes.ApplicationReturned,
                StripHtml($"Application returned for update: {reason}"));

            return true.ToOkApiResponse("Application returned to applicant for updates. They will be able to make changes and resubmit.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting application {ApplicationId}", applicationId);
            return new ApiResponse<bool>("Failed to reject application", 500);
        }
    }

    public async Task<IApiResponse<PromotionValidationResponse>> ValidateForPromotion(AuthData auth, string applicationId)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == "UAPC");
            if (committee == null)
                return new ApiResponse<PromotionValidationResponse>("Only UAPC members can validate applications", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<PromotionValidationResponse>("Application not found", 404);

            // Start staff lookup (IdentityDbContext) in parallel while NonAcademic queries run sequentially.
            var staffTask = _staffRepository.GetByIdAsync(application.ApplicantId);
            var positionRes = await _positionRepository.GetByIdAsync(application.PromotionPositionId);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.PromotionApplicationId == applicationId);
            var staff = await staffTask;

            var failedCriteria = new List<string>();
            bool meetsYears = false, meetsPerformance = false, meetsMaterials = false, meetsJournals = false;

            if (staff != null && positionRes != null)
            {
                var yearsInPosition = (DateTime.UtcNow - staff.LastAppointmentOrPromotionDate).TotalDays / 365.25;
                meetsYears = yearsInPosition >= positionRes.MinimumNumberOfYearsFromLastPromotion;
                if (!meetsYears) failedCriteria.Add($"Insufficient years in rank ({yearsInPosition:F1} of {positionRes.MinimumNumberOfYearsFromLastPromotion} required)");
            }

            if (knowledgeRecord != null && positionRes != null)
            {
                meetsMaterials = knowledgeRecord.Materials.Count >= positionRes.MinimumNumberOfKnowledgeMaterials;
                if (!meetsMaterials) failedCriteria.Add($"Insufficient knowledge materials ({knowledgeRecord.Materials.Count} of {positionRes.MinimumNumberOfKnowledgeMaterials} required)");

                var journalCount = knowledgeRecord.Materials.Count(m => m.MaterialTypeId.Equals("Journal", StringComparison.OrdinalIgnoreCase));
                meetsJournals = journalCount >= positionRes.MinimumNumberOfJournals;
                if (!meetsJournals) failedCriteria.Add($"Insufficient journals ({journalCount} of {positionRes.MinimumNumberOfJournals} required)");
            }

            if (positionRes != null && positionRes.PerformanceCriteria.Any())
            {
                // Use the most authoritative committee performance for each section.
                var perfPerformance = GetEffectivePerformance(performanceRecord);
                var knowledgePerformance = GetEffectivePerformance(knowledgeRecord);
                var svcPerformance = GetEffectivePerformance(serviceRecord);
                var performanceStr = $"{perfPerformance},{knowledgePerformance},{svcPerformance}";
                meetsPerformance = positionRes.PerformanceCriteria.Any(c => c.Equals(performanceStr, StringComparison.OrdinalIgnoreCase));
                if (!meetsPerformance) failedCriteria.Add($"Performance criteria not met (actual: {performanceStr})");
            }

            var isRecommended = meetsYears && meetsMaterials && meetsJournals;

            return new PromotionValidationResponse
            {
                MeetsPerformanceCriteria = meetsPerformance,
                MeetsKnowledgeMaterialRequirement = meetsMaterials,
                MeetsJournalRequirement = meetsJournals,
                MeetsYearsRequirement = meetsYears,
                IsRecommended = isRecommended,
                Summary = isRecommended ? "Applicant meets all requirements for promotion" : "Applicant does not meet all requirements",
                FailedCriteria = failedCriteria
            }.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating application {ApplicationId}", applicationId);
            return new ApiResponse<PromotionValidationResponse>("Failed to validate application", 500);
        }
    }

    // ========================= HELPERS =========================

    private static string GetReviewStatusForCommittee(string committeeType) =>
        committeeType.ToUpper() switch
        {
            "HOU" => NonAcademicApplicationReviewStatuses.HouReview,
            "AAPSC" => NonAcademicApplicationReviewStatuses.AapscReview,
            "UAPC" => NonAcademicApplicationReviewStatuses.UapcDecision,
            _ => string.Empty
        };

    private static string? GetNextReviewStatus(string committeeType) =>
        committeeType.ToUpper() switch
        {
            "HOU" => NonAcademicApplicationReviewStatuses.AapscReview,
            "AAPSC" => NonAcademicApplicationReviewStatuses.UapcDecision,
            _ => null
        };

    /// <summary>
    /// Maps an application's current ReviewStatus back to the committee type responsible for it.
    /// This ensures that a staff member who belongs to multiple committees always has their
    /// actions attributed to the committee currently handling the application.
    /// </summary>
    private static string? GetCommitteeTypeForReviewStatus(string? reviewStatus) =>
        reviewStatus switch
        {
            NonAcademicApplicationReviewStatuses.HouReview => "HOU",
            NonAcademicApplicationReviewStatuses.AapscReview => "AAPSC",
            NonAcademicApplicationReviewStatuses.UapcDecision => "UAPC",
            _ => null
        };

    private async Task<IEnumerable<NonAcademicPromotionApplication>> GetApplicationsForCommittee(NonAcademicCommitteeMembership committee)
    {
        if (committee.CommitteeType.ToUpper() == "HOU" && !string.IsNullOrEmpty(committee.UnitId))
            return await _applicationRepository.GetAllAsync(a => a.ApplicantUnitId == committee.UnitId);
        return await _applicationRepository.GetAllAsync(_ => true);
    }

    private async Task<bool> HasAccessToApplication(
        string staffId,
        NonAcademicPromotionApplication application,
        List<NonAcademicPromotionCommittee> committees)
    {
        var reviewStatus = application.ReviewStatus ?? string.Empty;

        foreach (var committee in committees)
        {
            var committeeReview = GetReviewStatusForCommittee(committee.CommitteeType);
            if (reviewStatus == committeeReview)
            {
                if (committee.CommitteeType.ToUpper() == "HOU" && !string.IsNullOrEmpty(committee.UnitId))
                    return application.ApplicantUnitId == committee.UnitId;
                return true;
            }
        }

        // Application is no longer in an active review stage (approved, returned, closed, etc.).
        // Any committee member can view it as read-only history.
        string[] activeReviewStatuses =
        [
            NonAcademicApplicationReviewStatuses.HouReview,
            NonAcademicApplicationReviewStatuses.AapscReview,
            NonAcademicApplicationReviewStatuses.UapcDecision
        ];
        return !activeReviewStatuses.Contains(reviewStatus);
    }

    private async Task LogActivity(
        NonAcademicPromotionApplication application,
        string committeeLevel,
        string staffId,
        string activityType,
        string description)
    {
        var staff = await _staffRepository.GetByIdAsync(staffId);
        var performedByName = staff != null ? $"{staff.FirstName} {staff.LastName}".Trim() : staffId;

        var activity = new NonAcademicAssessmentActivity
        {
            ApplicationId = application.Id,
            ApplicantId = application.ApplicantId,
            ApplicantName = application.ApplicantName,
            CommitteeLevel = committeeLevel,
            ActivityType = activityType,
            Description = description,
            PerformedByStaffId = staffId,
            PerformedByName = performedByName,
            ActivityDate = DateTime.UtcNow,
            CreatedBy = staffId
        };
        await _activityRepository.AddAsync(activity);
    }

    private static void ApplyPerformanceScores(PerformanceAtWorkRecord record, PerformanceAtWorkAssessmentScores scores, string committeeType)
    {
        // Create new instances instead of mutating in-place so EF Core detects the JSONB column change.
        PerformanceWorkData? Apply(PerformanceWorkData? data, CategoryScore? score)
        {
            if (data == null || score == null) return data;
            var updated = new PerformanceWorkData
            {
                Id = data.Id,
                ApplicantScore = data.ApplicantScore, ApplicantRemarks = data.ApplicantRemarks,
                HouScore = data.HouScore, HouRemarks = data.HouRemarks,
                AapscScore = data.AapscScore, AapscRemarks = data.AapscRemarks,
                UapcScore = data.UapcScore, UapcRemarks = data.UapcRemarks,
                SupportingEvidence = data.SupportingEvidence,
                CreatedAt = data.CreatedAt, UpdatedAt = DateTime.UtcNow
            };
            switch (committeeType)
            {
                case "HOU": updated.HouScore = score.Score; updated.HouRemarks = score.Remarks; break;
                case "AAPSC": updated.AapscScore = score.Score; updated.AapscRemarks = score.Remarks; break;
                case "UAPC": updated.UapcScore = score.Score; updated.UapcRemarks = score.Remarks; break;
            }
            return updated;
        }
        record.AccuracyOnSchedule = Apply(record.AccuracyOnSchedule, scores.AccuracyOnSchedule);
        record.QualityOfWork = Apply(record.QualityOfWork, scores.QualityOfWork);
        record.PunctualityAndRegularity = Apply(record.PunctualityAndRegularity, scores.PunctualityAndRegularity);
        record.KnowledgeOfProcedures = Apply(record.KnowledgeOfProcedures, scores.KnowledgeOfProcedures);
        record.AbilityToWorkOnOwn = Apply(record.AbilityToWorkOnOwn, scores.AbilityToWorkOnOwn);
        record.AbilityToWorkUnderPressure = Apply(record.AbilityToWorkUnderPressure, scores.AbilityToWorkUnderPressure);
        record.AdditionalResponsibility = Apply(record.AdditionalResponsibility, scores.AdditionalResponsibility);
        record.HumanRelations = Apply(record.HumanRelations, scores.HumanRelations);
        record.InitiativeAndForesight = Apply(record.InitiativeAndForesight, scores.InitiativeAndForesight);
        record.AbilityToInspireAndMotivate = Apply(record.AbilityToInspireAndMotivate, scores.AbilityToInspireAndMotivate);
    }

    private static void ApplyKnowledgeScores(KnowledgeProfessionRecord record, List<RecordScore> scores, string committeeType)
    {
        foreach (var scoreEntry in scores)
        {
            var item = record.Materials.FirstOrDefault(m => m.Id == scoreEntry.RecordId);
            if (item == null) continue;
            switch (committeeType)
            {
                case "HOU": item.HouScore = scoreEntry.Score; item.HouRemarks = scoreEntry.Remarks; break;
                case "AAPSC": item.AapscScore = scoreEntry.Score; item.AapscRemarks = scoreEntry.Remarks; break;
                case "UAPC": item.UapcScore = scoreEntry.Score; item.UapcRemarks = scoreEntry.Remarks; break;
            }
        }
        // Reassign the list so EF Core detects the mutation in the HasConversion property.
        record.Materials = record.Materials.ToList();
    }

    private static void ApplyServiceScores(NonAcademicServiceRecord record, List<RecordScore> scores, string committeeType)
    {
        var allItems = record.ServiceToTheUniversity.Concat(record.ServiceToNationalAndInternational).ToList();
        foreach (var scoreEntry in scores)
        {
            var item = allItems.FirstOrDefault(s => s.Id == scoreEntry.RecordId);
            if (item == null) continue;
            switch (committeeType)
            {
                case "HOU": item.HouScore = scoreEntry.Score; item.HouRemarks = scoreEntry.Remarks; break;
                case "AAPSC": item.AapscScore = scoreEntry.Score; item.AapscRemarks = scoreEntry.Remarks; break;
                case "UAPC": item.UapcScore = scoreEntry.Score; item.UapcRemarks = scoreEntry.Remarks; break;
            }
        }
        // Reassign both lists so EF Core detects mutations in the HasConversion properties.
        record.ServiceToTheUniversity = record.ServiceToTheUniversity.ToList();
        record.ServiceToNationalAndInternational = record.ServiceToNationalAndInternational.ToList();
    }

    private static double CalculateCommitteePerformanceAtWorkTotal(PerformanceAtWorkRecord r, string ct)
    {
        double Sum(Func<PerformanceWorkData?, double?> sel) =>
            (sel(r.AccuracyOnSchedule) ?? 0) + (sel(r.QualityOfWork) ?? 0) +
            (sel(r.PunctualityAndRegularity) ?? 0) + (sel(r.KnowledgeOfProcedures) ?? 0) +
            (sel(r.AbilityToWorkOnOwn) ?? 0) + (sel(r.AbilityToWorkUnderPressure) ?? 0) +
            (sel(r.AdditionalResponsibility) ?? 0) + (sel(r.HumanRelations) ?? 0) +
            (sel(r.InitiativeAndForesight) ?? 0) + (sel(r.AbilityToInspireAndMotivate) ?? 0);
        return ct switch
        {
            "HOU" => Sum(d => d?.HouScore),
            "AAPSC" => Sum(d => d?.AapscScore),
            _ => Sum(d => d?.UapcScore)
        };
    }

    private static double CalculateCommitteeKnowledgeTotal(KnowledgeProfessionRecord r, string ct) => ct switch
    {
        "HOU" => r.Materials.Sum(m => m.HouScore ?? 0),
        "AAPSC" => r.Materials.Sum(m => m.AapscScore ?? 0),
        _ => r.Materials.Sum(m => m.UapcScore ?? 0)
    };

    private static double CalculateCommitteeServiceTotal(NonAcademicServiceRecord r, string ct)
    {
        var all = r.ServiceToTheUniversity.Concat(r.ServiceToNationalAndInternational);
        return ct switch
        {
            "HOU" => all.Sum(s => s.HouScore ?? 0),
            "AAPSC" => all.Sum(s => s.AapscScore ?? 0),
            _ => all.Sum(s => s.UapcScore ?? 0)
        };
    }

    private static void SetCommitteePerformanceLevel(NonAcademicPerformanceWithBaseEntity record, string ct, string level)
    {
        switch (ct)
        {
            case "HOU": record.HouPerformance = level; break;
            case "AAPSC": record.AapscPerformance = level; break;
            case "UAPC": record.UapcPerformance = level; break;
        }
    }

    private PerformanceAtWorkAssessmentData BuildPerformanceAtWorkAssessmentData(PerformanceAtWorkRecord? record)
    {
        if (record == null) return new PerformanceAtWorkAssessmentData();

        WorkCategoryAssessment? MapCat(string name, string key, PerformanceWorkData? d)
        {
            if (d == null) return null;
            return new WorkCategoryAssessment
            {
                CategoryName = name, CategoryKey = key,
                ApplicantScore = d.ApplicantScore, ApplicantRemarks = d.ApplicantRemarks,
                HouScore = d.HouScore, HouRemarks = d.HouRemarks,
                AapscScore = d.AapscScore, AapscRemarks = d.AapscRemarks,
                UapcScore = d.UapcScore, UapcRemarks = d.UapcRemarks,
                SupportingEvidence = d.SupportingEvidence.Select(x => _storageService.GetFileUrl(x)).ToList()
            };
        }

        var cats = new[] {
            MapCat("Accuracy On Schedule", "AccuracyOnSchedule", record.AccuracyOnSchedule),
            MapCat("Quality Of Work", "QualityOfWork", record.QualityOfWork),
            MapCat("Punctuality And Regularity", "PunctualityAndRegularity", record.PunctualityAndRegularity),
            MapCat("Knowledge Of Procedures", "KnowledgeOfProcedures", record.KnowledgeOfProcedures),
            MapCat("Ability To Work On Own", "AbilityToWorkOnOwn", record.AbilityToWorkOnOwn),
            MapCat("Ability To Work Under Pressure", "AbilityToWorkUnderPressure", record.AbilityToWorkUnderPressure),
            MapCat("Additional Responsibility", "AdditionalResponsibility", record.AdditionalResponsibility),
            MapCat("Human Relations", "HumanRelations", record.HumanRelations),
            MapCat("Initiative And Foresight", "InitiativeAndForesight", record.InitiativeAndForesight),
            MapCat("Ability To Inspire And Motivate", "AbilityToInspireAndMotivate", record.AbilityToInspireAndMotivate)
        };

        return new PerformanceAtWorkAssessmentData
        {
            ApplicantPerformance = record.ApplicantPerformance,
            HouPerformance = record.HouPerformance,
            AapscPerformance = record.AapscPerformance,
            UapcPerformance = record.UapcPerformance,
            TotalCategoriesAssessed = record.TotalCategoriesAssessed,
            Categories = cats.Where(c => c != null).Select(c => c!).ToList()
        };
    }

    private KnowledgeProfessionAssessmentData BuildKnowledgeProfessionAssessmentData(KnowledgeProfessionRecord? record)
    {
        if (record == null) return new KnowledgeProfessionAssessmentData();
        return new KnowledgeProfessionAssessmentData
        {
            ApplicantPerformance = record.ApplicantPerformance,
            HouPerformance = record.HouPerformance,
            AapscPerformance = record.AapscPerformance,
            UapcPerformance = record.UapcPerformance,
            TotalMaterials = record.Materials.Count,
            Materials = record.Materials.Select(m => new KnowledgeMaterialAssessment
            {
                Id = m.Id, Title = m.Title, Year = m.Year, MaterialTypeName = m.MaterialTypeName,
                ApplicantScore = m.ApplicantScore, ApplicantRemarks = m.ApplicantRemarks,
                SystemGeneratedScore = m.SystemGeneratedScore,
                IsPresented = m.IsPresented,
                PresentationEvidence = m.PresentationEvidence.Select(x => _storageService.GetFileUrl(x)).ToList(),
                HouScore = m.HouScore, HouRemarks = m.HouRemarks,
                AapscScore = m.AapscScore, AapscRemarks = m.AapscRemarks,
                UapcScore = m.UapcScore, UapcRemarks = m.UapcRemarks,
                SupportingEvidence = m.SupportingEvidence.Select(x => _storageService.GetFileUrl(x)).ToList()
            }).ToList()
        };
    }

    private ServiceAssessmentData BuildServiceAssessmentData(NonAcademicServiceRecord? record)
    {
        if (record == null) return new ServiceAssessmentData();

        ServiceItemAssessment MapService(NonAcademicServiceItem s) => new()
        {
            Id = s.Id, ServiceTitle = s.ServiceTitle,
            Role = s.Role, Duration = s.Duration, IsActing = s.IsActing,
            ApplicantScore = s.ApplicantScore, ApplicantRemarks = s.ApplicantRemarks,
            HouScore = s.HouScore, HouRemarks = s.HouRemarks,
            AapscScore = s.AapscScore, AapscRemarks = s.AapscRemarks,
            UapcScore = s.UapcScore, UapcRemarks = s.UapcRemarks,
            SupportingEvidence = s.SupportingEvidence.Select(x => _storageService.GetFileUrl(x)).ToList()
        };

        return new ServiceAssessmentData
        {
            ApplicantPerformance = record.ApplicantPerformance,
            HouPerformance = record.HouPerformance,
            AapscPerformance = record.AapscPerformance,
            UapcPerformance = record.UapcPerformance,
            TotalRecords = record.ServiceToTheUniversity.Count + record.ServiceToNationalAndInternational.Count,
            UniversityServices = record.ServiceToTheUniversity.Select(MapService).ToList(),
            NationalInternationalServices = record.ServiceToNationalAndInternational.Select(MapService).ToList()
        };
    }

    private async Task<List<PendingApplicationResponse>> BuildPendingResponses(
        List<NonAcademicPromotionApplication> apps,
        string committeeType)
    {
        var responses = new List<PendingApplicationResponse>();
        if (apps.Count == 0) return responses;

        var appIds = apps.Select(a => a.Id).ToList();
        var perfLookup = (await _performanceRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);
        var knowLookup = (await _knowledgeRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);
        var svcLookup = (await _serviceRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);
        var activLookup = (await _activityRepository.GetAllAsync(a =>
            appIds.Contains(a.ApplicationId) &&
            a.CommitteeLevel == committeeType &&
            a.ActivityType == NonAcademicAssessmentActivityTypes.CommentAdded))
            .GroupBy(a => a.ApplicationId).ToDictionary(g => g.Key, g => g.ToList());

        foreach (var app in apps)
        {
            perfLookup.TryGetValue(app.Id, out var performance);
            knowLookup.TryGetValue(app.Id, out var knowledge);
            svcLookup.TryGetValue(app.Id, out var service);
            activLookup.TryGetValue(app.Id, out var appActivities);

            responses.Add(new PendingApplicationResponse
            {
                ApplicationId = app.Id,
                ApplicantId = app.ApplicantId,
                ApplicantName = app.ApplicantName,
                ApplicantEmail = app.ApplicantEmail,
                CurrentPosition = app.ApplicantCurrentPosition,
                ApplyingForPosition = app.PromotionPosition,
                UnitName = app.ApplicantUnitName,
                SubmissionDate = app.SubmissionDate ?? app.CreatedAt,
                ReviewStatus = app.ReviewStatus ?? "Pending",
                ApplicationStatus = app.ApplicationStatus,
                IsResubmission = (app.ReviewStatusHistory?.Split(',').Length ?? 0) > 1,
                ResubmissionCount = Math.Max(0, (app.ReviewStatusHistory?.Split(',').Length ?? 1) - 1),
                ApplicantPerformance = new NonAcademicPerformanceSummary
                {
                    PerformanceAtWorkPerformance = performance?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                    KnowledgeProfessionPerformance = knowledge?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                    ServicePerformance = service?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                    TotalPerformanceAtWorkScore = PerformanceAtWorkService.CalculateTotalScore(performance ?? new PerformanceAtWorkRecord()),
                    TotalKnowledgeProfessionScore = KnowledgeProfessionService.CalculateTotalScore(knowledge ?? new KnowledgeProfessionRecord()),
                    TotalServiceScore = NonAcademicServiceCategoryService.CalculateOverallTotal(service ?? new NonAcademicServiceRecord())
                },
                ReviewedByMemberCount = (appActivities ?? []).Select(a => a.PerformedByStaffId).Distinct().Count()
            });
        }
        return responses;
    }

    /// <summary>
    /// Returns the most authoritative committee performance using nullable item-level scores
    /// as the reliable signal (performance summary strings all default to "InAdequate").
    /// </summary>
    private static string GetEffectivePerformance(PerformanceAtWorkRecord? record)
    {
        if (record == null) return PerformanceTypes.InAdequate;
        var cats = new[] {
            record.AccuracyOnSchedule, record.QualityOfWork, record.PunctualityAndRegularity,
            record.KnowledgeOfProcedures, record.AbilityToWorkOnOwn, record.AbilityToWorkUnderPressure,
            record.AdditionalResponsibility, record.HumanRelations, record.InitiativeAndForesight,
            record.AbilityToInspireAndMotivate
        };
        return cats.Any(c => c?.UapcScore != null) ? record.UapcPerformance : PerformanceTypes.InAdequate;
    }

    private static string GetEffectivePerformance(KnowledgeProfessionRecord? record)
    {
        if (record == null) return PerformanceTypes.InAdequate;
        return record.Materials.Any(m => m.UapcScore.HasValue) ? record.UapcPerformance : PerformanceTypes.InAdequate;
    }

    private static string GetEffectivePerformance(NonAcademicServiceRecord? record)
    {
        if (record == null) return PerformanceTypes.InAdequate;
        var all = record.ServiceToTheUniversity.Concat(record.ServiceToNationalAndInternational);
        return all.Any(s => s.UapcScore.HasValue) ? record.UapcPerformance : PerformanceTypes.InAdequate;
    }

    private static string StripHtml(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        var withoutTags = Regex.Replace(input, @"<[^>]*>", string.Empty);
        withoutTags = withoutTags.Replace("&nbsp;", " ").Replace("&lt;", "<").Replace("&gt;", ">").Replace("&amp;", "&").Replace("&quot;", "\"");
        return Regex.Replace(withoutTags, @"\s+", " ").Trim();
    }
}
