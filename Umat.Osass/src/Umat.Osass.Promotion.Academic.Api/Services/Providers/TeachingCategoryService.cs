using Umat.Osass.AcademicPromotion.Sdk.Services;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Extensions;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

public class TeachingCategoryService : ITeachingCategoryService
{
    private readonly IAcademicPromotionPgRepository<AcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly ILogger<TeachingCategoryService> _logger;
    private readonly IStorageService _storageService;
    private readonly IAcademicPromotionPgRepository<TeachingRecord> _teachingRepository;


    public TeachingCategoryService(ILogger<TeachingCategoryService> logger,
        IIdentityPgRepository<Staff> staffRepository,
        IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository,
        IAcademicPromotionPgRepository<TeachingRecord> teachingRepository,
        IAcademicPromotionPgRepository<AcademicPromotionPosition> positionRepository,
        IIdentityPgRepository<Department> departmentRepository, IIdentityPgRepository<Faculty> facultyRepository,
        IIdentityPgRepository<School> schoolRepository, IStorageService storageService,
        IApplicationService applicationService)
    {
        _logger = logger;
        _applicationRepository = applicationRepository;
        _teachingRepository = teachingRepository;
        _storageService = storageService;
        _applicationService = applicationService;
    }

    public async Task<IApiResponse<TeachingResponse>> UpdateTeachingCategoryState(
        AuthData auth,
        UpdateTeachingRequest request)
    {
        try
        {
            _logger.LogInformation(
                "[UpdateTeachingCategoryState] Request:{Request} By:{Auth}",
                request.Serialize(),
                auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateAcademicPromotionApplication(auth.Id);

            var teaching =
                await _teachingRepository.GetOneAsync(t => t.ApplicantId == auth.Id &&
                                                           t.PromotionApplicationId == application.Id);

            if (teaching == null)
            {
                teaching = new TeachingRecord
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantDepartmentId = application.ApplicantDepartmentId,
                    ApplicantSchoolId = application.ApplicantSchoolId,
                    ApplicantFacultyId = application.ApplicantFacultyId,
                    Status = ApplicationProgressStates.InProgress,
                    TotalCategoriesAssessed = 0
                };

                await _teachingRepository.AddAsync(teaching);
            }

            var applicantName = $"{auth.FirstName} {auth.LastName}";

            async Task Handle(
                TeachingRequestData? req,
                Func<TeachingData?> getter,
                Action<TeachingData> setter)
            {
                if (req == null) return;

                var (data, isNew) =
                    await ProcessTeachingCategory(req, getter());

                setter(data);

                if (isNew)
                    teaching.TotalCategoriesAssessed++;
            }

            await Handle(request.LectureLoad,
                () => teaching.LectureLoad,
                v => teaching.LectureLoad = v);

            await Handle(request.AbilityToAdaptToTeaching,
                () => teaching.AbilityToAdaptToTeaching,
                v => teaching.AbilityToAdaptToTeaching = v);

            await Handle(request.RegularityAndPunctuality,
                () => teaching.RegularityAndPunctuality,
                v => teaching.RegularityAndPunctuality = v);

            await Handle(request.QualityOfLectureMaterial,
                () => teaching.QualityOfLectureMaterial,
                v => teaching.QualityOfLectureMaterial = v);

            await Handle(request.PerformanceOfStudentInExam,
                () => teaching.PerformanceOfStudentInExam,
                v => teaching.PerformanceOfStudentInExam = v);

            await Handle(request.AbilityToCompleteSyllabus,
                () => teaching.AbilityToCompleteSyllabus,
                v => teaching.AbilityToCompleteSyllabus = v);

            await Handle(request.QualityOfExamQuestionAndMarkingScheme,
                () => teaching.QualityOfExamQuestionAndMarkingScheme,
                v => teaching.QualityOfExamQuestionAndMarkingScheme = v);

            await Handle(request.PunctualityInSettingExamQuestion,
                () => teaching.PunctualityInSettingExamQuestion,
                v => teaching.PunctualityInSettingExamQuestion = v);

            await Handle(request.SupervisionOfProjectWorkAndThesis,
                () => teaching.SupervisionOfProjectWorkAndThesis,
                v => teaching.SupervisionOfProjectWorkAndThesis = v);

            await Handle(request.StudentReactionToAndAssessmentOfTeaching,
                () => teaching.StudentReactionToAndAssessmentOfTeaching,
                v => teaching.StudentReactionToAndAssessmentOfTeaching = v);

            teaching.UpdatedAt = DateTime.UtcNow;
            teaching.UpdatedBy = applicantName;

            var totalScore = CalculateTotalScore(teaching);
            teaching.ApplicantPerformance = PerformanceComputationService.ComputePerformanceForTeaching(totalScore);
           

            await _teachingRepository.UpdateAsync(teaching);

            return FormatTeachingResponse(teaching).ToOkApiResponse("Teaching category updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<TeachingResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[UpdateTeachingCategoryState] Failed. Request:{Request} By:{Auth}",
                request.Serialize(),
                auth.Serialize());

            return new ApiResponse<TeachingResponse>(
                "Failed to update teaching category state",
                500);
        }
    }

