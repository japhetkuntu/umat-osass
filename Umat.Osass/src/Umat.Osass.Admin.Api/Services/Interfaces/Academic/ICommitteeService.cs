using Umat.Osass.Admin.Api.Models.Filter.Academic;
using Umat.Osass.Admin.Api.Models.Requests.Academic;
using Umat.Osass.Admin.Api.Models.Responses.Academic;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;

namespace Umat.Osass.Admin.Api.Services.Interfaces.Academic;

public interface ICommitteeService:ICrudService<CommitteeResponse,CommitteeRequest,CommitteeFilter>
{
    
}
