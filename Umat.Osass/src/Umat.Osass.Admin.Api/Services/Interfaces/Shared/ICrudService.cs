using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Services.Interfaces.Shared;

public interface ICrudService<TReturnType,TInputPayload,TFilter>
{
    public Task<IApiResponse<TReturnType>> Add(TInputPayload request, AuthData auth);
    public Task<IApiResponse<TReturnType>> Update(TInputPayload request,string id, AuthData auth);
    public Task<IApiResponse<TReturnType>> Delete(string id, AuthData auth);
    public Task<IApiResponse<TReturnType>> GetById(string id, AuthData auth);
    public Task<IApiResponse<PagedResult<TReturnType>>> GetPagedList(TFilter filter, AuthData auth);
}