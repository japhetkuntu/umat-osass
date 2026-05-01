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
public class DepartmentsController : DefaultController
{
    private readonly ILogger<DepartmentsController> _logger;
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(ILogger<DepartmentsController> logger, IDepartmentService departmentService)
    {
        _logger = logger;
        _departmentService = departmentService;
    }
    
    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<DepartmentResponse>))]
    public async Task<IActionResult> AddDepartment([FromBody] DepartmentRequest request)
    {
        var auth = User.GetAccount();
        var response = await _departmentService.Add(request,auth);
        return StatusCode(response.Code, response);
    }
    
    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<DepartmentResponse>))]
    public async Task<IActionResult> UpdateDepartment([FromBody] DepartmentRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _departmentService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<DepartmentResponse>>))]
    public async Task<IActionResult> GetDepartments([FromQuery] DepartmentFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _departmentService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<DepartmentResponse>))]
    public async Task<IActionResult> GetDepartmentById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _departmentService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<DepartmentResponse>))]
    public async Task<IActionResult> DeleteDepartmentById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _departmentService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}

