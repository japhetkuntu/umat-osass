using Akka.Actor;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Academic;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.Academic;

public class CommitteeService : ICommitteeService
{
    private readonly ILogger<CommitteeService> _logger;
    private readonly IAcademicPromotionPgRepository<AcademicPromotionCommittee> _committeeRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly IIdentityPgRepository<Department> _departmentRepository;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;
    private readonly ActorSystem _actorSystem;

    public CommitteeService(
        ILogger<CommitteeService> logger,
        IAcademicPromotionPgRepository<AcademicPromotionCommittee> committeeRepository,
        IIdentityPgRepository<Staff> staffRepository,
        IIdentityPgRepository<Department> departmentRepository,
        IIdentityPgRepository<Faculty> facultyRepository,
        IIdentityPgRepository<School> schoolRepository,
        ActorSystem actorSystem)
    {
        _logger = logger;
        _committeeRepository = committeeRepository;
        _staffRepository = staffRepository;
        _departmentRepository = departmentRepository;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
        _actorSystem = actorSystem;
    }

    public async Task<IApiResponse<CommitteeResponse>> Add(CommitteeRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add committee member with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());

            var staff = await _staffRepository.GetByIdAsync(request.StaffId);
            if (staff == null)
                return new ApiResponse<CommitteeResponse>("Staff does not exist", 400);

            var existing = await _committeeRepository.GetOneAsync(x =>
                x.StaffId == request.StaffId && x.CommitteeType == request.CommitteeType );
            if (existing != null)
                return new ApiResponse<CommitteeResponse>("Staff is already a member of this committee", 400);

            var newMember = request.Adapt<AcademicPromotionCommittee>();
            newMember.CreatedAt = DateTime.UtcNow;

            var added = await _committeeRepository.AddAsync(newMember);
            var response = await BuildResponse(newMember, staff);

            if (added > 0)
            {
                // Fire-and-forget email dispatch via actor.
                _actorSystem.SendCommitteeAssignmentNotificationAsync(new CommitteeAssignmentPayload
                {
                    RecipientEmail = staff.Email,
                    RecipientName = $"{staff.FirstName} {staff.LastName}",
                    StaffName = $"{staff.FirstName} {staff.LastName}",
                    CommitteeType = newMember.CommitteeType,
                    CommitteeRole = newMember.IsChairperson ? "Chairperson" : "Committee Member",
                    DepartmentName = staff.DepartmentId ?? "Unknown",
                    PortalUrl = "https://osass.umat.edu.gh/login"
                });
            }

