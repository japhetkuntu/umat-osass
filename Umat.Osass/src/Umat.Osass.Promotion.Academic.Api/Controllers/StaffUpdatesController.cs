using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Filter;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class StaffUpdatesController : DefaultController
{
    private readonly IStaffUpdateService _staffUpdateService;

    public StaffUpdatesController(IStaffUpdateService staffUpdateService)
    {
        _staffUpdateService = staffUpdateService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PgPagedResult<StaffUpdateResponse>>))]
    public async Task<IActionResult> GetStaffUpdates([FromQuery] StaffUpdateFilter filter)
    {
        var response = await _staffUpdateService.GetVisibleUpdates(filter);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffUpdateResponse>))]
    public async Task<IActionResult> GetStaffUpdateById([FromRoute] string id)
    {
        var response = await _staffUpdateService.GetById(id);
        return StatusCode(response.Code, response);
    }
}
