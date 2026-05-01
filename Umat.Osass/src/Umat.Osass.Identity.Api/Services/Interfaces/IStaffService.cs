

using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Models.Responses;

namespace Umat.Osass.Identity.Api.Services.Interfaces;

/// <summary>
/// Service interface for customer authentication and account management operations.
/// Provides methods for customer registration, login, token refresh, email verification,
/// password management, and profile retrieval.
/// </summary>
public interface IStaffService
{
    /// <summary>
    /// Registers a new customer account manually with email and password.
    /// Generates and sends an OTP to the customer's email for verification.
    /// </summary>
    /// <param name="request">The registration request containing email and password details.</param>
    /// <returns>An API response containing the OTP response with verification details.</returns>
    public Task<IApiResponse<OtpResponse>> RegisterManualAsync(RegisterRequest request);

    /// <summary>
    /// Authenticates a customer using email and password credentials.
    /// Returns JWT access and refresh tokens upon successful authentication.
    /// </summary>
    /// <param name="request">The login request containing email and password.</param>
    /// <returns>An API response containing JWT tokens and customer details.</returns>
    Task<IApiResponse<StaffTokenResponse>> AccountLoginAsync(LoginRequest request);

    /// <summary>
    /// Refreshes an expired access token using a valid refresh token.
    /// Extends the customer session without requiring re-authentication.
    /// </summary>
    /// <param name="request">The refresh token request containing the refresh token details.</param>
    /// <returns>An API response containing new JWT tokens.</returns>
    Task<IApiResponse<StaffTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);

    /// <summary>
    /// Verifies a customer's email address using the OTP provided during registration.
    /// Completes the email verification process and activates the customer account.
    /// </summary>
    /// <param name="request">The verify email request containing OTP and email details.</param>
    /// <returns>An API response containing JWT tokens for the verified customer account.</returns>
    public Task<IApiResponse<StaffTokenResponse>> VerifyEmail(VerifyEmailRequest request);

    /// <summary>
    /// Retrieves the current authenticated customer's profile information.
    /// Includes account details, preferences, and subscription status.
    /// </summary>
    /// <param name="auth">The authenticated user's authorization data.</param>
    /// <returns>An API response containing the customer's profile information.</returns>
    Task<IApiResponse<StaffProfileResponse>> GetAccountAsync(AuthData auth);

    /// <summary>
    /// Resends the OTP to the customer's email address.
    /// Used when the customer didn't receive the initial OTP or it has expired.
    /// </summary>
    /// <param name="request">The resend OTP request containing the email address.</param>
    /// <returns>An API response containing a new OTP response.</returns>
    Task<IApiResponse<OtpResponse>> ResendOtp(ResendOtpRequest request);

    /// <summary>
    /// Initiates a password reset process for a customer account.
    /// Generates and sends a password reset token to the customer's email.
    /// </summary>
    /// <param name="email">The email address of the customer account to reset.</param>
    /// <returns>An API response containing password reset details and token expiration info.</returns>
    Task<IApiResponse<ResetPasswordResponse>> GetResetPasswordAsync(string email);

    /// <summary>
    /// Resets a customer's password using a valid password reset token.
    /// Allows customers who forgot their password to set a new one.
    /// </summary>
    /// <param name="request">The reset password request containing new password and reset token.</param>
    /// <returns>An API response containing JWT tokens for the account with updated password.</returns>
    Task<IApiResponse<StaffTokenResponse>> ResetPasswordAsync(ResetPasswordRequest request);

    /// <summary>
    /// Changes the password for an authenticated customer account.
    /// Requires the customer to provide their current password for verification.
    /// </summary>
    /// <param name="request">The change password request containing old and new passwords.</param>
    /// <param name="auth">The authenticated user's authorization data.</param>
    /// <returns>An API response containing JWT tokens after password change.</returns>
    Task<IApiResponse<StaffTokenResponse>> ChangePassword(ChangePasswordRequest request, AuthData auth);
    
    Task<object?> AddStaff(AddStaffRequest request, AuthData auth);
}