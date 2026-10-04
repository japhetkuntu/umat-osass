namespace Umat.Osass.Common.Sdk.Models
{
    public class BaseFilter
    {
        public const int MaxPageSize = 100;

        private int _page = 1;
        private int _pageSize = 10;

        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 1 : value > MaxPageSize ? MaxPageSize : value;
        }

        public string? SortColumn { get; set; }
        public string? SortDir { get; set; }
        public string? Search { get; set; }
    }
}
