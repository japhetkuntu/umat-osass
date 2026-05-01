using Umat.Osass.Admin.Api.Models.Filter.Shared;
using Umat.Osass.Admin.Api.Models.Requests.Shared;
using Umat.Osass.Admin.Api.Models.Responses.Shared;

namespace Umat.Osass.Admin.Api.Services.Interfaces.Shared;

public interface IFacultyService:ICrudService<FacultyResponse,FacultyRequest,FacultyFilter>
{
    
}