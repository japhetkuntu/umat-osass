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
public class AcademicPositionsController : DefaultController
{
    private readonly ILogger<AcademicPositionsController> _logger;
    private readonly IAcademicPositionService _academicPositionService;

    public AcademicPositionsController(ILogger<AcademicPositionsController> logger, IAcademicPositionService academicPositionService)
    {
        _logger = logger;
        _academicPositionService = academicPositionService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AcademicPositionResponse>))]
    public async Task<IActionResult> AddAcademicPosition([FromBody] AcademicPositionRequest request)
    {
        var auth = User.GetAccount();
        var response = await _academicPositionService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AcademicPositionResponse>))]
    public async Task<IActionResult> UpdateAcademicPosition([FromBody] AcademicPositionRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _academicPositionService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<AcademicPositionResponse>>))]
    public async Task<IActionResult> GetAcademicPositions([FromQuery] AcademicPositionFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _academicPositionService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AcademicPositionResponse>))]
    public async Task<IActionResult> GetAcademicPositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _academicPositionService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AcademicPositionResponse>))]
    public async Task<IActionResult> DeleteAcademicPositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _academicPositionService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

