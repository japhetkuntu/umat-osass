using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Filter;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface IStaffUpdateService
{
    Task<IApiResponse<PgPagedResult<StaffUpdateResponse>>> GetVisibleUpdates(StaffUpdateFilter filter);
    Task<IApiResponse<StaffUpdateResponse>> GetById(string id);
}
