using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.NonAcademicPromotion.Sdk.Services;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.NonAcademic.Api.Extensions;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

public class ApplicationService : IApplicationService
{
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> _applicationRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicAssessmentActivity> _activityRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> _positionRepository;
    private readonly INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> _performanceRepository;
    private readonly INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> _knowledgeRepository;
    private readonly INonAcademicPromotionPgRepository<NonAcademicServiceRecord> _serviceRepository;
    private readonly ILogger<ApplicationService> _logger;
    private readonly IStorageService _storageService;

    public ApplicationService(
        ILogger<ApplicationService> logger,
        IIdentityPgRepository<Staff> staffRepository,
        INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> applicationRepository,
        INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> positionRepository,
        INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> performanceRepository,
        INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> knowledgeRepository,
        INonAcademicPromotionPgRepository<NonAcademicServiceRecord> serviceRepository,
        INonAcademicPromotionPgRepository<NonAcademicAssessmentActivity> activityRepository,
        IStorageService storageService)
    {
        _logger = logger;
        _staffRepository = staffRepository;
        _applicationRepository = applicationRepository;
        _positionRepository = positionRepository;
        _performanceRepository = performanceRepository;
        _knowledgeRepository = knowledgeRepository;
        _serviceRepository = serviceRepository;
        _activityRepository = activityRepository;
        _storageService = storageService;
    }

