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

public class PublicationsController : ControllerBase
{
    private readonly IPublicationCategoryService _publicationService;
    private readonly ILogger<PublicationsController> _logger;

    public PublicationsController(ILogger<PublicationsController> logger, IPublicationCategoryService publicationService)
    {
        _logger = logger;
        _publicationService = publicationService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetPublicationCategoryState()
    {
        var account = User.GetAccount();
        var response = await _publicationService.GetPublicationCategoryState(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> UpdatePublicationCategoryState([FromForm] UpdatePublicationRequest request)
    {
        var account = User.GetAccount();
        var response = await _publicationService.UpdatePublicationCategoryState(account, request);
        return StatusCode(response.Code, response);
    }

    [HttpGet("indicators")]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetPublicationIndicators()
    {
        var response = await _publicationService.GetPublicationIndicators();
        return StatusCode(response.Code, response);
    }
}