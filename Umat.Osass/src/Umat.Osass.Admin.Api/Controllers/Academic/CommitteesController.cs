using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Academic;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Controllers.Academic;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class CommitteesController : DefaultController
{
    private readonly ILogger<CommitteesController> _logger;
    private readonly ICommitteeService _committeeService;

    public CommitteesController(ILogger<CommitteesController> logger, ICommitteeService committeeService)
    {
        _logger = logger;
        _committeeService = committeeService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CommitteeResponse>))]
    public async Task<IActionResult> AddCommitteeMember([FromBody] CommitteeRequest request)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Add(request, auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CommitteeResponse>))]
    public async Task<IActionResult> UpdateCommitteeMember([FromBody] CommitteeRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<CommitteeResponse>>))]
    public async Task<IActionResult> GetCommitteeMembers([FromQuery] CommitteeFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CommitteeResponse>))]
    public async Task<IActionResult> GetCommitteeMemberById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CommitteeResponse>))]
    public async Task<IActionResult> DeleteCommitteeMemberById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _committeeService.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
