using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Umat.Osass.Common.Sdk.Services;
using Umat.Osass.Identity.Api.Models;
using Umat.Osass.Identity.Api.Services.Interfaces;

namespace Umat.Osass.Identity.Api.Services.Implementations
{
    public class AuthService : IAuthService
    {
        
        private readonly ILogger<AuthService> _logger;
        public AuthService(ILogger<AuthService> logger)
        {
            _logger = logger;
          
        }

        public string GenerateJwtToken(AuthClaimData auth)
        {
            var claims = new[]
            {

            new Claim(ClaimTypes.Email, auth.Email),
            new Claim(ClaimTypes.Name, $"{auth.FirstName} {auth.LastName}"),
        }.ToList();


            if (!string.IsNullOrEmpty(auth.OnboardingId))
            {
                claims.Add(new Claim(IdentityClaimTypes.OnboardingId, auth.OnboardingId));
            }
            if (!string.IsNullOrEmpty(auth.UserName))
            {
                claims.Add(new Claim(IdentityClaimTypes.UserName, auth.UserName));
            }
            
            if (!string.IsNullOrEmpty(auth.Role))
            {
                claims.Add(new Claim(ClaimTypes.Role, auth.Role));
            }
    
            if (!string.IsNullOrEmpty(auth.Id))
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, auth.Id));
            }
     
            if (!string.IsNullOrEmpty(auth.MobileNumber))
            {
                claims.Add(new Claim(ClaimTypes.MobilePhone, auth.MobileNumber));
            }
            

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(auth.SigningKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                auth.Issuer,
                auth.Issuer,
                [.. claims],
                expires: DateTime.UtcNow.AddHours(auth.DurationInHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(AuthClaimData auth)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(auth.SigningKey)),
                ValidateLifetime = false,
                ValidIssuer = auth.Issuer,
                ValidAudience = auth.Audience,
                RoleClaimType = ClaimTypes.Role
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(auth.Token, tokenValidationParameters, out var securityToken);
                if (securityToken is JwtSecurityToken jwtSecurityToken &&
                    jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                        StringComparison.InvariantCultureIgnoreCase))
                    return principal;
            }
            catch
            {
                return null;
            }

            return null;
        }
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public string GeneratePasswordResetToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
        
    }
}