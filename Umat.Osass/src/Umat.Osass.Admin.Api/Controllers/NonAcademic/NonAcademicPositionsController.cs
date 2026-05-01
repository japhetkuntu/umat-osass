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
public class NonAcademicPositionsController : DefaultController
{
    private readonly ILogger<NonAcademicPositionsController> _logger;
    private readonly INonAcademicPositionService _positionService;

    public NonAcademicPositionsController(ILogger<NonAcademicPositionsController> logger, INonAcademicPositionService positionService)
    {
        _logger = logger;
        _positionService = positionService;
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicPositionResponse>))]
    public async Task<IActionResult> AddPosition([FromBody] NonAcademicPositionRequest request)
    {
        var auth = User.GetAccount();
        var response = await _positionService.Add(request, auth);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicPositionResponse>))]
    public async Task<IActionResult> UpdatePosition([FromBody] NonAcademicPositionRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _positionService.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<NonAcademicPositionResponse>>))]
    public async Task<IActionResult> GetPositions([FromQuery] NonAcademicPositionFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _positionService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicPositionResponse>))]
    public async Task<IActionResult> GetPositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _positionService.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicPositionResponse>))]
    public async Task<IActionResult> DeletePositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _positionService.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