    public async Task<IApiResponse<EligibilityResponse>> GetPromotionPositionEligibilityStatus(AuthData auth)
    {
        try
        {
            _logger.LogInformation("[GetPromotionPositionEligibilityStatus] By:{Auth}", auth.Serialize());

            var activeAppRes = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            var staff = await _staffRepository.GetByIdAsync(auth.Id);
            if (staff == null)
                return new ApiResponse<EligibilityResponse>("You are not authorized to access this platform", 400);

            ApplicationMetaData? activeApplication = null;
            if (activeAppRes != null)
                activeApplication = new ApplicationMetaData
                {
                    ApplicationId = activeAppRes.Id,
                    ApplicationStatus = activeAppRes.ApplicationStatus,
                    ApplicationStartDate = activeAppRes.CreatedAt,
                    ApplicationReviewStatus = activeAppRes.ReviewStatus!,
                    PerformanceCriteria = activeAppRes.PerformanceCriteria
                };

            var positionRes = await _positionRepository.GetOneAsync(p =>
               !string.IsNullOrEmpty(p.PreviousPosition)&&
                p.PreviousPosition.ToLower() == staff.Position.ToLower());
            if (positionRes == null)
            {
                // Distinguish: if ANY position has PreviousPosition configured, staff is at the top.
                // If NONE do, the positions haven't been set up with a pathway yet.
                var anyPathwayConfigured = await _positionRepository.GetOneAsync(p =>
                    !string.IsNullOrEmpty(p.PreviousPosition) && p.PreviousPosition != string.Empty);
                var noNextMessage = anyPathwayConfigured != null
                    ? "You have reached the highest position on this platform"
                    : "Promotion positions have not been configured with a promotion pathway. Please contact your administrator to set up the promotion track in the admin portal.";
                return new EligibilityResponse().ToOkApiResponse(noNextMessage);
            }

            var nextPosition = positionRes.Name;

            var timeInCurrentPosition = DateTime.UtcNow - staff.LastAppointmentOrPromotionDate;
            var yearsInCurrentPosition = Math.Round(timeInCurrentPosition.TotalDays / 365.25, 2);
            var minimumYears = (double)positionRes.MinimumNumberOfYearsFromLastPromotion;
            var remainingYears = Math.Max(0, minimumYears - yearsInCurrentPosition);

            return new EligibilityResponse
            {
                ApplicantName = $"{staff.FirstName} {staff.LastName}",
                ApplicantCurrentPosition = staff.Position,
                ApplicantNextPosition = nextPosition,
                TotalNumberOfYearsInCurrentPosition = yearsInCurrentPosition,
                TotalNumberOfYearsRequiredInNextPosition = minimumYears,
                RemainingNumberOfYearsRequiredInNextPosition = Math.Round(remainingYears, 2),
                EstimatedEligibilityDate = remainingYears > 0 ? DateTime.UtcNow.AddDays(remainingYears * 365.25) : null,
                IsEligibleToApplyForNextPosition = remainingYears <= 0,
                ActiveApplication = activeApplication,
                ApplicationRequirment = new NonAcademicPositionRequirement
                {
                    Id = positionRes.Id,
                    Name = positionRes.Name,
                    MinimumNumberOfYearsFromLastPromotion = positionRes.MinimumNumberOfYearsFromLastPromotion,
                    MinimumNumberOfKnowledgeMaterials = positionRes.MinimumNumberOfKnowledgeMaterials,
                    MinimumNumberOfJournals = positionRes.MinimumNumberOfJournals,
                    PreviousPosition = positionRes.PreviousPosition,
                    PerformanceCriteria = positionRes.PerformanceCriteria
                }
            }.ToOkApiResponse("Eligibility status retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetPromotionPositionEligibilityStatus] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<EligibilityResponse>("Failed to get promotion eligibility", 500);
        }
    }

public async Task<IApiResponse<EligibilityForecastResponse>> GetEligibilityForecast(AuthData auth)
{
    try
    {
        var staff = await _staffRepository.GetByIdAsync(auth.Id);
        if (staff == null)
            return new ApiResponse<EligibilityForecastResponse>("Staff not found", 404);

        var activeApp = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

        KnowledgeProfessionRecord? knowledgeRecord = null;
        if (activeApp != null)
            knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.PromotionApplicationId == activeApp.Id);

        var journalCount   = knowledgeRecord?.Materials.Count(m => m.MaterialTypeId.Equals("Journal", StringComparison.OrdinalIgnoreCase)) ?? 0;
        var totalMaterials = knowledgeRecord?.Materials.Count ?? 0;
        var yearsInCurrent = (DateTime.UtcNow - staff.LastAppointmentOrPromotionDate).TotalDays / 365.25;

        // Single fetch — walk the chain in memory instead of one query per level
        var allPositions = await _positionRepository.GetAllAsync(p =>
            !string.IsNullOrEmpty(p.PreviousPosition)&& 
            !p.Name.ToLower().Equals(p.PreviousPosition.ToLower()));

        var lookup = allPositions.ToDictionary(
            p =>  p.PreviousPosition!.ToLowerInvariant(),
            StringComparer.OrdinalIgnoreCase);

        var milestones       = new List<NonAcademicPromotionMilestone>();
        var currentPosition  = staff.Position;
        var previousPosition = staff.Position;

        while (milestones.Count < 10 && lookup.TryGetValue(currentPosition.ToLowerInvariant(), out var pos))
        {
            var isFirst   = milestones.Count == 0;
            var years     = isFirst ? (int)Math.Floor(yearsInCurrent) : 0;
            var remaining = Math.Max(0, pos.MinimumNumberOfYearsFromLastPromotion - years);

            milestones.Add(new NonAcademicPromotionMilestone
            {
                MilestoneOrder             = milestones.Count + 1,
                TargetPosition             = pos.Name,
                PreviousPosition           = previousPosition,
                MinimumYearsRequired       = pos.MinimumNumberOfYearsFromLastPromotion,
                CurrentYearsInRank         = years,
                RemainingYearsRequired     = remaining,
                EstimatedEligibilityDate   = remaining > 0 ? DateTime.UtcNow.AddDays(remaining * 365.25) : DateTime.UtcNow,
                IsEligible                 = isFirst && remaining <= 0,
                IsLocked                   = !isFirst,
                PerformanceCriteriaOptions = pos.PerformanceCriteria,
                MinimumKnowledgeMaterials  = pos.MinimumNumberOfKnowledgeMaterials,
                CurrentKnowledgeMaterials  = isFirst ? totalMaterials : 0,
                KnowledgeMaterialsGap      = isFirst ? Math.Max(0, pos.MinimumNumberOfKnowledgeMaterials - totalMaterials) : pos.MinimumNumberOfKnowledgeMaterials,
                MinimumJournals            = pos.MinimumNumberOfJournals,
                CurrentJournals            = isFirst ? journalCount : 0,
                JournalsGap                = isFirst ? Math.Max(0, pos.MinimumNumberOfJournals - journalCount) : pos.MinimumNumberOfJournals
            });

            previousPosition = pos.Name;
            currentPosition  = pos.Name;
        }

        return new EligibilityForecastResponse
        {
            ApplicantName         = $"{staff.FirstName} {staff.LastName}",
            CurrentPosition       = staff.Position,
            LastPromotionDate     = staff.LastAppointmentOrPromotionDate,
            Milestones            = milestones,
            NextEligibleMilestone = milestones.FirstOrDefault(m => !m.IsLocked && m.IsEligible)
        }.ToOkApiResponse("Eligibility forecast retrieved successfully");
    }
    catch (Exception e)
    {
        _logger.LogError(e, "[GetEligibilityForecast] Failed. By:{Auth}", auth.Serialize());
        return new ApiResponse<EligibilityForecastResponse>("Failed to get eligibility forecast", 500);
    }
}