    public static double CalculateTotalScore(TeachingRecord teaching)
    {
        ArgumentNullException.ThrowIfNull(teaching);

        return
            (teaching.LectureLoad?.ApplicantScore ?? 0) +
            (teaching.AbilityToAdaptToTeaching?.ApplicantScore ?? 0) +
            (teaching.RegularityAndPunctuality?.ApplicantScore ?? 0) +
            (teaching.QualityOfLectureMaterial?.ApplicantScore ?? 0) +
            (teaching.PerformanceOfStudentInExam?.ApplicantScore ?? 0) +
            (teaching.AbilityToCompleteSyllabus?.ApplicantScore ?? 0) +
            (teaching.QualityOfExamQuestionAndMarkingScheme?.ApplicantScore ?? 0) +
            (teaching.PunctualityInSettingExamQuestion?.ApplicantScore ?? 0) +
            (teaching.SupervisionOfProjectWorkAndThesis?.ApplicantScore ?? 0) +
            (teaching.StudentReactionToAndAssessmentOfTeaching?.ApplicantScore ?? 0);
    }
    public async Task<IApiResponse<TeachingResponse>> GetTeachingCategoryState(AuthData auth,string? id = null)
    {
        try
        {
            _logger.LogInformation(
                "[GetTeachingCategoryState] Fetching teaching category state for {Auth}",
                auth.Serialize());
            AcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
            {
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id==a.Id);
            }
            else
            {
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);
            }
        
            // No active application yet
            if (application == null)
                return new ApiResponse<TeachingResponse>(
                    "No active promotion application found", 400);

            var teaching = await _teachingRepository.GetOneAsync(t => t.ApplicantId == auth.Id &&
                                                                      t.PromotionApplicationId == application.Id);

            // Application exists but teaching not started
            if (teaching == null)
                return new ApiResponse<TeachingResponse>(
                    "Teaching categories not started yet", 400);

            var response = FormatTeachingResponse(teaching);

            return
                response.ToOkApiResponse("Teaching category state retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[GetTeachingCategoryState] Failed for {Auth}",
                auth.Serialize());

