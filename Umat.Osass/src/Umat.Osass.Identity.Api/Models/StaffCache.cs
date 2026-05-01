using Umat.Osass.PostgresDb.Sdk.Entities.Identity;

namespace Umat.Osass.Identity.Api.Models;

public class StaffCache:Staff
{
    public string OTP { get; set; }
    public string Source { get; set; }
}