    public async Task<IApiResponse<ApplicationCategoryStateResponse>> ApplicationCategoryState(AuthData auth, string? id = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.Id == id && a.ApplicantId == auth.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApplicationCategoryStateResponse().ToOkApiResponse("Successfully retrieved application category state");

            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            return new ApplicationCategoryStateResponse
            {
                PerformanceAtWorkCategoryStatus = performanceRecord?.Status ?? string.Empty,
                KnowledgeProfessionCategoryStatus = knowledgeRecord?.Status ?? string.Empty,
                ServiceCategoryStatus = serviceRecord?.Status ?? string.Empty,
                NumberOfRecordsForPerformanceAtWork = performanceRecord?.TotalCategoriesAssessed ?? 0,
                NumberOfRecordsForKnowledgeProfession = knowledgeRecord?.Materials.Count ?? 0,
                NumberOfRecordsForService = (serviceRecord?.ServiceToTheUniversity.Count ?? 0) + (serviceRecord?.ServiceToNationalAndInternational.Count ?? 0),
                PerformanceAtWorkPerformance = performanceRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                KnowledgeProfessionPerformance = knowledgeRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                ServicePerformance = serviceRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                PerformanceAtWorkCategoryId = performanceRecord?.Id ?? string.Empty,
                KnowledgeProfessionCategoryId = knowledgeRecord?.Id ?? string.Empty,
                ServiceCategoryId = serviceRecord?.Id ?? string.Empty,
                ApplicationId = application.Id,
                ApplicationStatus = application.ApplicationStatus,
                ReviewStatus = application.ReviewStatus ?? string.Empty,
                CurriculumVitaeUrl = string.IsNullOrWhiteSpace(application.CurriculumVitaeFile)
                    ? string.Empty
                    : _storageService.GetFileUrl(application.CurriculumVitaeFile!),
                CurriculumVitaeFileName = application.CurriculumVitaeFile ?? string.Empty,
                CurriculumVitaeUploadedAt = application.CurriculumVitaeUploadedAt,
                ApplicationLetterUrl = string.IsNullOrWhiteSpace(application.ApplicationLetterFile)
                    ? string.Empty
                    : _storageService.GetFileUrl(application.ApplicationLetterFile!),
                ApplicationLetterFileName = application.ApplicationLetterFile ?? string.Empty,
                ApplicationLetterUploadedAt = application.ApplicationLetterUploadedAt
            }.ToOkApiResponse("Application category state retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ApplicationCategoryState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<ApplicationCategoryStateResponse>("Failed to get application category state", 500);
        }
    }

