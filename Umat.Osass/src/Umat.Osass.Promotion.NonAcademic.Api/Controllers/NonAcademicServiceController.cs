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
public class NonAcademicServiceController : DefaultController
{
    private readonly INonAcademicServiceCategoryService _serviceCategoryService;
    private readonly ILogger<NonAcademicServiceController> _logger;

    public NonAcademicServiceController(ILogger<NonAcademicServiceController> logger, INonAcademicServiceCategoryService serviceCategoryService)
    {
        _logger = logger;
        _serviceCategoryService = serviceCategoryService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicServiceResponse>))]
    public async Task<IActionResult> GetServiceCategoryState()
    {
        var account = User.GetAccount();
        var response = await _serviceCategoryService.GetServiceCategoryState(account);
        return StatusCode(response.Code, response);
    }

    [HttpGet("positions")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<ServicePositionIndicatorResponse>>))]
    public async Task<IActionResult> GetServicePositions()
    {
        var response = await _serviceCategoryService.GetServicePositions();
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<NonAcademicServiceResponse>))]
    public async Task<IActionResult> UpdateServiceCategoryState([FromForm] UpdateNonAcademicServiceRequest request)
    {
        var account = User.GetAccount();
        var response = await _serviceCategoryService.UpdateServiceCategoryState(account, request);
        return StatusCode(response.Code, response);
    }
}
