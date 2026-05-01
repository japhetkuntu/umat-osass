using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.NonAcademic.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class PerformanceAtWorkController : DefaultController
{
    private readonly IPerformanceAtWorkService _performanceAtWorkService;
    private readonly ILogger<PerformanceAtWorkController> _logger;

    public PerformanceAtWorkController(ILogger<PerformanceAtWorkController> logger, IPerformanceAtWorkService performanceAtWorkService)
    {
        _logger = logger;
        _performanceAtWorkService = performanceAtWorkService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PerformanceAtWorkResponse>))]
    public async Task<IActionResult> GetPerformanceAtWorkState()
    {
        var account = User.GetAccount();
        var response = await _performanceAtWorkService.GetPerformanceAtWorkState(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PerformanceAtWorkResponse>))]
    public async Task<IActionResult> UpdatePerformanceAtWorkState([FromForm] UpdatePerformanceAtWorkRequest request)
    {
        var account = User.GetAccount();
        var response = await _performanceAtWorkService.UpdatePerformanceAtWorkState(account, request);
        return StatusCode(response.Code, response);
    }
}
