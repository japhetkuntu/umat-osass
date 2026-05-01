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
public class PublicationIndicatorsController : DefaultController
{
    private readonly ILogger<PublicationIndicatorsController> _logger;
    private readonly IPublicationIndicatorService _publicationIndicatorService;

    public PublicationIndicatorsController(ILogger<PublicationIndicatorsController> logger, IPublicationIndicatorService publicationIndicatorService)
    {
        _logger = logger;
        _publicationIndicatorService = publicationIndicatorService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PublicationIndicatorResponse>))]
    public async Task<IActionResult> AddPublicationIndicator([FromBody] PublicationIndicatorRequest request)
    {
        var auth = User.GetAccount();
        var response = await _publicationIndicatorService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PublicationIndicatorResponse>))]
    public async Task<IActionResult> UpdatePublicationIndicator([FromBody] PublicationIndicatorRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _publicationIndicatorService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<PublicationIndicatorResponse>>))]
    public async Task<IActionResult> GetPublicationIndicators([FromQuery] PublicationIndicatorFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _publicationIndicatorService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PublicationIndicatorResponse>))]
    public async Task<IActionResult> GetPublicationIndicatorById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _publicationIndicatorService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PublicationIndicatorResponse>))]
    public async Task<IActionResult> DeletePublicationIndicatorById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _publicationIndicatorService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

