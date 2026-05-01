using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Academic;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.Academic;

public class StaffUpdateService : IStaffUpdateService
{
    private readonly ILogger<StaffUpdateService> _logger;
    private readonly IIdentityPgRepository<StaffUpdate> _staffUpdateRepository;

    public StaffUpdateService(
        ILogger<StaffUpdateService> logger,
        IIdentityPgRepository<StaffUpdate> staffUpdateRepository)
    {
        _logger = logger;
        _staffUpdateRepository = staffUpdateRepository;
    }

    public async Task<IApiResponse<StaffUpdateResponse>> Add(StaffUpdateRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add staff update by {Auth}", auth.Serialize());

            var entity = request.Adapt<StaffUpdate>();
            entity.CreatedAt = DateTime.UtcNow;
            entity.PublishedAt = entity.IsVisible ? DateTime.UtcNow : null;

            var added = await _staffUpdateRepository.AddAsync(entity);
            var response = entity.Adapt<StaffUpdateResponse>();

            return added > 0
                ? response.ToOkApiResponse("Staff update created")
                : new ApiResponse<StaffUpdateResponse>("Staff update could not be created", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating staff update");
            return new ApiResponse<StaffUpdateResponse>("Failed to create staff update", 500);
        }
    }

    public async Task<IApiResponse<StaffUpdateResponse>> Update(StaffUpdateRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update staff update {Id} by {Auth}", id, auth.Serialize());

            var existing = await _staffUpdateRepository.GetByIdAsync(id);
            if (existing == null)
                return new ApiResponse<StaffUpdateResponse>("Staff update not found", 404);

            var updated = request.Adapt<StaffUpdate>();
            updated.Id = id;
            updated.CreatedAt = existing.CreatedAt;
            updated.CreatedBy = existing.CreatedBy;
            updated.UpdatedAt = DateTime.UtcNow;
            updated.UpdatedBy = auth.Name;
            updated.PublishedAt = existing.PublishedAt;

            if (updated.IsVisible && existing.PublishedAt == null)
                updated.PublishedAt = DateTime.UtcNow;

            var result = await _staffUpdateRepository.UpdateAsync(updated);
            var response = updated.Adapt<StaffUpdateResponse>();

            return result > 0
                ? response.ToOkApiResponse("Staff update updated")
                : new ApiResponse<StaffUpdateResponse>("Staff update could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating staff update {Id}", id);
            return new ApiResponse<StaffUpdateResponse>("Failed to update staff update", 500);
        }
    }

    public async Task<IApiResponse<StaffUpdateResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete staff update {Id} by {Auth}", id, auth.Serialize());

            var existing = await _staffUpdateRepository.GetByIdAsync(id);
            if (existing == null)
                return new ApiResponse<StaffUpdateResponse>("Staff update not found", 404);

            var deleted = await _staffUpdateRepository.Remove(existing);
            return deleted > 0
                ? new ApiResponse<StaffUpdateResponse>("Staff update deleted", 200)
                : new ApiResponse<StaffUpdateResponse>("Staff update could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting staff update {Id}", id);
            return new ApiResponse<StaffUpdateResponse>("Failed to delete staff update", 500);
        }
    }

    public async Task<IApiResponse<StaffUpdateResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            var existing = await _staffUpdateRepository.GetByIdAsync(id);
            if (existing == null)
                return new ApiResponse<StaffUpdateResponse>("Staff update not found", 404);

            var response = existing.Adapt<StaffUpdateResponse>();
            return response.ToOkApiResponse("Staff update found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting staff update {Id}", id);
            return new ApiResponse<StaffUpdateResponse>("Failed to retrieve staff update", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<StaffUpdateResponse>>> GetPagedList(StaffUpdateFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve staff updates by {Auth}", auth.Serialize());

            var query = _staffUpdateRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(x =>
                    x.Title.ToLower().Contains(search) ||
                    x.Category.ToLower().Contains(search));
            }

            if (!string.IsNullOrEmpty(filter.Category))
                query = query.Where(x => x.Category == filter.Category);

            if (filter.IsVisible.HasValue)
                query = query.Where(x => x.IsVisible == filter.IsVisible.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var responseList = items.Adapt<List<StaffUpdateResponse>>();
            var pagedResult = new PagedResult<StaffUpdateResponse>(responseList, filter.Page, filter.PageSize, responseList.Count, totalCount);

            return pagedResult.ToOkApiResponse("Staff updates retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting staff updates list");
            return new ApiResponse<PagedResult<StaffUpdateResponse>>("Failed to get staff updates", 500);
        }
    }

    public async Task<IApiResponse<StaffUpdateResponse>> ToggleVisibility(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to toggle visibility for staff update {Id} by {Auth}", id, auth.Serialize());

            var existing = await _staffUpdateRepository.GetByIdAsync(id);
            if (existing == null)
                return new ApiResponse<StaffUpdateResponse>("Staff update not found", 404);

            existing.IsVisible = !existing.IsVisible;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = auth.Name;

            if (existing.IsVisible && existing.PublishedAt == null)
                existing.PublishedAt = DateTime.UtcNow;

            var result = await _staffUpdateRepository.UpdateAsync(existing);
            var response = existing.Adapt<StaffUpdateResponse>();

            return result > 0
                ? response.ToOkApiResponse(existing.IsVisible ? "Staff update is now visible" : "Staff update is now hidden")
                : new ApiResponse<StaffUpdateResponse>("Could not toggle visibility", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error toggling visibility for staff update {Id}", id);
            return new ApiResponse<StaffUpdateResponse>("Failed to toggle visibility", 500);
        }
    }
}
