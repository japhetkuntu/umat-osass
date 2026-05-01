using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface INonAcademicServiceCategoryService
{
    Task<IApiResponse<NonAcademicServiceResponse>> UpdateServiceCategoryState(AuthData auth, UpdateNonAcademicServiceRequest request);
    Task<IApiResponse<NonAcademicServiceResponse>> GetServiceCategoryState(AuthData auth, string? id = null);
    Task<IApiResponse<List<ServicePositionIndicatorResponse>>> GetServicePositions();
}
