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
public class ServiceCategoriesController : DefaultController
{
    private readonly ILogger<ServiceCategoriesController> _logger;
    private readonly IServiceCategoryService _serviceCategoryService;

    public ServiceCategoriesController(ILogger<ServiceCategoriesController> logger, IServiceCategoryService serviceCategoryService)
    {
        _logger = logger;
        _serviceCategoryService = serviceCategoryService;
    }

    [HttpPost()]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServiceCategoryResponse>))]
    public async Task<IActionResult> AddServiceCategory([FromBody] ServiceCategoryRequest request)
    {
        var auth = User.GetAccount();
        var response = await _serviceCategoryService.Add(request,auth);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServiceCategoryResponse>))]
    public async Task<IActionResult> UpdateServiceCategory([FromBody] ServiceCategoryRequest request, string id)
    {
        var auth = User.GetAccount();
        var response = await _serviceCategoryService.Update(request,id,auth);
        return StatusCode(response.Code, response);
    }
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<ServiceCategoryResponse>>))]
    public async Task<IActionResult> GetServiceCategories([FromQuery] ServiceCategoryFilter filter)
    {
        var auth = User.GetAccount();
        var response = await _serviceCategoryService.GetPagedList(filter, auth);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServiceCategoryResponse>))]
    public async Task<IActionResult> GetServiceCategoryById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _serviceCategoryService.GetById(id,auth);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ServiceCategoryResponse>))]
    public async Task<IActionResult> DeleteServiceCategoryById([FromRoute] string id)
    {
        var auth = User.GetAccount();
        var response = await _serviceCategoryService.Delete(id,auth);
        return StatusCode(response.Code, response);
    }


}
