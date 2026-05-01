using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

public interface INonAcademicPromotionPgRepository<T> : IPgRepository<T, NonAcademicPromotionDbContext> where T : class
{
}
