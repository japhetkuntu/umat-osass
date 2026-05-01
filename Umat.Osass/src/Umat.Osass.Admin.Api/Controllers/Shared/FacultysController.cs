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
public class FacultysController : DefaultController
{
    private readonly ILogger<FacultysController> _logger;
    private readonly IFacultyService _facultyService;

    public FacultysController(ILogger<FacultysController> logger, IFacultyService facultyService)
    {
        _logger = logger;
        _facultyService = facultyService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FacultyResponse>))]
    public async Task<IActionResult> AddFaculty([FromBody] FacultyRequest request)
    {
        var auth = User.GetAccount();
        var response = await _facultyService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FacultyResponse>))]
    public async Task<IActionResult> UpdateFaculty([FromBody] FacultyRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _facultyService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<FacultyResponse>>))]
    public async Task<IActionResult> GetFacultys([FromQuery] FacultyFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _facultyService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FacultyResponse>))]
    public async Task<IActionResult> GetFacultyById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _facultyService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FacultyResponse>))]
    public async Task<IActionResult> DeleteFacultyById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _facultyService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

