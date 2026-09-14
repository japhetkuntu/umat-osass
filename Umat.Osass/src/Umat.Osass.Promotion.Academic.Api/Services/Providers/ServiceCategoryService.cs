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

public class ServiceCategoryService : IServiceCategoryService
{
    private readonly IAcademicPromotionPgRepository<AcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly IAcademicPromotionPgRepository<ServiceRecord> _serviceRepository;
    private readonly IIdentityPgRepository<ServicePosition> _servicePositionRepository;
    private readonly IIdentityPgRepository<ServiceCategory> _serviceCategoryRepository;
    private readonly IStorageService _storageService;
    private readonly ILogger<ServiceCategoryService> _logger;

    public ServiceCategoryService(
        IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository,
        IApplicationService applicationService,
        IAcademicPromotionPgRepository<ServiceRecord> serviceRepository,
        IIdentityPgRepository<ServicePosition> servicePositionRepository,
        IIdentityPgRepository<ServiceCategory> serviceCategoryRepository,
        IStorageService storageService,
        ILogger<ServiceCategoryService> logger)
    {
        _applicationRepository = applicationRepository;
        _applicationService = applicationService;
        _serviceRepository = serviceRepository;
        _servicePositionRepository = servicePositionRepository;
        _serviceCategoryRepository = serviceCategoryRepository;
        _storageService = storageService;
        _logger = logger;
    }

    // ========================= UPDATE =========================

    public async Task<IApiResponse<ServiceResponse>> UpdateServiceCategoryState(
        AuthData auth,
        UpdateServiceRequest request)
    {
        try
        {
            _logger.LogInformation(
                "[UpdateServiceCategoryState] Request:{Request} By:{Auth}",
                request.Serialize(),
                auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(
                    a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateAcademicPromotionApplication(auth.Id);

            var serviceRecord =
                await _serviceRepository.GetOneAsync(
                    s => s.ApplicantId == auth.Id &&
                         s.PromotionApplicationId == application.Id);

            if (serviceRecord == null)
            {
                serviceRecord = new ServiceRecord
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantDepartmentId = application.ApplicantDepartmentId,
                    ApplicantSchoolId = application.ApplicantSchoolId,
                    ApplicantFacultyId = application.ApplicantFacultyId,
                    Status = ApplicationProgressStates.InProgress,
                };

                await _serviceRepository.AddAsync(serviceRecord);
            }

            await ProcessServices(request.Services, serviceRecord.Services);

            serviceRecord.UpdatedAt = DateTime.UtcNow;
            serviceRecord.UpdatedBy = $"{auth.FirstName} {auth.LastName}";

            var totalScore = CalculateOverallTotal(serviceRecord);
            serviceRecord.ApplicantPerformance = PerformanceComputationService.ComputeServicePerformance(totalScore);

            await _serviceRepository.UpdateAsync(serviceRecord);

            return new ServiceResponse
            {
                PerformanceLevel = serviceRecord.ApplicantPerformance,
                Services = serviceRecord.Services
                    .Select(MapServiceData)
                    .ToList()
            }.ToOkApiResponse("Service category updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<ServiceResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[UpdateServiceCategoryState] Failed By:{Auth}",
                auth.Serialize());

            return new ApiResponse<ServiceResponse>(
                "Failed to update service category",
                500);
        }
    }

    public static double CalculateOverallTotal(ServiceRecord request)
    {
        return request.Services.Sum(x => x.ApplicantScore) ?? 0;
    }

    // ========================= GET =========================

    public async Task<IApiResponse<ServiceResponse>> GetServiceCategoryState(
        AuthData auth, string?id = null)
    {
        try
        {
            _logger.LogInformation(
                "[GetServiceCategoryState] Fetching service records for {Auth}",
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

            if (application == null)
                return new ApiResponse<ServiceResponse>(
                    "No active promotion application found",
                    400);

            var serviceRecord =
                await _serviceRepository.GetOneAsync(
                    s => s.ApplicantId == auth.Id &&
                         s.PromotionApplicationId == application.Id);

            if (serviceRecord == null)
                return new ApiResponse<ServiceResponse>(
                    "No service records submitted yet",
                    400);

            return new ServiceResponse
            {
                PerformanceLevel = serviceRecord.ApplicantPerformance,
                Services = serviceRecord.Services
                    .Select(MapServiceData)
                    .ToList()
            }.ToOkApiResponse("Service category retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[GetServiceCategoryState] Failed for {Auth}",
                auth.Serialize());

            return new ApiResponse<ServiceResponse>(
                "Failed to retrieve service category",
                500);
        }
    }

    public async Task<IApiResponse<List<ServiceCategoryWithPositions>>> GetServiceCategoriesWithPositions()
    {
        try
        {
            var categories = await _serviceCategoryRepository.GetAllAsync();
            var positions = await _servicePositionRepository.GetAllAsync();

            var response = categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new ServiceCategoryWithPositions
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    RequiresDesignation = c.RequiresDesignation,
                    RequiresCommitteeName = c.RequiresCommitteeName,
                    ActingScoreMultiplier = c.ActingScoreMultiplier,
                    FullTimeScoreMultiplier = c.FullTimeScoreMultiplier,
                    DisplayOrder = c.DisplayOrder,
                    Positions = positions
                        .Where(p => p.CategoryId == c.Id)
                        .Select(p => new ServicePositionOption { Id = p.Id, Name = p.Name, Score = p.Score })
                        .ToList()
                }).ToList();

            return response.ToOkApiResponse("Service categories retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetServiceCategoriesWithPositions] Failed");
            return new ApiResponse<List<ServiceCategoryWithPositions>>("Failed to retrieve service categories", 500);
        }
    }

