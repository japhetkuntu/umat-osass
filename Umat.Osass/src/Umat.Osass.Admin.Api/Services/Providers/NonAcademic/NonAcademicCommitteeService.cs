using Akka.Actor;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Extensions;
using Umat.Osass.Admin.Api.Models.Filter.NonAcademic;
using Umat.Osass.Admin.Api.Models.Requests.NonAcademic;
using Umat.Osass.Admin.Api.Models.Responses.NonAcademic;
using Umat.Osass.Admin.Api.Services.Interfaces.NonAcademic;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Services.Providers.NonAcademic;

public class NonAcademicCommitteeService : INonAcademicCommitteeService
{
    private readonly ILogger<NonAcademicCommitteeService> _logger;
    private readonly INonAcademicPromotionPgRepository<NonAcademicPromotionCommittee> _committeeRepository;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly ActorSystem _actorSystem;

    public NonAcademicCommitteeService(
        ILogger<NonAcademicCommitteeService> logger,
        INonAcademicPromotionPgRepository<NonAcademicPromotionCommittee> committeeRepository,
        IIdentityPgRepository<Staff> staffRepository,
        ActorSystem actorSystem)
    {
        _logger = logger;
        _committeeRepository = committeeRepository;
        _staffRepository = staffRepository;
        _actorSystem = actorSystem;
    }

    public async Task<IApiResponse<NonAcademicCommitteeResponse>> Add(NonAcademicCommitteeRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to add non-academic committee member with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());

            var staff = await _staffRepository.GetByIdAsync(request.StaffId);
            if (staff == null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Staff does not exist", 400);

            var existing = await _committeeRepository.GetOneAsync(x =>
                x.StaffId == request.StaffId && x.CommitteeType == request.CommitteeType);
            if (existing != null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Staff is already a member of this committee", 400);

            var newMember = request.Adapt<NonAcademicPromotionCommittee>();
            newMember.CreatedAt = DateTime.UtcNow;
            newMember.CreatedBy = auth.Name;

            var added = await _committeeRepository.AddAsync(newMember);
            var response = BuildResponse(newMember, staff);

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
                : new ApiResponse<NonAcademicCommitteeResponse>("Committee member could not be added", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating non-academic committee member with rawRequest:{Request} by {Auth}", request.Serialize(), auth.Serialize());
            return new ApiResponse<NonAcademicCommitteeResponse>("Failed to create committee member", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicCommitteeResponse>> Update(NonAcademicCommitteeRequest request, string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to update non-academic committee member with Id:{Id} by {Auth}", id, auth.Serialize());

            var member = await _committeeRepository.GetByIdAsync(id);
            if (member == null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Committee member does not exist", 400);

            var staff = await _staffRepository.GetByIdAsync(request.StaffId);
            if (staff == null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Staff does not exist", 400);

            member.StaffId = request.StaffId;
            member.CommitteeType = request.CommitteeType;
            member.CanSubmitReviewedApplication = request.CanSubmitReviewedApplication;
            member.IsChairperson = request.IsChairperson;
            member.UnitId = request.UnitId ?? member.UnitId;
            member.UpdatedAt = DateTime.UtcNow;
            member.UpdatedBy = auth.Name;

            var updated = await _committeeRepository.UpdateAsync(member);
            var response = BuildResponse(member, staff);
            return updated > 0
                ? response.ToOkApiResponse("Committee member updated")
                : new ApiResponse<NonAcademicCommitteeResponse>("Committee member could not be updated", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating non-academic committee member with Id:{Id} by {Auth}", id, auth.Serialize());
            return new ApiResponse<NonAcademicCommitteeResponse>("Failed to update committee member", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicCommitteeResponse>> Delete(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to delete non-academic committee member with Id:{Id} by {Auth}", id, auth.Serialize());

            var member = await _committeeRepository.GetByIdAsync(id);
            if (member == null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Committee member does not exist", 400);

            var deleted = await _committeeRepository.Remove(member);
            return deleted > 0
                ? new ApiResponse<NonAcademicCommitteeResponse>("Committee member deleted", 200)
                : new ApiResponse<NonAcademicCommitteeResponse>("Committee member could not be deleted", 400);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting non-academic committee member with Id:{Id}", id);
            return new ApiResponse<NonAcademicCommitteeResponse>("Failed to delete committee member", 500);
        }
    }

    public async Task<IApiResponse<NonAcademicCommitteeResponse>> GetById(string id, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to get non-academic committee member with Id:{Id} by {Auth}", id, auth.Serialize());

            var member = await _committeeRepository.GetByIdAsync(id);
            if (member == null)
                return new ApiResponse<NonAcademicCommitteeResponse>("Committee member does not exist", 400);

            var staff = await _staffRepository.GetByIdAsync(member.StaffId);
            var response = BuildResponse(member, staff);
            return response.ToOkApiResponse("Committee member found");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting non-academic committee member with Id:{Id}", id);
            return new ApiResponse<NonAcademicCommitteeResponse>("Failed to retrieve committee member", 500);
        }
    }

    public async Task<IApiResponse<PagedResult<NonAcademicCommitteeResponse>>> GetPagedList(NonAcademicCommitteeFilter filter, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Received request to list non-academic committee members with filter:{Filter} by {Auth}", filter.Serialize(), auth.Serialize());

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
            var responseList = new List<NonAcademicCommitteeResponse>();
            foreach (var member in members)
            {
                var staff = await _staffRepository.GetByIdAsync(member.StaffId);
                responseList.Add(BuildResponse(member, staff));
            }

            var pagedResult = new PagedResult<NonAcademicCommitteeResponse>(responseList, filter.Page, filter.PageSize, responseList.Count, totalCount);
            return pagedResult.ToOkApiResponse("Committee members retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error listing non-academic committee members with filter:{Filter}", filter.Serialize());
            return new ApiResponse<PagedResult<NonAcademicCommitteeResponse>>("Failed to get committee members list", 500);
        }
    }

    private static NonAcademicCommitteeResponse BuildResponse(NonAcademicPromotionCommittee member, Staff? staff)
    {
        var response = member.Adapt<NonAcademicCommitteeResponse>();
        if (staff != null)
        {
            response.StaffName = $"{staff.Title} {staff.FirstName} {staff.LastName}".Trim();
            response.StaffEmail = staff.Email;
        }
        return response;
    }
}
