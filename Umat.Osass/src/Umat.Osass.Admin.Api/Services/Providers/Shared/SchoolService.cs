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

public class SchoolService:ISchoolService
{
    private readonly ILogger<SchoolService> _logger;
    private readonly IIdentityPgRepository<School> _schoolRepository;

    public SchoolService(ILogger<SchoolService> logger,IIdentityPgRepository<School> schoolRepository)
    {
        _logger = logger;
        _schoolRepository = schoolRepository;
    }

    public async Task<IApiResponse<SchoolResponse>> Add(SchoolRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add school with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var schoolExist = await _schoolRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower());
            if (schoolExist != null)
            {
                return new ApiResponse<SchoolResponse>("School with the same name already exists",400);
            }
            var newSchool = request.Adapt<School>();
            newSchool.CreatedAt = DateTime.UtcNow;
            var added = await _schoolRepository.AddAsync(newSchool);
            var response = newSchool.Adapt<SchoolResponse>();
            return added > 0 ? response.ToOkApiResponse("School added") : new ApiResponse<SchoolResponse>("School could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new school with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<SchoolResponse>("Failed to create new school",500);
        }
    }

    public async Task<IApiResponse<SchoolResponse>> Update(SchoolRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update school with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var schoolExist = await _schoolRepository.GetByIdAsync(id);
            if (schoolExist == null)
            {
                return new ApiResponse<SchoolResponse>("School does not exist",400);
            }
            // Update the existing tracked entity instead of creating a new one
            schoolExist.Name = request.Name;
            schoolExist.UpdatedAt = DateTime.UtcNow;
            schoolExist.UpdatedBy = auth.Name;
            var updated = await _schoolRepository.UpdateAsync(schoolExist);
            var response = schoolExist.Adapt<SchoolResponse>();
            return updated > 0 ? response.ToOkApiResponse("School updated") : new ApiResponse<SchoolResponse>("School could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new school with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<SchoolResponse>("Failed to update school",500);
        }
    }

    public async Task<IApiResponse<SchoolResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete school with Id: {Id} by {Auth}",id,auth.Serialize());
            var schoolExist = await _schoolRepository.GetByIdAsync(id);
            if (schoolExist == null)
            {
                return new ApiResponse<SchoolResponse>("School does not exist",400);
            }
            
            var deleted = await _schoolRepository.Remove(schoolExist);
            return deleted > 0 ? new ApiResponse<SchoolResponse>("School deleted",200) : new ApiResponse<SchoolResponse>("School could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new school with Id: {Id}", id);
            return new ApiResponse<SchoolResponse>("Failed to delete school",500);
        }
    }

    public async Task<IApiResponse<SchoolResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get school with Id: {Id} by {Auth}",id,auth.Serialize());
            var schoolExist = await _schoolRepository.GetByIdAsync(id);
            if (schoolExist == null)
            {
                return new ApiResponse<SchoolResponse>("School does not exist",400);
            }
            
            var response = schoolExist.Adapt<SchoolResponse>();
            return response.ToOkApiResponse("School found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a school with id: {Id}",id);
            return new ApiResponse<SchoolResponse>("Failed to retrieve school",500);
        }
    }

    public async Task<IApiResponse<PagedResult<SchoolResponse>>> GetPagedList(SchoolFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of schools with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var schoolQuery = _schoolRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                schoolQuery = schoolQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var schools = await schoolQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await schoolQuery.CountAsync();
            var response = schools.Adapt<List<SchoolResponse>>();

            var pagedResult = new PagedResult<SchoolResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("Schools retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of schools with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<SchoolResponse>>("Failed to get schools list",500);
        }
    }
}