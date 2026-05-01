using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Models.Filter.Academic;

public class StaffUpdateFilter : BaseFilter
{
    public string? Category { get; set; }
    public bool? IsVisible { get; set; }
}
