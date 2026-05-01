namespace Umat.Osass.Admin.Api.Models.Requests.Academic;

public class StaffUpdateRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = "low";
    public bool IsVisible { get; set; } = true;
}
