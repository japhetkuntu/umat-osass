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

public class PublicationCategoryService : IPublicationCategoryService
{
    private readonly IAcademicPromotionPgRepository<AcademicPromotionApplication> _applicationRepository;
    private readonly IApplicationService _applicationService;
    private readonly IIdentityPgRepository<PublicationIndicator> _indicatorRepository;
    private readonly ILogger<PublicationCategoryService> _logger;
    private readonly IAcademicPromotionPgRepository<Publication> _publicationRepository;
    private readonly IStorageService _storageService;

    public PublicationCategoryService(IAcademicPromotionPgRepository<AcademicPromotionApplication> applicationRepository, IApplicationService applicationService, IIdentityPgRepository<PublicationIndicator> indicatorRepository, ILogger<PublicationCategoryService> logger, IAcademicPromotionPgRepository<Publication> publicationRepository, IStorageService storageService)
    {
        _applicationRepository = applicationRepository;
        _applicationService = applicationService;
        _indicatorRepository = indicatorRepository;
        _logger = logger;
        _publicationRepository = publicationRepository;
        _storageService = storageService;
    }

    public async Task<IApiResponse<PublicationResponse>> UpdatePublicationCategoryState(
        AuthData auth,
        UpdatePublicationRequest request)
    {
        try
        {
            _logger.LogInformation(
                "[UpdatePublicationCategoryState] Request:{Request} By:{Auth}",
                request.Serialize(),
                auth.Serialize());

            var application =
                await _applicationRepository.GetOneAsync(a => a.IsActive && a.ApplicantId == auth.Id)
                ?? await _applicationService.CreateAcademicPromotionApplication(auth.Id);

            var publication =
                await _publicationRepository.GetOneAsync(p => p.ApplicantId == auth.Id &&
                                                              p.PromotionApplicationId == application.Id);

            if (publication == null)
            {
                publication = new Publication
                {
                    CreatedBy = $"{auth.FirstName} {auth.LastName}",
                    PromotionApplicationId = application.Id,
                    PromotionPositionId = application.PromotionPositionId,
                    ApplicantId = auth.Id,
                    ApplicantDepartmentId = application.ApplicantDepartmentId,
                    ApplicantSchoolId = application.ApplicantSchoolId,
                    ApplicantFacultyId = application.ApplicantFacultyId,
                    Status = ApplicationProgressStates.InProgress
                };

                await _publicationRepository.AddAsync(publication);
            }
            
      

            foreach (var req in request.Publications)
            {
                var indicator = await _indicatorRepository.GetOneAsync(x => x.Id == req.PublicationTypeId);

                if (indicator == null)
                    throw new Exception($"Invalid publication type {req.PublicationTypeId}");

                var maxScore = indicator.Score;
                if (maxScore < req.Score)
                {
                    req.Score = maxScore;
                }

                var existing = publication.Publications
                    .FirstOrDefault(x => x.Id == req.Id);

                if (existing == null)
                {
                    var evidence = await UploadPublicationEvidence(req.Evidence);
                    var presentationEvidence = await UploadPublicationEvidence(req.PresentationEvidence);

                    var newPub = new PublicationData
                    {
                        Title = req.Title,
                        Year = req.Year,
                        PublicationTypeId = indicator.Id,
                        PublicationTypeName = indicator.Name,
                        SystemGeneratedScore = indicator.Score + (req.IsPresented ? indicator.ScoreForPresentation : 0),
                        ApplicantScore = req.Score,
                        ApplicantRemarks = req.Remark,
                        SupportingEvidence = evidence,
                        IsPresented = req.IsPresented,
                        PresentationBonus = req.IsPresented
                            ? (indicator.ScoreForPresentation > 0 ? indicator.ScoreForPresentation : PresentationBonusFallback)
                            : 0,
                        PresentationEvidence = presentationEvidence
                    };
                    req.Id = newPub.Id;
                    publication.Publications.Add(newPub);
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
                    existing.Title = req.Title;
                    existing.Year = req.Year;
                    existing.PublicationTypeId = indicator.Id;
                    existing.PublicationTypeName = indicator.Name;
                    existing.SystemGeneratedScore = indicator.Score + (req.IsPresented ? indicator.ScoreForPresentation : 0);
                    existing.ApplicantScore = req.Score;
                    existing.ApplicantRemarks = req.Remark;
                    existing.IsPresented = req.IsPresented;
                    existing.PresentationBonus = req.IsPresented
                        ? (indicator.ScoreForPresentation > 0 ? indicator.ScoreForPresentation : PresentationBonusFallback)
                        : 0;
                    existing.UpdatedAt = DateTime.UtcNow;

                    // Remove presentation evidence files
                    if (req.RemovedPresentationEvidence.Count != 0)
                    {
                        var filesToRemove = req.RemovedPresentationEvidence
                            .Select(ImageFormatter.GetFileNameFromUrl)
                            .Where(x => !string.IsNullOrWhiteSpace(x))
                            .ToList();
                        existing.PresentationEvidence =
                            existing.PresentationEvidence
                                .Where(x => !filesToRemove.Contains(x))
                                .ToList();
                    }

                    if (req.PresentationEvidence.Count != 0)
                    {
                        var newPresentationEvidence = await UploadPublicationEvidence(req.PresentationEvidence);
                        existing.PresentationEvidence.AddRange(newPresentationEvidence);
                    }

                    if (req.Evidence.Count == 0) continue;
                    var newEvidence = await UploadPublicationEvidence(req.Evidence);
                    existing.SupportingEvidence.AddRange(newEvidence);
                }
            }
            
            var existingIds = request.Publications.Select(p => p.Id).ToList();
            // Keep only publications that are in the valid list (removes deleted ones)
            publication.Publications = publication.Publications
                .Where(p => existingIds.Contains(p.Id))
                .ToList();
            publication.UpdatedAt = DateTime.UtcNow;
            publication.UpdatedBy = $"{auth.FirstName} {auth.LastName}";
            var totalScore = CalculateTotalScore(publication);
            publication.ApplicantPerformance = PerformanceComputationService.ComputePerformanceForPublications(totalScore);

            await _publicationRepository.UpdateAsync(publication);

            var response = new PublicationResponse
            {
                PerformanceLevel = publication.ApplicantPerformance,
                Publications = publication.Publications
                    .Select(MapPublicationData)
                    .ToList()
            };

            return response.ToOkApiResponse("Publication category updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<PublicationResponse>(ex.Message, 400);
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[UpdatePublicationCategoryState] Failed By:{Auth}",
                auth.Serialize());

            return new ApiResponse<PublicationResponse>(
                "Failed to update publication category",
                500);
        }
    }
    
