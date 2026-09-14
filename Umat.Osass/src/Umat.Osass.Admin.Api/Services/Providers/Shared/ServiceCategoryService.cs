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

public class ServiceCategoryService:IServiceCategoryService
{
    private readonly ILogger<ServiceCategoryService> _logger;
    private readonly IIdentityPgRepository<ServiceCategory> _serviceCategoryRepository;
    private readonly IIdentityPgRepository<ServicePosition> _servicePositionRepository;

    public ServiceCategoryService(ILogger<ServiceCategoryService> logger,IIdentityPgRepository<ServiceCategory> serviceCategoryRepository, IIdentityPgRepository<ServicePosition> servicePositionRepository)
    {
        _logger = logger;
        _serviceCategoryRepository = serviceCategoryRepository;
        _servicePositionRepository = servicePositionRepository;
    }

    public async Task<IApiResponse<ServiceCategoryResponse>> Add(ServiceCategoryRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add serviceCategory with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var serviceCategoryExist = await _serviceCategoryRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (serviceCategoryExist != null)
            {
                return new ApiResponse<ServiceCategoryResponse>("ServiceCategory with the same name already exists",400);
            }
            var newServiceCategory = request.Adapt<ServiceCategory>();
            newServiceCategory.CreatedAt = DateTime.UtcNow;
            newServiceCategory.CreatedBy = auth.Name;
            var added = await _serviceCategoryRepository.AddAsync(newServiceCategory);
            var response = newServiceCategory.Adapt<ServiceCategoryResponse>();
            return added > 0 ? response.ToOkApiResponse("ServiceCategory added") : new ApiResponse<ServiceCategoryResponse>("ServiceCategory could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new serviceCategory with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<ServiceCategoryResponse>("Failed to create new serviceCategory",500);
        }
    }

    public async Task<IApiResponse<ServiceCategoryResponse>> Update(ServiceCategoryRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update serviceCategory with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var serviceCategoryExist = await _serviceCategoryRepository.GetByIdAsync(id);
            if (serviceCategoryExist == null)
            {
                return new ApiResponse<ServiceCategoryResponse>("ServiceCategory does not exist",400);
            }
            // Update the existing tracked entity instead of creating a new one
            serviceCategoryExist.Name = request.Name;
            serviceCategoryExist.Description = request.Description;
            serviceCategoryExist.RequiresDesignation = request.RequiresDesignation;
            serviceCategoryExist.RequiresCommitteeName = request.RequiresCommitteeName;
            serviceCategoryExist.ActingScoreMultiplier = request.ActingScoreMultiplier;
            serviceCategoryExist.FullTimeScoreMultiplier = request.FullTimeScoreMultiplier;
            serviceCategoryExist.DisplayOrder = request.DisplayOrder;
            serviceCategoryExist.UpdatedAt = DateTime.UtcNow;
            serviceCategoryExist.UpdatedBy = auth.Name;
            var updated = await _serviceCategoryRepository.UpdateAsync(serviceCategoryExist);
            var response = serviceCategoryExist.Adapt<ServiceCategoryResponse>();
            return updated > 0 ? response.ToOkApiResponse("ServiceCategory updated") : new ApiResponse<ServiceCategoryResponse>("ServiceCategory could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new serviceCategory with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<ServiceCategoryResponse>("Failed to update serviceCategory",500);
        }
    }

    public async Task<IApiResponse<ServiceCategoryResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete serviceCategory with Id: {Id} by {Auth}",id,auth.Serialize());
            var serviceCategoryExist = await _serviceCategoryRepository.GetByIdAsync(id);
            if (serviceCategoryExist == null)
            {
                return new ApiResponse<ServiceCategoryResponse>("ServiceCategory does not exist",400);
            }

            var inUse = await _servicePositionRepository.GetOneAsync(x => x.CategoryId == id);
            if (inUse != null)
            {
                return new ApiResponse<ServiceCategoryResponse>("Cannot delete a service category that has service positions assigned to it",400);
            }

            var deleted = await _serviceCategoryRepository.Remove(serviceCategoryExist);
            return deleted > 0 ? new ApiResponse<ServiceCategoryResponse>("ServiceCategory deleted",200) : new ApiResponse<ServiceCategoryResponse>("ServiceCategory could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new serviceCategory with Id: {Id}", id);
            return new ApiResponse<ServiceCategoryResponse>("Failed to delete serviceCategory",500);
        }
    }

    public async Task<IApiResponse<ServiceCategoryResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get serviceCategory with Id: {Id} by {Auth}",id,auth.Serialize());
            var serviceCategoryExist = await _serviceCategoryRepository.GetByIdAsync(id);
            if (serviceCategoryExist == null)
            {
                return new ApiResponse<ServiceCategoryResponse>("ServiceCategory does not exist",400);
            }

            var response = serviceCategoryExist.Adapt<ServiceCategoryResponse>();
            return response.ToOkApiResponse("ServiceCategory found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a serviceCategory with id: {Id}",id);
            return new ApiResponse<ServiceCategoryResponse>("Failed to retrieve serviceCategory",500);
        }
    }

    public async Task<IApiResponse<PagedResult<ServiceCategoryResponse>>> GetPagedList(ServiceCategoryFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of serviceCategories with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var serviceCategoryQuery = _serviceCategoryRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                serviceCategoryQuery = serviceCategoryQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var serviceCategories = await serviceCategoryQuery
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.Name)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await serviceCategoryQuery.CountAsync();
            var response = serviceCategories.Adapt<List<ServiceCategoryResponse>>();

            var pagedResult = new PagedResult<ServiceCategoryResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("ServiceCategories retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of serviceCategories with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<ServiceCategoryResponse>>("Failed to get serviceCategories list",500);
        }
    }
}
