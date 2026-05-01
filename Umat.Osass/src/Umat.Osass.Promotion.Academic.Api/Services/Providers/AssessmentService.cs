using Akka.Actor;
using System.Text.RegularExpressions;
using Umat.Osass.AcademicPromotion.Sdk.Services;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Extensions;
using Umat.Osass.Promotion.Academic.Api.Actors.Messages;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

public class AssessmentService : IAssessmentService
{
    private readonly IAcademicPromotionPgRepository<AcademicPromotionApplication> _applicationRepository;
    private readonly IAcademicPromotionPgRepository<AcademicPromotionCommittee> _committeeRepository;
    private readonly IAcademicPromotionPgRepository<AssessmentActivity> _activityRepository;
    private readonly IAcademicPromotionPgRepository<Publication> _publicationRepository;
    private readonly IAcademicPromotionPgRepository<ServiceRecord> _serviceRepository;
    private readonly IAcademicPromotionPgRepository<TeachingRecord> _teachingRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly ILogger<AssessmentService> _logger;
    private readonly IStorageService _storageService;
    private readonly IAcademicPromotionPgRepository<AcademicPromotionPosition> _positionRepository;
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly ActorSystem _actorSystem;
    public AssessmentService(
        ILogger<AssessmentService> logger,
        IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository,
        IAcademicPromotionPgRepository<AcademicPromotionCommittee> committeeRepository,
        IAcademicPromotionPgRepository<AssessmentActivity> activityRepository,
        IAcademicPromotionPgRepository<Publication> publicationRepository,
        IAcademicPromotionPgRepository<ServiceRecord> serviceRepository,
        IAcademicPromotionPgRepository<TeachingRecord> teachingRepository,
        IIdentityPgRepository<Staff> staffRepository,
        IStorageService storageService,
        IAcademicPromotionPgRepository<AcademicPromotionPosition> positionRepository,
        IEmailNotificationService emailNotificationService,
        ActorSystem actorSystem)
    {
        _logger = logger;
        _applicationRepository = applicationRepository;
        _committeeRepository = committeeRepository;
        _activityRepository = activityRepository;
        _publicationRepository = publicationRepository;
        _serviceRepository = serviceRepository;
        _teachingRepository = teachingRepository;
        _staffRepository = staffRepository;
        _storageService = storageService;
        _positionRepository = positionRepository;
        _emailNotificationService = emailNotificationService;
        _actorSystem = actorSystem;
    }

