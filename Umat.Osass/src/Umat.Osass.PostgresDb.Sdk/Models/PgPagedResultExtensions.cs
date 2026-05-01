namespace Umat.Osass.PostgresDb.Sdk.Models;

public static class PgPagedResultExtensions
{
    public static PgPagedResult<T> ToPagedResult<T>(this IEnumerable<T> result, int pageIndex, int pageSize, long count = 0)
        where T : class
    {
        return new PgPagedResult<T>(result, pageIndex, pageSize, count);
    }
}