    public async Task<NonAcademicPromotionApplication> CreateNonAcademicPromotionApplication(string applicantId)
    {
        var staff = await _staffRepository.GetOneAsync(s => s.Id == applicantId);
        if (staff == null) return new NonAcademicPromotionApplication();

        var positionRes = await _positionRepository.GetOneAsync(p =>
            p.PreviousPosition != null &&
            p.PreviousPosition.ToLower() == staff.Position.ToLower());
        var nextPosition = positionRes?.Name ?? string.Empty;
        if (string.IsNullOrEmpty(nextPosition))
            throw new InvalidOperationException("You have reached the highest position and cannot start a new application");

        var application = new NonAcademicPromotionApplication
        {
            CreatedBy = staff.Email,
            PromotionPositionId = positionRes?.Id ?? string.Empty,
            PromotionPosition = positionRes?.Name ?? string.Empty,
            ApplicantId = staff.Id,
            ApplicantName = $"{staff.FirstName} {staff.LastName}",
            ApplicantEmail = staff.Email,
            ApplicantCurrentPosition = staff.Position,
            ApplicantUnitId = staff.DepartmentId, // DepartmentId holds unit for non-academic staff
            ApplicantUnitName = staff.DepartmentId,
            IsActive = true
        };

        await _applicationRepository.AddAsync(application);
        _logger.LogInformation("[CreateNonAcademicPromotionApplication] Created application for {StaffId}", applicantId);
        return application;
    }

    public async Task<IApiResponse<OverallOverview>> ActiveApplicationOverallReview(AuthData auth, string? id = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.Id == id && a.ApplicantId == auth.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApiResponse<OverallOverview>("No active application found", 400);

            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            return new OverallOverview
            {
                PerformanceAtWork = performanceRecord == null ? null : new PerformanceAtWorkOverview
                {
                    Performance = performanceRecord.ApplicantPerformance,
                    AverageScore = PerformanceAtWorkService.CalculateAverage(performanceRecord),
                    TotalCategoriesAssessed = performanceRecord.TotalCategoriesAssessed
                },
                KnowledgeProfession = knowledgeRecord == null ? null : new KnowledgeProfessionOverview
                {
                    Performance = knowledgeRecord.ApplicantPerformance,
                    TotalMaterialsAdded = knowledgeRecord.Materials.Count,
                    TotalApplicantScore = knowledgeRecord.Materials.Sum(m => m.ApplicantScore ?? 0),
                    TotalSystemGeneratedScore = KnowledgeProfessionService.CalculateTotalScore(knowledgeRecord)
                },
                Service = serviceRecord == null ? null : new ServiceOverview
                {
                    Performance = serviceRecord.ApplicantPerformance,
                    TotalRecords = serviceRecord.ServiceToTheUniversity.Count + serviceRecord.ServiceToNationalAndInternational.Count,
                    UniversityCommunityScore = serviceRecord.ServiceToTheUniversity.Sum(x => x.ApplicantScore ?? 0),
                    NationalInternationalScore = serviceRecord.ServiceToNationalAndInternational.Sum(x => x.ApplicantScore ?? 0)
                }
            }.ToOkApiResponse("Overall review retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ActiveApplicationOverallReview] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<OverallOverview>("Failed to get overall review", 500);
        }
    }

