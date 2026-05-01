
using Akka.Actor;
using Mapster;
using Umat.Osass.AcademicPromotion.Sdk;
using Umat.Osass.AcademicPromotion.Sdk.Services;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Services;
using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Actors.Messages;
using Umat.Osass.Promotion.Academic.Api.Extensions;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

public class ApplicationService : IApplicationService
{
    private readonly IAcademicPromotionPgRepository<AcademicPromotionApplication> _applicationRepository;
    private readonly IAcademicPromotionPgRepository<AssessmentActivity> _activityRepository;
    private readonly IIdentityPgRepository<Department> _departmentRepository;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly ILogger<ApplicationService> _logger;
    private readonly IAcademicPromotionPgRepository<AcademicPromotionPosition> _positionRepository;
    private readonly IAcademicPromotionPgRepository<Publication> _publicationRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;
    private readonly IAcademicPromotionPgRepository<ServiceRecord> _serviceRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly IAcademicPromotionPgRepository<TeachingRecord> _teachingRepository;
    private readonly ActorSystem _actorSystem;
    private readonly IStorageService _storageService;


    public ApplicationService(ILogger<ApplicationService> logger, IIdentityPgRepository<Staff> staffRepository,
        IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository,
        IAcademicPromotionPgRepository<Publication> publicationRepository,
        IAcademicPromotionPgRepository<ServiceRecord> serviceRepository,
        IAcademicPromotionPgRepository<TeachingRecord> teachingRepository,
        IAcademicPromotionPgRepository<AcademicPromotionPosition> positionRepository,
        IIdentityPgRepository<Department> departmentRepository, IIdentityPgRepository<Faculty> facultyRepository,
        IIdentityPgRepository<School> schoolRepository,
        IAcademicPromotionPgRepository<AssessmentActivity> activityRepository,
        ActorSystem actorSystem,
        IStorageService storageService)
    {
        _logger = logger;
        _staffRepository = staffRepository;
        _applicationRepository = applicationRepository;
        _publicationRepository = publicationRepository;
        _serviceRepository = serviceRepository;
        _teachingRepository = teachingRepository;
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
        _activityRepository = activityRepository;
        _actorSystem = actorSystem;
        _storageService = storageService;
    }


    public async Task<IApiResponse<EligibilityResponse>> GetPromotionPositionEligibilityStatus(AuthData auth)
    {
        try
        {
            _logger.LogInformation(
                "[GetPromotionPositionEligibilityStatus] Getting promotion position eligibility status with rawRequest:{Auth}",
                auth.Serialize());

            var activeApplicationRes =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            ApplicationMetaData? activeApplication = null;

            if (activeApplicationRes != null)
                activeApplication = new ApplicationMetaData
                {
                    ApplicationId = activeApplicationRes.Id,
                    ApplicationStatus = activeApplicationRes.ApplicationStatus,
                    ApplicationStartDate = activeApplicationRes.CreatedAt,
                    ApplicationReviewStatus = activeApplicationRes.ReviewStatus!,
                    PerformanceCriteria = activeApplicationRes.PerformanceCriteria

                };

            var staffRes = await _staffRepository.GetByIdAsync(auth.Id);
            if (staffRes == null)
                return new ApiResponse<EligibilityResponse>("Sorry you're not authorized to access this platform", 400);

            var nextPosition = PromotionApplicationService.GetNextPosition(staffRes.Position);
            if (nextPosition == null)
                return new EligibilityResponse
                {
                    ApplicantName = staffRes.FirstName + " " + staffRes.LastName,
                    ApplicantCurrentPosition = staffRes.Position,
                    ActiveApplication = activeApplication
                }.ToOkApiResponse(PromotionApplicationService.IneligibilityMessage(staffRes.Position));

            var positionRes = await _positionRepository.GetOneAsync(p => p.Name.ToLower() == nextPosition.ToLower());
            if (positionRes == null)
                return new EligibilityResponse
                {
                    ApplicantName = staffRes.FirstName + " " + staffRes.LastName,
                    ApplicantCurrentPosition = staffRes.Position,
                    ActiveApplication = activeApplication
                }.ToOkApiResponse(
                    "Promotion positions have not been configured for your next rank. Please contact your administrator.");

            var timeInCurrentPosition = DateTime.UtcNow - staffRes.LastAppointmentOrPromotionDate;
            var yearsInCurrentPosition = Math.Round(timeInCurrentPosition.TotalDays / 365.25, 2);
            var minimumYearsRequiredForNextPosition = (double)positionRes.MinimumNumberOfYearsFromLastPromotion;
            var remainingYears = Math.Max(0, minimumYearsRequiredForNextPosition - yearsInCurrentPosition);
            
            var response = new EligibilityResponse
            {
                ApplicantName = staffRes.FirstName + " " + staffRes.LastName,
                ApplicantCurrentPosition = staffRes.Position,
                ApplicantNextPosition = nextPosition,
                TotalNumberOfYearsInCurrentPosition = yearsInCurrentPosition,
                TotalNumberOfYearsRequiredInNextPosition = minimumYearsRequiredForNextPosition,
                RemainingNumberOfYearsRequiredInNextPosition = Math.Round(remainingYears, 2),
                EstimatedEligibilityDate = DateTime.UtcNow.AddDays(remainingYears * 365.25),
                IsEligibleToApplyForNextPosition = remainingYears <= 0,
                ActiveApplication = activeApplication,
                ApplicationRequirment = new PositionRequirement()
                {
                    Id = positionRes.Id,
                    Name = positionRes.Name,
                    MinimumNumberOfYearsFromLastPromotion = positionRes.MinimumNumberOfYearsFromLastPromotion,
                    MinimumNumberOfPublications = positionRes.MinimumNumberOfPublications,
                    MinimumNumberOfRefereedJournal = positionRes.MinimumNumberOfRefereedJournal,
                    PreviousPosition = positionRes.PreviousPosition,
                    PerformanceCriteria = positionRes.PerformanceCriteria   
                }
            
               
            };

            return response.ToOkApiResponse("Successfully retrieved promotion position eligibility status");
        }
        catch (Exception e)
        {
            _logger.LogError(e,
                "[GetPromotionPositionEligibilityStatus] failed to get promotion position eligibility status");
            return new ApiResponse<EligibilityResponse>("Failed to get promotion position eligibility", 500);
        }
    }

