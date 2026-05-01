using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Models.Filter;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Services.Providers;

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

    public async Task<IApiResponse<PgPagedResult<StaffUpdateResponse>>> GetVisibleUpdates(StaffUpdateFilter filter)
    {
        try
        {
            var query = _staffUpdateRepository.GetQueryableAsync()
                .Where(x => x.IsVisible);

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(x =>
                    x.Title.ToLower().Contains(search) ||
                    x.Category.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var responseList = items.Adapt<List<StaffUpdateResponse>>();
            var pagedResult = new PgPagedResult<StaffUpdateResponse>(responseList, filter.Page, filter.PageSize, responseList.Count, totalCount);

            return pagedResult.ToOkApiResponse("Staff updates retrieved");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting visible staff updates");
            return new ApiResponse<PgPagedResult<StaffUpdateResponse>>("Failed to get staff updates", 500);
        }
    }

    public async Task<IApiResponse<StaffUpdateResponse>> GetById(string id)
    {
        try
        {
            var entity = await _staffUpdateRepository.GetOneAsync(x => x.Id == id && x.IsVisible);
            if (entity == null)
                return new ApiResponse<StaffUpdateResponse>("Staff update not found", 404);

            var response = entity.Adapt<StaffUpdateResponse>();
            return response.ToOkApiResponse("Staff update found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting staff update {Id}", id);
            return new ApiResponse<StaffUpdateResponse>("Failed to retrieve staff update", 500);
        }
    }
}
