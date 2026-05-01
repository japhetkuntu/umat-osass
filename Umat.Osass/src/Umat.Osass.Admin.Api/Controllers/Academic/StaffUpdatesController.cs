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
public class StaffUpdatesController : DefaultController
{
    private readonly ILogger<StaffUpdatesController> _logger;
    private readonly IStaffUpdateService _staffUpdateService;

    public StaffUpdatesController(ILogger<StaffUpdatesController> logger, IStaffUpdateService staffUpdateService)
    {
        _logger = logger;
        _staffUpdateService = staffUpdateService;
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> CreateStaffUpdate([FromBody] StaffUpdateRequest request)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.Add(request, auth);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> UpdateStaffUpdate([FromBody] StaffUpdateRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<StaffUpdateResponse>>))]
    public async Task<IActionResult> GetStaffUpdates([FromQuery] StaffUpdateFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> GetStaffUpdateById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpPatch("{id}/visibility")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> ToggleVisibility([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.ToggleVisibility(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> DeleteStaffUpdate([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _staffUpdateService.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