    public async Task<IApiResponse<SubmittedApplicationResponse>> SubmittedApplicationPreview(AuthData auth, string? id = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id == a.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApiResponse<SubmittedApplicationResponse>("No active application found", 400);

            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            var workCategories = performanceRecord == null ? new List<PerformanceAtWorkApplicationData>() : MapWorkCategories(performanceRecord);

            return new SubmittedApplicationResponse
            {
                PerformanceAtWorkApplication = performanceRecord == null ? null : new PerformanceAtWorkApplicationResponse
                {
                    TotalNumberOfCategoriesAssessed = workCategories.Count,
                    Categories = workCategories
                },
                KnowledgeProfessionApplication = knowledgeRecord == null ? null : new KnowledgeProfessionApplicationResponse
                {
                    TotalNumberOfMaterialsRecorded = knowledgeRecord.Materials.Count,
                    Materials = knowledgeRecord.Materials.Select(m => new KnowledgeProfessionApplicationData
                    {
                        Title = m.Title,
                        Year = m.Year,
                        MaterialCategory = m.MaterialTypeName,
                        Remark = m.ApplicantRemarks,
                        Score = m.ApplicantScore ?? 0,
                        SystemScore = m.SystemGeneratedScore
                    }).ToList()
                },
                ServiceApplication = serviceRecord == null ? null : new ServiceApplicationResponse
                {
                    TotalNumberOfServicesRecorded = serviceRecord.ServiceToTheUniversity.Count + serviceRecord.ServiceToNationalAndInternational.Count,
                    ServiceToUniversityApplicationData = serviceRecord.ServiceToTheUniversity.Select(s => new ServiceApplicationData { Title = s.ServiceTitle, Remark = s.ApplicantRemarks, Score = s.ApplicantScore ?? 0 }).ToList(),
                    ServiceToNationalInternationApplicationData = serviceRecord.ServiceToNationalAndInternational.Select(s => new ServiceApplicationData { Title = s.ServiceTitle, Remark = s.ApplicantRemarks, Score = s.ApplicantScore ?? 0 }).ToList()
                }
            }.ToOkApiResponse("Submitted application preview retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[SubmittedApplicationPreview] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<SubmittedApplicationResponse>("Failed to get submitted application preview", 500);
        }
    }

