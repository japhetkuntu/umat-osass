using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Academic;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.Academic;

public class AcademicPositionService:IAcademicPositionService
{
    private readonly ILogger<AcademicPositionService> _logger;
    private readonly IAcademicPromotionPgRepository<AcademicPromotionPosition> _academicPositionRepository;

    public AcademicPositionService(ILogger<AcademicPositionService> logger,IAcademicPromotionPgRepository<AcademicPromotionPosition> academicPositionRepository)
    {
        _logger = logger;
        _academicPositionRepository = academicPositionRepository;
    }

    public async Task<IApiResponse<AcademicPositionResponse>> Add(AcademicPositionRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add academicPosition with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var academicPositionExist = await _academicPositionRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (academicPositionExist != null)
            {
                return new ApiResponse<AcademicPositionResponse>("AcademicPosition with the same name already exists",400);
            }
            var newAcademicPosition = request.Adapt<AcademicPromotionPosition>();
            newAcademicPosition.CreatedAt = DateTime.UtcNow;
            var added = await _academicPositionRepository.AddAsync(newAcademicPosition);
            var response = newAcademicPosition.Adapt<AcademicPositionResponse>();
            return added > 0 ? response.ToOkApiResponse("AcademicPosition added") : new ApiResponse<AcademicPositionResponse>("AcademicPosition could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new academicPosition with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<AcademicPositionResponse>("Failed to create new academicPosition",500);
        }
    }

    public async Task<IApiResponse<AcademicPositionResponse>> Update(AcademicPositionRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update academicPosition with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var academicPositionExist = await _academicPositionRepository.GetByIdAsync(id);
            if (academicPositionExist == null)
            {
                return new ApiResponse<AcademicPositionResponse>("AcademicPosition does not exist",400);
            }
            academicPositionExist.MinimumNumberOfPublications=request.MinimumNumberOfPublications??academicPositionExist.MinimumNumberOfPublications;
            academicPositionExist.MinimumNumberOfRefereedJournal=request.MinimumNumberOfRefereedJournal??academicPositionExist.MinimumNumberOfRefereedJournal;
             academicPositionExist.MinimumNumberOfYearsFromLastPromotion=request.MinimumNumberOfYearsFromLastPromotion??academicPositionExist.MinimumNumberOfYearsFromLastPromotion;
             academicPositionExist.Name=request.Name??academicPositionExist.Name;
             academicPositionExist.PerformanceCriteria=request.PerformanceCriteria??academicPositionExist.PerformanceCriteria;
             academicPositionExist.PreviousPosition = request.PreviousPosition??academicPositionExist.PreviousPosition;
             academicPositionExist.UpdatedAt = DateTime.UtcNow;
             academicPositionExist.UpdatedBy = auth.Name;
            var updated = await _academicPositionRepository.UpdateAsync(academicPositionExist);
            var response = academicPositionExist.Adapt<AcademicPositionResponse>();
            return updated > 0 ? response.ToOkApiResponse("AcademicPosition updated") : new ApiResponse<AcademicPositionResponse>("AcademicPosition could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new academicPosition with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<AcademicPositionResponse>("Failed to update academicPosition",500);
        }
    }

    public async Task<IApiResponse<AcademicPositionResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete academicPosition with Id: {Id} by {Auth}",id,auth.Serialize());
            var academicPositionExist = await _academicPositionRepository.GetByIdAsync(id);
            if (academicPositionExist == null)
            {
                return new ApiResponse<AcademicPositionResponse>("AcademicPosition does not exist",400);
            }
            
            var deleted = await _academicPositionRepository.Remove(academicPositionExist);
            return deleted > 0 ? new ApiResponse<AcademicPositionResponse>("AcademicPosition deleted",200) : new ApiResponse<AcademicPositionResponse>("AcademicPosition could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new academicPosition with Id: {Id}", id);
            return new ApiResponse<AcademicPositionResponse>("Failed to delete academicPosition",500);
        }
    }

    public async Task<IApiResponse<AcademicPositionResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get academicPosition with Id: {Id} by {Auth}",id,auth.Serialize());
            var academicPositionExist = await _academicPositionRepository.GetByIdAsync(id);
            if (academicPositionExist == null)
            {
                return new ApiResponse<AcademicPositionResponse>("AcademicPosition does not exist",400);
            }
            
            var response = academicPositionExist.Adapt<AcademicPositionResponse>();
            return response.ToOkApiResponse("AcademicPosition found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a academicPosition with id: {Id}",id);
            return new ApiResponse<AcademicPositionResponse>("Failed to retrieve academicPosition",500);
        }
    }

    public async Task<IApiResponse<PagedResult<AcademicPositionResponse>>> GetPagedList(AcademicPositionFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of academicPositions with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var academicPositionQuery = _academicPositionRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                academicPositionQuery = academicPositionQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var academicPositions = await academicPositionQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await academicPositionQuery.CountAsync();
            var response = academicPositions.Adapt<List<AcademicPositionResponse>>();

            var pagedResult = new PagedResult<AcademicPositionResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("AcademicPositions retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of academicPositions with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<AcademicPositionResponse>>("Failed to get academicPositions list",500);
        }
    }
}