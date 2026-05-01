using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Admin.Api.Models.Filter.Shared;

public class StaffFilter : BaseFilter
{
    public string? StaffCategory { get; set; } // "Academic" | "Non-Academic"
}
