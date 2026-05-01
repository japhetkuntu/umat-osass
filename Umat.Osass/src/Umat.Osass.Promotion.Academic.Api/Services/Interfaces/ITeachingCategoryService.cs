using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;

namespace Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

public interface ITeachingCategoryService
{
    //teaching category
    public Task<IApiResponse<TeachingResponse>> UpdateTeachingCategoryState(AuthData auth,
        UpdateTeachingRequest request);
    public Task<IApiResponse<TeachingResponse>> GetTeachingCategoryState(AuthData auth, string? id=null);
}