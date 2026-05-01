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

public class ServicePositionService:IServicePositionService
{
    private readonly ILogger<ServicePositionService> _logger;
    private readonly IIdentityPgRepository<ServicePosition> _servicePositionRepository;

    public ServicePositionService(ILogger<ServicePositionService> logger,IIdentityPgRepository<ServicePosition> servicePositionRepository)
    {
        _logger = logger;
        _servicePositionRepository = servicePositionRepository;
    }

    public async Task<IApiResponse<ServicePositionResponse>> Add(ServicePositionRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add servicePosition with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var servicePositionExist = await _servicePositionRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (servicePositionExist != null)
            {
                return new ApiResponse<ServicePositionResponse>("ServicePosition with the same name already exists",400);
            }
            var newServicePosition = request.Adapt<ServicePosition>();
            newServicePosition.CreatedAt = DateTime.UtcNow;
            var added = await _servicePositionRepository.AddAsync(newServicePosition);
            var response = newServicePosition.Adapt<ServicePositionResponse>();
            return added > 0 ? response.ToOkApiResponse("ServicePosition added") : new ApiResponse<ServicePositionResponse>("ServicePosition could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new servicePosition with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<ServicePositionResponse>("Failed to create new servicePosition",500);
        }
    }

    public async Task<IApiResponse<ServicePositionResponse>> Update(ServicePositionRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update servicePosition with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var servicePositionExist = await _servicePositionRepository.GetByIdAsync(id);
            if (servicePositionExist == null)
            {
                return new ApiResponse<ServicePositionResponse>("ServicePosition does not exist",400);
            }
            // Update the existing tracked entity instead of creating a new one
            servicePositionExist.Name = request.Name;
            servicePositionExist.UpdatedAt = DateTime.UtcNow;
            servicePositionExist.UpdatedBy = auth.Name;
            var updated = await _servicePositionRepository.UpdateAsync(servicePositionExist);
            var response = servicePositionExist.Adapt<ServicePositionResponse>();
            return updated > 0 ? response.ToOkApiResponse("ServicePosition updated") : new ApiResponse<ServicePositionResponse>("ServicePosition could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new servicePosition with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<ServicePositionResponse>("Failed to update servicePosition",500);
        }
    }

    public async Task<IApiResponse<ServicePositionResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete servicePosition with Id: {Id} by {Auth}",id,auth.Serialize());
            var servicePositionExist = await _servicePositionRepository.GetByIdAsync(id);
            if (servicePositionExist == null)
            {
                return new ApiResponse<ServicePositionResponse>("ServicePosition does not exist",400);
            }
            
            var deleted = await _servicePositionRepository.Remove(servicePositionExist);
            return deleted > 0 ? new ApiResponse<ServicePositionResponse>("ServicePosition deleted",200) : new ApiResponse<ServicePositionResponse>("ServicePosition could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new servicePosition with Id: {Id}", id);
            return new ApiResponse<ServicePositionResponse>("Failed to delete servicePosition",500);
        }
    }

    public async Task<IApiResponse<ServicePositionResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get servicePosition with Id: {Id} by {Auth}",id,auth.Serialize());
            var servicePositionExist = await _servicePositionRepository.GetByIdAsync(id);
            if (servicePositionExist == null)
            {
                return new ApiResponse<ServicePositionResponse>("ServicePosition does not exist",400);
            }
            
            var response = servicePositionExist.Adapt<ServicePositionResponse>();
            return response.ToOkApiResponse("ServicePosition found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a servicePosition with id: {Id}",id);
            return new ApiResponse<ServicePositionResponse>("Failed to retrieve servicePosition",500);
        }
    }

    public async Task<IApiResponse<PagedResult<ServicePositionResponse>>> GetPagedList(ServicePositionFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of servicePositions with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var servicePositionQuery = _servicePositionRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                servicePositionQuery = servicePositionQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var servicePositions = await servicePositionQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await servicePositionQuery.CountAsync();
            var response = servicePositions.Adapt<List<ServicePositionResponse>>();

            var pagedResult = new PagedResult<ServicePositionResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("ServicePositions retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of servicePositions with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<ServicePositionResponse>>("Failed to get servicePositions list",500);
        }
    }
}