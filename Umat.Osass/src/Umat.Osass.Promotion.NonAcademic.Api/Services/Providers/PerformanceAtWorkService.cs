using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.NonAcademicPromotion.Sdk.Services;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.NonAcademic.Api.Extensions;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;
using Umat.Osass.Storage.Sdk.Services.Interfaces;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

public class PerformanceAtWorkService : IPerformanceAtWorkService
{
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly ILogger<PerformanceAtWorkService> _logger;
    private readonly IStorageService _storageService;
    private readonly INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> _performanceRepository;

    public PerformanceAtWorkService(
        ILogger<PerformanceAtWorkService> logger,
        INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> applicationRepository,
        INonAcademicPromotionPgRepository<PerformanceAtWorkRecord> performanceRepository,
        IStorageService storageService,
        IApplicationService applicationService)
    {
        _logger = logger;
        _applicationRepository = applicationRepository;
        _performanceRepository = performanceRepository;
        _storageService = storageService;
        _applicationService = applicationService;
    }

    public async Task<IApiResponse<PerformanceAtWorkResponse>> UpdatePerformanceAtWorkState(
        AuthData auth,
        UpdatePerformanceAtWorkRequest request)
    {
        try
        {
            _logger.LogInformation(
                "[UpdatePerformanceAtWorkState] Request:{Request} By:{Auth}",
                request.Serialize(), auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateNonAcademicPromotionApplication(auth.Id);

            var record = await _performanceRepository.GetOneAsync(
                r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            if (record == null)
            {
                record = new PerformanceAtWorkRecord
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantUnitId = application.ApplicantUnitId,
                    Status = ApplicationProgressStates.InProgress,
                    TotalCategoriesAssessed = 0
                };
                await _performanceRepository.AddAsync(record);
            }

            var applicantName = $"{auth.FirstName} {auth.LastName}";

            async Task Handle(PerformanceWorkRequestData? req,
                Func<PerformanceWorkData?> getter,
                Action<PerformanceWorkData> setter)
            {
                if (req == null) return;
                var (data, isNew) = await ProcessCategory(req, getter());
                setter(data);
                if (isNew) record.TotalCategoriesAssessed++;
            }

            await Handle(request.AccuracyOnSchedule, () => record.AccuracyOnSchedule, v => record.AccuracyOnSchedule = v);
            await Handle(request.QualityOfWork, () => record.QualityOfWork, v => record.QualityOfWork = v);
            await Handle(request.PunctualityAndRegularity, () => record.PunctualityAndRegularity, v => record.PunctualityAndRegularity = v);
            await Handle(request.KnowledgeOfProcedures, () => record.KnowledgeOfProcedures, v => record.KnowledgeOfProcedures = v);
            await Handle(request.AbilityToWorkOnOwn, () => record.AbilityToWorkOnOwn, v => record.AbilityToWorkOnOwn = v);
            await Handle(request.AbilityToWorkUnderPressure, () => record.AbilityToWorkUnderPressure, v => record.AbilityToWorkUnderPressure = v);
            await Handle(request.AdditionalResponsibility, () => record.AdditionalResponsibility, v => record.AdditionalResponsibility = v);
            await Handle(request.HumanRelations, () => record.HumanRelations, v => record.HumanRelations = v);
            await Handle(request.InitiativeAndForesight, () => record.InitiativeAndForesight, v => record.InitiativeAndForesight = v);
            await Handle(request.AbilityToInspireAndMotivate, () => record.AbilityToInspireAndMotivate, v => record.AbilityToInspireAndMotivate = v);

            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = applicantName;

            var totalScore = CalculateTotalScore(record);
            record.ApplicantPerformance = PerformanceComputationService.ComputePerformanceAtWork(totalScore);

            await _performanceRepository.UpdateAsync(record);

            return FormatResponse(record).ToOkApiResponse("Performance at work updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<PerformanceAtWorkResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[UpdatePerformanceAtWorkState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<PerformanceAtWorkResponse>("Failed to update performance at work", 500);
        }
    }

    public async Task<IApiResponse<PerformanceAtWorkResponse>> GetPerformanceAtWorkState(AuthData auth, string? id = null)
    {
        try
        {
            _logger.LogInformation("[GetPerformanceAtWorkState] For {Auth}", auth.Serialize());

            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id == a.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApiResponse<PerformanceAtWorkResponse>("No active promotion application found", 400);

            var record = await _performanceRepository.GetOneAsync(
                r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            if (record == null)
                return new ApiResponse<PerformanceAtWorkResponse>("No performance at work record found", 400);

            return FormatResponse(record).ToOkApiResponse("Performance at work retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetPerformanceAtWorkState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<PerformanceAtWorkResponse>("Failed to retrieve performance at work", 500);
        }
    }

    public static double CalculateTotalScore(PerformanceAtWorkRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);
        return
            (record.AccuracyOnSchedule?.ApplicantScore ?? 0) +
            (record.QualityOfWork?.ApplicantScore ?? 0) +
            (record.PunctualityAndRegularity?.ApplicantScore ?? 0) +
            (record.KnowledgeOfProcedures?.ApplicantScore ?? 0) +
            (record.AbilityToWorkOnOwn?.ApplicantScore ?? 0) +
            (record.AbilityToWorkUnderPressure?.ApplicantScore ?? 0) +
            (record.AdditionalResponsibility?.ApplicantScore ?? 0) +
            (record.HumanRelations?.ApplicantScore ?? 0) +
            (record.InitiativeAndForesight?.ApplicantScore ?? 0) +
            (record.AbilityToInspireAndMotivate?.ApplicantScore ?? 0);
    }

    public static double CalculateAverage(PerformanceAtWorkRecord record)
    {
        var scores = new List<double>();
        void Add(PerformanceWorkData? d) { if (d != null) scores.Add(d.ApplicantScore ?? 0); }
        Add(record.AccuracyOnSchedule);
        Add(record.QualityOfWork);
        Add(record.PunctualityAndRegularity);
        Add(record.KnowledgeOfProcedures);
        Add(record.AbilityToWorkOnOwn);
        Add(record.AbilityToWorkUnderPressure);
        Add(record.AdditionalResponsibility);
        Add(record.HumanRelations);
        Add(record.InitiativeAndForesight);
        Add(record.AbilityToInspireAndMotivate);
        return scores.Any() ? Math.Round(scores.Average(), 2) : 0;
    }

    private async Task<(PerformanceWorkData data, bool isNew)> ProcessCategory(
        PerformanceWorkRequestData req,
        PerformanceWorkData? existing)
    {
        if (existing == null)
        {
            var evidence = await UploadEvidence(req.Evidence);
            var data = new PerformanceWorkData
            {
                ApplicantScore = req.Score,
                ApplicantRemarks = req.Remark,
                SupportingEvidence = evidence
            };
            req.Id = data.Id;
            return (data, true);
        }

        // Remove evidence first
        if (req.RemovedEvidence.Count != 0)
        {
            var toRemove = req.RemovedEvidence
                .Select(GetFileNameFromUrl)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
            existing.SupportingEvidence = existing.SupportingEvidence
                .Where(x => !toRemove.Contains(x))
                .ToList();
        }

        existing.ApplicantScore = req.Score;
        existing.ApplicantRemarks = req.Remark;
        existing.UpdatedAt = DateTime.UtcNow;

        if (req.Evidence.Count > 0)
        {
            var newEvidence = await UploadEvidence(req.Evidence);
            existing.SupportingEvidence.AddRange(newEvidence);
        }

        return (existing, false);
    }

    private async Task<List<string>> UploadEvidence(List<IFormFile> files)
    {
        var urls = new List<string>();
        foreach (var file in files)
        {
            var extension = Path.GetExtension(file.FileName);
            var objectName = $"{Guid.NewGuid():N}{extension}";
            var url = await _storageService.UploadFileAsync(file, objectName);
            if (!string.IsNullOrWhiteSpace(url)) urls.Add(url);
        }
        return urls;
    }

    private static string GetFileNameFromUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return string.Empty;
        var uri = new Uri(url);
        return uri.Segments.LastOrDefault() ?? string.Empty;
    }

    private PerformanceAtWorkResponse FormatResponse(PerformanceAtWorkRecord record)
    {
        PerformanceWorkResponseData? Map(PerformanceWorkData? d)
        {
            if (d == null) return null;
            return new PerformanceWorkResponseData
            {
                Id = d.Id,
                Score = d.ApplicantScore ?? 0,
                Remark = d.ApplicantRemarks,
                Evidence = d.SupportingEvidence.Select(x => _storageService.GetFileUrl(x))
                    .ToList()
            };
        }

        return new PerformanceAtWorkResponse
        {
            CompletedCategories = record.TotalCategoriesAssessed,
            AverageScore = CalculateAverage(record),
            PerformanceLevel = record.ApplicantPerformance,
            AccuracyOnSchedule = Map(record.AccuracyOnSchedule),
            QualityOfWork = Map(record.QualityOfWork),
            PunctualityAndRegularity = Map(record.PunctualityAndRegularity),
            KnowledgeOfProcedures = Map(record.KnowledgeOfProcedures),
            AbilityToWorkOnOwn = Map(record.AbilityToWorkOnOwn),
            AbilityToWorkUnderPressure = Map(record.AbilityToWorkUnderPressure),
            AdditionalResponsibility = Map(record.AdditionalResponsibility),
            HumanRelations = Map(record.HumanRelations),
            InitiativeAndForesight = Map(record.InitiativeAndForesight),
            AbilityToInspireAndMotivate = Map(record.AbilityToInspireAndMotivate)
        };
    }
}
