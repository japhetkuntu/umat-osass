using Akka.Actor;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.Shared;
using Umat.Osass.Admin.Api.Models.Requests.Shared;
using Umat.Osass.Admin.Api.Models.Responses.Shared;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Common.Sdk.Services;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Options;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;


namespace Umat.Osass.Admin.Api.Services.Providers.Shared;

public class StaffService : IStaffService
{
    private readonly ILogger<StaffService> _logger;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly IIdentityPgRepository<Department> _departmentRepository;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;
    private readonly EmailConfig _emailConfig;
    private readonly ActorSystem _actorSystem;

    public StaffService(
        ILogger<StaffService> logger,
        IIdentityPgRepository<Staff> staffRepository,
        IIdentityPgRepository<Department> departmentRepository,
        IIdentityPgRepository<Faculty> facultyRepository,
        IIdentityPgRepository<School> schoolRepository,
        IOptions<EmailConfig> emailConfig,
        ActorSystem actorSystem)
    {
        _logger = logger;
        _staffRepository = staffRepository;
        _departmentRepository = departmentRepository;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
        _emailConfig = emailConfig.Value;
        _actorSystem = actorSystem;
    }

    public async Task<IApiResponse<StaffResponse>> Add(StaffRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add staff with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());

            var staffExist = await _staffRepository.GetOneAsync(x => x.StaffId == request.StaffId);
            if (staffExist != null)
            {
                return new ApiResponse<StaffResponse>("Staff with the same Staff ID already exists", 400);
            }

            var department = await _departmentRepository.GetByIdAsync(request.DepartmentId);
            if (department == null)
                return new ApiResponse<StaffResponse>("Department does not exist", 400);

            var newStaff = request.Adapt<Staff>();
            newStaff.CreatedAt = DateTime.UtcNow;
            newStaff.CreatedBy = auth.Name;
            newStaff.LastAppointmentOrPromotionDate = DateTime.SpecifyKind(newStaff.LastAppointmentOrPromotionDate, DateTimeKind.Utc);
            newStaff.FacultyId = department.FacultyId;
            newStaff.SchoolId = department.SchoolId;
            var temporaryPassword = RandomNumberGeneratorExtension.GenerateTemporaryPassword();
            newStaff.Password = BCrypt.Net.BCrypt.HashPassword(temporaryPassword);

            var added = await _staffRepository.AddAsync(newStaff);
            var response = newStaff.Adapt<StaffResponse>();
            response.DepartmentName = department.Name;

            if (!string.IsNullOrEmpty(department.FacultyId))
            {
                var faculty = await _facultyRepository.GetByIdAsync(department.FacultyId);
                if (faculty != null) response.FacultyName = faculty.Name;
            }

            if (added > 0)
            {
                // Fire-and-forget email dispatch via actor so it does not block the API response.
                _actorSystem.SendStaffRegistrationNotificationAsync(new StaffRegistrationPayload
                {
                    RecipientEmail = newStaff.Email,
                    RecipientName = $"{newStaff.FirstName} {newStaff.LastName}",
                    staffId = newStaff.StaffId,
                    FirstName = newStaff.FirstName,
                    LastName = newStaff.LastName,
                    TemporalPassword = temporaryPassword,
                    StaffCategory = newStaff.StaffCategory ?? "Non-Academic",
                    PortalLoginUrl = "https://osass.umat.edu.gh/login",
                    PasswordChangeRequiredUrl = "https://osass.umat.edu.gh/password/change"
                });
            }

            var school = await _schoolRepository.GetByIdAsync(department.SchoolId);
            if (school != null) response.SchoolName = school.Name;

