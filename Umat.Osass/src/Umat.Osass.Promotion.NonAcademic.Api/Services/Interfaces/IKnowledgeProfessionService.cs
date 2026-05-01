using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface IKnowledgeProfessionService
{
    Task<IApiResponse<KnowledgeProfessionResponse>> UpdateKnowledgeProfessionState(AuthData auth, UpdateKnowledgeProfessionRequest request);
    Task<IApiResponse<KnowledgeProfessionResponse>> GetKnowledgeProfessionState(AuthData auth, string? id = null);
    Task<IApiResponse<List<KnowledgeMaterialIndicatorResponse>>> GetKnowledgeMaterialIndicators();
}
