using System.Security.Claims;
using Umat.Osass.Identity.Api.Models;

namespace Umat.Osass.Identity.Api.Services.Interfaces
{
    /// <summary>
    /// Service interface for JWT token generation and validation operations.
    /// Provides methods for creating JWT tokens, validating expired tokens,
    /// and generating security tokens for password reset and token refresh.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Generates a JWT access token for an authenticated user.
        /// The token includes user claims and is signed with the application's security key.
        /// </summary>
        /// <param name="auth">The authentication claim data containing user identity and roles.</param>
        /// <returns>A signed JWT token string that can be used for API authorization.</returns>
        string GenerateJwtToken(AuthClaimData auth);

        /// <summary>
        /// Extracts and validates the claims principal from an expired JWT token.
        /// Used to retrieve user information from expired tokens during refresh operations.
        /// </summary>
        /// <param name="auth">The authentication claim data for token validation.</param>
        /// <returns>A claims principal containing the user's claims, or null if validation fails.</returns>
        ClaimsPrincipal? GetPrincipalFromExpiredToken(AuthClaimData auth);

        /// <summary>
        /// Generates a secure token for password reset functionality.
        /// This token is typically sent via email to users initiating password reset.
        /// </summary>
        /// <returns>A secure, randomly generated password reset token string.</returns>
        string GeneratePasswordResetToken();

        /// <summary>
        /// Generates a refresh token for extending user sessions.
        /// Refresh tokens are used to obtain new access tokens without re-authentication.
        /// </summary>
        /// <returns>A secure, randomly generated refresh token string.</returns>
        string GenerateRefreshToken();
    }
}
