using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Implementation;

public class AcademicPromotionPgRepository<T>:PgRepository<T,AcademicPromotionDbContext>,IAcademicPromotionPgRepository<T> where T : class
{
    public AcademicPromotionPgRepository(AcademicPromotionDbContext context) : base(context)
    {
    }
}