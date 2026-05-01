using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Implementation;

public class IdentityPgRepository<T>:PgRepository<T,IdentityDbContext>,IIdentityPgRepository<T> where T : class
{
    public IdentityPgRepository(IdentityDbContext context) : base(context)
    {
    }
}