using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.Shared;
using Umat.Osass.Admin.Api.Models.Requests.Shared;
using Umat.Osass.Admin.Api.Models.Responses.Shared;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.Shared;

public class KnowledgeMaterialIndicatorService : IKnowledgeMaterialIndicatorService
{
    private readonly ILogger<KnowledgeMaterialIndicatorService> _logger;
    private readonly IIdentityPgRepository<KnowledgeMaterialIndicator> _repository;

    public KnowledgeMaterialIndicatorService(
        ILogger<KnowledgeMaterialIndicatorService> logger,
        IIdentityPgRepository<KnowledgeMaterialIndicator> repository)
    {
        _logger = logger;
        _repository = repository;
    }

    public async Task<IApiResponse<KnowledgeMaterialIndicatorResponse>> Add(KnowledgeMaterialIndicatorRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Add KnowledgeMaterialIndicator: {Request} by {Auth}", request.Serialize(), auth.Serialize());
            var exists = await _repository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (exists != null)
                return new ApiResponse<KnowledgeMaterialIndicatorResponse>("A knowledge material indicator with the same name already exists", 400);

            var entity = request.Adapt<KnowledgeMaterialIndicator>();
            entity.CreatedAt = DateTime.UtcNow;
            var added = await _repository.AddAsync(entity);
            var response = entity.Adapt<KnowledgeMaterialIndicatorResponse>();
            return added > 0
                ? response.ToOkApiResponse("Knowledge material indicator added")
                : new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator could not be added", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error adding KnowledgeMaterialIndicator: {Request} by {Auth}", request.Serialize(), auth.Serialize());
            return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Failed to add knowledge material indicator", 500);
        }
    }

    public async Task<IApiResponse<KnowledgeMaterialIndicatorResponse>> Update(KnowledgeMaterialIndicatorRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Update KnowledgeMaterialIndicator {Id}: {Request} by {Auth}", id, request.Serialize(), auth.Serialize());
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator not found", 400);

            entity.Name = request.Name;
            entity.Score = request.Score;
            entity.ScoreForPresentation = request.ScoreForPresentation;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = auth.Name;
            var updated = await _repository.UpdateAsync(entity);
            var response = entity.Adapt<KnowledgeMaterialIndicatorResponse>();
            return updated > 0
                ? response.ToOkApiResponse("Knowledge material indicator updated")
                : new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating KnowledgeMaterialIndicator {Id} by {Auth}", id, auth.Serialize());
            return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Failed to update knowledge material indicator", 500);
        }
    }

    public async Task<IApiResponse<KnowledgeMaterialIndicatorResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Delete KnowledgeMaterialIndicator {Id} by {Auth}", id, auth.Serialize());
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator not found", 400);

            var deleted = await _repository.Remove(entity);
            return deleted > 0
                ? new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator deleted", 200)
                : new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting KnowledgeMaterialIndicator {Id}", id);
            return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Failed to delete knowledge material indicator", 500);
        }
    }

    public async Task<IApiResponse<KnowledgeMaterialIndicatorResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Get KnowledgeMaterialIndicator {Id} by {Auth}", id, auth.Serialize());
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Knowledge material indicator not found", 400);

            var response = entity.Adapt<KnowledgeMaterialIndicatorResponse>();
            return response.ToOkApiResponse("Knowledge material indicator found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting KnowledgeMaterialIndicator {Id}", id);
            return new ApiResponse<KnowledgeMaterialIndicatorResponse>("Failed to retrieve knowledge material indicator", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<KnowledgeMaterialIndicatorResponse>>> GetPagedList(KnowledgeMaterialIndicatorFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("List KnowledgeMaterialIndicators filter:{Filter} by:{Auth}", filter.Serialize(), auth.Serialize());
            var query = _repository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search))
                query = query.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();
            var response = items.Adapt<List<KnowledgeMaterialIndicatorResponse>>();
            var pagedResult = new PagedResult<KnowledgeMaterialIndicatorResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);
            return pagedResult.ToOkApiResponse("Knowledge material indicators retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error listing KnowledgeMaterialIndicators filter:{Filter}", filter.Serialize());
            return new ApiResponse<PagedResult<KnowledgeMaterialIndicatorResponse>>("Failed to retrieve knowledge material indicators", 500);
        }
    }
}
