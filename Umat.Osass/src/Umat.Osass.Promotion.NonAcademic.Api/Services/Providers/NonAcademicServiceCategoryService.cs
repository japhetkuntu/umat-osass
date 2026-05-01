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

public class NonAcademicServiceCategoryService : INonAcademicServiceCategoryService
{
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly INonAcademicPromotionPgRepository<NonAcademicServiceRecord> _serviceRepository;
    private readonly IIdentityPgRepository<ServicePosition> _servicePositionRepository;
    private readonly IStorageService _storageService;
    private readonly ILogger<NonAcademicServiceCategoryService> _logger;

    public NonAcademicServiceCategoryService(
        INonAcademicPromotionPgRepository<NonAcademicPromotionApplication> applicationRepository,
        IApplicationService applicationService,
        INonAcademicPromotionPgRepository<NonAcademicServiceRecord> serviceRepository,
        IIdentityPgRepository<ServicePosition> servicePositionRepository,
        IStorageService storageService,
        ILogger<NonAcademicServiceCategoryService> logger)
    {
        _applicationRepository = applicationRepository;
        _applicationService = applicationService;
        _serviceRepository = serviceRepository;
        _servicePositionRepository = servicePositionRepository;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<IApiResponse<NonAcademicServiceResponse>> UpdateServiceCategoryState(
        AuthData auth,
        UpdateNonAcademicServiceRequest request)
    {
        try
        {
            _logger.LogInformation("[UpdateServiceCategoryState] By:{Auth}", auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateNonAcademicPromotionApplication(auth.Id);

            var record = await _serviceRepository.GetOneAsync(
                s => s.ApplicantId == auth.Id && s.PromotionApplicationId == application.Id);

            if (record == null)
            {
                record = new NonAcademicServiceRecord
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantUnitId = application.ApplicantUnitId,
                    Status = ApplicationProgressStates.InProgress
                };
                await _serviceRepository.AddAsync(record);
            }

            await ProcessServiceList(request.UniversityCommunity, record.ServiceToTheUniversity);
            await ProcessServiceList(request.NationalInternationalCommunity, record.ServiceToNationalAndInternational);

            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = $"{auth.FirstName} {auth.LastName}";

            var totalScore = CalculateOverallTotal(record);
            record.ApplicantPerformance = PerformanceComputationService.ComputeServicePerformance(totalScore);

            await _serviceRepository.UpdateAsync(record);

            return new NonAcademicServiceResponse
            {
                PerformanceLevel = record.ApplicantPerformance,
                UniversityCommunity = record.ServiceToTheUniversity.Select(MapItem).ToList(),
                NationalInternationalCommunity = record.ServiceToNationalAndInternational.Select(MapItem).ToList()
            }.ToOkApiResponse("Service category updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<NonAcademicServiceResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[UpdateServiceCategoryState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<NonAcademicServiceResponse>("Failed to update service category", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicServiceResponse>> GetServiceCategoryState(AuthData auth, string? id = null)
    {
        try
        {
            NonAcademicPromotionApplication? application;
            if (!string.IsNullOrEmpty(id))
                application = await _applicationRepository.GetOneAsync(a => a.ApplicantId == auth.Id && id == a.Id);
            else
                application = await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id);

            if (application == null)
                return new ApiResponse<NonAcademicServiceResponse>("No active promotion application found", 400);

            var record = await _serviceRepository.GetOneAsync(
                s => s.ApplicantId == auth.Id && s.PromotionApplicationId == application.Id);

            if (record == null)
                return new ApiResponse<NonAcademicServiceResponse>("No service records submitted yet", 400);

            return new NonAcademicServiceResponse
            {
                PerformanceLevel = record.ApplicantPerformance,
                UniversityCommunity = record.ServiceToTheUniversity.Select(MapItem).ToList(),
                NationalInternationalCommunity = record.ServiceToNationalAndInternational.Select(MapItem).ToList()
            }.ToOkApiResponse("Service category retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetServiceCategoryState] Failed. By:{Auth}", auth.Serialize());
            return new ApiResponse<NonAcademicServiceResponse>("Failed to retrieve service category", 500);
        }
    }

    public async Task<IApiResponse<List<ServicePositionIndicatorResponse>>> GetServicePositions()
    {
        try
        {
            var positions = await _servicePositionRepository.GetQueryableAsync()
                .OrderBy(x => x.Name)
                .ToListAsync();
            var response = positions.Adapt<List<ServicePositionIndicatorResponse>>();
            return response.ToOkApiResponse("Service positions retrieved");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetServicePositions] Failed");
            return new ApiResponse<List<ServicePositionIndicatorResponse>>("Failed to retrieve service positions", 500);
        }
    }

    public static double CalculateUniversityTotal(NonAcademicServiceRecord record) =>
        record.ServiceToTheUniversity.Sum(x => x.ApplicantScore) ?? 0;

    public static double CalculateNationalInternationalTotal(NonAcademicServiceRecord record) =>
        record.ServiceToNationalAndInternational.Sum(x => x.ApplicantScore) ?? 0;

    public static double CalculateOverallTotal(NonAcademicServiceRecord record) =>
        CalculateUniversityTotal(record) + CalculateNationalInternationalTotal(record);

    private async Task ProcessServiceList(
        List<NonAcademicServiceRequestData> requestItems,
        List<NonAcademicServiceItem> existingList)
    {
        var requestIds = requestItems.Select(r => r.Id).ToList();

        foreach (var req in requestItems)
        {
            var existing = existingList.FirstOrDefault(x => x.Id == req.Id);

            if (existing == null)
            {
                var evidence = await UploadFiles(req.Evidence);
                var newItem = new NonAcademicServiceItem
                {
                    ServiceTitle = req.ServiceTitle,
                    ServiceTypeId = req.ServiceTypeId,
                    Role = req.Role,
                    Duration = req.Duration,
                    ApplicantScore = req.Score,
                    ApplicantRemarks = req.Remark,
                    IsActing = req.IsActing,
                    SupportingEvidence = evidence
                };
                req.Id = newItem.Id;
                requestIds[requestItems.IndexOf(req)] = newItem.Id;
                existingList.Add(newItem);
            }
            else
            {
                if (req.RemovedEvidence.Count != 0)
                {
                    var toRemove = req.RemovedEvidence.Select(GetFileNameFromUrl).Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                    existing.SupportingEvidence = existing.SupportingEvidence.Where(x => !toRemove.Contains(x)).ToList();
                }
                existing.ServiceTitle = req.ServiceTitle;
                existing.ServiceTypeId = req.ServiceTypeId;
                existing.Role = req.Role;
                existing.Duration = req.Duration;
                existing.ApplicantScore = req.Score;
                existing.ApplicantRemarks = req.Remark;
                existing.IsActing = req.IsActing;
                existing.UpdatedAt = DateTime.UtcNow;

                if (req.Evidence.Count > 0)
                {
                    var newEvidence = await UploadFiles(req.Evidence);
                    existing.SupportingEvidence.AddRange(newEvidence);
                }
            }
        }

        // Remove items not in the request
        existingList.RemoveAll(x => !requestIds.Contains(x.Id));
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

    private string GetFileNameFromUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return string.Empty;
        try { return new Uri(url).Segments.LastOrDefault() ?? string.Empty; }
        catch { return string.Empty; }
    }

    private NonAcademicServiceResponseData MapItem(NonAcademicServiceItem s) =>
        new()
        {
            Id = s.Id,
            ServiceTitle = s.ServiceTitle,
            ServiceTypeId = s.ServiceTypeId,
            Role = s.Role,
            Duration = s.Duration,
            Score = s.ApplicantScore ?? 0,
            Remark = s.ApplicantRemarks,
            IsActing = s.IsActing,
            Evidence = s.SupportingEvidence.Select(x => _storageService.GetFileUrl(x))
                .ToList(),
            SystemGeneratedScore = s.SystemGeneratedScore ?? 0
        };
}
