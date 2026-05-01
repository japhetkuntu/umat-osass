using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;

namespace Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

public interface IPublicationCategoryService
{
    //Publication category
    public Task<IApiResponse<PublicationResponse>> UpdatePublicationCategoryState(AuthData auth,
        UpdatePublicationRequest request);

    public Task<IApiResponse<PublicationResponse>> GetPublicationCategoryState(AuthData auth, string? id=null);
    Task<IApiResponse<List<PublicationIndicatorResponse>>> GetPublicationIndicators();
}