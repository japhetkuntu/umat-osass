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

public class TeachingsController : DefaultController
{
    private readonly ITeachingCategoryService _teachingService;
    private readonly ILogger<TeachingsController> _logger;

    public TeachingsController(ILogger<TeachingsController> logger, ITeachingCategoryService teachingService)
    {
        _logger = logger;
        _teachingService = teachingService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetTeachingCategoryState()
    {
        var account = User.GetAccount();
        var response = await _teachingService.GetTeachingCategoryState(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> UpdateTeachingCategoryState([FromForm] UpdateTeachingRequest request)
    {
        var account = User.GetAccount();
        var response = await _teachingService.UpdateTeachingCategoryState(account, request);
        return StatusCode(response.Code, response);
    }
}