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
public class SchoolsController : DefaultController
{
    private readonly ILogger<SchoolsController> _logger;
    private readonly ISchoolService _schoolService;

    public SchoolsController(ILogger<SchoolsController> logger, ISchoolService schoolService)
    {
        _logger = logger;
        _schoolService = schoolService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SchoolResponse>))]
    public async Task<IActionResult> AddSchool([FromBody] SchoolRequest request)
    {
        var auth = User.GetAccount();
        var response = await _schoolService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SchoolResponse>))]
    public async Task<IActionResult> UpdateSchool([FromBody] SchoolRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _schoolService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<SchoolResponse>>))]
    public async Task<IActionResult> GetSchools([FromQuery] SchoolFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _schoolService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SchoolResponse>))]
    public async Task<IActionResult> GetSchoolById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _schoolService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<SchoolResponse>))]
    public async Task<IActionResult> DeleteSchoolById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _schoolService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

