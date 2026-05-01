using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Implementation;

public class NonAcademicPromotionPgRepository<T> : PgRepository<T, NonAcademicPromotionDbContext>, INonAcademicPromotionPgRepository<T> where T : class
{
    public NonAcademicPromotionPgRepository(NonAcademicPromotionDbContext context) : base(context)
    {
    }
}
