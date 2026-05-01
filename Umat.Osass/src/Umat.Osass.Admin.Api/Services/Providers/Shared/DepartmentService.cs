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

public class DepartmentService:IDepartmentService
{
    private readonly ILogger<DepartmentService> _logger;
    private readonly IIdentityPgRepository<Department> _departmentRepository;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;

    public DepartmentService(ILogger<DepartmentService> logger,IIdentityPgRepository<Department> departmentRepository, IIdentityPgRepository<Faculty> facultyRepository, IIdentityPgRepository<School> schoolRepository)
    {
        _logger = logger;
        _departmentRepository = departmentRepository;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
    }

    public async Task<IApiResponse<DepartmentResponse>> Add(DepartmentRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add department with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());

            var isNonAcademic = string.Equals(request.DepartmentType, "non-academic", StringComparison.OrdinalIgnoreCase);

            if (isNonAcademic)
            {
                // Non-academic units/sections belong directly to a school
                if (string.IsNullOrWhiteSpace(request.SchoolId))
                    return new ApiResponse<DepartmentResponse>("School is required for a non-academic unit/section", 400);

                var schoolExist = await _schoolRepository.GetByIdAsync(request.SchoolId);
                if (schoolExist == null) return new ApiResponse<DepartmentResponse>("School does not exist", 400);

                var departmentExist = await _departmentRepository.GetOneAsync(x =>
                    x.Name.ToLower() == request.Name.ToLower() && x.SchoolId == request.SchoolId && x.DepartmentType == request.DepartmentType);
                if (departmentExist != null)
                    return new ApiResponse<DepartmentResponse>("A unit/section with the same name already exists in this school", 400);

                var newDepartment = request.Adapt<Department>();
                newDepartment.CreatedAt = DateTime.UtcNow;
                newDepartment.SchoolId = request.SchoolId;
                newDepartment.FacultyId = null;
                var added = await _departmentRepository.AddAsync(newDepartment);
                var response = newDepartment.Adapt<DepartmentResponse>();
                response.SchoolId = request.SchoolId;
                response.SchoolName = schoolExist.Name;
                response.DepartmentType = request.DepartmentType;
                return added > 0 ? response.ToOkApiResponse("Unit/section added") : new ApiResponse<DepartmentResponse>("Unit/section could not be added", 400);
            }
            else
            {
                // Academic departments belong to a faculty (which belongs to a school)
                var departmentExist = await _departmentRepository.GetOneAsync(x => x.Name.ToLower() == request.Name.ToLower() && x.FacultyId == request.FacultyId);
                if (departmentExist != null)
                    return new ApiResponse<DepartmentResponse>("Department with the same name already exists", 400);

                var facultyExist = await _facultyRepository.GetByIdAsync(request.FacultyId);
                if (facultyExist == null) return new ApiResponse<DepartmentResponse>("Faculty does not exist", 400);
                var schoolExist = await _schoolRepository.GetByIdAsync(facultyExist.SchoolId);
                if (schoolExist == null) return new ApiResponse<DepartmentResponse>("School does not exist", 400);

                var newDepartment = request.Adapt<Department>();
                newDepartment.CreatedAt = DateTime.UtcNow;
                newDepartment.SchoolId = facultyExist.SchoolId;
                var added = await _departmentRepository.AddAsync(newDepartment);
                var response = newDepartment.Adapt<DepartmentResponse>();
                response.FacultyId = request.FacultyId;
                response.FacultyName = facultyExist.Name;
                response.SchoolId = facultyExist.SchoolId;
                response.SchoolName = schoolExist.Name;
                response.DepartmentType = request.DepartmentType ?? "academic";
                return added > 0 ? response.ToOkApiResponse("Department added") : new ApiResponse<DepartmentResponse>("Department could not be added", 400);
            }
        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error creating new department with rawRequest:{Request} by {Auth}",request.Serialize(),auth.Serialize());
           return new ApiResponse<DepartmentResponse>("Failed to create new department",500);
        }
    }

    public async Task<IApiResponse<DepartmentResponse>> Update(DepartmentRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update department with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            var departmentExist = await _departmentRepository.GetByIdAsync(id);
            if (departmentExist == null)
                return new ApiResponse<DepartmentResponse>("Department does not exist", 400);

            var isNonAcademic = string.Equals(request.DepartmentType, "non-academic", StringComparison.OrdinalIgnoreCase);

            if (isNonAcademic)
            {
                if (string.IsNullOrWhiteSpace(request.SchoolId))
                    return new ApiResponse<DepartmentResponse>("School is required for a non-academic unit/section", 400);

                var schoolExist = await _schoolRepository.GetByIdAsync(request.SchoolId);
                if (schoolExist == null) return new ApiResponse<DepartmentResponse>("School does not exist", 400);

                departmentExist.Name = request.Name;
                departmentExist.FacultyId = null;
                departmentExist.SchoolId = request.SchoolId;
                departmentExist.DepartmentType = request.DepartmentType;
                departmentExist.UpdatedAt = DateTime.UtcNow;
                departmentExist.UpdatedBy = auth.Name;
                var updated = await _departmentRepository.UpdateAsync(departmentExist);
                var response = departmentExist.Adapt<DepartmentResponse>();
                response.SchoolId = request.SchoolId;
                response.SchoolName = schoolExist.Name;
                response.DepartmentType = request.DepartmentType;
                return updated > 0 ? response.ToOkApiResponse("Unit/section updated") : new ApiResponse<DepartmentResponse>("Unit/section could not be updated", 400);
            }
            else
            {
                var facultyExist = await _facultyRepository.GetByIdAsync(request.FacultyId);
                if (facultyExist == null) return new ApiResponse<DepartmentResponse>("Faculty does not exist", 400);
                var schoolExist = await _schoolRepository.GetByIdAsync(facultyExist.SchoolId);
                if (schoolExist == null) return new ApiResponse<DepartmentResponse>("School does not exist", 400);

                departmentExist.Name = request.Name;
                departmentExist.FacultyId = request.FacultyId;
                departmentExist.DepartmentType = request.DepartmentType ?? "academic";
                departmentExist.UpdatedAt = DateTime.UtcNow;
                departmentExist.UpdatedBy = auth.Name;
                departmentExist.SchoolId = facultyExist.SchoolId;
                var updated = await _departmentRepository.UpdateAsync(departmentExist);
                var response = departmentExist.Adapt<DepartmentResponse>();
                response.FacultyId = request.FacultyId;
                response.FacultyName = facultyExist.Name;
                response.SchoolId = facultyExist.SchoolId;
                response.SchoolName = schoolExist.Name;
                response.DepartmentType = request.DepartmentType ?? "academic";
                return updated > 0 ? response.ToOkApiResponse("Department updated") : new ApiResponse<DepartmentResponse>("Department could not be updated", 400);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error updating new department with rawRequest:{Request} with Id: {Id} by {Auth}",request.Serialize(),id,auth.Serialize());
            return new ApiResponse<DepartmentResponse>("Failed to update department",500);
        }
    }

    public async Task<IApiResponse<DepartmentResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete department with Id: {Id} by {Auth}",id,auth.Serialize());
            var departmentExist = await _departmentRepository.GetByIdAsync(id);
            if (departmentExist == null)
            {
                return new ApiResponse<DepartmentResponse>("Department does not exist",400);
            }
            
            var deleted = await _departmentRepository.Remove(departmentExist);
            return deleted > 0 ? new ApiResponse<DepartmentResponse>("Department deleted",200) : new ApiResponse<DepartmentResponse>("Department could not be deleted",400);
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error deleting new department with Id: {Id}", id);
            return new ApiResponse<DepartmentResponse>("Failed to delete department",500);
        }
    }

    public async Task<IApiResponse<DepartmentResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get department with Id: {Id} by {Auth}",id,auth.Serialize());
            var departmentExist = await _departmentRepository.GetByIdAsync(id);
            if (departmentExist == null)
            {
                return new ApiResponse<DepartmentResponse>("Department does not exist",400);
            }
            var facultyExist = await _facultyRepository.GetByIdAsync(departmentExist.FacultyId!);
            var schoolExist = await _schoolRepository.GetByIdAsync(departmentExist.SchoolId);
            var response = departmentExist.Adapt<DepartmentResponse>();
            if (facultyExist == null) return response.ToOkApiResponse("Department found");
            response.FacultyId = departmentExist.FacultyId!;
            response.FacultyName = facultyExist.Name;
            if (schoolExist != null)
            {
                response.SchoolId = departmentExist.SchoolId;
                response.SchoolName = schoolExist.Name;
            }

            return response.ToOkApiResponse("Department found");
        }
        catch (Exception e)
        {
            _logger.LogError(e,"Error getting a department with id: {Id}",id);
            return new ApiResponse<DepartmentResponse>("Failed to retrieve department",500);
        }
    }

    public async Task<IApiResponse<PagedResult<DepartmentResponse>>> GetPagedList(DepartmentFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of departments with rawFilter: {Filter} by: {Auth}",filter.Serialize(),auth.Serialize());
                  var departmentQuery = _departmentRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search) )
            {
                departmentQuery = departmentQuery.Where(x => x.Name.ToLower().Contains(filter.Search.ToLower()));
            }

            var departments = await departmentQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await departmentQuery.CountAsync();
            var response = departments.Adapt<List<DepartmentResponse>>();

            // Fetch related Faculty and School data to populate response
            foreach (var dept in response)
            {
                if (!string.IsNullOrEmpty(dept.FacultyId))
                {
                    var faculty = await _facultyRepository.GetByIdAsync(dept.FacultyId);
                    if (faculty != null)
                    {
                        dept.FacultyName = faculty.Name;
                    }
                }
                if (!string.IsNullOrEmpty(dept.SchoolId))
                {
                    var school = await _schoolRepository.GetByIdAsync(dept.SchoolId);
                    if (school != null)
                    {
                        dept.SchoolName = school.Name;
                    }
                }
            }

            var pagedResult = new PagedResult<DepartmentResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("Departments retrieved successfully");

        }
        catch (Exception e)
        {
           _logger.LogError(e,"Error getting list of departments with filter: {Filter}",filter.Serialize());
           return new ApiResponse<PagedResult<DepartmentResponse>>("Failed to get faculties list",500);
        }
    }
}