    /// <summary>
    /// Strips all HTML tags from text, converting HTML entities to their text equivalents
    /// </summary>
    private string StripHtmlTags(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // Remove HTML tags
        string withoutTags = Regex.Replace(input, @"<[^>]*>", string.Empty);
        
        // Decode common HTML entities
        withoutTags = withoutTags
            .Replace("&nbsp;", " ")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Replace("&amp;", "&")
            .Replace("&quot;", "\"")
            .Replace("&#39;", "'");

        // Trim excess whitespace
        withoutTags = Regex.Replace(withoutTags, @"\s+", " ").Trim();

        return withoutTags;
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

            var response = new CommitteeMemberInfoResponse
            {
                StaffId = auth.Id,
                StaffName = $"{staff.FirstName} {staff.LastName}",
                Email = staff.Email,
                Committees = committees.Select(c => new CommitteeMembership
                {
                    CommitteeType = c.CommitteeType,
                    IsChairperson = c.IsChairperson,
                    CanSubmitReviewedApplication = c.CanSubmitReviewedApplication,
                    DepartmentId = c.DepartmentId,
                    FacultyId = c.FacultyId,
                    SchoolId = c.SchoolId
                }).ToList()
            };

            return response.ToOkApiResponse();
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
            var committees = memberInfo.Committees;

            // Count applications based on committee memberships
            int pendingCount = 0, inProgressCount = 0, completedCount = 0, returnedCount = 0;

            foreach (var committee in committees)
            {
                var reviewStatus = GetReviewStatusForCommittee(committee.CommitteeType);
                var applications = await GetApplicationsForCommittee(committee);
                
                pendingCount += applications.Count(a => a.ReviewStatus == reviewStatus);
                inProgressCount += applications.Count(a => a.ReviewStatus == reviewStatus && a.ApplicationStatus == ApplicationStatusTypes.UnderReview);
            }

            // Get recent activities
            var recentActivities = await _activityRepository.GetAllAsync(
                a => committees.Select(c => c.CommitteeType).Contains(a.CommitteeLevel));
            
            var recentActivitySummaries = recentActivities
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
                InProgressCount = inProgressCount,
                CompletedThisMonthCount = completedCount,
                ReturnedCount = returnedCount,
                RecentActivities = recentActivitySummaries
            }.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard for {StaffId}", auth.Id);
            return new ApiResponse<AssessmentDashboardResponse>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetPendingApplications(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<PgPagedResult<PendingApplicationResponse>>($"You are not a member of {committeeType}", 403);

            var reviewStatus = GetReviewStatusForCommittee(committeeType);
            var applications = await GetApplicationsForCommittee(new CommitteeMembership
            {
                CommitteeType = committeeType,
                DepartmentId = committee.DepartmentId,
                FacultyId = committee.FacultyId,
                SchoolId = committee.SchoolId
            });

            // Filter by review status and non-draft
            var filtered = applications.Where(a =>
                a.ReviewStatus == reviewStatus &&
                a.ApplicationStatus != ApplicationStatusTypes.Draft);

            // Apply search if provided (applicant name, department, position, email)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                filtered = filtered.Where(a =>
                    (a.ApplicantName ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantEmail ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantDepartmentName ?? string.Empty).ToLower().Contains(term) ||
                    (a.PromotionPosition ?? string.Empty).ToLower().Contains(term));
            }

            var total = filtered.Count();

            // Pagination
            var pageIndex = Math.Max(1, page);
            var skip = (pageIndex - 1) * pageSize;
            var pageItems = filtered.OrderByDescending(a => a.SubmissionDate ?? a.CreatedAt).Skip(skip).Take(pageSize).ToList();

            var responses = new List<PendingApplicationResponse>();

            foreach (var app in pageItems)
            {
                // Get performance data
                var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == app.Id);
                var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == app.Id);
                var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == app.Id);

                // Count how many committee members have reviewed
                var activities = await _activityRepository.GetAllAsync(a =>
                    a.ApplicationId == app.Id &&
                    a.CommitteeLevel == committeeType &&
                    a.ActivityType == AssessmentActivityTypes.CommentAdded);

                responses.Add(new PendingApplicationResponse
                {
                    ApplicationId = app.Id,
                    ApplicantId = app.ApplicantId,
                    ApplicantName = app.ApplicantName,
                    ApplicantEmail = app.ApplicantEmail,
                    CurrentPosition = app.ApplicantCurrentPosition,
                    ApplyingForPosition = app.PromotionPosition,
                    DepartmentName = app.ApplicantDepartmentName,
                    FacultyName = app.ApplicantFacultyName,
                    SubmissionDate = app.SubmissionDate ?? app.CreatedAt,
                    ReviewStatus = app.ReviewStatus ?? "Pending",
                    ApplicationStatus = app.ApplicationStatus,
                    IsResubmission = (app.ReviewStatusHistory?.Split(',').Length ?? 0) > 1,
                    ResubmissionCount = Math.Max(0, (app.ReviewStatusHistory?.Split(',').Length ?? 1) - 1),
                    ApplicantPerformance = new PerformanceSummary
                    {
                        TeachingPerformance = teaching?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        PublicationPerformance = publication?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        ServicePerformance = service?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        TotalTeachingScore = CalculateTeachingScore(teaching),
                        TotalPublicationScore = CalculatePublicationScore(publication),
                        TotalServiceScore = CalculateServiceScore(service)
                    },
                    ReviewedByMemberCount = activities.Select(a => a.PerformedByStaffId).Distinct().Count()
                });
            }

            var result = new PgPagedResult<PendingApplicationResponse>(
                results: responses,
                pageIndex: pageIndex,
                pageSize: pageSize,
                count: responses.Count,
                totalCount: total
            );

            return result.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending applications for {StaffId}", auth.Id);
            return new ApiResponse<PgPagedResult<PendingApplicationResponse>>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetApplicationHistory(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            var committee = await _committeeRepository.GetOneAsync(c => c.StaffId == auth.Id && c.CommitteeType == committeeType);
            if (committee == null)
                return new ApiResponse<PgPagedResult<PendingApplicationResponse>>($"You are not a member of {committeeType}", 403);

            var reviewStatus = GetReviewStatusForCommittee(committeeType);
            var applications = await GetApplicationsForCommittee(new CommitteeMembership
            {
                CommitteeType = committeeType,
                DepartmentId = committee.DepartmentId,
                FacultyId = committee.FacultyId,
                SchoolId = committee.SchoolId
            });

            // History includes applications that have moved past this review stage
            var filtered = applications.Where(a =>
                a.ReviewStatus != reviewStatus &&
                a.ApplicationStatus != ApplicationStatusTypes.Draft);

            // Apply search
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                filtered = filtered.Where(a =>
                    (a.ApplicantName ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantEmail ?? string.Empty).ToLower().Contains(term) ||
                    (a.ApplicantDepartmentName ?? string.Empty).ToLower().Contains(term) ||
                    (a.PromotionPosition ?? string.Empty).ToLower().Contains(term));
            }

            var total = filtered.Count();

            var pageIndex = Math.Max(1, page);
            var skip = (pageIndex - 1) * pageSize;
            var pageItems = filtered.OrderByDescending(a => a.SubmissionDate ?? a.CreatedAt).Skip(skip).Take(pageSize).ToList();

            var responses = new List<PendingApplicationResponse>();

            foreach (var app in pageItems)
            {
                var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == app.Id);
                var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == app.Id);
                var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == app.Id);

                var activities = await _activityRepository.GetAllAsync(a =>
                    a.ApplicationId == app.Id &&
                    a.CommitteeLevel == committeeType &&
                    a.ActivityType == AssessmentActivityTypes.CommentAdded);

                responses.Add(new PendingApplicationResponse
                {
                    ApplicationId = app.Id,
                    ApplicantId = app.ApplicantId,
                    ApplicantName = app.ApplicantName,
                    ApplicantEmail = app.ApplicantEmail,
                    CurrentPosition = app.ApplicantCurrentPosition,
                    ApplyingForPosition = app.PromotionPosition,
                    DepartmentName = app.ApplicantDepartmentName,
                    FacultyName = app.ApplicantFacultyName,
                    SubmissionDate = app.SubmissionDate ?? app.CreatedAt,
                    ReviewStatus = app.ReviewStatus ?? "Pending",
                    ApplicationStatus = app.ApplicationStatus,
                    IsResubmission = (app.ReviewStatusHistory?.Split(',').Length ?? 0) > 1,
                    ResubmissionCount = Math.Max(0, (app.ReviewStatusHistory?.Split(',').Length ?? 1) - 1),
                    ApplicantPerformance = new PerformanceSummary
                    {
                        TeachingPerformance = teaching?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        PublicationPerformance = publication?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        ServicePerformance = service?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        TotalTeachingScore = CalculateTeachingScore(teaching),
                        TotalPublicationScore = CalculatePublicationScore(publication),
                        TotalServiceScore = CalculateServiceScore(service)
                    },
                    ReviewedByMemberCount = activities.Select(a => a.PerformedByStaffId).Distinct().Count()
                });
            }

            var result = new PgPagedResult<PendingApplicationResponse>(
                results: responses,
                pageIndex: pageIndex,
                pageSize: pageSize,
                count: responses.Count,
                totalCount: total
            );

            return result.ToOkApiResponse();
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
            // Verify committee membership
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id);
            if (!committees.Any())
                return new ApiResponse<ApplicationForAssessmentResponse>("Not authorized", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<ApplicationForAssessmentResponse>("Application not found", 404);

            // Check if user has access to this application based on committee membership
            var hasAccess = await HasAccessToApplication(auth.Id, application, committees.ToList());
            if (!hasAccess)
                return new ApiResponse<ApplicationForAssessmentResponse>("You do not have access to this application", 403);

            // Get all assessment data
            var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == applicationId);
            var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == applicationId);
            var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == applicationId);

            // Get activity history
            var activities = await _activityRepository.GetAllAsync(a => a.ApplicationId == applicationId);

            var response = new ApplicationForAssessmentResponse
            {
                ApplicationId = application.Id,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                ApplicantEmail = application.ApplicantEmail,
                CurrentPosition = application.ApplicantCurrentPosition,
                ApplyingForPosition = application.PromotionPosition,
                DepartmentName = application.ApplicantDepartmentName,
                FacultyName = application.ApplicantFacultyName,
                SchoolName = application.ApplicantSchoolName,
                SubmissionDate = application.SubmissionDate ?? application.CreatedAt,
                ReviewStatus = application.ReviewStatus ?? "Pending",
                ApplicationStatus = application.ApplicationStatus,
                PerformanceCriteria = application.PerformanceCriteria,
                Teaching = MapTeachingData(teaching),
                Publications = MapPublicationData(publication),
                Services = MapServiceData(service),
                PreviousAssessments = await GetPreviousAssessments(applicationId),
                ActivityHistory = activities.OrderByDescending(a => a.ActivityDate).Select(a => new ActivityHistoryItem
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    Description = a.Description,
                    PerformedBy = a.PerformedByName,
                    CommitteeLevel = a.CommitteeLevel,
                    IsChairperson = a.PerformedByIsChairperson,
                    ActivityDate = a.ActivityDate,
                    CategoryAffected = a.CategoryAffected,
                    PreviousStatus = a.PreviousStatus,
                    NewStatus = a.NewStatus,
                    AdditionalData = a.ActivityData != null ? new AssessmentActivityDataResponse
                    {
                        PreviousScore = a.ActivityData.PreviousScore,
                        NewScore = a.ActivityData.NewScore,
                        Remarks = a.ActivityData.Remarks,
                        ReturnReason = a.ActivityData.ReturnReason
                    } : null
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
            // Get committee membership and verify chairperson role
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id && c.IsChairperson);
            if (!committees.Any())
                return new ApiResponse<bool>("Only chairpersons can submit assessment scores", 403);

            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            // Determine which committee level is assessing
            var activeCommittee = committees.FirstOrDefault(c => 
                GetReviewStatusForCommittee(c.CommitteeType) == application.ReviewStatus);
            
            if (activeCommittee == null)
                return new ApiResponse<bool>("This application is not at a stage you can assess", 400);

            // Verify application has not reached a terminal state (returned, approved, or rejected)
            if (application.ApplicationStatus == ApplicationStatusTypes.Returned
                || application.ApplicationStatus == ApplicationStatusTypes.Approved
                || application.ApplicationStatus == ApplicationStatusTypes.NotApproved)
                return new ApiResponse<bool>("Application has already been processed and cannot be assessed", 400);

            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            var committeeType = activeCommittee.CommitteeType;

            // Update teaching scores
            if (request.TeachingScores != null)
            {
                var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == request.ApplicationId);
                if (teaching != null)
                {
                    // Preserve all critical properties for data integrity
                    var originalApplicationId = teaching.PromotionApplicationId;
                    var originalPositionId = teaching.PromotionPositionId;
                    var originalApplicantId = teaching.ApplicantId;
                    var originalDepartmentId = teaching.ApplicantDepartmentId;
                    var originalSchoolId = teaching.ApplicantSchoolId;
                    var originalFacultyId = teaching.ApplicantFacultyId;
                    var originalStatus = teaching.Status;
                    var originalApplicantPerformance = teaching.ApplicantPerformance;
                    var originalTotalCategories = teaching.TotalCategoriesAssessed;

                    UpdateTeachingScores(teaching, request.TeachingScores, committeeType);

                    // Restore all critical properties after update
                    teaching.PromotionApplicationId = originalApplicationId;
                    teaching.PromotionPositionId = originalPositionId;
                    teaching.ApplicantId = originalApplicantId;
                    teaching.ApplicantDepartmentId = originalDepartmentId;
                    teaching.ApplicantSchoolId = originalSchoolId;
                    teaching.ApplicantFacultyId = originalFacultyId;
                    teaching.Status = originalStatus;
                    teaching.ApplicantPerformance = originalApplicantPerformance;
                    teaching.TotalCategoriesAssessed = originalTotalCategories;

                    await _teachingRepository.UpdateAsync(teaching);
                }
            }

            // Update publication scores
            if (request.PublicationScores != null && request.PublicationScores.Any())
            {
                var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == request.ApplicationId);
                if (publication != null)
                {
                    // Preserve all critical properties for data integrity
                    var originalApplicationId = publication.PromotionApplicationId;
                    var originalPositionId = publication.PromotionPositionId;
                    var originalApplicantId = publication.ApplicantId;
                    var originalDepartmentId = publication.ApplicantDepartmentId;
                    var originalSchoolId = publication.ApplicantSchoolId;
                    var originalFacultyId = publication.ApplicantFacultyId;
                    var originalStatus = publication.Status;
                    var originalApplicantPerformance = publication.ApplicantPerformance;

                    UpdatePublicationScores(publication, request.PublicationScores, committeeType);

                    // Restore all critical properties after update
                    publication.PromotionApplicationId = originalApplicationId;
                    publication.PromotionPositionId = originalPositionId;
                    publication.ApplicantId = originalApplicantId;
                    publication.ApplicantDepartmentId = originalDepartmentId;
                    publication.ApplicantSchoolId = originalSchoolId;
                    publication.ApplicantFacultyId = originalFacultyId;
                    publication.Status = originalStatus;
                    publication.ApplicantPerformance = originalApplicantPerformance;

                    await _publicationRepository.UpdateAsync(publication);
                }
            }

            // Update service scores
            if (request.ServiceScores != null && request.ServiceScores.Any())
            {
                var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == request.ApplicationId);
                if (service != null)
                {
                    // Preserve all critical properties for data integrity
                    var originalApplicationId = service.PromotionApplicationId;
                    var originalPositionId = service.PromotionPositionId;
                    var originalApplicantId = service.ApplicantId;
                    var originalDepartmentId = service.ApplicantDepartmentId;
                    var originalSchoolId = service.ApplicantSchoolId;
                    var originalFacultyId = service.ApplicantFacultyId;
                    var originalStatus = service.Status;
                    var originalApplicantPerformance = service.ApplicantPerformance;

                    UpdateServiceScores(service, request.ServiceScores, committeeType);

                    // Restore all critical properties after update
                    service.PromotionApplicationId = originalApplicationId;
                    service.PromotionPositionId = originalPositionId;
                    service.ApplicantId = originalApplicantId;
                    service.ApplicantDepartmentId = originalDepartmentId;
                    service.ApplicantSchoolId = originalSchoolId;
                    service.ApplicantFacultyId = originalFacultyId;
                    service.Status = originalStatus;
                    service.ApplicantPerformance = originalApplicantPerformance;

                    await _serviceRepository.UpdateAsync(service);
                }
            }

            // Log activity
            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = request.ApplicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = committeeType,
                PerformedByStaffId = auth.Id,
                PerformedByName = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown",
                PerformedByIsChairperson = true,
                ActivityType = AssessmentActivityTypes.ScoreSubmitted,
                Description = $"Assessment scores submitted by {committeeType} chairperson",
                ActivityData = new AssessmentActivityData
                {
                    Remarks = StripHtmlTags(request.OverallRemarks)
                }
            });

            return true.ToOkApiResponse("Scores submitted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting assessment scores for {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> AddAssessmentComment(AuthData auth, AddAssessmentCommentRequest request)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id);
            if (!committees.Any())
                return new ApiResponse<bool>("Not authorized", 403);

            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            var activeCommittee = committees.FirstOrDefault(c => 
                GetReviewStatusForCommittee(c.CommitteeType) == application.ReviewStatus);

            if (activeCommittee == null)
                return new ApiResponse<bool>("This application is not at a stage you can comment on", 400);

            // Verify application has not reached a terminal state (returned, approved, or rejected)
            if (application.ApplicationStatus == ApplicationStatusTypes.Returned
                || application.ApplicationStatus == ApplicationStatusTypes.Approved
                || application.ApplicationStatus == ApplicationStatusTypes.NotApproved)
                return new ApiResponse<bool>("Application has already been processed and cannot be commented on", 400);

            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = request.ApplicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = activeCommittee.CommitteeType,
                PerformedByStaffId = auth.Id,
                PerformedByName = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown",
                PerformedByIsChairperson = activeCommittee.IsChairperson,
                ActivityType = AssessmentActivityTypes.CommentAdded,
                Description = $"Comment added on {request.Category}",
                CategoryAffected = request.Category,
                ActivityData = new AssessmentActivityData
                {
                    Remarks = StripHtmlTags(request.Comment),
                    AffectedRecordIds = request.RecordId != null ? new List<string> { request.RecordId } : null
                }
            });

            return true.ToOkApiResponse("Comment added successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment for {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> ReturnApplication(AuthData auth, ReturnApplicationRequest request)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id && c.IsChairperson);
            if (!committees.Any())
                return new ApiResponse<bool>("Only chairpersons can return applications", 403);

            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var activeCommittee = committees.FirstOrDefault(c => 
                GetReviewStatusForCommittee(c.CommitteeType) == application.ReviewStatus);

            if (activeCommittee == null)
                return new ApiResponse<bool>("This application is not at a stage you can return", 400);

            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            var previousStatus = application.ReviewStatus;

            // Update application status
            application.ApplicationStatus = ApplicationStatusTypes.Returned;
            application.ReviewStatus = AcademicPromotionState.Returned;
            application.ReviewStatusHistory = string.IsNullOrEmpty(application.ReviewStatusHistory) 
                ? previousStatus 
                : $"{application.ReviewStatusHistory},{previousStatus}";

            await _applicationRepository.UpdateAsync(application);

            // Log activity
            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = request.ApplicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = activeCommittee.CommitteeType,
                PerformedByStaffId = auth.Id,
                PerformedByName = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown",
                PerformedByIsChairperson = true,
                ActivityType = AssessmentActivityTypes.ApplicationReturned,
                Description = $"Application returned to applicant by {activeCommittee.CommitteeType}",
                PreviousStatus = previousStatus,
                NewStatus = AcademicPromotionState.Returned,
                ActivityData = new AssessmentActivityData
                {
                    ReturnReason = StripHtmlTags(request.ReturnReason),
                    Remarks = StripHtmlTags(request.DetailedComments),
                    AffectedRecordIds = request.CategoriesRequiringAttention
                }
            });

            // Send email notification to applicant via the shared email notification service
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
                    ApplicationUrl = "https://academic-portal.umat.edu.gh/applications"
                };

                _actorSystem.SendApplicationReturnedNotificationAsync(payload);
                _logger.LogInformation("[ReturnApplication] Returned notification dispatched via actor for applicant {ApplicantId}", application.ApplicantId);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "[ReturnApplication] Error sending returned notification email for applicant {ApplicantId}", application.ApplicantId);
                // Don't fail the return process if email sending fails
            }

            return true.ToOkApiResponse("Application returned to applicant");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error returning application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> AdvanceApplication(AuthData auth, AdvanceApplicationRequest request)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id && c.IsChairperson);
            if (!committees.Any())
                return new ApiResponse<bool>("Only chairpersons can advance applications", 403);

            var application = await _applicationRepository.GetByIdAsync(request.ApplicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            var activeCommittee = committees.FirstOrDefault(c => 
                GetReviewStatusForCommittee(c.CommitteeType) == application.ReviewStatus);

            if (activeCommittee == null)
                return new ApiResponse<bool>("This application is not at a stage you can advance", 400);

            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            var previousStatus = application.ReviewStatus;
            var nextStatus = GetNextReviewStatus(activeCommittee.CommitteeType);

            // Update application status
            application.ReviewStatus = nextStatus;
            application.ReviewStatusHistory = string.IsNullOrEmpty(application.ReviewStatusHistory) 
                ? previousStatus 
                : $"{application.ReviewStatusHistory},{previousStatus}";

            await _applicationRepository.UpdateAsync(application);

            // Log activity
            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = request.ApplicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = activeCommittee.CommitteeType,
                PerformedByStaffId = auth.Id,
                PerformedByName = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown",
                PerformedByIsChairperson = true,
                ActivityType = AssessmentActivityTypes.ApplicationAdvanced,
                Description = $"Application advanced from {activeCommittee.CommitteeType} to next stage",
                PreviousStatus = previousStatus,
                NewStatus = nextStatus,
                ActivityData = new AssessmentActivityData
                {
                    Remarks = StripHtmlTags(request.Recommendation)
                }
            });

            // Notify the next committee that an application has reached their stage.
            // Maps DAPC → FAPSC, FAPSC → UAPC. UAPC advances to CouncilApproved, which has no committee.
            var nextCommitteeType = activeCommittee.CommitteeType switch
            {
                AcademicPromotionApplicationRoles.DAPC => AcademicPromotionApplicationRoles.FAPSC,
                AcademicPromotionApplicationRoles.FAPSC => AcademicPromotionApplicationRoles.UAPC,
                _ => null
            };

            if (nextCommitteeType != null)
            {
                try
                {
                    _actorSystem.SendCommitteeEmailAsync(new SendCommitteeEmailMessage
                    {
                        ApplicationId = application.Id,
                        ApplicantName = application.ApplicantName,
                        ApplicantEmail = application.ApplicantEmail,
                        ApplicantPosition = application.ApplicantCurrentPosition,
                        ApplicantDepartmentId = application.ApplicantDepartmentId,
                        ApplicantDepartmentName = application.ApplicantDepartmentName,
                        ApplicantFacultyId = application.ApplicantFacultyId,
                        ApplicantFacultyName = application.ApplicantFacultyName,
                        ApplicantSchoolName = application.ApplicantSchoolName,
                        TargetPosition = application.PromotionPosition,
                        CommitteeType = nextCommitteeType,
                        ReviewUrl = "https://academic-portal.umat.edu.gh/review"
                    });
                    _logger.LogInformation("[AdvanceApplication] Queued {CommitteeType} notification for application {ApplicationId}",
                        nextCommitteeType, application.Id);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "[AdvanceApplication] Failed to queue {CommitteeType} notification for application {ApplicationId}",
                        nextCommitteeType, application.Id);
                    // Email failures must not roll back the advance
                }
            }

            return true.ToOkApiResponse($"Application advanced to {nextStatus}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error advancing application {ApplicationId}", request.ApplicationId);
            return new ApiResponse<bool>("An error occurred", 500);
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

            var response = activities.OrderByDescending(a => a.ActivityDate).Select(a => new ActivityHistoryItem
            {
                Id = a.Id,
                ActivityType = a.ActivityType,
                Description = a.Description,
                PerformedBy = a.PerformedByName,
                CommitteeLevel = a.CommitteeLevel,
                IsChairperson = a.PerformedByIsChairperson,
                ActivityDate = a.ActivityDate,
                CategoryAffected = a.CategoryAffected,
                PreviousStatus = a.PreviousStatus,
                NewStatus = a.NewStatus,
                AdditionalData = a.ActivityData != null ? new AssessmentActivityDataResponse
                {
                    PreviousScore = a.ActivityData.PreviousScore,
                    NewScore = a.ActivityData.NewScore,
                    Remarks = a.ActivityData.Remarks,
                    ReturnReason = a.ActivityData.ReturnReason
                } : null
            }).ToList();

            return response.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting activity history for {ApplicationId}", applicationId);
            return new ApiResponse<List<ActivityHistoryItem>>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> ApproveApplication(AuthData auth, string applicationId, string? recommendation)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id && c.IsChairperson && c.CommitteeType == AcademicPromotionApplicationRoles.UAPC);
            if (!committees.Any())
                return new ApiResponse<bool>("Only UAPC chairperson can approve applications", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            if (application.ReviewStatus != AcademicPromotionState.UAPCReview)
                return new ApiResponse<bool>("Application is not at UAPC review stage", 400);

            var chairperson = await _staffRepository.GetByIdAsync(auth.Id);
            var previousStatus = application.ReviewStatus;

            // Update application status
            application.ApplicationStatus = ApplicationStatusTypes.Approved;
            application.ReviewStatus = AcademicPromotionState.CouncilApproved;
            application.IsActive = false;
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

            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = applicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = AcademicPromotionApplicationRoles.UAPC,
                PerformedByStaffId = auth.Id,
                PerformedByName = chairperson != null ? $"{chairperson.FirstName} {chairperson.LastName}" : "Unknown",
                PerformedByIsChairperson = true,
                ActivityType = AssessmentActivityTypes.ApplicationApproved,
                Description = $"Application approved - Promoted to {application.PromotionPosition}",
                PreviousStatus = previousStatus,
                NewStatus = AcademicPromotionState.CouncilApproved,
                ActivityData = new AssessmentActivityData
                {
                    Remarks = StripHtmlTags(recommendation)
                }
            });

            // Send approval email notification to applicant via the shared email notification service
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
                    AcademicPortalUrl = "https://academic-portal.umat.edu.gh"
                };

                _actorSystem.SendApplicationApprovedNotificationAsync(payload);
                _logger.LogInformation("[ApproveApplication] Approval notification dispatched via actor for applicant {ApplicantId}", application.ApplicantId);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "[ApproveApplication] Error sending approval email for applicant {ApplicantId}", application.ApplicantId);
                // Don't fail the approval process if email sending fails
            }

            return true.ToOkApiResponse($"Application approved successfully. {application.ApplicantName} has been promoted to {application.PromotionPosition}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving application {ApplicationId}", applicationId);
            return new ApiResponse<bool>("An error occurred", 500);
        }
    }

    public async Task<IApiResponse<bool>> RejectApplication(AuthData auth, string applicationId, string reason)
    {
        try
        {
            var committees = await _committeeRepository.GetAllAsync(c => c.StaffId == auth.Id && c.IsChairperson && c.CommitteeType == AcademicPromotionApplicationRoles.UAPC);
            if (!committees.Any())
                return new ApiResponse<bool>("Only UAPC chairperson can return applications for update", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<bool>("Application not found", 404);

            if (application.ReviewStatus != AcademicPromotionState.UAPCReview)
                return new ApiResponse<bool>("Application is not at UAPC review stage", 400);

            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            var previousStatus = application.ReviewStatus;

            // Return for update - applicant can edit and resubmit
            application.ApplicationStatus = ApplicationStatusTypes.Returned;
            application.ReviewStatus = AcademicPromotionState.ReturnedForUpdate;
            await _applicationRepository.UpdateAsync(application);

            await _activityRepository.AddAsync(new AssessmentActivity
            {
                ApplicationId = applicationId,
                ApplicantId = application.ApplicantId,
                ApplicantName = application.ApplicantName,
                CommitteeLevel = AcademicPromotionApplicationRoles.UAPC,
                PerformedByStaffId = auth.Id,
                PerformedByName = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown",
                PerformedByIsChairperson = true,
                ActivityType = AssessmentActivityTypes.ApplicationReturned,
                Description = "Application returned for update by UAPC",
                PreviousStatus = previousStatus,
                NewStatus = AcademicPromotionState.ReturnedForUpdate,
                ActivityData = new AssessmentActivityData
                {
                    ReturnReason = StripHtmlTags(reason),
                    Remarks = StripHtmlTags(reason)
                }
            });

            return true.ToOkApiResponse("Application returned to applicant for updates. They will be able to make changes and resubmit.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error returning application {ApplicationId} for update", applicationId);
            return new ApiResponse<bool>("An error occurred", 500);
        }
    }

    #region Private Helper Methods

    private string GetReviewStatusForCommittee(string committeeType) => committeeType switch
    {
        AcademicPromotionApplicationRoles.DAPC => AcademicPromotionState.DepartmentReview,
        AcademicPromotionApplicationRoles.FAPSC => AcademicPromotionState.FacultyReview,
        AcademicPromotionApplicationRoles.UAPC => AcademicPromotionState.UAPCReview,
        _ => AcademicPromotionState.Submitted
    };

    private string GetNextReviewStatus(string currentCommittee) => currentCommittee switch
    {
        AcademicPromotionApplicationRoles.DAPC => AcademicPromotionState.FacultyReview,
        AcademicPromotionApplicationRoles.FAPSC => AcademicPromotionState.UAPCReview,
        AcademicPromotionApplicationRoles.UAPC => AcademicPromotionState.CouncilApproved,
        _ => AcademicPromotionState.DepartmentReview
    };

    private async Task<List<AcademicPromotionApplication>> GetApplicationsForCommittee(CommitteeMembership committee)
    {
        var applications = await _applicationRepository.GetAllAsync(a => a.ApplicationStatus != ApplicationStatusTypes.Draft);
        
        return committee.CommitteeType switch
        {
            AcademicPromotionApplicationRoles.DAPC => applications.Where(a => 
                a.ApplicantDepartmentId == committee.DepartmentId).ToList(),
            AcademicPromotionApplicationRoles.FAPSC => applications.Where(a => 
                a.ApplicantFacultyId == committee.FacultyId).ToList(),
            AcademicPromotionApplicationRoles.UAPC => applications.ToList(),
            _ => new List<AcademicPromotionApplication>()
        };
    }

    private async Task<bool> HasAccessToApplication(string staffId, AcademicPromotionApplication application, List<AcademicPromotionCommittee> committees)
    {
        foreach (var committee in committees)
        {
            switch (committee.CommitteeType)
            {
                case AcademicPromotionApplicationRoles.DAPC:
                    if (committee.DepartmentId == application.ApplicantDepartmentId) return true;
                    break;
                case AcademicPromotionApplicationRoles.FAPSC:
                    if (committee.FacultyId == application.ApplicantFacultyId) return true;
                    break;
                case AcademicPromotionApplicationRoles.UAPC:
                    return true;
            }
        }
        return false;
    }

    private double CalculateTeachingScore(TeachingRecord? teaching)
    {
        if (teaching == null) return 0;
        var scores = new List<double?>
        {
            teaching.LectureLoad?.ApplicantScore,
            teaching.AbilityToAdaptToTeaching?.ApplicantScore,
            teaching.RegularityAndPunctuality?.ApplicantScore,
            teaching.QualityOfLectureMaterial?.ApplicantScore,
            teaching.PerformanceOfStudentInExam?.ApplicantScore,
            teaching.AbilityToCompleteSyllabus?.ApplicantScore,
            teaching.QualityOfExamQuestionAndMarkingScheme?.ApplicantScore,
            teaching.PunctualityInSettingExamQuestion?.ApplicantScore,
            teaching.SupervisionOfProjectWorkAndThesis?.ApplicantScore,
            teaching.StudentReactionToAndAssessmentOfTeaching?.ApplicantScore
        };
        var validScores = scores.Where(s => s.HasValue).Select(s => s!.Value);
        return validScores.Any() ? validScores.Average() : 0;
    }

    private double CalculatePublicationScore(Publication? publication)
    {
        if (publication?.Publications == null || !publication.Publications.Any()) return 0;
        return publication.Publications.Sum(p => p.ApplicantScore ?? 0);
    }

    private double CalculateServiceScore(ServiceRecord? service)
    {
        if (service == null) return 0;
        var universityScore = service.ServiceToTheUniversity?.Sum(s => s.ApplicantScore ?? 0) ?? 0;
        var nationalScore = service.ServiceToNationalAndInternational?.Sum(s => s.ApplicantScore ?? 0) ?? 0;
        return universityScore + nationalScore;
    }

    private TeachingAssessmentData MapTeachingData(TeachingRecord? teaching)
    {
        if (teaching == null) return new TeachingAssessmentData { Categories = new List<TeachingCategoryAssessment>() };

        return new TeachingAssessmentData
        {
            ApplicantPerformance = teaching.ApplicantPerformance,
            DapcPerformance = teaching.DapcPerformance,
            FapcPerformance = teaching.FapcPerformance,
            UapcPerformance = teaching.UapcPerformance,
            TotalCategoriesAssessed = teaching.TotalCategoriesAssessed,
            Categories = new List<TeachingCategoryAssessment>
            {
                MapTeachingCategory("Lecture Load", "lectureLoad", teaching.LectureLoad),
                MapTeachingCategory("Ability to Adapt Teaching", "abilityToAdaptToTeaching", teaching.AbilityToAdaptToTeaching),
                MapTeachingCategory("Regularity and Punctuality", "regularityAndPunctuality", teaching.RegularityAndPunctuality),
                MapTeachingCategory("Quality of Lecture Material", "qualityOfLectureMaterial", teaching.QualityOfLectureMaterial),
                MapTeachingCategory("Student Exam Performance", "performanceOfStudentInExam", teaching.PerformanceOfStudentInExam),
                MapTeachingCategory("Syllabus Coverage", "abilityToCompleteSyllabus", teaching.AbilityToCompleteSyllabus),
                MapTeachingCategory("Assessment Quality", "qualityOfExamQuestionAndMarkingScheme", teaching.QualityOfExamQuestionAndMarkingScheme),
                MapTeachingCategory("Exam Punctuality", "punctualityInSettingExamQuestion", teaching.PunctualityInSettingExamQuestion),
                MapTeachingCategory("Supervision of Projects", "supervisionOfProjectWorkAndThesis", teaching.SupervisionOfProjectWorkAndThesis),
                MapTeachingCategory("Student Assessment of Teaching", "studentReactionToAndAssessmentOfTeaching", teaching.StudentReactionToAndAssessmentOfTeaching)
            }
        };
    }

    private TeachingCategoryAssessment MapTeachingCategory(string name, string key, TeachingData? data)
    {
        return new TeachingCategoryAssessment
        {
            CategoryName = name,
            CategoryKey = key,
            ApplicantScore = data?.ApplicantScore,
            ApplicantRemarks = data?.ApplicantRemarks,
            DapcScore = data?.DapcScore,
            DapcRemarks = data?.DapcRemarks,
            FapcScore = data?.FapcScore,
            FapcRemarks = data?.FapcRemarks,
            UapcScore = data?.UapcScore,
            UapcRemarks = data?.UapcRemarks,
            SupportingEvidence = data?.SupportingEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList()?? []
        };
    }

    private PublicationAssessmentData MapPublicationData(Publication? publication)
    {
        if (publication == null) return new PublicationAssessmentData { Records = new List<PublicationRecordAssessment>() };

        return new PublicationAssessmentData
        {
            ApplicantPerformance = publication.ApplicantPerformance,
            DapcPerformance = publication.DapcPerformance,
            FapcPerformance = publication.FapcPerformance,
            UapcPerformance = publication.UapcPerformance,
            TotalPublications = publication.Publications?.Count ?? 0,
            Records = publication.Publications?.Select(p => new PublicationRecordAssessment
            {
                Id = p.Id,
                Title = p.Title,
                Year = p.Year,
                PublicationType = p.PublicationTypeName,
                SystemGeneratedScore = p.SystemGeneratedScore,
                ApplicantScore = p.ApplicantScore,
                ApplicantRemarks = p.ApplicantRemarks,
                DapcScore = p.DapcScore,
                DapcRemarks = p.DapcRemarks,
                FapcScore = p.FapcScore,
                FapcRemarks = p.FapcRemarks,
                UapcScore = p.UapcScore,
                UapcRemarks = p.UapcRemarks,
                SupportingEvidence = p.SupportingEvidence
                    .Select(x => _storageService.GetFileUrl(x))
                    .ToList()?? []
            }).ToList() ?? []
        };
    }

    private ServiceAssessmentData MapServiceData(ServiceRecord? service)
    {
        if (service == null) return new ServiceAssessmentData 
        { 
            UniversityService = new List<ServiceRecordAssessment>(),
            NationalInternationalService = new List<ServiceRecordAssessment>()
        };

        return new ServiceAssessmentData
        {
            ApplicantPerformance = service.ApplicantPerformance,
            DapcPerformance = service.DapcPerformance,
            FapcPerformance = service.FapcPerformance,
            UapcPerformance = service.UapcPerformance,
            TotalServiceRecords = (service.ServiceToTheUniversity?.Count ?? 0) + (service.ServiceToNationalAndInternational?.Count ?? 0),
            UniversityService = service.ServiceToTheUniversity?.Select(s => MapServiceRecord(s, "University")).ToList() ?? new List<ServiceRecordAssessment>(),
            NationalInternationalService = service.ServiceToNationalAndInternational?.Select(s => MapServiceRecord(s, "National/International")).ToList() ?? new List<ServiceRecordAssessment>()
        };
    }

    private ServiceRecordAssessment MapServiceRecord(ServiceRecordsData data, string serviceType)
    {
        return new ServiceRecordAssessment
        {
            Id = data.Id,
            ServiceTitle = data.ServiceTitle,
            Role = data.Role,
            Duration = data.Duration,
            ServiceType = serviceType,
            SystemGeneratedScore = data.SystemGeneratedScore ?? 0,
            ApplicantScore = data.ApplicantScore,
            ApplicantRemarks = data.ApplicantRemarks,
            DapcScore = data.DapcScore,
            DapcRemarks = data.DapcRemarks,
            FapcScore = data.FapcScore,
            FapcRemarks = data.FapcRemarks,
            UapcScore = data.UapcScore,
            UapcRemarks = data.UapcRemarks,
            SupportingEvidence  = data.SupportingEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList()?? []
        };
    }

    private async Task<List<PreviousAssessment>> GetPreviousAssessments(string applicationId)
    {
        var activities = await _activityRepository.GetAllAsync(a => 
            a.ApplicationId == applicationId && 
            a.ActivityType == AssessmentActivityTypes.ScoreSubmitted);

        return activities.OrderBy(a => a.ActivityDate).Select(a => new PreviousAssessment
        {
            CommitteeLevel = a.CommitteeLevel,
            AssessmentDate = a.ActivityDate,
            AssessedBy = a.PerformedByName,
            OverallRemarks = a.ActivityData?.Remarks,
            Recommendation = a.ActivityData?.Remarks
        }).ToList();
    }

    private void UpdateTeachingScores(TeachingRecord teaching, TeachingAssessmentScores scores, string committeeType)
    {
        void UpdateCategory(TeachingData? data, CategoryScore? score)
        {
            if (data == null || score == null) return;
            switch (committeeType)
            {
                case AcademicPromotionApplicationRoles.DAPC:
                    data.DapcScore = score.Score;
                    data.DapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.FAPSC:
                    data.FapcScore = score.Score;
                    data.FapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.UAPC:
                    data.UapcScore = score.Score;
                    data.UapcRemarks = StripHtmlTags(score.Remarks);
                    break;
            }
        }

        UpdateCategory(teaching.LectureLoad, scores.LectureLoad);
        UpdateCategory(teaching.AbilityToAdaptToTeaching, scores.AbilityToAdaptToTeaching);
        UpdateCategory(teaching.RegularityAndPunctuality, scores.RegularityAndPunctuality);
        UpdateCategory(teaching.QualityOfLectureMaterial, scores.QualityOfLectureMaterial);
        UpdateCategory(teaching.PerformanceOfStudentInExam, scores.PerformanceOfStudentInExam);
        UpdateCategory(teaching.AbilityToCompleteSyllabus, scores.AbilityToCompleteSyllabus);
        UpdateCategory(teaching.QualityOfExamQuestionAndMarkingScheme, scores.QualityOfExamQuestionAndMarkingScheme);
        UpdateCategory(teaching.PunctualityInSettingExamQuestion, scores.PunctualityInSettingExamQuestion);
        UpdateCategory(teaching.SupervisionOfProjectWorkAndThesis, scores.SupervisionOfProjectWorkAndThesis);
        UpdateCategory(teaching.StudentReactionToAndAssessmentOfTeaching, scores.StudentReactionToAndAssessmentOfTeaching);

        // Calculate total committee score for performance computation
        var categories = new List<TeachingData?>
        {
            teaching.LectureLoad,
            teaching.AbilityToAdaptToTeaching,
            teaching.RegularityAndPunctuality,
            teaching.QualityOfLectureMaterial,
            teaching.PerformanceOfStudentInExam,
            teaching.AbilityToCompleteSyllabus,
            teaching.QualityOfExamQuestionAndMarkingScheme,
            teaching.PunctualityInSettingExamQuestion,
            teaching.SupervisionOfProjectWorkAndThesis,
            teaching.StudentReactionToAndAssessmentOfTeaching
        };

        double GetCommitteeScore(TeachingData? data) => committeeType switch
        {
            AcademicPromotionApplicationRoles.DAPC => data?.DapcScore ?? 0,
            AcademicPromotionApplicationRoles.FAPSC => data?.FapcScore ?? 0,
            AcademicPromotionApplicationRoles.UAPC => data?.UapcScore ?? 0,
            _ => 0
        };

        var totalScore = categories.Where(c => c != null).Sum(c => GetCommitteeScore(c));
        var performance = PerformanceComputationService.ComputePerformanceForTeaching(totalScore);

        // Update the committee-level performance
        switch (committeeType)
        {
            case AcademicPromotionApplicationRoles.DAPC:
                teaching.DapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.FAPSC:
                teaching.FapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.UAPC:
                teaching.UapcPerformance = performance;
                break;
        }
    }

    private void UpdatePublicationScores(Publication publication, List<RecordScore> scores, string committeeType)
    {
        foreach (var score in scores)
        {
            var record = publication.Publications?.FirstOrDefault(p => p.Id == score.RecordId);
            if (record == null) continue;

            switch (committeeType)
            {
                case AcademicPromotionApplicationRoles.DAPC:
                    record.DapcScore = score.Score;
                    record.DapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.FAPSC:
                    record.FapcScore = score.Score;
                    record.FapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.UAPC:
                    record.UapcScore = score.Score;
                    record.UapcRemarks = StripHtmlTags(score.Remarks);
                    break;
            }
        }

        // Calculate total committee score for performance computation
        if (publication.Publications == null || !publication.Publications.Any()) return;

        double GetCommitteeScore(PublicationData? data) => committeeType switch
        {
            AcademicPromotionApplicationRoles.DAPC => data?.DapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            AcademicPromotionApplicationRoles.FAPSC => data?.FapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            AcademicPromotionApplicationRoles.UAPC => data?.UapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            _ => 0
        };

        var totalScore = publication.Publications.Sum(p => GetCommitteeScore(p));
        var performance = PerformanceComputationService.ComputePerformanceForPublications(totalScore);

        // Update the committee-level performance
        switch (committeeType)
        {
            case AcademicPromotionApplicationRoles.DAPC:
                publication.DapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.FAPSC:
                publication.FapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.UAPC:
                publication.UapcPerformance = performance;
                break;
        }
    }

    private void UpdateServiceScores(ServiceRecord service, List<RecordScore> scores, string committeeType)
    {
        foreach (var score in scores)
        {
            var universityRecord = service.ServiceToTheUniversity?.FirstOrDefault(s => s.Id == score.RecordId);
            var nationalRecord = service.ServiceToNationalAndInternational?.FirstOrDefault(s => s.Id == score.RecordId);
            var record = universityRecord ?? nationalRecord;
            
            if (record == null) continue;

            switch (committeeType)
            {
                case AcademicPromotionApplicationRoles.DAPC:
                    record.DapcScore = score.Score;
                    record.DapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.FAPSC:
                    record.FapcScore = score.Score;
                    record.FapcRemarks = StripHtmlTags(score.Remarks);
                    break;
                case AcademicPromotionApplicationRoles.UAPC:
                    record.UapcScore = score.Score;
                    record.UapcRemarks = StripHtmlTags(score.Remarks);
                    break;
            }
        }

        // Calculate total committee score for performance computation
        double GetCommitteeScore(ServiceRecordsData? data) => committeeType switch
        {
            AcademicPromotionApplicationRoles.DAPC => data?.DapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            AcademicPromotionApplicationRoles.FAPSC => data?.FapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            AcademicPromotionApplicationRoles.UAPC => data?.UapcScore ?? data?.ApplicantScore ?? data?.SystemGeneratedScore ?? 0,
            _ => 0
        };

        var universityTotal = service.ServiceToTheUniversity?.Sum(s => GetCommitteeScore(s)) ?? 0;
        var nationalTotal = service.ServiceToNationalAndInternational?.Sum(s => GetCommitteeScore(s)) ?? 0;
        var totalScore = universityTotal + nationalTotal;

        var performance = PerformanceComputationService.ComputeServicePerformance(totalScore);

        // Update the committee-level performance
        switch (committeeType)
        {
            case AcademicPromotionApplicationRoles.DAPC:
                service.DapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.FAPSC:
                service.FapcPerformance = performance;
                break;
            case AcademicPromotionApplicationRoles.UAPC:
                service.UapcPerformance = performance;
                break;
        }
    }

    #endregion

    public async Task<IApiResponse<PromotionValidationResponse>> ValidateForPromotion(AuthData auth, string applicationId)
    {
        try
        {
            // Verify UAPC chairperson
            var committees = await _committeeRepository.GetAllAsync(c => 
                c.StaffId == auth.Id && c.IsChairperson && c.CommitteeType == AcademicPromotionApplicationRoles.UAPC);
            if (!committees.Any())
                return new ApiResponse<PromotionValidationResponse>("Only UAPC chairperson can validate applications for promotion", 403);

            var application = await _applicationRepository.GetByIdAsync(applicationId);
            if (application == null)
                return new ApiResponse<PromotionValidationResponse>("Application not found", 404);

            if (application.ReviewStatus != AcademicPromotionState.UAPCReview)
                return new ApiResponse<PromotionValidationResponse>("Application must be at UAPC review stage for validation", 400);

            // Get position requirements
            var position = await _positionRepository.GetByIdAsync(application.PromotionPositionId);
            if (position == null)
                return new ApiResponse<PromotionValidationResponse>("Position not found", 404);

            // Get staff info for years calculation
            var staff = await _staffRepository.GetByIdAsync(application.ApplicantId);
            
            // Get assessment records
            var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == applicationId);
            var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == applicationId);
            var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == applicationId);

            // Calculate years since last promotion
            var yearsSincePromotion = staff != null 
                ? (int)Math.Floor((DateTime.UtcNow - staff.LastAppointmentOrPromotionDate).TotalDays / 365.25)
                : 0;

            // Count publications and refereed journals
            var publications = publication?.Publications ?? new List<PublicationData>();
            var totalPublications = publications.Count;
            var refereedJournalCount = publications.Count(p => 
                p.PublicationTypeName.Contains("Journal", StringComparison.OrdinalIgnoreCase) ||
                p.PublicationTypeName.Contains("Refereed", StringComparison.OrdinalIgnoreCase) ||
                p.PublicationTypeId.Contains("journal", StringComparison.OrdinalIgnoreCase));

            // Get final (UAPC) performances - fall back to FAPSC then DAPC if UAPC not yet assessed
            var teachingPerformance = GetFinalPerformance(teaching?.UapcPerformance, teaching?.FapcPerformance, teaching?.DapcPerformance, teaching?.ApplicantPerformance);
            var publicationPerformance = GetFinalPerformance(publication?.UapcPerformance, publication?.FapcPerformance, publication?.DapcPerformance, publication?.ApplicantPerformance);
            var servicePerformance = GetFinalPerformance(service?.UapcPerformance, service?.FapcPerformance, service?.DapcPerformance, service?.ApplicantPerformance);

            var performanceCombination = $"{teachingPerformance},{publicationPerformance},{servicePerformance}";

            // Calculate scores
            var teachingScore = CalculateTeachingScore(teaching);
            var publicationScore = publications.Sum(p => p.UapcScore ?? p.FapcScore ?? p.DapcScore ?? p.ApplicantScore ?? p.SystemGeneratedScore);
            var serviceScore = CalculateServiceScore(service);

            // Build validation items
            var validationItems = new List<ValidationItem>();
            var strengths = new List<string>();
            var areasForImprovement = new List<string>();

            // 1. Years since promotion
            var yearsRequirementMet = yearsSincePromotion >= position.MinimumNumberOfYearsFromLastPromotion;
            validationItems.Add(new ValidationItem
            {
                Category = "Time in Position",
                Requirement = $"Minimum {position.MinimumNumberOfYearsFromLastPromotion} years since last promotion",
                ActualValue = $"{yearsSincePromotion} years",
                IsMet = yearsRequirementMet,
                Severity = yearsRequirementMet ? "Info" : "Critical",
                Notes = yearsRequirementMet 
                    ? "Applicant has served the required duration" 
                    : $"Applicant needs {position.MinimumNumberOfYearsFromLastPromotion - yearsSincePromotion} more year(s)"
            });
            if (yearsRequirementMet) strengths.Add($"Has served {yearsSincePromotion} years since last promotion");
            else areasForImprovement.Add($"Only {yearsSincePromotion} years since last promotion (minimum: {position.MinimumNumberOfYearsFromLastPromotion})");

            // 2. Total publications
            var pubsRequirementMet = totalPublications >= position.MinimumNumberOfPublications;
            validationItems.Add(new ValidationItem
            {
                Category = "Publications",
                Requirement = $"Minimum {position.MinimumNumberOfPublications} publications",
                ActualValue = $"{totalPublications} publications",
                IsMet = pubsRequirementMet,
                Severity = pubsRequirementMet ? "Info" : "Critical",
                Notes = pubsRequirementMet 
                    ? "Publication count meets requirements" 
                    : $"Need {position.MinimumNumberOfPublications - totalPublications} more publication(s)"
            });
            if (pubsRequirementMet && totalPublications > position.MinimumNumberOfPublications) 
                strengths.Add($"Exceeds publication requirement with {totalPublications} publications");
            else if (!pubsRequirementMet) 
                areasForImprovement.Add($"Only {totalPublications} publications (minimum: {position.MinimumNumberOfPublications})");

            // 3. Refereed journals
            var journalRequirementMet = refereedJournalCount >= position.MinimumNumberOfRefereedJournal;
            validationItems.Add(new ValidationItem
            {
                Category = "Refereed Journals",
                Requirement = $"Minimum {position.MinimumNumberOfRefereedJournal} refereed journal articles",
                ActualValue = $"{refereedJournalCount} journal articles",
                IsMet = journalRequirementMet,
                Severity = journalRequirementMet ? "Info" : "Critical",
                Notes = journalRequirementMet 
                    ? "Refereed journal count meets requirements" 
                    : $"Need {position.MinimumNumberOfRefereedJournal - refereedJournalCount} more refereed journal article(s)"
            });
            if (journalRequirementMet && refereedJournalCount > position.MinimumNumberOfRefereedJournal) 
                strengths.Add($"Strong research output with {refereedJournalCount} refereed journal articles");
            else if (!journalRequirementMet) 
                areasForImprovement.Add($"Only {refereedJournalCount} refereed journal articles (minimum: {position.MinimumNumberOfRefereedJournal})");

            // 4. Performance criteria
            var acceptableCriteria = position.PerformanceCriteria ?? new List<string>();
            var matchedCriteria = acceptableCriteria.FirstOrDefault(c => MatchesPerformanceCriteria(performanceCombination, c, teachingScore, publicationScore, serviceScore));
            var performanceCriteriaMet = acceptableCriteria.Count == 0 || matchedCriteria != null;

            // If no exact match by labels, allow numeric teaching-based fulfilment with strict publication/service checks.
            if (!performanceCriteriaMet && MatchesPerformanceByNumericTeaching(acceptableCriteria, teachingScore, publicationScore, serviceScore))
            {
                performanceCriteriaMet = true;
                matchedCriteria = null;
            }

            var performanceDescription = BuildPerformanceCriteriaDescription(acceptableCriteria);

            var criteriaNote = performanceCriteriaMet 
                ? matchedCriteria != null 
                    ? $"Performance matches acceptable criteria: {FormatCriteria(matchedCriteria)}"
                    : "Performance criteria satisfied by numeric teaching score and detailed committee assessments"
                : $"Performance ({performanceCombination}) does not match any acceptable combination. Required: {string.Join(" OR ", acceptableCriteria.Select(FormatCriteria))}";
            
            validationItems.Add(new ValidationItem
            {
                Category = "Performance Criteria",
                Requirement = performanceDescription,
                ActualValue = $"Teaching: {teachingPerformance}, Publications: {publicationPerformance}, Service: {servicePerformance}",
                IsMet = performanceCriteriaMet,
                Severity = performanceCriteriaMet ? "Info" : "Critical",
                Notes = criteriaNote
            });

            // Add performance criteria insight
            if (performanceCriteriaMet && matchedCriteria != null)
                strengths.Add($"Performance combination ({performanceCombination}) meets promotion criteria");
            else if (!performanceCriteriaMet)
                areasForImprovement.Add($"Performance combination ({performanceCombination}) does not meet any acceptable criteria for {position.Name}");

            // Add individual performance strengths/weaknesses
            AddPerformanceInsights(teachingPerformance, "Teaching", strengths, areasForImprovement);
            AddPerformanceInsights(publicationPerformance, "Publications", strengths, areasForImprovement);
            AddPerformanceInsights(servicePerformance, "Service", strengths, areasForImprovement);

            // Determine overall recommendation
            var meetsAllRequirements = yearsRequirementMet && pubsRequirementMet && journalRequirementMet && performanceCriteriaMet;
            var recommendation = meetsAllRequirements ? "Approve" : "ReturnForUpdate";
            
            var summary = meetsAllRequirements
                ? $"Applicant meets all requirements for promotion to {position.Name}. All performance criteria have been satisfied."
                : BuildImprovementSummary(yearsRequirementMet, pubsRequirementMet, journalRequirementMet, performanceCriteriaMet);

            var response = new PromotionValidationResponse
            {
                ApplicationId = applicationId,
                ApplicantName = application.ApplicantName,
                CurrentPosition = application.ApplicantCurrentPosition,
                ApplyingForPosition = application.PromotionPosition,
                Recommendation = recommendation,
                MeetsAllRequirements = meetsAllRequirements,
                Summary = summary,
                Requirements = new PositionRequirements
                {
                    PositionName = position.Name,
                    MinimumYearsFromLastPromotion = position.MinimumNumberOfYearsFromLastPromotion,
                    MinimumPublications = position.MinimumNumberOfPublications,
                    MinimumRefereedJournals = position.MinimumNumberOfRefereedJournal,
                    AcceptablePerformanceCriteria = acceptableCriteria,
                    PerformanceCriteriaDescription = performanceDescription
                },
                Performance = new ApplicantPerformanceAnalysis
                {
                    YearsSinceLastPromotion = yearsSincePromotion,
                    TotalPublications = totalPublications,
                    RefereedJournalCount = refereedJournalCount,
                    TeachingPerformance = teachingPerformance,
                    PublicationPerformance = publicationPerformance,
                    ServicePerformance = servicePerformance,
                    PerformanceCombination = performanceCombination,
                    TeachingScore = teachingScore,
                    PublicationScore = publicationScore,
                    ServiceScore = serviceScore
                },
                ValidationItems = validationItems,
                Strengths = strengths,
                AreasForImprovement = areasForImprovement
            };

            return response.ToOkApiResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating application {ApplicationId} for promotion", applicationId);
            return new ApiResponse<PromotionValidationResponse>("An error occurred during validation", 500);
        }
    }

    private string GetFinalPerformance(params string?[] performances)
    {
        foreach (var perf in performances)
        {
            if (!string.IsNullOrEmpty(perf) && perf != PerformanceTypes.InAdequate)
                return perf;
        }
        return PerformanceTypes.InAdequate;
    }


    private bool MatchesPerformanceCriteria(string actual, string required, double teachingScore, double publicationScore, double serviceScore)
    {
        // Parse performance levels and check if actual meets or exceeds required
        var performanceLevels = new Dictionary<string, int>
        {
            { PerformanceTypes.InAdequate, 1 },
            { PerformanceTypes.Adequate, 2 },
            { PerformanceTypes.Good, 3 },
            { PerformanceTypes.High, 4 }
        };

        var actualParts = actual.Split(',').Select(p => p.Trim()).ToList();
        var requiredParts = required.Split(',').Select(p => p.Trim()).ToList();

        if (actualParts.Count != 3 || requiredParts.Count != 3) return false;

        // For criteria like "High,High,High" or "Good,High,High" we treat it as category-agnostic
        // target distribution (e.g., 2 high + 1 good) instead of exact teaching/publications/service mapping.
        var actualRanks = actualParts.Select(p => performanceLevels.GetValueOrDefault(p, 0)).OrderByDescending(x => x).ToArray();
        var requiredRanks = requiredParts.Select(p => performanceLevels.GetValueOrDefault(p, 0)).OrderByDescending(x => x).ToArray();

        // Numeric teaching fallback: allow one-level shortfall if teaching score is strong enough
        if (actualRanks[0] < requiredRanks[0])
        {
            var teachingOk =
                (teachingScore >= 80 && requiredRanks[0] == performanceLevels[PerformanceTypes.High]) ||
                (teachingScore >= 60 && requiredRanks[0] == performanceLevels[PerformanceTypes.Good]);
            if (!teachingOk) return false;
        }

        // Compare unordered thresholds: each required rank must be satisfied by some actual rank.
        var used = new bool[3];
        for (int j = 0; j < 3; j++)
        {
            int requiredRank = requiredRanks[j];
            bool matched = false;
            for (int k = 0; k < 3; k++)
            {
                if (used[k]) continue;
                if (actualRanks[k] >= requiredRank)
                {
                    used[k] = true;
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }

        return true;
    }

    private static bool IsTeachingPerformanceAcceptable(string actual, string required, double teachingScore)
    {
        if (string.Equals(actual, required, StringComparison.OrdinalIgnoreCase))
            return true;

        var performanceLevels = new Dictionary<string, int>
        {
            { PerformanceTypes.InAdequate, 1 },
            { PerformanceTypes.Adequate, 2 },
            { PerformanceTypes.Good, 3 },
            { PerformanceTypes.High, 4 }
        };

        var actualLevel = performanceLevels.GetValueOrDefault(actual, 0);
        var requiredLevel = performanceLevels.GetValueOrDefault(required, 0);

        if (actualLevel > 0 && requiredLevel > 0 && actualLevel >= requiredLevel)
            return true;

        // Numeric thresholds matching the computation service.
        var requiredTeachingThreshold = required switch
        {
            PerformanceTypes.High => 80,
            PerformanceTypes.Good => 60,
            PerformanceTypes.Adequate => 50,
            _ => 0
        };

        return teachingScore >= requiredTeachingThreshold;
    }

    private static bool MatchesPerformanceByNumericTeaching(List<string> acceptableCriteria, double teachingScore, double publicationScore, double serviceScore)
    {
        // Fallback: if any acceptable pattern exists with publication/service criteria met and teaching numeric score is sufficiently high, accept.
        if (acceptableCriteria == null || acceptableCriteria.Count == 0)
            return true;

        foreach (var criteria in acceptableCriteria)
        {
            var parts = criteria.Split(',').Select(p => p.Trim()).ToList();
            if (parts.Count != 3) continue;

            var publicationRequired = parts[1];
            var serviceRequired = parts[2];
            if (!IsPerformanceLevelSatisfied(publicationScore, publicationRequired, PerformanceTypes.Good)) continue;
            if (!IsPerformanceLevelSatisfied(serviceScore, serviceRequired, PerformanceTypes.Good)) continue;

            // teaching numeric threshold min: 60 to be considered acceptable as numeric
            if (teachingScore >= 60)
                return true;
        }

        return false;
    }

    private static bool IsPerformanceLevelSatisfied(double value, string level, string minimumLevel)
    {
        var valueLevel = value switch
        {
            >= 80 => PerformanceTypes.High,
            >= 60 => PerformanceTypes.Good,
            >= 50 => PerformanceTypes.Adequate,
            >= 0  => PerformanceTypes.InAdequate,
            _ => PerformanceTypes.InAdequate
        };

        var performanceLevels = new Dictionary<string, int>
        {
            { PerformanceTypes.InAdequate, 1 },
            { PerformanceTypes.Adequate, 2 },
            { PerformanceTypes.Good, 3 },
            { PerformanceTypes.High, 4 }
        };

        var valueRank = performanceLevels.GetValueOrDefault(valueLevel, 0);
        var requiredRank = performanceLevels.GetValueOrDefault(level, 0);

        return valueRank >= requiredRank;
    }

    private string FormatCriteria(string criteria)
    {
        var parts = criteria.Split(',');
        if (parts.Length != 3) return criteria;
        return $"({parts[0]} Teaching, {parts[1]} Publications, {parts[2]} Service)";
    }

    private string BuildPerformanceCriteriaDescription(List<string> criteria)
    {
        if (criteria == null || !criteria.Any())
            return "No specific performance criteria defined";

        var descriptions = criteria.Select(c =>
        {
            var parts = c.Split(',');
            if (parts.Length != 3) return c;
            return $"({parts[0]} Teaching, {parts[1]} Publications, {parts[2]} Service)";
        });

        return $"One of the following combinations: {string.Join(" OR ", descriptions)}";
    }

    private void AddPerformanceInsights(string performance, string category, List<string> strengths, List<string> improvements)
    {
        switch (performance)
        {
            case PerformanceTypes.High:
                strengths.Add($"Excellent {category} performance (High)");
                break;
            case PerformanceTypes.Good:
                strengths.Add($"Strong {category} performance (Good)");
                break;
            case PerformanceTypes.Adequate:
                // Neither strength nor weakness - meets minimum
                break;
            case PerformanceTypes.InAdequate:
                improvements.Add($"{category} performance is below acceptable level (Inadequate)");
                break;
        }
    }

    private string BuildImprovementSummary(bool yearsOk, bool pubsOk, bool journalsOk, bool perfOk)
    {
        var issues = new List<string>();
        if (!yearsOk) issues.Add("insufficient time in current position");
        if (!pubsOk) issues.Add("publication count below minimum");
        if (!journalsOk) issues.Add("refereed journal count below minimum");
        if (!perfOk) issues.Add("performance combination does not meet criteria");

        return $"Application cannot be approved due to: {string.Join(", ", issues)}. Consider returning for the applicant to address these gaps.";
    }
}
