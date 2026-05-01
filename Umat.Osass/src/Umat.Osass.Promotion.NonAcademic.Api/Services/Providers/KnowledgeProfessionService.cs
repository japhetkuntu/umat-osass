using Mapster;
using Microsoft.EntityFrameworkCore;
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

public class KnowledgeProfessionService : IKnowledgeProfessionService
{
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly ILogger<KnowledgeProfessionService> _logger;
    private readonly INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> _knowledgeRepository;
    private readonly IStorageService _storageService;
    private readonly IIdentityPgRepository<KnowledgeMaterialIndicator> _indicatorRepository;

    public KnowledgeProfessionService(
        INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> applicationRepository,
        IApplicationService applicationService,
        ILogger<KnowledgeProfessionService> logger,
        INonAcademicPromotionPgRepository<KnowledgeProfessionRecord> knowledgeRepository,
        IStorageService storageService,
        IIdentityPgRepository<KnowledgeMaterialIndicator> indicatorRepository)
    {
        _applicationRepository = applicationRepository;
        _applicationService = applicationService;
        _logger = logger;
        _knowledgeRepository = knowledgeRepository;
        _storageService = storageService;
        _indicatorRepository = indicatorRepository;
    }

    public async Task<IApiResponse<KnowledgeProfessionResponse>> UpdateKnowledgeProfessionState(
        AuthData auth,
        UpdateKnowledgeProfessionRequest request)
    {
        try
        {
            _logger.LogInformation("[UpdateKnowledgeProfessionState] By:{Auth}", auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateNonAcademicPromotionApplication(auth.Id);

            var record = await _knowledgeRepository.GetOneAsync(
                r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            if (record == null)
            {
                record = new KnowledgeProfessionRecord
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantUnitId = application.ApplicantUnitId,
                    Status = ApplicationProgressStates.InProgress
                };
                await _knowledgeRepository.AddAsync(record);
            }

            foreach (var req in request.Materials)
            {
                var systemScore = KnowledgeScoringService.ComputeMaterialScore(
                    req.MaterialTypeId,
                    req.AuthorCount,
                    req.IsFirstAuthor,
                    req.IsPrincipalAuthor,
                    req.IsPresented);

                var existing = record.Materials.FirstOrDefault(m => m.Id == req.Id);

                if (existing == null)
                {
                    var evidence = await UploadFiles(req.Evidence);
                    var presentationEvidence = await UploadFiles(req.PresentationEvidence);

                    var item = new KnowledgeProfessionItem
                    {
                        Title = req.Title,
                        Year = req.Year,
                        MaterialTypeId = req.MaterialTypeId,
                        MaterialTypeName = req.MaterialTypeId,
                        AuthorCount = req.AuthorCount,
                        IsFirstAuthor = req.IsFirstAuthor,
                        IsPrincipalAuthor = req.IsPrincipalAuthor,
                        IsPresented = req.IsPresented,
                        PresentationBonus = req.IsPresented ? KnowledgeScoringService.PresentationBonus : 0,
                        SystemGeneratedScore = systemScore,
                        AuthorWeightedScore = systemScore,
                        ApplicantScore = req.Score,
                        ApplicantRemarks = req.Remark,
                        SupportingEvidence = evidence,
                        PresentationEvidence = presentationEvidence
                    };
                    req.Id = item.Id;
                    record.Materials.Add(item);
                }
                else
                {
                    if (req.RemovedEvidence.Count != 0)
                    {
                        var toRemove = req.RemovedEvidence.Select(GetFileNameFromUrl).Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                        existing.SupportingEvidence = existing.SupportingEvidence.Where(x => !toRemove.Contains(x)).ToList();
                    }
                    if (req.RemovedPresentationEvidence.Count != 0)
                    {
                        var toRemove = req.RemovedPresentationEvidence.Select(GetFileNameFromUrl).Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                        existing.PresentationEvidence = existing.PresentationEvidence.Where(x => !toRemove.Contains(x)).ToList();
                    }

                    existing.Title = req.Title;
                    existing.Year = req.Year;
                    existing.MaterialTypeId = req.MaterialTypeId;
                    existing.MaterialTypeName = req.MaterialTypeId;
                    existing.AuthorCount = req.AuthorCount;
                    existing.IsFirstAuthor = req.IsFirstAuthor;
                    existing.IsPrincipalAuthor = req.IsPrincipalAuthor;
                    existing.IsPresented = req.IsPresented;
                    existing.PresentationBonus = req.IsPresented ? KnowledgeScoringService.PresentationBonus : 0;
                    existing.SystemGeneratedScore = systemScore;
                    existing.AuthorWeightedScore = systemScore;
                    existing.ApplicantScore = req.Score;
                    existing.ApplicantRemarks = req.Remark;
                    existing.UpdatedAt = DateTime.UtcNow;

                    if (req.Evidence.Count > 0)
                    {
                        var newEvidence = await UploadFiles(req.Evidence);
                        existing.SupportingEvidence.AddRange(newEvidence);
                    }
                    if (req.PresentationEvidence.Count > 0)
                    {
                        var newPresentEvidence = await UploadFiles(req.PresentationEvidence);
                        existing.PresentationEvidence.AddRange(newPresentEvidence);
                    }
                }
            }

            // Keep only materials in the request (removes deleted ones)
            var validIds = request.Materials.Select(m => m.Id).ToList();
            record.Materials = record.Materials.Where(m => validIds.Contains(m.Id)).ToList();

            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = $"{auth.FirstName} {auth.LastName}";

            var allScores = record.Materials.Select(m => m.AuthorWeightedScore + (m.IsPresented && m.PresentationEvidence.Count > 0 ? m.PresentationBonus : 0));
            var totalScore = KnowledgeScoringService.ComputeTotalKnowledgeScore(allScores);
            record.ApplicantPerformance = PerformanceComputationService.ComputeKnowledgeProfessionPerformance(totalScore);

            await _knowledgeRepository.UpdateAsync(record);

            return new KnowledgeProfessionResponse
            {
                PerformanceLevel = record.ApplicantPerformance,
                Materials = record.Materials.Select(MapItem).ToList()
            }.ToOkApiResponse("Knowledge and profession updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<KnowledgeProfessionResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[UpdateKnowledgeProfessionState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<KnowledgeProfessionResponse>("Failed to update knowledge and profession", 500);
        }
    }

    public async Task<IApiResponse<KnowledgeProfessionResponse>> GetKnowledgeProfessionState(AuthData auth, string? id = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id == a.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApiResponse<KnowledgeProfessionResponse>("No active promotion application found", 400);

            var record = await _knowledgeRepository.GetOneAsync(
                r => r.ApplicantId == auth.Id && r.PromotionApplicationId == application.Id);

            if (record == null)
                return new ApiResponse<KnowledgeProfessionResponse>("No knowledge profession records found", 400);

            return new KnowledgeProfessionResponse
            {
                PerformanceLevel = record.ApplicantPerformance,
                Materials = record.Materials.Select(MapItem).ToList()
            }.ToOkApiResponse("Knowledge and profession retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetKnowledgeProfessionState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<KnowledgeProfessionResponse>("Failed to retrieve knowledge and profession", 500);
        }
    }

    public static double CalculateTotalScore(KnowledgeProfessionRecord record)
    {
        var scores = record.Materials.Select(m =>
            m.AuthorWeightedScore + (m.IsPresented && m.PresentationEvidence.Count > 0 ? m.PresentationBonus : 0));
        return KnowledgeScoringService.ComputeTotalKnowledgeScore(scores);
    }

    private async Task<List<string>> UploadFiles(List<IFormFile> files)
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
        try { return new Uri(url).Segments.LastOrDefault() ?? string.Empty; }
        catch { return string.Empty; }
    }

    private KnowledgeProfessionResponseData MapItem(KnowledgeProfessionItem m) =>
        new()
        {
            Id = m.Id,
            Title = m.Title,
            Year = m.Year,
            Score = m.AuthorWeightedScore,
            ApplicantScore = m.ApplicantScore ?? 0,
            SystemGeneratedScore = m.SystemGeneratedScore,
            AuthorWeightedScore = m.AuthorWeightedScore,
            MaterialTypeId = m.MaterialTypeId,
            MaterialTypeName = m.MaterialTypeName,
            IsPresented = m.IsPresented,
            PresentationBonus = m.PresentationBonus,
            Remark = m.ApplicantRemarks,
            PresentationEvidence = m.PresentationEvidence.Select(x => _storageService.GetFileUrl(x)).ToList(),
            Evidence = m.SupportingEvidence.Select(x => _storageService.GetFileUrl(x))
                .ToList()
        };

    public async Task<IApiResponse<List<KnowledgeMaterialIndicatorResponse>>> GetKnowledgeMaterialIndicators()
    {
        try
        {
            var entities = await _indicatorRepository.GetQueryableAsync()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            var indicators = entities.Adapt<List<KnowledgeMaterialIndicatorResponse>>();
            return indicators.ToOkApiResponse("Knowledge material indicators retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetKnowledgeMaterialIndicators] Failed");
            return new ApiResponse<List<KnowledgeMaterialIndicatorResponse>>("Failed to retrieve knowledge material indicators", 500);
        }
    }
}
