

using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Models.Responses;

namespace Umat.Osass.Identity.Api.Services.Interfaces;

/// <summary>
/// Service interface for admin authentication and account management operations.
/// Provides methods for admin login, token refresh, profile retrieval,
/// password management, and administrative access control.
/// </summary>
public interface IAdminService
{
    /// <summary>
    /// Refreshes an expired admin access token using a valid refresh token.
    /// Extends the admin session without requiring re-authentication.
    /// </summary>
    /// <param name="request">The refresh token request containing the refresh token details.</param>
    /// <returns>An API response containing new JWT tokens for admin access.</returns>
    Task<IApiResponse<AdminTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);

    /// <summary>
    /// Retrieves the current authenticated admin's profile information.
    /// Includes admin details, permissions, and administrative metadata.
    /// </summary>
    /// <param name="auth">The authenticated admin's authorization data.</param>
    /// <returns>An API response containing the admin's profile information.</returns>
    Task<IApiResponse<AdminProfileResponse>> GetAccountAsync(AuthData auth);

    /// <summary>
    /// Initiates a password reset process for an admin account.
    /// Generates and sends a password reset token to the admin's registered email.
    /// </summary>
    /// <param name="email">The email address of the admin account to reset.</param>
    /// <returns>An API response containing password reset details and token expiration info.</returns>
    Task<IApiResponse<ResetPasswordResponse>> GetResetPasswordAsync(string email);

    /// <summary>
    /// Resets an admin's password using a valid password reset token.
    /// Allows admins who forgot their password to set a new one.
    /// </summary>
    /// <param name="request">The reset password request containing new password and reset token.</param>
    /// <returns>An API response containing JWT tokens for the admin account with updated password.</returns>
    Task<IApiResponse<AdminTokenResponse>> ResetPasswordAsync(ResetPasswordRequest request);

    /// <summary>
    /// Changes the password for an authenticated admin account.
    /// Requires the admin to provide their current password for verification.
    /// </summary>
    /// <param name="request">The change password request containing old and new passwords.</param>
    /// <param name="auth">The authenticated admin's authorization data.</param>
    /// <returns>An API response containing JWT tokens after password change.</returns>
    Task<IApiResponse<AdminTokenResponse>> ChangePassword(ChangePasswordRequest request, AuthData auth);

    /// <summary>
    /// Authenticates an admin using email and password credentials.
    /// Returns JWT access and refresh tokens upon successful authentication.
    /// </summary>
    /// <param name="request">The login request containing admin email and password.</param>
    /// <returns>An API response containing JWT tokens and admin details.</returns>
    Task<IApiResponse<AdminTokenResponse>> AccountLoginAsync(LoginRequest request);
}