    public async Task<IApiResponse<ApplicationCategoryStateResponse>> ApplicationCategoryState(AuthData auth,
        string? id = null)
    {
        try
        {
            _logger.LogInformation(
                "[ApplicationCategoryState] Getting application category state with rawRequest:{Request}",
                auth.Serialize());
            AcademicPromotionApplication? activeApplicationRes;
            if (!string.IsNullOrEmpty(id))
            {
                activeApplicationRes =
                    await _applicationRepository.GetOneAsync(a => a.Id == id && a.ApplicantId == auth.Id);
            }
            else
            {
                activeApplicationRes =
                    await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            }

            if (activeApplicationRes == null)
                return new ApplicationCategoryStateResponse().ToOkApiResponse(
                    "Successfully retrieved application category state");
            // ApiResponse<ApplicationCategoryStateResponse>("There's no active application started", 400);
            
            var teachingRes = await _teachingRepository.GetOneAsync(a =>
                a.ApplicantId == auth.Id && a.PromotionApplicationId == activeApplicationRes.Id);
            var serviceRes = await _serviceRepository.GetOneAsync(a =>
                a.ApplicantId == auth.Id && a.PromotionApplicationId == activeApplicationRes.Id);
            var publicationRes = await _publicationRepository.GetOneAsync(a =>
                a.ApplicantId == auth.Id && a.PromotionApplicationId == activeApplicationRes.Id);

      
            var response = new ApplicationCategoryStateResponse
            {
                TeachingCategoryStatus = teachingRes?.Status ?? string.Empty,
                PublicationCategoryStatus = publicationRes?.Status ?? string.Empty,
                ServiceCategoryStatus = serviceRes?.Status ?? string.Empty,
                NumberOfRecordsForTeaching = teachingRes?.TotalCategoriesAssessed ?? 0,
                NumberOfRecordsForPublication = publicationRes?.Publications.Count ?? 0,
                NumberOfRecordsForService = (serviceRes?.ServiceToTheUniversity.Count ?? 0) + 
                                            (serviceRes?.ServiceToNationalAndInternational.Count ?? 0),
                TeachingPerformance =  teachingRes?.ApplicantPerformance?? PerformanceTypes.InAdequate,
                ServicePerformance = serviceRes?.ApplicantPerformance?? PerformanceTypes.InAdequate,
                PublicationPerformance = publicationRes?.ApplicantPerformance ?? PerformanceTypes.InAdequate,
                TeachingCategoryId = teachingRes?.Id ?? string.Empty,
                PublicationCategoryId = publicationRes?.Id ?? string.Empty,
                ServiceCategoryId = serviceRes?.Id ?? string.Empty,
                ApplicationId = activeApplicationRes?.Id ?? string.Empty,
                ApplicationStatus = activeApplicationRes?.ApplicationStatus ?? string.Empty,
                ReviewStatus = activeApplicationRes?.ReviewStatus ?? string.Empty,
                CurriculumVitaeUrl = string.IsNullOrWhiteSpace(activeApplicationRes?.CurriculumVitaeFile)
                    ? string.Empty
                    : _storageService.GetFileUrl(activeApplicationRes!.CurriculumVitaeFile!),
                CurriculumVitaeFileName = activeApplicationRes?.CurriculumVitaeFile ?? string.Empty,
                CurriculumVitaeUploadedAt = activeApplicationRes?.CurriculumVitaeUploadedAt,
                ApplicationLetterUrl = string.IsNullOrWhiteSpace(activeApplicationRes?.ApplicationLetterFile)
                    ? string.Empty
                    : _storageService.GetFileUrl(activeApplicationRes!.ApplicationLetterFile!),
                ApplicationLetterFileName = activeApplicationRes?.ApplicationLetterFile ?? string.Empty,
                ApplicationLetterUploadedAt = activeApplicationRes?.ApplicationLetterUploadedAt
            };

            return response.ToOkApiResponse("Successfully retrieved application category state");
        }
        catch (Exception e)
        {
            _logger.LogError(e,
                "[ApplicationCategoryState]  failed to get application category statuses with rawRequest:{Request}",
                auth.Serialize());
            return new ApiResponse<ApplicationCategoryStateResponse>("Failed to get application statuses", 500);
        }
    }

    public async Task<AcademicPromotionApplication> CreateAcademicPromotionApplication(string applicantId)
    {
        var staff = await _staffRepository.GetOneAsync(a => a.Id == applicantId);
        if (staff == null) return new AcademicPromotionApplication();
        var department = await _departmentRepository.GetByIdAsync(staff.DepartmentId);
        var faculty = await _facultyRepository.GetByIdAsync(staff.FacultyId);
        var school = await _schoolRepository.GetByIdAsync(staff.SchoolId);
        var nextPosition = PromotionApplicationService.GetNextPosition(staff.Position) ?? string.Empty;
        if (string.IsNullOrEmpty(nextPosition))
            throw new InvalidOperationException(PromotionApplicationService.IneligibilityMessage(staff.Position));
        var positionRes = await _positionRepository.GetOneAsync(p => p.Name.ToLower() == nextPosition.ToLower());

        var academicApplication = new AcademicPromotionApplication
        {
            CreatedBy = staff.Email,
            PromotionPositionId = positionRes?.Id ?? string.Empty,
            PromotionPosition = positionRes?.Name ?? string.Empty,
            ApplicantId = staff.Id,
            ApplicantName = staff.FirstName + " " + staff.LastName,
            ApplicantEmail = staff.Email,
            ApplicantCurrentPosition = staff.Position,
            ApplicantDepartmentId = staff.DepartmentId,
            ApplicantSchoolId = staff.SchoolId,
            ApplicantFacultyId = staff.FacultyId,
            ApplicantDepartmentName = department?.Name ?? staff.DepartmentId,
            ApplicantSchoolName = faculty?.Name ?? staff.FacultyId,
            ApplicantFacultyName = school?.Name ?? staff.SchoolId,
            IsActive = true,

        };

        var academicPromotionAdded = await _applicationRepository.AddAsync(academicApplication);
        _logger.LogInformation(
            "[CreateAcademicPromotionApplication] Response after creating application: {Application}, status:{Status}",
            academicApplication.Serialize(), academicPromotionAdded);
        return academicApplication;
    }

