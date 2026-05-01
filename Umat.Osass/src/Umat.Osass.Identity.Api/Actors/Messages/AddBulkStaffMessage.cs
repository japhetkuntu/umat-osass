using Umat.Osass.Common.Sdk.Models;

namespace Umat.Osass.Identity.Api.Actors.Messages;

public struct AddBulkStaffMessage
{
    public AddBulkStaffData Data { get; set; }

    public AddBulkStaffMessage(AddBulkStaffData data)
    {
        Data = data;
    }
    
}

public class AddBulkStaffData
{
    public AuthData AuthData { get; set; }
    public byte[] FileBytes { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
}