            return new ApiResponse<TeachingResponse>(
                "Failed to retrieve teaching category state",
                500);
        }
    }

    private async Task<(TeachingData data, bool isNew)>
        ProcessTeachingCategory(
            TeachingRequestData request,
            TeachingData? existing)
    {
        var isNew = existing == null;

        var teachingData = existing ?? new TeachingData
        {
            ApplicantScore = request.Score,
            ApplicantRemarks = request.Remark,
            CreatedAt = DateTime.UtcNow
        };

        teachingData.ApplicantScore = request.Score ?? teachingData.ApplicantScore;
        teachingData.ApplicantRemarks = request.Remark ?? teachingData.ApplicantRemarks;
        teachingData.UpdatedAt = DateTime.UtcNow;

        // Remove evidence
        if (request.RemovedEvidence.Count != 0)
        {
            var filesToRemove = request.RemovedEvidence
                .Select(ImageFormatter.GetFileNameFromUrl)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
            teachingData.SupportingEvidence =
                teachingData.SupportingEvidence
                    .Where(x => !filesToRemove.Contains(x))
                    .ToList();
        }

        // Upload new evidence
        foreach (var file in request.Evidence)
        {
            var extension = Path.GetExtension(file.FileName);
            var newFileName = $"{Guid.NewGuid():N}{extension}";
            var fileName = await _storageService.UploadFileAsync(
                file,
                newFileName);

            teachingData.SupportingEvidence.Add(fileName);
        }

        return (teachingData, isNew);
    }

    private TeachingResponseData? MapTeachingData(TeachingData? data)
    {
        if (data == null) return null;

        return new TeachingResponseData
        {
            Id = data.Id,
            Score = data.ApplicantScore ?? 0,
            Remark = data.ApplicantRemarks,
            Evidence = data.SupportingEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList()
        };
    }

    private TeachingResponse FormatTeachingResponse(TeachingRecord record)
    {
        var scores = new List<double>();

        void CollectScore(TeachingData? d)
        {
            if (d?.ApplicantScore != null)
                scores.Add(d.ApplicantScore.Value);
        }

        CollectScore(record.LectureLoad);
        CollectScore(record.AbilityToAdaptToTeaching);
        CollectScore(record.RegularityAndPunctuality);
        CollectScore(record.QualityOfLectureMaterial);
        CollectScore(record.PerformanceOfStudentInExam);
        CollectScore(record.AbilityToCompleteSyllabus);
        CollectScore(record.QualityOfExamQuestionAndMarkingScheme);
        CollectScore(record.PunctualityInSettingExamQuestion);
        CollectScore(record.SupervisionOfProjectWorkAndThesis);
        CollectScore(record.StudentReactionToAndAssessmentOfTeaching);

        return new TeachingResponse
        {
            CompletedCategories = scores.Count,
            AverageScore = scores.Any() ? Math.Round(scores.Average(), 2) : null,
            PerformanceLevel =record.ApplicantPerformance,
            LectureLoad = MapTeachingData(record.LectureLoad),
            AbilityToAdaptToTeaching = MapTeachingData(record.AbilityToAdaptToTeaching),
            RegularityAndPunctuality = MapTeachingData(record.RegularityAndPunctuality),
            QualityOfLectureMaterial = MapTeachingData(record.QualityOfLectureMaterial),
            PerformanceOfStudentInExam = MapTeachingData(record.PerformanceOfStudentInExam),
            AbilityToCompleteSyllabus = MapTeachingData(record.AbilityToCompleteSyllabus),
            QualityOfExamQuestionAndMarkingScheme = MapTeachingData(record.QualityOfExamQuestionAndMarkingScheme),
            PunctualityInSettingExamQuestion = MapTeachingData(record.PunctualityInSettingExamQuestion),
            SupervisionOfProjectWorkAndThesis = MapTeachingData(record.SupervisionOfProjectWorkAndThesis),
            StudentReactionToAndAssessmentOfTeaching = MapTeachingData(record.StudentReactionToAndAssessmentOfTeaching)
        };
    }

    private string ResolvePerformanceLevel(List<double> scores)
    {
        if (!scores.Any())
            return "Not assessed";

        var avg = scores.Average();

        return avg switch
        {
            >= 80 => "High",
            >= 60 => "Good",
            >= 50 => "Adequate",
            _ => "Inadequate"
        };
    }


}