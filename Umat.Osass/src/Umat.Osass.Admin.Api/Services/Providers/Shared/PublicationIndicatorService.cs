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

public class PublicationIndicatorService:IPublicationIndicatorService
{
    private readonly ILogger<PublicationIndicatorService> _logger;
    private readonly IIdentityPgRepository<PublicationIndicator> _publicationIndicatorRepository;

    public PublicationIndicatorService(ILogger<PublicationIndicatorService> logger,IIdentityPgRepository<PublicationIndicator> publicationIndicatorRepository)
    {
        _logger = logger;
        _publicationIndicatorRepository = publicationIndicatorRepository;
    }

    public async Task<IApiResponse<PublicationIndicatorResponse>> Add(PublicationIndicatorRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add publicationIndicator with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var publicationIndicatorExist = await _publicationIndicatorRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (publicationIndicatorExist != null)
            {
                return new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator with the same name already exists",400);
            }
            var newPublicationIndicator = request.Adapt<PublicationIndicator>();
            newPublicationIndicator.CreatedAt = DateTime.UtcNow;
            var added = await _publicationIndicatorRepository.AddAsync(newPublicationIndicator);
            var response = newPublicationIndicator.Adapt<PublicationIndicatorResponse>();
            return added > 0 ? response.ToOkApiResponse("PublicationIndicator added") : new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new publicationIndicator with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<PublicationIndicatorResponse>("Failed to create new publicationIndicator",500);
        }
    }

    public async Task<IApiResponse<PublicationIndicatorResponse>> Update(PublicationIndicatorRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update publicationIndicator with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var publicationIndicatorExist = await _publicationIndicatorRepository.GetByIdAsync(id);
            if (publicationIndicatorExist == null)
            {
                return new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator does not exist",400);
            }
            // Update the existing tracked entity instead of creating a new one
            publicationIndicatorExist.Name = request.Name;
            publicationIndicatorExist.Score = request.Score;
            publicationIndicatorExist.ScoreForPresentation = request.ScoreForPresentation;
            publicationIndicatorExist.UpdatedAt = DateTime.UtcNow;
            publicationIndicatorExist.UpdatedBy = auth.Name;
            var updated = await _publicationIndicatorRepository.UpdateAsync(publicationIndicatorExist);
            var response = publicationIndicatorExist.Adapt<PublicationIndicatorResponse>();
            return updated > 0 ? response.ToOkApiResponse("PublicationIndicator updated") : new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new publicationIndicator with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<PublicationIndicatorResponse>("Failed to update publicationIndicator",500);
        }
    }

    public async Task<IApiResponse<PublicationIndicatorResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete publicationIndicator with Id: {Id} by {Auth}",id,auth.Serialize());
            var publicationIndicatorExist = await _publicationIndicatorRepository.GetByIdAsync(id);
            if (publicationIndicatorExist == null)
            {
                return new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator does not exist",400);
            }
            
            var deleted = await _publicationIndicatorRepository.Remove(publicationIndicatorExist);
            return deleted > 0 ? new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator deleted",200) : new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new publicationIndicator with Id: {Id}", id);
            return new ApiResponse<PublicationIndicatorResponse>("Failed to delete publicationIndicator",500);
        }
    }

    public async Task<IApiResponse<PublicationIndicatorResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get publicationIndicator with Id: {Id} by {Auth}",id,auth.Serialize());
            var publicationIndicatorExist = await _publicationIndicatorRepository.GetByIdAsync(id);
            if (publicationIndicatorExist == null)
            {
                return new ApiResponse<PublicationIndicatorResponse>("PublicationIndicator does not exist",400);
            }
            
            var response = publicationIndicatorExist.Adapt<PublicationIndicatorResponse>();
            return response.ToOkApiResponse("PublicationIndicator found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a publicationIndicator with id: {Id}",id);
            return new ApiResponse<PublicationIndicatorResponse>("Failed to retrieve publicationIndicator",500);
        }
    }

    public async Task<IApiResponse<PagedResult<PublicationIndicatorResponse>>> GetPagedList(PublicationIndicatorFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of publicationIndicators with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var publicationIndicatorQuery = _publicationIndicatorRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                publicationIndicatorQuery = publicationIndicatorQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var publicationIndicators = await publicationIndicatorQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await publicationIndicatorQuery.CountAsync();
            var response = publicationIndicators.Adapt<List<PublicationIndicatorResponse>>();

            var pagedResult = new PagedResult<PublicationIndicatorResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("PublicationIndicators retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of publicationIndicators with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<PublicationIndicatorResponse>>("Failed to get publicationIndicators list",500);
        }
    }
}