    private const double PresentationBonusFallback = 2;

    public static double CalculateTotalScore(Publication request)
    {
        return request.Publications.Sum(p =>
            (p.ApplicantScore ?? 0) +
            (p.IsPresented && p.PresentationEvidence.Count > 0
                ? (p.PresentationBonus > 0 ? p.PresentationBonus : PresentationBonusFallback)
                : 0));
    }

    public async Task<IApiResponse<PublicationResponse>> GetPublicationCategoryState(
        AuthData auth, 
        string? id=null
        )
    {
        try
        {
            _logger.LogInformation(
                "[GetPublicationCategoryState] Fetching publications for {Auth}",
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
                return new ApiResponse<PublicationResponse>(
                    "No active promotion application found", 400);

            var publication = await _publicationRepository.GetOneAsync(p => p.ApplicantId == auth.Id &&
                                                                            p.PromotionApplicationId == application.Id);

            if (publication == null)
                return new ApiResponse<PublicationResponse>(
                    "No publications submitted yet", 400);

            return
                new PublicationResponse
                { PerformanceLevel = publication.ApplicantPerformance,
                    Publications = publication.Publications
                        .Select(MapPublicationData)
                        .ToList()
                }.ToOkApiResponse("Publication category retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "[GetPublicationCategoryState] Failed for {Auth}",
                auth.Serialize());

            return new ApiResponse<PublicationResponse>(
                "Failed to retrieve publication category",
                500);
        }
    }
    private PublicationResponseData MapPublicationData(PublicationData data)
    {
        return new PublicationResponseData
        {
            Id = data.Id,
            Title = data.Title,
            Year = data.Year,
            Score = data.SystemGeneratedScore,
            ApplicantScore = data.ApplicantScore ?? 0,
            PublicationTypeId = data.PublicationTypeId,
            Remark = data.ApplicantRemarks,
            IsPresented = data.IsPresented,
            PresentationEvidence = data.PresentationEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList(),
            Evidence = data.SupportingEvidence
                .Select(x => _storageService.GetFileUrl(x))
                .ToList()
        };
    }

    private async Task<List<string>> UploadPublicationEvidence(List<IFormFile> files)
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

    public async Task<IApiResponse<List<PublicationIndicatorResponse>>> GetPublicationIndicators()
    {
        try
        {
            var indicators = await _indicatorRepository.GetAllAsync();
            var response = indicators
                .Select(x => new PublicationIndicatorResponse
                {
                    Id = x.Id,
                    Name = x.Name,
                    Score = x.Score,
                    ScoreForPresentation = x.ScoreForPresentation
                }).ToList();

            return response.ToOkApiResponse("Publication indicators retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetPublicationIndicators] Failed");
            return new ApiResponse<List<PublicationIndicatorResponse>>("Failed to retrieve publication indicators", 500);
        }
    }
}