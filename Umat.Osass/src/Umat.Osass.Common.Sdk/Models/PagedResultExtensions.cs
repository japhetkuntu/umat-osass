namespace Umat.Osass.Common.Sdk.Models;

public static class PagedResultExtensions
{
    public static PagedResult<T> ToPagedResult<T>(this IEnumerable<T> result, int pageIndex, int pageSize, long count = 0)
        where T : class
    {
        return new PagedResult<T>(result, pageIndex, pageSize, count);
    }
}