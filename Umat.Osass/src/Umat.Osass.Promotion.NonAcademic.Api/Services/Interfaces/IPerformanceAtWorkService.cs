using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface IPerformanceAtWorkService
{
    Task<IApiResponse<PerformanceAtWorkResponse>> UpdatePerformanceAtWorkState(AuthData auth, UpdatePerformanceAtWorkRequest request);
    Task<IApiResponse<PerformanceAtWorkResponse>> GetPerformanceAtWorkState(AuthData auth, string? id = null);
}
