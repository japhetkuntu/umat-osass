using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Admin.Api.Models.Filter.Shared;
using Umat.Osass.Admin.Api.Models.Requests.Shared;
using Umat.Osass.Admin.Api.Models.Responses.Shared;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Controllers.Shared;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class StaffsController : DefaultController
{
    private readonly ILogger<StaffsController> _logger;
    private readonly IStaffService _staffService;

    public StaffsController(ILogger<StaffsController> logger, IStaffService staffService)
    {
        _logger = logger;
        _staffService = staffService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffResponse>))]
    public async Task<IActionResult> AddStaff([FromBody] StaffRequest request)
    {
        var auth = User.GetAccount();
        var response = await _staffService.Add(request, auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffResponse>))]
    public async Task<IActionResult> UpdateStaff([FromBody] StaffRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _staffService.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<StaffResponse>>))]
    public async Task<IActionResult> GetStaff([FromQuery] StaffFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _staffService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffResponse>))]
    public async Task<IActionResult> GetStaffById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _staffService.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffResponse>))]
    public async Task<IActionResult> DeleteStaffById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _staffService.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
