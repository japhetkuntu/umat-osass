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
public class KnowledgeMaterialIndicatorsController : DefaultController
{
    private readonly ILogger<KnowledgeMaterialIndicatorsController> _logger;
    private readonly IKnowledgeMaterialIndicatorService _service;

    public KnowledgeMaterialIndicatorsController(
        ILogger<KnowledgeMaterialIndicatorsController> logger,
        IKnowledgeMaterialIndicatorService service)
    {
        _logger = logger;
        _service = service;
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeMaterialIndicatorResponse>))]
    public async Task<IActionResult> Add([FromBody] KnowledgeMaterialIndicatorRequest request)
    {
        var auth = User.GetAccount();
        var response = await _service.Add(request, auth);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeMaterialIndicatorResponse>))]
    public async Task<IActionResult> Update([FromBody] KnowledgeMaterialIndicatorRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _service.Update(request, id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<KnowledgeMaterialIndicatorResponse>>))]
    public async Task<IActionResult> GetAll([FromQuery] KnowledgeMaterialIndicatorFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _service.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeMaterialIndicatorResponse>))]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _service.GetById(id, auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<KnowledgeMaterialIndicatorResponse>))]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _service.Delete(id, auth);
        return StatusCode(response.Code, response);
    }
}
