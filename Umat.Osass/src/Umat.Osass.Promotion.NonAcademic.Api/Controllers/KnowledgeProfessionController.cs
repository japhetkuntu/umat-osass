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
public class KnowledgeProfessionController : DefaultController
{
    private readonly IKnowledgeProfessionService _knowledgeProfessionService;
    private readonly ILogger<KnowledgeProfessionController> _logger;

    public KnowledgeProfessionController(ILogger<KnowledgeProfessionController> logger, IKnowledgeProfessionService knowledgeProfessionService)
    {
        _logger = logger;
        _knowledgeProfessionService = knowledgeProfessionService;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeProfessionResponse>))]
    public async Task<IActionResult> GetKnowledgeProfessionState()
    {
        var account = User.GetAccount();
        var response = await _knowledgeProfessionService.GetKnowledgeProfessionState(account);
        return StatusCode(response.Code, response);
    }

    [HttpGet("indicators")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<KnowledgeMaterialIndicatorResponse>>))]
    public async Task<IActionResult> GetKnowledgeMaterialIndicators()
    {
        var response = await _knowledgeProfessionService.GetKnowledgeMaterialIndicators();
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeProfessionResponse>))]
    public async Task<IActionResult> UpdateKnowledgeProfessionState([FromForm] UpdateKnowledgeProfessionRequest request)
    {
        var account = User.GetAccount();
        var response = await _knowledgeProfessionService.UpdateKnowledgeProfessionState(account, request);
        return StatusCode(response.Code, response);
    }
}