    public async Task<IApiResponse<bool>> SubmitApplication(AuthData auth)
    {
        try
        {
            var application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            if (application == null)
                return false.ToBadRequestApiResponse("No active application found");

            if (application.ApplicationStatus != ApplicationStatusTypes.Draft &&
                application.ApplicationStatus != ApplicationStatusTypes.Returned)
                return false.ToBadRequestApiResponse("Application has already been submitted");

            // Required documents must be uploaded before final submission
            if (string.IsNullOrWhiteSpace(application.CurriculumVitaeFile))
                return false.ToBadRequestApiResponse("Please upload your Curriculum Vitae before submitting");

            if (string.IsNullOrWhiteSpace(application.ApplicationLetterFile))
                return false.ToBadRequestApiResponse("Please upload your application letter before submitting");

            var isResubmission = application.ApplicationStatus == ApplicationStatusTypes.Returned;

            application.ApplicationStatus = ApplicationStatusTypes.Submitted;
            application.ReviewStatus = NonAcademicApplicationReviewStatuses.HouReview;
            application.ReviewStatusHistory = isResubmission
                ? $"{application.ReviewStatusHistory},{NonAcademicApplicationReviewStatuses.HouReview}"
                : NonAcademicApplicationReviewStatuses.HouReview;
            application.SubmissionDate = DateTime.UtcNow;
            application.UpdatedAt = DateTime.UtcNow;
            application.UpdatedBy = $"{auth.FirstName} {auth.LastName}";

            await _applicationRepository.UpdateAsync(application);

            _logger.LogInformation("[SubmitApplication] Application {AppId} submitted by {StaffId}", application.Id, auth.Id);

            return true.ToOkApiResponse(isResubmission ? "Application resubmitted successfully" : "Application submitted successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[SubmitApplication] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<bool>("Failed to submit application", 500);
        }
    }

    public async Task<IApiResponse<List<PromotionHistoryResponse>>> GetPromotionHistory(AuthData auth)
    {
        try
        {
            var applications = await _applicationRepository.GetAllAsync(a => a.ApplicantId == auth.Id);
            var history = new List<PromotionHistoryResponse>();

            if (applications.Any())
            {
                var appIds = applications.Select(a => a.Id).ToList();
                var perfLookup = (await _performanceRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);
                var knowLookup = (await _knowledgeRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);
                var svcLookup = (await _serviceRepository.GetAllAsync(r => appIds.Contains(r.PromotionApplicationId))).ToDictionary(r => r.PromotionApplicationId);

                foreach (var app in applications.OrderByDescending(a => a.CreatedAt))
                {
                    perfLookup.TryGetValue(app.Id, out var performanceRecord);
                    knowLookup.TryGetValue(app.Id, out var knowledgeRecord);
                    svcLookup.TryGetValue(app.Id, out var serviceRecord);

                    history.Add(new PromotionHistoryResponse
                {
                    Id = app.Id,
                    PromotionPosition = app.PromotionPosition,
                    ApplicantCurrentPosition = app.ApplicantCurrentPosition,
                    ApplicationStatus = app.ApplicationStatus,
                    ReviewStatus = app.ReviewStatus ?? string.Empty,
                    CreatedAt = app.CreatedAt,
                    SubmissionDate = app.SubmissionDate,
                    IsActive = app.IsActive,
                    Performance = new NonAcademicApplicationPerformance
                    {
                        PerformanceAtWork = performanceRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        KnowledgeProfession = knowledgeRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                        Service = serviceRecord?.ApplicantPerformance ?? PerformanceTypes.InAdequate
                    }
                });
                }
            }

            return history.ToOkApiResponse("Promotion history retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetPromotionHistory] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<List<PromotionHistoryResponse>>("Failed to get promotion history", 500);
        }
    }

    public async Task<IApiResponse<PromotionLetterResponse>> GetPromotionLetter(AuthData auth, string? applicationId = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(applicationId))
                application = await _applicationRepository.GetOneAsync(a => a.Id == applicationId && a.ApplicantId == auth.Id);
            else
                application = await _applicationRepository.GetOneAsync(a =>
                    a.ApplicantId == auth.Id && a.ApplicationStatus == ApplicationStatusTypes.Approved);

            if (application == null)
                return new ApiResponse<PromotionLetterResponse>("No approved application found", 404);

            // Start staff lookup (IdentityDbContext) in parallel while NonAcademic queries run sequentially.
            var staffTask = _staffRepository.GetByIdAsync(auth.Id);
            var performanceRecord = await _performanceRepository.GetOneAsync(r => r.PromotionApplicationId == application.Id);
            var knowledgeRecord = await _knowledgeRepository.GetOneAsync(r => r.PromotionApplicationId == application.Id);
            var serviceRecord = await _serviceRepository.GetOneAsync(r => r.PromotionApplicationId == application.Id);
            var staff = await staffTask;

            // Use UAPC performance as the final performance, falling back through committee chain
            var performanceAtWorkPerformance = GetFinalPerformance(
                performanceRecord?.UapcPerformance, performanceRecord?.AapscPerformance,
                performanceRecord?.HouPerformance, performanceRecord?.ApplicantPerformance);
            var knowledgeProfessionPerformance = GetFinalPerformance(
                knowledgeRecord?.UapcPerformance, knowledgeRecord?.AapscPerformance,
                knowledgeRecord?.HouPerformance, knowledgeRecord?.ApplicantPerformance);
            var servicePerformance = GetFinalPerformance(
                serviceRecord?.UapcPerformance, serviceRecord?.AapscPerformance,
                serviceRecord?.HouPerformance, serviceRecord?.ApplicantPerformance);

            return new PromotionLetterResponse
            {
                ApplicationId = application.Id,
                StaffName = application.ApplicantName,
                StaffId = application.ApplicantId,
                CurrentPosition = application.ApplicantCurrentPosition,
                NextPosition = application.PromotionPosition,
                UnitName = application.ApplicantUnitName,
                LetterDate = DateTime.UtcNow.ToString("MMMM dd, yyyy"),
                PerformanceAtWorkPerformance = performanceAtWorkPerformance,
                KnowledgeProfessionPerformance = knowledgeProfessionPerformance,
                ServicePerformance = servicePerformance,
                ApplicationSubmissionDate = application.SubmissionDate?.ToString("MMMM dd, yyyy") ?? string.Empty,
                ApplicationStatus = application.ApplicationStatus,
                ReviewStatus = application.ReviewStatus ?? string.Empty
            }.ToOkApiResponse("Promotion letter retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetPromotionLetter] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<PromotionLetterResponse>("Failed to get promotion letter", 500);
        }
    }

    private static List<PerformanceAtWorkApplicationData> MapWorkCategories(PerformanceAtWorkRecord record)
    {
        var result = new List<PerformanceAtWorkApplicationData>();
        void Add(string cat, PerformanceWorkData? d) { if (d != null) result.Add(new PerformanceAtWorkApplicationData { Category = cat, Remark = d.ApplicantRemarks, Score = d.ApplicantScore ?? 0 }); }
        Add("Accuracy On Schedule", record.AccuracyOnSchedule);
        Add("Quality Of Work", record.QualityOfWork);
        Add("Punctuality And Regularity", record.PunctualityAndRegularity);
        Add("Knowledge Of Procedures", record.KnowledgeOfProcedures);
        Add("Ability To Work On Own", record.AbilityToWorkOnOwn);
        Add("Ability To Work Under Pressure", record.AbilityToWorkUnderPressure);
        Add("Additional Responsibility", record.AdditionalResponsibility);
        Add("Human Relations", record.HumanRelations);
        Add("Initiative And Foresight", record.InitiativeAndForesight);
        Add("Ability To Inspire And Motivate", record.AbilityToInspireAndMotivate);
        return result;
    }

    private string GetFinalPerformance(params string?[] performances)
    {
        foreach (var perf in performances)
        {
            if (!string.IsNullOrEmpty(perf) && perf != PerformanceTypes.InAdequate)
                return perf;
        }
        return PerformanceTypes.Adequate;
    }

    // ────────────────────────────────────────────────────────────────────────
    // Application Documents (CV & Application Letter)
    // ────────────────────────────────────────────────────────────────────────
    private static readonly string[] AllowedDocumentExtensions = [".pdf", ".doc", ".docx"];
    private const long MaxDocumentSizeBytes = 15 * 1024 * 1024; // 15 MB

    private static bool IsValidDocument(IFormFile file, out string error)
    {
        error = string.Empty;
        if (file.Length <= 0)
        {
            error = "Uploaded file is empty";
            return false;
        }
        if (file.Length > MaxDocumentSizeBytes)
        {
            error = "File exceeds the 15 MB size limit";
            return false;
        }
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedDocumentExtensions.Contains(ext))
        {
            error = "Only PDF or Word documents are allowed";
            return false;
        }
        return true;
    }