    // ========================= HELPERS =========================

    private async Task ProcessServices(
        List<ServiceRequestData> requests,
        List<ServiceRecordItem> existingList)
    {
        foreach (var req in requests)
        {
            if (string.IsNullOrWhiteSpace(req.ServicePositionId))
                continue;

            var servicePosition =
                await _servicePositionRepository.GetOneAsync(
                    x => x.Id == req.ServicePositionId);

            if (servicePosition == null)
                throw new InvalidOperationException($"Invalid service position {req.ServicePositionId}");

            var category =
                await _serviceCategoryRepository.GetOneAsync(
                    x => x.Id == servicePosition.CategoryId);

            if (category == null)
                throw new InvalidOperationException($"Invalid service category for position {req.ServicePositionId}");

            if (category.RequiresCommitteeName && string.IsNullOrWhiteSpace(req.CommitteeName))
                throw new InvalidOperationException($"Committee name is required for {category.Name}");

            bool? isActing = category.RequiresDesignation ? (req.IsActing ?? false) : null;
            var multiplier = category.RequiresDesignation
                ? (isActing == true ? category.ActingScoreMultiplier : category.FullTimeScoreMultiplier)
                : 1.0;
            var effectiveScore = servicePosition.Score * multiplier;

            var existing =
                existingList.FirstOrDefault(x => x.Id == req.Id);

            if (existing == null)
            {
                var evidence = await UploadServiceEvidence(req.Evidence);

                existingList.Add(new ServiceRecordItem
                {
                    ServicePositionId = servicePosition.Id,
                    CategoryId = category.Id,
                    CategoryName = category.Name,
                    PositionName = servicePosition.Name,
                    CommitteeName = category.RequiresCommitteeName ? req.CommitteeName : null,
                    IsActing = isActing,
                    SystemGeneratedScore = effectiveScore,
                    ApplicantScore = effectiveScore,
                    ApplicantRemarks = req.Remark,
                    SupportingEvidence = evidence
                });
            }
            else
            {
                // Remove evidence
                if (req.RemovedEvidence.Count != 0)
                {
                    var filesToRemove = req.RemovedEvidence
                        .Select(ImageFormatter.GetFileNameFromUrl)
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToList();
                    existing.SupportingEvidence =
                        existing.SupportingEvidence
                            .Where(x => !filesToRemove.Contains(x))
                            .ToList();
                }
                existing.ServicePositionId = servicePosition.Id;
                existing.CategoryId = category.Id;
                existing.CategoryName = category.Name;
                existing.PositionName = servicePosition.Name;
                existing.CommitteeName = category.RequiresCommitteeName ? req.CommitteeName : null;
                existing.IsActing = isActing;
                existing.SystemGeneratedScore = effectiveScore;
                existing.ApplicantScore = effectiveScore;
                existing.ApplicantRemarks = req.Remark;
                existing.UpdatedAt = DateTime.UtcNow;

                if (req.Evidence.Count == 0) continue;
                var newEvidence = await UploadServiceEvidence(req.Evidence);
                existing.SupportingEvidence.AddRange(newEvidence);
            }
        }
    }

    private ServiceResponseData MapServiceData(ServiceRecordItem data)
    {
        return new ServiceResponseData
        {
            Id = data.Id,
            ServicePositionId = data.ServicePositionId,
            CategoryId = data.CategoryId,
            CategoryName = data.CategoryName,
            PositionName = data.PositionName,
            CommitteeName = data.CommitteeName,
            IsActing = data.IsActing,
            Score = data.ApplicantScore ?? 0,
            SystemGeneratedScore = data.SystemGeneratedScore,
            Remark = data.ApplicantRemarks,
            Evidence = data.SupportingEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList()
        };
    }

    private async Task<List<string>> UploadServiceEvidence(
        List<IFormFile> files)
    {
        var uploaded = new List<string>();

        foreach (var file in files)
        {
            var extension = Path.GetExtension(file.FileName);
            var newFileName = $"{Guid.NewGuid():N}{extension}";
            var fileName = await _storageService.UploadFileAsync(
                file,
                newFileName);

            uploaded.Add(fileName);
        }

        return uploaded;
    }
}
