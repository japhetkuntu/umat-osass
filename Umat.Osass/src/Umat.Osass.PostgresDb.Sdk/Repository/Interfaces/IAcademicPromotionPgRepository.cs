using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

public interface IAcademicPromotionPgRepository<T>:IPgRepository<T,AcademicPromotionDbContext> where T : class
{
    
}