            return added > 0
                ? response.ToOkApiResponse("Staff added")
                : new ApiResponse<StaffResponse>("Staff could not be added", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating new staff with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());
            return new ApiResponse<StaffResponse>("Failed to create new staff", 500);
        }
    }

    public async Task<IApiResponse<StaffResponse>> Update(StaffRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update staff with rawRequest:{Request} with Id: {Id} by {Auth}", request.Serialize(), id, auth.Serialize());

            var staffExist = await _staffRepository.GetByIdAsync(id);
            if (staffExist == null)
            {
                return new ApiResponse<StaffResponse>("Staff does not exist", 400);
            }

            var department = await _departmentRepository.GetByIdAsync(request.DepartmentId);
            if (department == null)
                return new ApiResponse<StaffResponse>("Department does not exist", 400);

            // Update the existing tracked entity instead of creating a new one
            staffExist.FirstName = request.FirstName;
            staffExist.LastName = request.LastName;
            staffExist.Email = request.Email;
            staffExist.StaffId = request.StaffId;
            staffExist.Position = request.Position;
            staffExist.PreviousPosition = request.PreviousPosition;
            staffExist.Title = request.Title;
            staffExist.StaffCategory = request.StaffCategory;
            staffExist.UniversityRole = request.UniversityRole;
            staffExist.DepartmentId = request.DepartmentId;
            staffExist.LastAppointmentOrPromotionDate = DateTime.SpecifyKind(request.LastAppointmentOrPromotionDate, DateTimeKind.Utc);
            staffExist.UpdatedAt = DateTime.UtcNow;
            staffExist.UpdatedBy = auth.Name;
            staffExist.FacultyId = department.FacultyId;
            staffExist.SchoolId = department.SchoolId;

            var updated = await _staffRepository.UpdateAsync(staffExist);
            var response = staffExist.Adapt<StaffResponse>();
            response.DepartmentName = department.Name;

            if (!string.IsNullOrEmpty(department.FacultyId))
            {
                var faculty = await _facultyRepository.GetByIdAsync(department.FacultyId);
                if (faculty != null) response.FacultyName = faculty.Name;
            }

            var school = await _schoolRepository.GetByIdAsync(department.SchoolId);
            if (school != null) response.SchoolName = school.Name;

            return updated > 0
                ? response.ToOkApiResponse("Staff updated")
                : new ApiResponse<StaffResponse>("Staff could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating staff with rawRequest:{Request} with Id: {Id} by {Auth}", request.Serialize(), id, auth.Serialize());
            return new ApiResponse<StaffResponse>("Failed to update staff", 500);
        }
    }

    public async Task<IApiResponse<StaffResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete staff with Id: {Id} by {Auth}", id, auth.Serialize());

            var staffExist = await _staffRepository.GetByIdAsync(id);
            if (staffExist == null)
            {
                return new ApiResponse<StaffResponse>("Staff does not exist", 400);
            }

            var deleted = await _staffRepository.Remove(staffExist);
            return deleted > 0
                ? new ApiResponse<StaffResponse>("Staff deleted", 200)
                : new ApiResponse<StaffResponse>("Staff could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting staff with Id: {Id}", id);
            return new ApiResponse<StaffResponse>("Failed to delete staff", 500);
        }
    }

    public async Task<IApiResponse<StaffResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get staff with Id: {Id} by {Auth}", id, auth.Serialize());

            var staffExist = await _staffRepository.GetByIdAsync(id);
            if (staffExist == null)
            {
                return new ApiResponse<StaffResponse>("Staff does not exist", 400);
            }

            var response = staffExist.Adapt<StaffResponse>();

            var department = await _departmentRepository.GetByIdAsync(staffExist.DepartmentId);
            if (department != null) response.DepartmentName = department.Name;

            if (!string.IsNullOrEmpty(staffExist.FacultyId))
            {
                var faculty = await _facultyRepository.GetByIdAsync(staffExist.FacultyId);
                if (faculty != null) response.FacultyName = faculty.Name;
            }

            var school = await _schoolRepository.GetByIdAsync(staffExist.SchoolId);
            if (school != null) response.SchoolName = school.Name;

            return response.ToOkApiResponse("Staff found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting staff with id: {Id}", id);
            return new ApiResponse<StaffResponse>("Failed to retrieve staff", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<StaffResponse>>> GetPagedList(StaffFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of staff with rawFilter: {Filter} by: {Auth}", filter.Serialize(), auth.Serialize());

            var staffQuery = _staffRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();
                staffQuery = staffQuery.Where(x =>
                    x.FirstName.ToLower().Contains(search) ||
                    x.LastName.ToLower().Contains(search) ||
                    x.Email.ToLower().Contains(search) ||
                    x.StaffId.ToLower().Contains(search));
            }

            if (!string.IsNullOrEmpty(filter.StaffCategory))
            {
                staffQuery = staffQuery.Where(x => x.StaffCategory == filter.StaffCategory);
            }

            var staffList = await staffQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await staffQuery.CountAsync();
            var response = staffList.Adapt<List<StaffResponse>>();

            // Fetch related department, faculty, and school data to populate response
            foreach (var staff in response)
            {
                if (!string.IsNullOrEmpty(staff.DepartmentId))
                {
                    var department = await _departmentRepository.GetByIdAsync(staff.DepartmentId);
                    if (department != null)
                    {
                        staff.DepartmentName = department.Name;
                    }
                }
                if (!string.IsNullOrEmpty(staff.FacultyId))
                {
                    var faculty = await _facultyRepository.GetByIdAsync(staff.FacultyId);
                    if (faculty != null)
                    {
                        staff.FacultyName = faculty.Name;
                    }
                }
                if (!string.IsNullOrEmpty(staff.SchoolId))
                {
                    var school = await _schoolRepository.GetByIdAsync(staff.SchoolId);
                    if (school != null)
                    {
                        staff.SchoolName = school.Name;
                    }
                }
            }

            var pagedResult = new PagedResult<StaffResponse>(response, filter.Page, filter.PageSize, response.Count, totalCount);

            return pagedResult.ToOkApiResponse("Staff retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting list of staff with filter: {Filter}", filter.Serialize());
            return new ApiResponse<PagedResult<StaffResponse>>("Failed to get staff list", 500);
        }
    }
}
