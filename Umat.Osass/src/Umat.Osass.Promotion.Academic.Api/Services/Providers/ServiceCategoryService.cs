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
    private readonly IStorageService _storageService;
    private readonly ILogger<ServiceCategoryService> _logger;

    public ServiceCategoryService(
        IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository,
        IApplicationService applicationService,
        IAcademicPromotionPgRepository<ServiceRecord> serviceRepository,
        IIdentityPgRepository<ServicePosition> servicePositionRepository,
        IStorageService storageService,
        ILogger<ServiceCategoryService> logger)
    {
        _applicationRepository = applicationRepository;
        _applicationService = applicationService;
        _serviceRepository = serviceRepository;
        _servicePositionRepository = servicePositionRepository;
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

            await ProcessServiceList(
                request.UniversityCommunity,
                serviceRecord.ServiceToTheUniversity);

            await ProcessServiceList(
                request.NationalInternationalCommunity,
                serviceRecord.ServiceToNationalAndInternational);

            serviceRecord.UpdatedAt = DateTime.UtcNow;
            serviceRecord.UpdatedBy = $"{auth.FirstName} {auth.LastName}";
            
            var totalScore = CalculateOverallTotal(serviceRecord);
            serviceRecord.ApplicantPerformance = PerformanceComputationService.ComputeServicePerformance(totalScore);

            await _serviceRepository.UpdateAsync(serviceRecord);

            return new ServiceResponse
            {PerformanceLevel = serviceRecord.ApplicantPerformance,
                UniversityCommunity = serviceRecord.ServiceToTheUniversity
                    .Select(MapServiceData)
                    .ToList(),

                NationalInternationalCommunity = serviceRecord.ServiceToNationalAndInternational
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
    
    public static double CalculateUniversityTotal(
        ServiceRecord request)
    {
        return request.ServiceToTheUniversity.Sum(x => x.ApplicantScore) ?? 0;
    }

    public static double CalculateNationalInternationalTotal(ServiceRecord request)
    {
        return request.ServiceToNationalAndInternational?.Sum(x => x.ApplicantScore) ?? 0;
    }

    public static double CalculateOverallTotal(ServiceRecord request)
    {
        return CalculateUniversityTotal(request) +
               CalculateNationalInternationalTotal(request);
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
                UniversityCommunity = serviceRecord.ServiceToTheUniversity
                    .Select(MapServiceData)
                    .ToList(),

                NationalInternationalCommunity = serviceRecord.ServiceToNationalAndInternational
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

    public async Task<IApiResponse<List<ServicePositionResponse>>> GetServicePositions()
    {
        try
        {
            var positions = await _servicePositionRepository.GetAllAsync();
            var response = positions.Select(p => new ServicePositionResponse
            {
                Id = p.Id,
                Name = p.Name,
                ServiceType = p.ServiceType.ToString(),
                Score = p.Score
            }).ToList();

            return response.ToOkApiResponse("Service positions retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetServicePositions] Failed");
            return new ApiResponse<List<ServicePositionResponse>>("Failed to retrieve service positions", 500);
        }
    }

    // ========================= HELPERS =========================

    private async Task ProcessServiceList(
        List<ServiceRequestData> requests,
        List<ServiceRecordsData> existingList)
    {
        foreach (var req in requests)
        {
            if (string.IsNullOrWhiteSpace(req.ServiceTypeId))
                continue;

            var servicePosition =
                await _servicePositionRepository.GetOneAsync(
                    x => x.Id == req.ServiceTypeId);

            if (servicePosition == null)
                throw new Exception($"Invalid service type {req.ServiceTypeId}");
            if (servicePosition.Score < req.Score)
            {
                req.Score = servicePosition.Score;
            }
            var effectiveScore = req.IsActing ? req.Score * 0.5 : req.Score;

            var existing =
                existingList.FirstOrDefault(x => x.Id == req.Id);

            if (existing == null)
            {
                var evidence = await UploadServiceEvidence(req.Evidence);

                existingList.Add(new ServiceRecordsData
                {
                    ServiceTitle = req.ServiceTitle,
                    Role = req.Role,
                    Duration = req.Duration,
                    ApplicantScore = effectiveScore,
                    ApplicantRemarks = req.Remark,
                    SupportingEvidence = evidence,
                    SystemGeneratedScore = servicePosition.Score,
                    ServiceTypeId = servicePosition.Id,
                    IsActing = req.IsActing
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
                existing.ServiceTitle = req.ServiceTitle;
                existing.Role = req.Role;
                existing.Duration = req.Duration;
                existing.ApplicantScore = effectiveScore;
                existing.ApplicantRemarks = req.Remark;
                existing.SystemGeneratedScore = servicePosition.Score;
                existing.ServiceTypeId = servicePosition.Id;
                existing.IsActing = req.IsActing;
                existing.UpdatedAt = DateTime.UtcNow;

                if (req.Evidence.Count == 0) continue;
                var newEvidence = await UploadServiceEvidence(req.Evidence);
                existing.SupportingEvidence.AddRange(newEvidence);
            }
        }
    }

    private ServiceResponseData MapServiceData(ServiceRecordsData data)
    {
        return new ServiceResponseData
        {
            Id = data.Id,
            ServiceTitle = data.ServiceTitle,
            ServiceTypeId = data.ServiceTypeId??string.Empty,
            SystemGeneratedScore = data.SystemGeneratedScore ?? 0,
            Role = data.Role,
            Duration = data.Duration,
            Score = data.ApplicantScore ?? 0,
            Remark = data.ApplicantRemarks,
            IsActing = data.IsActing,
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