    private ApplicationDocumentsResponse BuildDocumentsResponse(NonAcademicPromotionApplication application) => new()
    {
        ApplicationId = application.Id,
        CurriculumVitaeFileName = application.CurriculumVitaeFile ?? string.Empty,
        CurriculumVitaeUrl = string.IsNullOrWhiteSpace(application.CurriculumVitaeFile)
            ? string.Empty
            : _storageService.GetFileUrl(application.CurriculumVitaeFile!),
        CurriculumVitaeUploadedAt = application.CurriculumVitaeUploadedAt,
        ApplicationLetterFileName = application.ApplicationLetterFile ?? string.Empty,
        ApplicationLetterUrl = string.IsNullOrWhiteSpace(application.ApplicationLetterFile)
            ? string.Empty
            : _storageService.GetFileUrl(application.ApplicationLetterFile!),
        ApplicationLetterUploadedAt = application.ApplicationLetterUploadedAt
    };

    public async Task<IApiResponse<ApplicationDocumentsResponse>> GetApplicationDocuments(AuthData auth)
    {
        try
        {
            var application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            if (application == null)
                return new ApiResponse<ApplicationDocumentsResponse>("No active application found", 400);

            return BuildDocumentsResponse(application).ToOkApiResponse("Application documents retrieved");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetApplicationDocuments] Failed for {ApplicantId}", auth.Id);
            return new ApiResponse<ApplicationDocumentsResponse>("Failed to retrieve application documents", 500);
        }
    }

    public async Task<IApiResponse<ApplicationDocumentsResponse>> UploadApplicationDocuments(AuthData auth, UploadApplicationDocumentsRequest request)
    {
        try
        {
            if (request.CurriculumVitae == null && request.ApplicationLetter == null)
                return new ApiResponse<ApplicationDocumentsResponse>("Please attach a Curriculum Vitae or Application Letter file", 400);

            var application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            if (application == null)
                return new ApiResponse<ApplicationDocumentsResponse>("No active application found", 400);

            if (application.ApplicationStatus != ApplicationStatusTypes.Draft &&
                application.ApplicationStatus != ApplicationStatusTypes.Returned)
                return new ApiResponse<ApplicationDocumentsResponse>(
                    "Documents can only be updated while the application is in Draft or Returned status", 400);

            if (request.CurriculumVitae != null)
            {
                if (!IsValidDocument(request.CurriculumVitae, out var cvError))
                    return new ApiResponse<ApplicationDocumentsResponse>($"Curriculum Vitae: {cvError}", 400);

                var cvName = $"cv-{application.Id}-{Guid.NewGuid():N}{Path.GetExtension(request.CurriculumVitae.FileName)}";
                var savedCv = await _storageService.UploadFileAsync(request.CurriculumVitae, cvName);
                if (string.IsNullOrWhiteSpace(savedCv))
                    return new ApiResponse<ApplicationDocumentsResponse>("Failed to upload Curriculum Vitae", 500);

                application.CurriculumVitaeFile = savedCv;
                application.CurriculumVitaeUploadedAt = DateTime.UtcNow;
            }

            if (request.ApplicationLetter != null)
            {
                if (!IsValidDocument(request.ApplicationLetter, out var letterError))
                    return new ApiResponse<ApplicationDocumentsResponse>($"Application Letter: {letterError}", 400);

                var letterName = $"letter-{application.Id}-{Guid.NewGuid():N}{Path.GetExtension(request.ApplicationLetter.FileName)}";
                var savedLetter = await _storageService.UploadFileAsync(request.ApplicationLetter, letterName);
                if (string.IsNullOrWhiteSpace(savedLetter))
                    return new ApiResponse<ApplicationDocumentsResponse>("Failed to upload Application Letter", 500);

                application.ApplicationLetterFile = savedLetter;
                application.ApplicationLetterUploadedAt = DateTime.UtcNow;
            }

            application.UpdatedAt = DateTime.UtcNow;
            application.UpdatedBy = $"{auth.FirstName} {auth.LastName}";
            await _applicationRepository.UpdateAsync(application);

            return BuildDocumentsResponse(application).ToOkApiResponse("Application documents updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UploadApplicationDocuments] Failed for {ApplicantId}", auth.Id);
            return new ApiResponse<ApplicationDocumentsResponse>("Failed to upload application documents", 500);
        }
    }

}

/// <summary>
/// Non-academic application review status constants — mirrors NonAcademicPromotionState enum.
/// </summary>
public static class NonAcademicApplicationReviewStatuses
{
    public const string Draft = "Draft";
    public const string HouReview = "HOU Review";
    public const string AapscReview = "AAPSC Review";
    public const string UapcDecision = "UAPC Decision";
    public const string CouncilApproved = "Council Approved";
    public const string Rejected = "Rejected";
    public const string Returned = "Returned";
    public const string ReturnedForUpdate = "Returned For Update";
    public const string Closed = "Closed";
}
