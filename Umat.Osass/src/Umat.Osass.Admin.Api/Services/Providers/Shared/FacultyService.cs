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

public class FacultyService:IFacultyService
{
    private readonly ILogger<FacultyService> _logger;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;

    public FacultyService(ILogger<FacultyService> logger,IIdentityPgRepository<Faculty> facultyRepository, IIdentityPgRepository<School> schoolRepository)
    {
        _logger = logger;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
    }

    public async Task<IApiResponse<FacultyResponse>> Add(FacultyRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add faculty with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
            var facultyExist = await _facultyRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower() && x.SchoolId == request.SchoolId);
            if (facultyExist != null)
            {
                return new ApiResponse<FacultyResponse>("Faculty with the same name already exists",400);
            }
            var schoolExist = await _schoolRepository.GetByIdAsync(request.SchoolId);
            if (schoolExist == null) return new ApiResponse<FacultyResponse>("School does not exist",400);
            var newFaculty = request.Adapt<Faculty>();
            newFaculty.CreatedAt = DateTime.UtcNow;
            newFaculty.CreatedBy = auth.Name;
            var added = await _facultyRepository.AddAsync(newFaculty);
            var response = newFaculty.Adapt<FacultyResponse>();
            response.SchoolId = request.SchoolId;
            response.SchoolName = schoolExist.Name;
            return added > 0 ? response.ToOkApiResponse("Faculty added") : new ApiResponse<FacultyResponse>("Faculty could not be added",400);
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new faculty with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<FacultyResponse>("Failed to create new faculty",500);
        }
    }

    public async Task<IApiResponse<FacultyResponse>> Update(FacultyRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update faculty with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var facultyExist = await _facultyRepository.GetByIdAsync(id);
            if (facultyExist == null)
            {
                return new ApiResponse<FacultyResponse>("Faculty does not exist",400);
            }
            var schoolExist = await _schoolRepository.GetByIdAsync(request.SchoolId);
            if (schoolExist == null) return new ApiResponse<FacultyResponse>("School does not exist",400);
            // Update the existing tracked entity instead of creating a new one
            facultyExist.Name = request.Name;
            facultyExist.SchoolId = request.SchoolId;
            facultyExist.UpdatedAt = DateTime.UtcNow;
            facultyExist.UpdatedBy = auth.Name;
            var updated = await _facultyRepository.UpdateAsync(facultyExist);
            var response = facultyExist.Adapt<FacultyResponse>();
            response.SchoolId = request.SchoolId;
            response.SchoolName = schoolExist.Name;
            return updated > 0 ? response.ToOkApiResponse("Faculty updated") : new ApiResponse<FacultyResponse>("Faculty could not be updated",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new faculty with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<FacultyResponse>("Failed to update faculty",500);
        }
    }

    public async Task<IApiResponse<FacultyResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete faculty with Id: {Id} by {Auth}",id,auth.Serialize());
            var facultyExist = await _facultyRepository.GetByIdAsync(id);
            if (facultyExist == null)
            {
                return new ApiResponse<FacultyResponse>("Faculty does not exist",400);
            }
            
            var deleted = await _facultyRepository.Remove(facultyExist);
            return deleted > 0 ? new ApiResponse<FacultyResponse>("Faculty deleted",200) : new ApiResponse<FacultyResponse>("Faculty could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new faculty with Id: {Id}", id);
            return new ApiResponse<FacultyResponse>("Failed to delete faculty",500);
        }
    }

    public async Task<IApiResponse<FacultyResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get faculty with Id: {Id} by {Auth}",id,auth.Serialize());
            var facultyExist = await _facultyRepository.GetByIdAsync(id);
            if (facultyExist == null)
            {
                return new ApiResponse<FacultyResponse>("Faculty does not exist",400);
            }
            var schoolExist = await _schoolRepository.GetByIdAsync(facultyExist.SchoolId);
            var response = facultyExist.Adapt<FacultyResponse>();
            if (schoolExist == null) return response.ToOkApiResponse("Faculty found");
            response.SchoolId = facultyExist.SchoolId;
            response.SchoolName = schoolExist.Name;


            return response.ToOkApiResponse("Faculty found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a faculty with id: {Id}",id);
            return new ApiResponse<FacultyResponse>("Failed to retrieve faculty",500);
        }
    }

    public async Task<IApiResponse<PagedResult<FacultyResponse>>> GetPagedList(FacultyFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of facultys with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var facultyQuery = _facultyRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                facultyQuery = facultyQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var facultys = await facultyQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await facultyQuery.CountAsync();
            var response = facultys.Adapt<List<FacultyResponse>>();

            // Fetch related School data to populate response
            foreach (var fac in response)
            {
                if (!string.IsNullOrEmpty(fac.SchoolId))
                {
                    var school = await _schoolRepository.GetByIdAsync(fac.SchoolId);
                    if (school != null)
                    {
                        fac.SchoolName = school.Name;
                    }
                }
            }

            var pagedResult = new PagedResult<FacultyResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("Facultys retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of facultys with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<FacultyResponse>>("Failed to get faculties list",500);
        }
    }
}