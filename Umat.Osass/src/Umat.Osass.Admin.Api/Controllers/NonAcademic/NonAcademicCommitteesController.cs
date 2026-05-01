using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Admin.Api.Models.Filter.NonAcademic;
using Umat.Osass.Admin.Api.Models.Requests.NonAcademic;
using Umat.Osass.Admin.Api.Models.Responses.NonAcademic;
using Umat.Osass.Admin.Api.Services.Interfaces.NonAcademic;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Controllers.NonAcademic;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class NonAcademicCommitteesController : DefaultController
{
    private readonly ILogger<NonAcademicCommitteesController> _logger;
    private readonly INonAcademicCommitteeService _committeeService;

    public NonAcademicCommitteesController(ILogger<NonAcademicCommitteesController> logger, INonAcademicCommitteeService committeeService)
    {
        _logger = logger;
        _committeeService = committeeService;
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicCommitteeResponse>))]
    public async Task<IActionResult> AddCommitteeMember([FromBody] NonAcademicCommitteeRequest request)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Add(request, auth);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicCommitteeResponse>))]
    public async Task<IActionResult> UpdateCommitteeMember([FromBody] NonAcademicCommitteeRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<NonAcademicCommitteeResponse>>))]
    public async Task<IActionResult> GetCommitteeMembers([FromQuery] NonAcademicCommitteeFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicCommitteeResponse>))]
    public async Task<IActionResult> GetCommitteeMemberById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicCommitteeResponse>))]
    public async Task<IActionResult> DeleteCommitteeMemberById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
