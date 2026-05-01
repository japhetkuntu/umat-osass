using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

public interface IIdentityPgRepository<T>:IPgRepository<T,IdentityDbContext> where T : class
{
    
}