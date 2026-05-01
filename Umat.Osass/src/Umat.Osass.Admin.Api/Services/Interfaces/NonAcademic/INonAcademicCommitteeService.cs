using Umat.Osass.Admin.Api.Models.Filter.NonAcademic;
using Umat.Osass.Admin.Api.Models.Requests.NonAcademic;
using Umat.Osass.Admin.Api.Models.Responses.NonAcademic;
using Umat.Osass.Admin.Api.Services.Interfaces.Shared;

namespace Umat.Osass.Admin.Api.Services.Interfaces.NonAcademic;

public interface INonAcademicCommitteeService : ICrudService<NonAcademicCommitteeResponse, NonAcademicCommitteeRequest, NonAcademicCommitteeFilter>
{
}
