using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;

namespace Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

public interface IServiceCategoryService
{
    //service category
    public Task<IApiResponse<ServiceResponse>> UpdateServiceCategoryState(AuthData auth, UpdateServiceRequest request);
    public Task<IApiResponse<ServiceResponse>> GetServiceCategoryState(AuthData auth, string? id=null);
    Task<IApiResponse<List<ServicePositionResponse>>> GetServicePositions();
}