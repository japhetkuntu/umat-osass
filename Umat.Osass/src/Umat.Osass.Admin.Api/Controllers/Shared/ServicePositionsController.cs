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
public class ServicePositionsController : DefaultController
{
    private readonly ILogger<ServicePositionsController> _logger;
    private readonly IServicePositionService _servicePositionService;

    public ServicePositionsController(ILogger<ServicePositionsController> logger, IServicePositionService servicePositionService)
    {
        _logger = logger;
        _servicePositionService = servicePositionService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServicePositionResponse>))]
    public async Task<IActionResult> AddServicePosition([FromBody] ServicePositionRequest request)
    {
        var auth = User.GetAccount();
        var response = await _servicePositionService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServicePositionResponse>))]
    public async Task<IActionResult> UpdateServicePosition([FromBody] ServicePositionRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _servicePositionService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<ServicePositionResponse>>))]
    public async Task<IActionResult> GetServicePositions([FromQuery] ServicePositionFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _servicePositionService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServicePositionResponse>))]
    public async Task<IActionResult> GetServicePositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _servicePositionService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServicePositionResponse>))]
    public async Task<IActionResult> DeleteServicePositionById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _servicePositionService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

