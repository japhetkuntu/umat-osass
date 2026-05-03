using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class ApplicationsController : DefaultController
{
    private readonly IApplicationService _applicationService;
    private readonly ILogger<ApplicationsController> _logger;


    public ApplicationsController(ILogger<ApplicationsController> logger, IApplicationService applicationService)
    {
        _logger = logger;
        _applicationService = applicationService;
    }


    [HttpGet("eligibility")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<EligibilityResponse>))]
    public async Task<IActionResult> GetApplicationEligibility()
    {
        var account = User.GetAccount();
        var response = await _applicationService.GetPromotionPositionEligibilityStatus(account);
        return StatusCode(response.Code, response);
    }
    
    [HttpGet("category-state")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ApplicationCategoryStateResponse>))]
    public async Task<IActionResult> GetApplicationCategoryState()
    {
        var account = User.GetAccount();
        var response = await _applicationService.ApplicationCategoryState(account);
        return StatusCode(response.Code, response);
    }

    [HttpGet("overall-review")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<OverallOverview>))]
    public async Task<IActionResult> GetOverallReview()
    {
        var account = User.GetAccount();
        var response = await _applicationService.ActiveApplicationOverallReview(account);
        return StatusCode(response.Code, response);
    }

    [HttpGet("submitted-preview")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SubmittedApplicationResponse>))]
    public async Task<IActionResult> GetSubmittedApplicationPreview()
    {
        var account = User.GetAccount();
        var response = await _applicationService.SubmittedApplicationPreview(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost("start")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ApplicationCategoryStateResponse>))]
    public async Task<IActionResult> StartApplication()
    {
        var account = User.GetAccount();
        var response = await _applicationService.StartAcademicPromotionApplication(account);
        return StatusCode(response.Code, response);
    }

    [HttpPost("submit")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> SubmitApplication()
    {
        var account = User.GetAccount();
        var response = await _applicationService.SubmitApplication(account);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get the applicant's currently uploaded CV & Application Letter for the active application.
    /// </summary>
    [HttpGet("documents")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ApplicationDocumentsResponse>))]
    public async Task<IActionResult> GetApplicationDocuments()
    {
        var account = User.GetAccount();
        var response = await _applicationService.GetApplicationDocuments(account);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Upload (or replace) the applicant's CV and/or Application Letter.
    /// Only allowed while the application is in Draft or Returned status.
    /// </summary>
    [HttpPost("documents")]
    [Consumes("multipart/form-data")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ApplicationDocumentsResponse>))]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UploadApplicationDocuments([FromForm] UploadApplicationDocumentsRequest request)
    {
        var account = User.GetAccount();
        var response = await _applicationService.UploadApplicationDocuments(account, request);
        return StatusCode(response.Code, response);
    }

    [HttpGet("history")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<PromotionHistoryResponse>>))]
    public async Task<IActionResult> GetPromotionHistory()
    {
        var account = User.GetAccount();
        var response = await _applicationService.GetPromotionHistory(account);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get promotion letter for a specific application or the most recent approved one
    /// </summary>
    [HttpGet("promotion-letter")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PromotionLetterResponse>))]
    public async Task<IActionResult> GetPromotionLetter([FromQuery] string? applicationId = null)
    {
        var account = User.GetAccount();
        var response = await _applicationService.GetPromotionLetter(account, applicationId);
        return StatusCode(response.Code, response);
    }

    [HttpGet("eligibility-forecast")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<EligibilityForecastResponse>))]
    public async Task<IActionResult> GetEligibilityForecast()
    {
        var account = User.GetAccount();
        var response = await _applicationService.GetEligibilityForecast(account);
        return StatusCode(response.Code, response);
    }
}