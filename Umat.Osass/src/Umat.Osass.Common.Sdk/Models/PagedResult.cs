namespace Umat.Osass.Common.Sdk.Models;

public  class PagedResult<T>
{
    public PagedResult(IEnumerable<T> results, int pageIndex = 1, int pageSize = 10, long count = 0, long totalCount = 0)
    {

        TotalCount = totalCount <= 0 ? count : totalCount;
        PageIndex = pageIndex;
        PageSize = pageSize;
        var pageCount = (double)TotalCount / pageSize;
        TotalPages = (int)Math.Ceiling(pageCount);
        Results = results;
        LowerBoundSize = pageSize * pageIndex - pageSize + 1;

        var upperBoundSize = pageSize * pageIndex;
        UpperBoundSize = upperBoundSize > (int)count ? (int)count : upperBoundSize;
        Count = count;

    }

    public int PageIndex { get; }
    public int PageSize { get; }
    public long Count { get;}

    public long TotalCount { get; }
    public int TotalPages { get; }
    public int LowerBoundSize { get; set; }
    public int UpperBoundSize { get; set; }
    public IEnumerable<T> Results { get; }

}