            return added > 0
                ? response.ToOkApiResponse("Committee member added")
                : new ApiResponse<CommitteeResponse>("Committee member could not be added", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating committee member with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());
            return new ApiResponse<CommitteeResponse>("Failed to create committee member", 500);
        }
    }

    public async Task<IApiResponse<CommitteeResponse>> Update(CommitteeRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update committee member with rawRequest:{Request} with Id: {Id} by {Auth}", request.Serialize(), id, auth.Serialize());

            var updatedMember = await _committeeRepository.GetByIdAsync(id);
            if (updatedMember == null)
                return new ApiResponse<CommitteeResponse>("Committee member does not exist", 400);

            var staff = await _staffRepository.GetByIdAsync(request.StaffId);
            if (staff == null)
                return new ApiResponse<CommitteeResponse>("Staff does not exist", 400);
            

            updatedMember.CanSubmitReviewedApplication = request.CanSubmitReviewedApplication;
            updatedMember.CanSubmitReviewedApplication = request.CanSubmitReviewedApplication;
            updatedMember.CommitteeType = request.CommitteeType;
            updatedMember.DepartmentId = request.DepartmentId?? updatedMember.DepartmentId;
            updatedMember.FacultyId = request.FacultyId ?? updatedMember.FacultyId;
            updatedMember.SchoolId = request.SchoolId ?? updatedMember.SchoolId;
            updatedMember.StaffId = request.StaffId;
            updatedMember.IsChairperson = request.IsChairperson;
            updatedMember.SchoolId = request.SchoolId ?? updatedMember.SchoolId;
            
           
            updatedMember.UpdatedAt = DateTime.UtcNow;
            updatedMember.UpdatedBy = auth.Name;
         

            var updated = await _committeeRepository.UpdateAsync(updatedMember);
            var response = await BuildResponse(updatedMember, staff);

            return updated > 0
                ? response.ToOkApiResponse("Committee member updated")
                : new ApiResponse<CommitteeResponse>("Committee member could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating committee member with rawRequest:{Request} with Id: {Id} by {Auth}", request.Serialize(), id, auth.Serialize());
            return new ApiResponse<CommitteeResponse>("Failed to update committee member", 500);
        }
    }

    public async Task<IApiResponse<CommitteeResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete committee member with Id: {Id} by {Auth}", id, auth.Serialize());

            var memberExist = await _committeeRepository.GetByIdAsync(id);
            if (memberExist == null)
                return new ApiResponse<CommitteeResponse>("Committee member does not exist", 400);

            var deleted = await _committeeRepository.Remove(memberExist);
            return deleted > 0
                ? new ApiResponse<CommitteeResponse>("Committee member deleted", 200)
                : new ApiResponse<CommitteeResponse>("Committee member could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting committee member with Id: {Id}", id);
            return new ApiResponse<CommitteeResponse>("Failed to delete committee member", 500);
        }
    }

    public async Task<IApiResponse<CommitteeResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get committee member with Id: {Id} by {Auth}", id, auth.Serialize());

            var memberExist = await _committeeRepository.GetByIdAsync(id);
            if (memberExist == null)
                return new ApiResponse<CommitteeResponse>("Committee member does not exist", 400);

            var staff = await _staffRepository.GetByIdAsync(memberExist.StaffId);
            var response = await BuildResponse(memberExist, staff);

            return response.ToOkApiResponse("Committee member found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting committee member with id: {Id}", id);
            return new ApiResponse<CommitteeResponse>("Failed to retrieve committee member", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<CommitteeResponse>>> GetPagedList(CommitteeFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to retrieve list of committee members with rawFilter: {Filter} by: {Auth}", filter.Serialize(), auth.Serialize());

            var query = _committeeRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(x => x.CommitteeType.ToLower().Contains(search));
            }

            var members = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();
            var responseList = new List<CommitteeResponse>();
            foreach (var member in members)
            {
                var staff = await _staffRepository.GetByIdAsync(member.StaffId);
                responseList.Add(await BuildResponse(member, staff));
            }

            var pagedResult = new PagedResult<CommitteeResponse>(responseList, filter.Page, filter.PageSize, responseList.Count, totalCount);

            return pagedResult.ToOkApiResponse("Committee members retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting list of committee members with filter: {Filter}", filter.Serialize());
            return new ApiResponse<PagedResult<CommitteeResponse>>("Failed to get committee members list", 500);
        }
    }

    private async Task<CommitteeResponse> BuildResponse(AcademicPromotionCommittee member, Staff? staff)
    {
        var response = member.Adapt<CommitteeResponse>();
        if (staff != null)
        {
            response.StaffName = $"{staff.Title} {staff.FirstName} {staff.LastName}".Trim();
            response.StaffEmail = staff.Email;
        }

        if (!string.IsNullOrEmpty(member.DepartmentId))
        {
            var dept = await _departmentRepository.GetByIdAsync(member.DepartmentId);
            if (dept != null) response.DepartmentName = dept.Name;
        }

        if (!string.IsNullOrEmpty(member.FacultyId))
        {
            var fac = await _facultyRepository.GetByIdAsync(member.FacultyId);
            if (fac != null) response.FacultyName = fac.Name;
        }

        if (!string.IsNullOrEmpty(member.SchoolId))
        {
            var sch = await _schoolRepository.GetByIdAsync(member.SchoolId);
            if (sch != null) response.SchoolName = sch.Name;
        }

        return response;
    }
}
