using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;
using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Services.Interfaces.Academic;

public interface IStaffUpdateService : ICrudService<StaffUpdateResponse, StaffUpdateRequest, StaffUpdateFilter>
{
    Task<IApiResponse<StaffUpdateResponse>> ToggleVisibility(string id, AuthData auth);
}
