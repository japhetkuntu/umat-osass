using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]

public class ServicesController : DefaultController
{
    private readonly IServiceCategoryService _serviceService;
    private readonly ILogger<ServicesController> _logger;

    public ServicesController(ILogger<ServicesController> logger, IServiceCategoryService serviceService)
    {
        _logger = logger;
        _serviceService = serviceService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetServiceCategoryState()
    {
        var account = User.GetAccount();
        var response = await _serviceService.GetServiceCategoryState(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> UpdateServiceCategoryState([FromForm] UpdateServiceRequest request)
    {
        var account = User.GetAccount();
        var response = await _serviceService.UpdateServiceCategoryState(account, request);
        return StatusCode(response.Code, response);
    }

    [HttpGet("positions")]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetServicePositions()
    {
        var response = await _serviceService.GetServicePositions();
        return StatusCode(response.Code, response);
    }
}