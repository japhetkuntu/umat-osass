using System.Security.Claims;
using System.Security.Principal;
using Newtonsoft.Json;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Common.Sdk.Services;

namespace Umat.Osass.Common.Sdk.Extensions;

public static class IdentityPrincipalExtensions
{
    private static string GetUserId(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier);
        return claim?.Value!;
    }

    private static string GetUserEmail(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.Email);
        return claim?.Value!;
    }
    private static string GetUserMobileNumber(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.MobilePhone);
        return claim?.Value!;
    }

    private static string GetUserName(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.Name);
        return claim?.Value!;
    }

    private static string GetUserRole(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.Role);
        return claim?.Value!;
    }
        private static string GetAccountUserName(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(IdentityClaimTypes.UserName);
        return claim?.Value!;
    }
        
    private static string GetOnboardingId(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(IdentityClaimTypes.OnboardingId);
        return claim?.Value!;
    }
    

    private static AuthData? GetUserThumbPrintDataData(this IPrincipal principal)
    {
        var claimsIdentity = (ClaimsIdentity)principal.Identity!;
        var claim = claimsIdentity?.FindFirst(ClaimTypes.Thumbprint);
        if (claim == null) return new AuthData();
        var userThumbprint = JsonConvert.DeserializeObject<AuthData>(claim.Value);
        return userThumbprint;

    }
    public static AuthData GetAccount(this ClaimsPrincipal principal)
    {
        return new AuthData
        {
            Id = principal.GetUserId(),
            Role = principal.GetUserRole(),
            Name = principal.GetUserName(),
            Email = principal.GetUserEmail(),
            MobileNumber = principal.GetUserMobileNumber(),
            OnboardingId = principal.GetOnboardingId(),
            UserName = principal.GetAccountUserName(),
        };

    }
}