    public async Task<IApiResponse<OverallOverview>> ActiveApplicationOverallReview(AuthData auth, string? id = null)
    {
        try
        {
            _logger.LogInformation(
                "[ActiveApplicationOverallReview] Fetching overall review for applicant {ApplicantId}",
                auth.Id);
            AcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
            {
                application = await _applicationRepository.GetOneAsync(a => a.Id == id && a.ApplicantId == auth.Id);
            }
            else
            {
                application = await _applicationRepository
                    .GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            }

            if (application == null)
                return new ApiResponse<OverallOverview>("No active application found", 400);

            var teaching = await _teachingRepository
                .GetOneAsync(t => t.ApplicantId == auth.Id && t.PromotionApplicationId == application.Id);

            var publication = await _publicationRepository
                .GetOneAsync(p => p.ApplicantId == auth.Id && p.PromotionApplicationId == application.Id);

            var service = await _serviceRepository
                .GetOneAsync(s => s.ApplicantId == auth.Id && s.PromotionApplicationId == application.Id);

            var response = new OverallOverview
            {
                Teaching = teaching == null
                    ? null
                    : new TeachingOverview
                    {
                        Performance = teaching.ApplicantPerformance,
                        AverageScore = CalculateTeachingAverage(teaching),
                        TotalCategoriesAssessed = teaching.TotalCategoriesAssessed
                    },

                Publication = publication == null
                    ? null
                    : new PublicationOverview
                    {
                        Performance = publication.ApplicantPerformance,
                        TotalPublicationsAdded = publication.Publications.Count,
                        TotalApplicantScore = publication.Publications.Sum(x => x.ApplicantScore ?? 0),
                        TotalSystemGeneratedScore = publication.Publications.Sum(x => x.SystemGeneratedScore)
                    },

                Service = service == null
                    ? null
                    : new ServiceOverview
                    {
                        Performance = service.ApplicantPerformance,
                        TotalRecords =
                            service.ServiceToTheUniversity.Count +
                            service.ServiceToNationalAndInternational.Count,
                        UniversityCommunityScore =
                            service.ServiceToTheUniversity.Sum(x => x.ApplicantScore ?? 0),
                        NationalInternationalScore =
                            service.ServiceToNationalAndInternational.Sum(x => x.ApplicantScore ?? 0)
                    }
            };

            return response.ToOkApiResponse("Overall application review fetched successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[ActiveApplicationOverallReview] Failed to fetch overview for applicant {ApplicantId}",
                auth.Id);

            return new ApiResponse<OverallOverview>("Failed to fetch application overview", 500);
        }
    }

    /// <summary>
    /// Computes the average score across all teaching subcategories
    /// </summary>
    private static double CalculateTeachingAverage(TeachingRecord teaching)
    {
        var scores = new List<double>();

        void Add(TeachingData? data)
        {
            if (data != null)
                scores.Add(data.ApplicantScore ?? 0);
        }

        Add(teaching.LectureLoad);
        Add(teaching.AbilityToAdaptToTeaching);
        Add(teaching.RegularityAndPunctuality);
        Add(teaching.QualityOfLectureMaterial);
        Add(teaching.PerformanceOfStudentInExam);
        Add(teaching.AbilityToCompleteSyllabus);
        Add(teaching.QualityOfExamQuestionAndMarkingScheme);
        Add(teaching.PunctualityInSettingExamQuestion);
        Add(teaching.SupervisionOfProjectWorkAndThesis);
        Add(teaching.StudentReactionToAndAssessmentOfTeaching);

        return scores.Any()
            ? Math.Round(scores.Average(), 2)
            : 0;
    }

