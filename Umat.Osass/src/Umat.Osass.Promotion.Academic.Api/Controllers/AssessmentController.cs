using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;
using Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

namespace Umat.Osass.Promotion.Academic.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class AssessmentController : DefaultController
{
    private readonly IAssessmentService _assessmentService;
    private readonly ILogger<AssessmentController> _logger;

    public AssessmentController(ILogger<AssessmentController> logger, IAssessmentService assessmentService)
    {
        _logger = logger;
        _assessmentService = assessmentService;
    }

    /// <summary>
    /// Get committee member information and permissions
    /// </summary>
    [HttpGet("member-info")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<CommitteeMemberInfoResponse>))]
    public async Task<IActionResult> GetCommitteeMemberInfo()
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetCommitteeMemberInfo(account);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get assessment dashboard with statistics and recent activities
    /// </summary>
    [HttpGet("dashboard")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AssessmentDashboardResponse>))]
    public async Task<IActionResult> GetDashboard()
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetDashboard(account);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get pending applications for a specific committee
    /// </summary>
    [HttpGet("pending/{committeeType}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PgPagedResult<PendingApplicationResponse>>))]
    public async Task<IActionResult> GetPendingApplications(string committeeType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetPendingApplications(account, committeeType, page, pageSize, search);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get reviewed/completed applications history for a specific committee
    /// </summary>
    [HttpGet("history/{committeeType}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PgPagedResult<PendingApplicationResponse>>))]
    public async Task<IActionResult> GetApplicationHistory(string committeeType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetApplicationHistory(account, committeeType, page, pageSize, search);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get full application details for assessment
    /// </summary>
    [HttpGet("{applicationId}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ApplicationForAssessmentResponse>))]
    public async Task<IActionResult> GetApplicationForAssessment(string applicationId)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetApplicationForAssessment(account, applicationId);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Submit assessment scores (chairperson only)
    /// </summary>
    [HttpPost("{applicationId}/scores")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> SubmitAssessmentScores(string applicationId, [FromBody] SubmitAssessmentScoresRequest request)
    {
        if (request.ApplicationId != applicationId)
            return BadRequest(new ApiResponse<bool>("Application ID mismatch", 400));

        var account = User.GetAccount();
        var response = await _assessmentService.SubmitAssessmentScores(account, request);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Add a comment on an application (any committee member)
    /// </summary>
    [HttpPost("{applicationId}/comment")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> AddAssessmentComment(string applicationId, [FromBody] AddAssessmentCommentRequest request)
    {
        if (request.ApplicationId != applicationId)
            return BadRequest(new ApiResponse<bool>("Application ID mismatch", 400));

        var account = User.GetAccount();
        var response = await _assessmentService.AddAssessmentComment(account, request);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Return application to applicant for modifications (chairperson only)
    /// </summary>
    [HttpPost("{applicationId}/return")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> ReturnApplication(string applicationId, [FromBody] ReturnApplicationRequest request)
    {
        if (request.ApplicationId != applicationId)
            return BadRequest(new ApiResponse<bool>("Application ID mismatch", 400));

        var account = User.GetAccount();
        var response = await _assessmentService.ReturnApplication(account, request);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Advance application to next committee (chairperson only)
    /// </summary>
    [HttpPost("{applicationId}/advance")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> AdvanceApplication(string applicationId, [FromBody] AdvanceApplicationRequest request)
    {
        if (request.ApplicationId != applicationId)
            return BadRequest(new ApiResponse<bool>("Application ID mismatch", 400));

        var account = User.GetAccount();
        var response = await _assessmentService.AdvanceApplication(account, request);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Get activity history for an application
    /// </summary>
    [HttpGet("{applicationId}/history")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<ActivityHistoryItem>>))]
    public async Task<IActionResult> GetActivityHistory(string applicationId)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.GetActivityHistory(account, applicationId);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Approve application (UAPC chairperson only)
    /// </summary>
    [HttpPost("{applicationId}/approve")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> ApproveApplication(string applicationId, [FromBody] ApproveApplicationRequest? request)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.ApproveApplication(account, applicationId, request?.Recommendation);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Reject application (UAPC chairperson only)
    /// </summary>
    [HttpPost("{applicationId}/reject")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<bool>))]
    public async Task<IActionResult> RejectApplication(string applicationId, [FromBody] RejectApplicationRequest request)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.RejectApplication(account, applicationId, request.Reason);
        return StatusCode(response.Code, response);
    }

    /// <summary>
    /// Validate application for promotion (UAPC chairperson only)
    /// Returns detailed analysis of whether applicant meets position requirements
    /// </summary>
    [HttpGet("{applicationId}/validate")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PromotionValidationResponse>))]
    public async Task<IActionResult> ValidateForPromotion(string applicationId)
    {
        var account = User.GetAccount();
        var response = await _assessmentService.ValidateForPromotion(account, applicationId);
        return StatusCode(response.Code, response);
    }
}

/// <summary>
/// Request model for approving an application
/// </summary>
public record ApproveApplicationRequest
{
    public string? Recommendation { get; init; }
}

/// <summary>
/// Request model for rejecting an application
/// </summary>
public record RejectApplicationRequest
{
    public required string Reason { get; init; }
}
