using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.NonAcademic;
using Umat.Osass.Admin.Api.Models.Requests.NonAcademic;
using Umat.Osass.Admin.Api.Models.Responses.NonAcademic;
using Umat.Osass.Admin.Api.Services.Interfaces.NonAcademic;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.NonAcademic;

public class NonAcademicPositionService : INonAcademicPositionService
{
    private readonly ILogger<NonAcademicPositionService> _logger;
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> _positionRepository;

    public NonAcademicPositionService(
        ILogger<NonAcademicPositionService> logger,
        INonAcademicPromotionPgRepository<NonAcademicPromotionPosition> positionRepository)
    {
        _logger = logger;
        _positionRepository = positionRepository;
    }

    public async Task<IApiResponse<NonAcademicPositionResponse>> Add(NonAcademicPositionRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add non-academic position with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());

            var existing = await _positionRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (existing != null)
                return new ApiResponse<NonAcademicPositionResponse>("Position with the same name already exists", 400);

            var newPosition = request.Adapt<NonAcademicPromotionPosition>();
            newPosition.CreatedAt = DateTime.UtcNow;
            newPosition.CreatedBy = auth.Name;

            var added = await _positionRepository.AddAsync(newPosition);
            var response = newPosition.Adapt<NonAcademicPositionResponse>();
            return added > 0
                ? response.ToOkApiResponse("Non-academic position added")
                : new ApiResponse<NonAcademicPositionResponse>("Position could not be added", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating non-academic position with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());
            return new ApiResponse<NonAcademicPositionResponse>("Failed to create position", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicPositionResponse>> Update(NonAcademicPositionRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update non-academic position with Id:{Id} by {Auth}", id, auth.Serialize());

            var position = await _positionRepository.GetByIdAsync(id);
            if (position == null)
                return new ApiResponse<NonAcademicPositionResponse>("Position does not exist", 400);

            position.Name = request.Name ?? position.Name;
            position.PerformanceCriteria = request.PerformanceCriteria ?? position.PerformanceCriteria;
            position.MinimumNumberOfYearsFromLastPromotion = request.MinimumNumberOfYearsFromLastPromotion ?? position.MinimumNumberOfYearsFromLastPromotion;
            position.PreviousPosition = request.PreviousPosition ?? position.PreviousPosition;
            position.MinimumNumberOfKnowledgeMaterials = request.MinimumNumberOfKnowledgeMaterials ?? position.MinimumNumberOfKnowledgeMaterials;
            position.MinimumNumberOfJournals = request.MinimumNumberOfJournals ?? position.MinimumNumberOfJournals;
            position.UnitType = request.UnitType ?? position.UnitType;
            position.UpdatedAt = DateTime.UtcNow;
            position.UpdatedBy = auth.Name;

            var updated = await _positionRepository.UpdateAsync(position);
            var response = position.Adapt<NonAcademicPositionResponse>();
            return updated > 0
                ? response.ToOkApiResponse("Position updated")
                : new ApiResponse<NonAcademicPositionResponse>("Position could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating non-academic position with Id:{Id} by {Auth}", id, auth.Serialize());
            return new ApiResponse<NonAcademicPositionResponse>("Failed to update position", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicPositionResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete non-academic position with Id:{Id} by {Auth}", id, auth.Serialize());

            var position = await _positionRepository.GetByIdAsync(id);
            if (position == null)
                return new ApiResponse<NonAcademicPositionResponse>("Position does not exist", 400);

            var deleted = await _positionRepository.Remove(position);
            return deleted > 0
                ? new ApiResponse<NonAcademicPositionResponse>("Position deleted", 200)
                : new ApiResponse<NonAcademicPositionResponse>("Position could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting non-academic position with Id:{Id}", id);
            return new ApiResponse<NonAcademicPositionResponse>("Failed to delete position", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicPositionResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get non-academic position with Id:{Id} by {Auth}", id, auth.Serialize());

            var position = await _positionRepository.GetByIdAsync(id);
            if (position == null)
                return new ApiResponse<NonAcademicPositionResponse>("Position does not exist", 400);

            var response = position.Adapt<NonAcademicPositionResponse>();
            return response.ToOkApiResponse("Position found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting non-academic position with Id:{Id}", id);
            return new ApiResponse<NonAcademicPositionResponse>("Failed to retrieve position", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<NonAcademicPositionResponse>>> GetPagedList(NonAcademicPositionFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to list non-academic positions with filter:{Filter} by {Auth}", filter.Serialize(), auth.Serialize());

            var query = _positionRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search))
                query = query.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));

            var positions = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();
            var response = positions.Adapt<List<NonAcademicPositionResponse>>();
            var pagedResult = new PagedResult<NonAcademicPositionResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("Positions retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error listing non-academic positions with filter:{Filter}", filter.Serialize());
            return new ApiResponse<PagedResult<NonAcademicPositionResponse>>("Failed to get positions list", 500);
        }
    }
}