    public async Task<IApiResponse<SubmittedApplicationResponse>> SubmittedApplicationPreview(AuthData auth,
        string? id = null)
    {
        try
        {
            _logger.LogInformation(
                "[SubmittedApplicationPreview] Fetching submitted application preview for {ApplicantId} with Id: {Id}",
                auth.Id, id);



            AcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
            {
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id == a.Id);
            }
            else
            {
                application = await _applicationRepository
                    .GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            }


            if (application == null)
                return new ApiResponse<SubmittedApplicationResponse>(
                    "No active application found", 400);

            var teaching = await _teachingRepository
                .GetOneAsync(t => t.ApplicantId == auth.Id &&
                                  t.PromotionApplicationId == application.Id);

            var publication = await _publicationRepository
                .GetOneAsync(p => p.ApplicantId == auth.Id &&
                                  p.PromotionApplicationId == application.Id);

            var service = await _serviceRepository
                .GetOneAsync(s => s.ApplicantId == auth.Id &&
                                  s.PromotionApplicationId == application.Id);

            var teachingData = teaching == null
                ? new List<TeachingApplicationData>()
                : MapTeachingData(teaching);

            var response = new SubmittedApplicationResponse
            {
                TeachingApplication = teaching == null
                    ? null
                    : new TeachingApplicationResponse
                    {
                        TotalNumberOfCategoriesAssessed = teachingData.Count,
                        TeachingApplicationData = teachingData
                    },

                PublicationApplication = publication == null
                    ? null
                    : new PublicationApplicationResponse
                    {
                        TotalNumberOfPublicationsRecorded = publication.Publications.Count,
                        PublicationApplicationData = publication.Publications
                            .Select(p => new PublicationApplicationData
                            {
                                Title = p.Title,
                                Year = p.Year,
                                PublicationCategory = p.PublicationTypeName,
                                Remark = p.ApplicantRemarks,
                                Score = p.ApplicantScore ?? 0,
                                SystemScore = p.SystemGeneratedScore
                            })
                            .ToList()
                    },

                ServiceApplication = service == null
                    ? null
                    : new ServiceApplicationResponse
                    {
                        TotalNumberOfServicesRecorded =
                            service.ServiceToTheUniversity.Count +
                            service.ServiceToNationalAndInternational.Count,

                        ServiceToUniversityApplicationData =
                            service.ServiceToTheUniversity
                                .Select(s => new ServiceApplicationData
                                {
                                    Title = s.ServiceTitle,
                                    Remark = s.ApplicantRemarks,
                                    Score = s.ApplicantScore ?? 0
                                })
                                .ToList(),

                        ServiceToNationalInternationApplicationData =
                            service.ServiceToNationalAndInternational
                                .Select(s => new ServiceApplicationData
                                {
                                    Title = s.ServiceTitle,
                                    Remark = s.ApplicantRemarks,
                                    Score = s.ApplicantScore ?? 0
                                })
                                .ToList()
                    }
            };

            return response.ToOkApiResponse("Submitted application preview fetched successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[SubmittedApplicationPreview] Failed to fetch preview for applicant {ApplicantId}",
                auth.Id);

            return new ApiResponse<SubmittedApplicationResponse>(
                "Failed to fetch submitted application preview", 500);
        }
    }

    private static List<TeachingApplicationData> MapTeachingData(TeachingRecord teaching)
    {
        var result = new List<TeachingApplicationData>();

        void Add(string category, TeachingData? data)
        {
            if (data == null) return;

            result.Add(new TeachingApplicationData
            {
                Category = category,
                Remark = data.ApplicantRemarks,
                Score = data.ApplicantScore ?? 0
            });
        }

        Add("Lecture Load", teaching.LectureLoad);
        Add("Ability To Adapt To Teaching", teaching.AbilityToAdaptToTeaching);
        Add("Regularity And Punctuality", teaching.RegularityAndPunctuality);
        Add("Quality Of Lecture Material", teaching.QualityOfLectureMaterial);
        Add("Performance Of Student In Exam", teaching.PerformanceOfStudentInExam);
        Add("Ability To Complete Syllabus", teaching.AbilityToCompleteSyllabus);
        Add("Quality Of Exam Question And Marking Scheme", teaching.QualityOfExamQuestionAndMarkingScheme);
        Add("Punctuality In Setting Exam Question", teaching.PunctualityInSettingExamQuestion);
        Add("Supervision Of Project Work And Thesis", teaching.SupervisionOfProjectWorkAndThesis);
        Add("Student Reaction To And Assessment Of Teaching", teaching.StudentReactionToAndAssessmentOfTeaching);

        return result;
    }

    public async Task<IApiResponse<bool>> SubmitApplication(AuthData auth)
    {
        try
        {
            _logger.LogInformation("[SubmitApplication] Submitting application for applicant {ApplicantId}", auth.Id);

            var application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            if (application == null)
                return false.ToBadRequestApiResponse("No active application found");

            // Allow submission for Draft and Returned applications
            if (application.ApplicationStatus != ApplicationStatusTypes.Draft && 
                application.ApplicationStatus != ApplicationStatusTypes.Returned)
                return false.ToBadRequestApiResponse("Application has already been submitted");

            // Verify categories are completed
            var teaching = await _teachingRepository.GetOneAsync(t => t.ApplicantId == auth.Id && t.PromotionApplicationId == application.Id);
            var publication = await _publicationRepository.GetOneAsync(p => p.ApplicantId == auth.Id && p.PromotionApplicationId == application.Id);
            var service = await _serviceRepository.GetOneAsync(s => s.ApplicantId == auth.Id && s.PromotionApplicationId == application.Id);

            if (teaching == null || teaching.TotalCategoriesAssessed < 10)
                return false.ToBadRequestApiResponse("Please complete all teaching assessment categories before submitting");

            if (publication == null || !publication.Publications.Any())
                return false.ToBadRequestApiResponse("Please add at least one publication before submitting");

            if (service == null || (service.ServiceToTheUniversity.Count == 0 && service.ServiceToNationalAndInternational.Count == 0))
                return false.ToBadRequestApiResponse("Please add at least one service record before submitting");

            // Required documents must be uploaded before final submission
            if (string.IsNullOrWhiteSpace(application.CurriculumVitaeFile))
                return false.ToBadRequestApiResponse("Please upload your Curriculum Vitae before submitting");

            if (string.IsNullOrWhiteSpace(application.ApplicationLetterFile))
                return false.ToBadRequestApiResponse("Please upload your application letter before submitting");

            // Update application status
            application.ApplicationStatus = ApplicationStatusTypes.Submitted;
            application.ReviewStatus = ApplicationReviewStatusTypes.DepartmentReview;
            application.SubmissionDate = DateTime.UtcNow;

            await _applicationRepository.UpdateAsync(application);
            
            // Send email notifications to committee members and applicant via actor (non-blocking, fire-and-forget)
            try
            {
                // Send notification to committee members asynchronously
                var committeeMessage = new SendCommitteeEmailMessage
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
                    CommitteeType = AcademicPromotionApplicationRoles.DAPC,
                    ReviewUrl = "https://academic-portal.umat.edu.gh/review"
                };

                _actorSystem.SendCommitteeEmailAsync(committeeMessage);
                _logger.LogInformation("[SubmitApplication] Committee notification message queued for application {ApplicationId}", application.Id);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "[SubmitApplication] Failed to queue email notifications for application {ApplicationId}", application.Id);
                // Don't fail the application submission if email queueing fails
            }

            _logger.LogInformation("[SubmitApplication] Application {ApplicationId} submitted successfully", application.Id);
            return true.ToOkApiResponse("Application submitted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SubmitApplication] Failed to submit application for applicant {ApplicantId}", auth.Id);
            return false.ToServerErrorApiResponse("Failed to submit application");
        }
    }

    public async Task<IApiResponse<List<PromotionHistoryResponse>>> GetPromotionHistory(AuthData auth)
    {
        try
        {
            _logger.LogInformation("[GetPromotionHistory] Fetching promotion history for applicant {ApplicantId}", auth.Id);
            var history = await _applicationRepository.GetAllAsync(a => a.ApplicantId == auth.Id);
            var sortedHistory = history.OrderByDescending(a => a.CreatedAt).ToList();
            
            var response = new List<PromotionHistoryResponse>();
            
            foreach (var application in sortedHistory)
            {
                var historyResponse = application.Adapt<PromotionHistoryResponse>();
                
                // Fetch related records to get performance levels
                var teaching = await _teachingRepository.GetOneAsync(t => 
                    t.ApplicantId == auth.Id && t.PromotionApplicationId == application.Id);
                var publication = await _publicationRepository.GetOneAsync(p => 
                    p.ApplicantId == auth.Id && p.PromotionApplicationId == application.Id);
                var service = await _serviceRepository.GetOneAsync(s => 
                    s.ApplicantId == auth.Id && s.PromotionApplicationId == application.Id);
                
                // Get performance levels from each category
                var teachingPerformance = teaching?.ApplicantPerformance ?? PerformanceTypes.InAdequate;
                var publicationPerformance = publication?.ApplicantPerformance ?? PerformanceTypes.InAdequate;
                var servicePerformance = service?.ApplicantPerformance ?? PerformanceTypes.InAdequate;
                
                // Set performance in response
                historyResponse.Performance = new ApplicationPerformance
                {
                    Teaching = teachingPerformance,
                    Publication = publicationPerformance,
                    Service = servicePerformance
                };
                
                // Fetch the latest feedback/remarks from assessment activities
                var activities = await _activityRepository.GetAllAsync(a => a.ApplicationId == application.Id);
                var latestFeedback = activities
                    .Where(a => a.ActivityType == AssessmentActivityTypes.ApplicationReturned ||
                               a.ActivityType == AssessmentActivityTypes.ApplicationApproved ||
                               a.ActivityType == AssessmentActivityTypes.ApplicationRejected)
                    .OrderByDescending(a => a.ActivityDate)
                    .FirstOrDefault();
                
                if (latestFeedback?.ActivityData != null)
                {
                    // Get feedback from either ReturnReason or Remarks
                    historyResponse.Feedback = !string.IsNullOrEmpty(latestFeedback.ActivityData.ReturnReason) 
                        ? latestFeedback.ActivityData.ReturnReason 
                        : latestFeedback.ActivityData.Remarks;
                }
                
                response.Add(historyResponse);
            }
            
            return response.ToOkApiResponse("Promotion history fetched successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetPromotionHistory] Failed to fetch promotion history for applicant {ApplicantId}", auth.Id);
            return new ApiResponse<List<PromotionHistoryResponse>>("Failed to fetch promotion history", 500);
        }
    }

    public async Task<IApiResponse<PromotionLetterResponse>> GetPromotionLetter(AuthData auth, string? applicationId = null)
    {
        try
        {
            _logger.LogInformation("[GetPromotionLetter] Fetching promotion letter for applicant {ApplicantId}, applicationId: {ApplicationId}", 
                auth.Id, applicationId ?? "latest");
            
            AcademicPromotionApplication? application;
            
            if (string.IsNullOrEmpty(applicationId))
            {
                // Get the most recent approved application for this user
                var applications = await _applicationRepository.GetAllAsync(a => 
                    a.ApplicantId == auth.Id && 
                    a.ApplicationStatus == ApplicationStatusTypes.Approved);
                application = applications.OrderByDescending(a => a.UpdatedAt).FirstOrDefault();
            }
            else
            {
                // Get specific application
                application = await _applicationRepository.GetByIdAsync(applicationId);
                
                // Verify ownership
                if (application != null && application.ApplicantId != auth.Id)
                {
                    return new ApiResponse<PromotionLetterResponse>("You don't have access to this application", 403);
                }
            }
            
            if (application == null)
            {
                return new ApiResponse<PromotionLetterResponse>("Application not found", 404);
            }
            
            // Check if application is approved
            if (application.ApplicationStatus != ApplicationStatusTypes.Approved)
            {
                return new ApiResponse<PromotionLetterResponse>("Promotion letter is only available for approved applications", 400);
            }
            
            // Get staff details
            var staff = await _staffRepository.GetByIdAsync(application.ApplicantId);
            if (staff == null)
            {
                return new ApiResponse<PromotionLetterResponse>("Staff record not found", 404);
            }
            
            // Get department and faculty
            var department = await _departmentRepository.GetByIdAsync(staff.DepartmentId ?? "");
            var faculty = department != null 
                ? await _facultyRepository.GetByIdAsync(department.FacultyId) 
                : null;
            
            // Get position for requirements
            var position = await _positionRepository.GetByIdAsync(application.PromotionPositionId);
            
            // Fetch assessment records
            var teaching = await _teachingRepository.GetOneAsync(t => t.PromotionApplicationId == application.Id);
            var publication = await _publicationRepository.GetOneAsync(p => p.PromotionApplicationId == application.Id);
            var service = await _serviceRepository.GetOneAsync(s => s.PromotionApplicationId == application.Id);
            
            // Calculate scores
            var teachingScore = CalculateTotalTeachingScore(teaching);
            var publicationScore = CalculateTotalPublicationScore(publication);
            var serviceScore = CalculateTotalServiceScore(service);
            var overallScore = (teachingScore + publicationScore + serviceScore) / 3;
            
            // Get performance levels (prefer UAPC, then FAPC, then DAPC, then Applicant)
            var teachingPerformance = GetFinalPerformance(teaching?.UapcPerformance, teaching?.FapcPerformance, teaching?.DapcPerformance, teaching?.ApplicantPerformance);
            var publicationPerformance = GetFinalPerformance(publication?.UapcPerformance, publication?.FapcPerformance, publication?.DapcPerformance, publication?.ApplicantPerformance);
            var servicePerformance = GetFinalPerformance(service?.UapcPerformance, service?.FapcPerformance, service?.DapcPerformance, service?.ApplicantPerformance);
            
            // Get overall performance based on average
            var overallPerformance = DetermineOverallPerformance(teachingPerformance, publicationPerformance, servicePerformance);
            
            // Calculate years in position
            var yearsInPosition = (int)Math.Floor((application?.UpdatedAt - staff.LastAppointmentOrPromotionDate)?.TotalDays??0 / 365.25);
            
            // Get approval activity for date and approver
            var activities = await _activityRepository.GetAllAsync(a => 
                a.ApplicationId == application.Id && 
                a.ActivityType == AssessmentActivityTypes.ApplicationApproved);
            var approvalActivity = activities.OrderByDescending(a => a.ActivityDate).FirstOrDefault();
            
            // Generate letter number: PROM-YEAR-APPNUMBER-DEPTCODE
            var deptCode = department?.Name?.Substring(0, 3).ToUpper() ?? "GEN";
            var letterNumber = $"PROM-{application.UpdatedAt?.Year}-{application.Id[..8].ToUpper()}-{deptCode}";
            
            var letterResponse = new PromotionLetterResponse
            {
                ApplicationId = application.Id,
                StaffName = $"{staff.Title} {staff.FirstName} {staff.LastName}",
                StaffId = staff.StaffId,
                CurrentPosition = application.ApplicantCurrentPosition,
                NextPosition = application.PromotionPosition,
                Department = department?.Name ?? "Unknown Department",
                Faculty = faculty?.Name ?? "Unknown Faculty",
                LetterDate = approvalActivity?.ActivityDate.ToString("yyyy-MM-dd") ?? application.UpdatedAt?.ToString("yyyy-MM-dd")??string.Empty,
                LetterNumber = letterNumber,
                TeachingScore = Math.Round(teachingScore, 1),
                PublicationScore = Math.Round(publicationScore, 1),
                ServiceScore = Math.Round(serviceScore, 1),
                OverallScore = Math.Round(overallScore, 1),
                TeachingPerformance = teachingPerformance,
                PublicationPerformance = publicationPerformance,
                ServicePerformance = servicePerformance,
                OverallPerformance = overallPerformance,
                ApplicationSubmissionDate = application.SubmissionDate?.ToString("yyyy-MM-dd") ?? application.CreatedAt.ToString("yyyy-MM-dd"),
                ApprovalDate = approvalActivity?.ActivityDate.ToString("yyyy-MM-dd") ?? application.UpdatedAt?.ToString("yyyy-MM-dd")??string.Empty,
                ApplicationStatus = application.ApplicationStatus,
                ReviewStatus = application.ReviewStatus!,
                YearsInCurrentPosition = yearsInPosition,
                YearsRequired = position?.MinimumNumberOfYearsFromLastPromotion ?? 3,
                Summary = $"Comprehensive portfolio demonstrating {overallPerformance.ToLower()} performance across teaching excellence, scholarly publications, and institutional service.",
                Recommendation = "Promotion approved by University Academic Promotion Committee (UAPC)",
                ApprovedBy = approvalActivity?.PerformedByName ?? "UAPC Chairperson",
                ApproverTitle = "UAPC Chairperson"
            };
            
            return letterResponse.ToOkApiResponse("Promotion letter generated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetPromotionLetter] Failed to fetch promotion letter for applicant {ApplicantId}", auth.Id);
            return new ApiResponse<PromotionLetterResponse>("Failed to generate promotion letter", 500);
        }
    }

    private double CalculateTotalTeachingScore(TeachingRecord? teaching)
    {
        if (teaching == null) return 0;
        
        double total = 0;
        var count = 0;
        
        var scores = new[]
        {
            teaching.LectureLoad?.UapcScore ?? teaching.LectureLoad?.FapcScore ?? teaching.LectureLoad?.DapcScore ?? teaching.LectureLoad?.ApplicantScore,
            teaching.AbilityToAdaptToTeaching?.UapcScore ?? teaching.AbilityToAdaptToTeaching?.FapcScore ?? teaching.AbilityToAdaptToTeaching?.DapcScore ?? teaching.AbilityToAdaptToTeaching?.ApplicantScore,
            teaching.RegularityAndPunctuality?.UapcScore ?? teaching.RegularityAndPunctuality?.FapcScore ?? teaching.RegularityAndPunctuality?.DapcScore ?? teaching.RegularityAndPunctuality?.ApplicantScore,
            teaching.QualityOfLectureMaterial?.UapcScore ?? teaching.QualityOfLectureMaterial?.FapcScore ?? teaching.QualityOfLectureMaterial?.DapcScore ?? teaching.QualityOfLectureMaterial?.ApplicantScore,
            teaching.PerformanceOfStudentInExam?.UapcScore ?? teaching.PerformanceOfStudentInExam?.FapcScore ?? teaching.PerformanceOfStudentInExam?.DapcScore ?? teaching.PerformanceOfStudentInExam?.ApplicantScore,
            teaching.AbilityToCompleteSyllabus?.UapcScore ?? teaching.AbilityToCompleteSyllabus?.FapcScore ?? teaching.AbilityToCompleteSyllabus?.DapcScore ?? teaching.AbilityToCompleteSyllabus?.ApplicantScore,
            teaching.QualityOfExamQuestionAndMarkingScheme?.UapcScore ?? teaching.QualityOfExamQuestionAndMarkingScheme?.FapcScore ?? teaching.QualityOfExamQuestionAndMarkingScheme?.DapcScore ?? teaching.QualityOfExamQuestionAndMarkingScheme?.ApplicantScore,
            teaching.PunctualityInSettingExamQuestion?.UapcScore ?? teaching.PunctualityInSettingExamQuestion?.FapcScore ?? teaching.PunctualityInSettingExamQuestion?.DapcScore ?? teaching.PunctualityInSettingExamQuestion?.ApplicantScore,
            teaching.SupervisionOfProjectWorkAndThesis?.UapcScore ?? teaching.SupervisionOfProjectWorkAndThesis?.FapcScore ?? teaching.SupervisionOfProjectWorkAndThesis?.DapcScore ?? teaching.SupervisionOfProjectWorkAndThesis?.ApplicantScore,
            teaching.StudentReactionToAndAssessmentOfTeaching?.UapcScore ?? teaching.StudentReactionToAndAssessmentOfTeaching?.FapcScore ?? teaching.StudentReactionToAndAssessmentOfTeaching?.DapcScore ?? teaching.StudentReactionToAndAssessmentOfTeaching?.ApplicantScore,
        };
        
        foreach (var score in scores)
        {
            if (score.HasValue)
            {
                total += score.Value;
                count++;
            }
        }
        
        return count > 0 ? (total / count) * 10 / 5 : 0; // Normalize to 10-point scale
    }

    private double CalculateTotalPublicationScore(Publication? publication)
    {
        if (publication?.Publications == null) return 0;
        
        var total = publication.Publications.Sum(p => 
            p.UapcScore ?? p.FapcScore ?? p.DapcScore ?? p.ApplicantScore ?? p.SystemGeneratedScore);
        
        // Normalize to 10-point scale (assuming max is around 50)
        return Math.Min(total / 5, 10);
    }

    private double CalculateTotalServiceScore(ServiceRecord? service)
    {
        if (service == null) return 0;
        
        var universityTotal = service.ServiceToTheUniversity?.Sum(s => 
            s.UapcScore ?? s.FapcScore ?? s.DapcScore ?? s.ApplicantScore ?? s.SystemGeneratedScore ?? 0) ?? 0;
        var nationalTotal = service.ServiceToNationalAndInternational?.Sum(s => 
            s.UapcScore ?? s.FapcScore ?? s.DapcScore ?? s.ApplicantScore ?? s.SystemGeneratedScore ?? 0) ?? 0;
        
        // Normalize to 10-point scale
        return Math.Min((universityTotal + nationalTotal) / 5, 10);
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

    private string DetermineOverallPerformance(string teaching, string publication, string service)
    {
        var levels = new Dictionary<string, int>
        {
            { PerformanceTypes.High, 4 },
            { PerformanceTypes.Good, 3 },
            { PerformanceTypes.Adequate, 2 },
            { PerformanceTypes.InAdequate, 1 }
        };
        
        var avgLevel = (levels.GetValueOrDefault(teaching, 2) + 
                        levels.GetValueOrDefault(publication, 2) + 
                        levels.GetValueOrDefault(service, 2)) / 3.0;
        
        if (avgLevel >= 3.5) return "Excellent";
        if (avgLevel >= 2.5) return "Very Good";
        if (avgLevel >= 1.5) return "Good";
        return "Satisfactory";
    }

    public async Task<IApiResponse<EligibilityForecastResponse>> GetEligibilityForecast(AuthData auth)
    {
        try
        {
            _logger.LogInformation(
                "[GetEligibilityForecast] Getting eligibility forecast for {ApplicantId}",
                auth.Id);

            var staffRes = await _staffRepository.GetByIdAsync(auth.Id);
            if (staffRes == null)
                return new ApiResponse<EligibilityForecastResponse>("User not found", 400);

            // Publication data is fetched per milestone inside the loop.
            // Each milestone only reflects records the applicant has uploaded for that specific target position.
            var forecast = new EligibilityForecastResponse
            {
                ApplicantName = staffRes.FirstName + " " + staffRes.LastName,
                CurrentPosition = staffRes.Position,
                LastPromotionDate = staffRes.LastAppointmentOrPromotionDate,
                Milestones = new List<PromotionMilestone>()
            };

            // Calculate time in current position ONCE
            var timeInCurrentPosition = DateTime.UtcNow - staffRes.LastAppointmentOrPromotionDate;
            var yearsInCurrentPosition = Math.Round(timeInCurrentPosition.TotalDays / 365.25, 2);

            // Build only the next 3 positions in the chain (for reference/planning)
            // Only the first one (immediate next) can be marked as eligible — no position skipping
            // Position chain is driven entirely from DB PreviousPosition field (not hardcoded names)
            var currentPosition = staffRes.Position;
            var previousPosition = staffRes.Position;

            for (int i = 0; i < 3; i++)
            {
                // Look up the next position by finding one whose PreviousPosition = current
                // Primary lookup: find next position by PreviousPosition field in DB
                var positionRes = await _positionRepository.GetOneAsync(p =>
                    p.PreviousPosition != null &&
                    p.PreviousPosition.ToLower() == currentPosition.ToLower());

                // Fallback: handles cross-track convergence (e.g. Senior Research Fellow → Associate Professor)
                // where the DB target position has a different PreviousPosition value on record.
                if (positionRes == null)
                {
                    var sdkNextName = PromotionApplicationService.GetNextPosition(currentPosition);
                    if (sdkNextName != null)
                        positionRes = await _positionRepository.GetOneAsync(p =>
                            p.Name.ToLower() == sdkNextName.ToLower());
                }

                if (positionRes == null) break;

                var nextPosition = positionRes.Name;

                var yearsRequiredForThisLevel = positionRes.MinimumNumberOfYearsFromLastPromotion;

                // Only the first milestone (i=0) can be eligible — no position skipping allowed
                bool canBeEligible = (i == 0);
                var yearsUntilEligible = canBeEligible
                    ? Math.Max(0, yearsRequiredForThisLevel - yearsInCurrentPosition)
                    : double.MaxValue;

                DateTime? estimatedEligibilityDate = null;
                if (yearsUntilEligible != double.MaxValue && yearsUntilEligible > 0)
                {
                    estimatedEligibilityDate = DateTime.UtcNow.AddDays(yearsUntilEligible * 365.25);
                }

                // Per-milestone publication data: only look at records uploaded for this specific target position.
                // Locked future milestones get no data — the applicant hasn't started preparing for them yet.
                int milestonePublicationCount = 0;
                int milestoneRefereedCount = 0;
                bool hasUploadedData = false;

                if (canBeEligible)
                {
                    var milestoneApp = await _applicationRepository.GetOneAsync(a =>
                        a.ApplicantId == auth.Id &&
                        a.PromotionPosition.ToLower() == nextPosition.ToLower());

                    if (milestoneApp != null)
                    {
                        var milestonePublicationRecord = await _publicationRepository.GetOneAsync(p =>
                            p.ApplicantId == auth.Id && p.PromotionApplicationId == milestoneApp.Id);

                        if (milestonePublicationRecord != null)
                        {
                            hasUploadedData = true;
                            milestonePublicationCount = milestonePublicationRecord.Publications.Count;
                            milestoneRefereedCount = milestonePublicationRecord.Publications
                                .Count(p => p.PublicationTypeName.Contains("Journal", StringComparison.OrdinalIgnoreCase));
                        }
                    }
                }

                // Gap is full minimum when no data uploaded, or actual gap when data exists
                var publicationGap = hasUploadedData
                    ? Math.Max(0, positionRes.MinimumNumberOfPublications - milestonePublicationCount)
                    : positionRes.MinimumNumberOfPublications;
                var refereedGap = hasUploadedData
                    ? Math.Max(0, positionRes.MinimumNumberOfRefereedJournal - milestoneRefereedCount)
                    : positionRes.MinimumNumberOfRefereedJournal;

                var milestone = new PromotionMilestone
                {
                    MilestoneOrder = i + 1,
                    TargetPosition = nextPosition,
                    PreviousPosition = previousPosition,
                    MinimumYearsRequired = yearsRequiredForThisLevel,
                    // Locked milestones have 0 years because the applicant hasn't held this position yet.
                    // Counting current rank years against a future locked position would be misleading.
                    CurrentYearsInRank = canBeEligible ? (int)yearsInCurrentPosition : 0,
                    RemainingYearsRequired = canBeEligible
                        ? Math.Max(0, (int)(yearsRequiredForThisLevel - yearsInCurrentPosition))
                        : yearsRequiredForThisLevel,
                    EstimatedEligibilityDate = estimatedEligibilityDate,
                    // A locked milestone can NEVER be eligible regardless of any other criteria.
                    // Positions cannot be skipped — the applicant must be promoted to each intermediate level first.
                    IsEligible = canBeEligible && yearsUntilEligible <= 0 && hasUploadedData && publicationGap == 0 && refereedGap == 0,
                    IsLocked = !canBeEligible,
                    HasUploadedData = hasUploadedData,
                    PerformanceCriteriaOptions = positionRes.PerformanceCriteria,
                    MinimumPublications = positionRes.MinimumNumberOfPublications,
                    CurrentPublications = milestonePublicationCount,
                    PublicationsGap = publicationGap,
                    MinimumRefereedJournals = positionRes.MinimumNumberOfRefereedJournal,
                    CurrentRefereedJournals = milestoneRefereedCount,
                    RefereedJournalsGap = refereedGap,
                    RequiredActions = canBeEligible 
                        ? GenerateActionItems(nextPosition, publicationGap, refereedGap, yearsUntilEligible)
                        : new List<ActionItem>() // No actions for locked positions
                };

                forecast.Milestones.Add(milestone);

                // Set next eligible milestone only if it's the first one and it's eligible
                if (forecast.NextEligibleMilestone == null && milestone.IsEligible)
                {
                    forecast.NextEligibleMilestone = milestone;
                }

                previousPosition = nextPosition;
                currentPosition = nextPosition;
            }

            return forecast.ToOkApiResponse("Successfully retrieved eligibility forecast");
        }
        catch (Exception e)
        {
            _logger.LogError(e,
                "[GetEligibilityForecast] Failed to get eligibility forecast for {ApplicantId}",
                auth.Id);
            return new ApiResponse<EligibilityForecastResponse>("Failed to get eligibility forecast", 500);
        }
    }

    private List<ActionItem> GenerateActionItems(string targetPosition, int pubGap, int refGap, double yearsUntilEligible)
    {
        var actions = new List<ActionItem>();

        if (yearsUntilEligible > 0)
        {
            actions.Add(new ActionItem
            {
                Category = "Timeline",
                Action = $"Wait until {DateTime.UtcNow.AddDays(yearsUntilEligible * 365.25):MMMM yyyy} to be eligible",
                Details = $"You need {Math.Ceiling(yearsUntilEligible)} more year(s) in rank",
                TargetDate = DateTime.UtcNow.AddDays(yearsUntilEligible * 365.25),
                Priority = 1
            });
        }

        if (pubGap > 0)
        {
            actions.Add(new ActionItem
            {
                Category = "Publications",
                Action = $"Publish {pubGap} more publication(s)",
                Details = $"You currently have {targetPosition} publications needed",
                TargetCount = pubGap,
                Priority = pubGap > 2 ? 1 : 2
            });
        }

        if (refGap > 0)
        {
            actions.Add(new ActionItem
            {
                Category = "Publications",
                Action = $"Publish {refGap} more in high-impact/refereed journals",
                Details = $"Strengthen your publication profile with refereed journal articles",
                TargetCount = refGap,
                Priority = 1
            });
        }

        if (pubGap == 0 && refGap == 0 && yearsUntilEligible <= 0)
        {
            actions.Add(new ActionItem
            {
                Category = "Timeline",
                Action = "You are currently eligible to apply!",
                Details = "Review your teaching and service records to strengthen your application",
                Priority = 1
            });
        }

        return actions;
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

    private ApplicationDocumentsResponse BuildDocumentsResponse(AcademicPromotionApplication application) => new()
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

            // Documents can only be uploaded/replaced while the application has not been submitted
            // for assessment (Draft or Returned for revision).
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