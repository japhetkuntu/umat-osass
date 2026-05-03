using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Models.Responses;
using Umat.Osass.Identity.Api.Services.Interfaces;

namespace Umat.Osass.Identity.Api.Controllers
{
    /// <summary>
    /// API controller for admin authentication and account management endpoints.
    /// Provides administrative access control including login, token refresh,
    /// password management, and admin profile management operations.
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
    [Authorize(AuthenticationSchemes = $"{Common.Sdk.Models.CommonConstants.AuthScheme.Bearer}")]
    public class AdminsController : DefaultController
    {
        private readonly ILogger<AdminsController> _logger;
        private readonly IAdminService _adminService;

        /// <summary>
        /// Initializes a new instance of the AdminsController.
        /// </summary>
        /// <param name="logger">Logger instance for logging admin controller operations.</param>
        /// <param name="adminService">The admin service for handling business logic.</param>
        public AdminsController(ILogger<AdminsController> logger, IAdminService adminService)
        {
            _logger = logger;
            _adminService = adminService;

        }

        /// <summary>
        /// Authenticates an admin user using email and password.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/admins/login
        /// This endpoint allows admins to log in with their credentials.
        /// Returns JWT tokens on successful authentication with admin privileges.
        /// </remarks>
        /// <param name="request">The login request containing admin email and password.</param>
        /// <returns>OTP response with admin authentication details.</returns>
        /// <response code="200">Login successful, OTP sent to email.</response>
        /// <response code="401">Invalid credentials or insufficient privileges.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("login")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _adminService.AccountLoginAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Refreshes the admin access token using refresh token.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/admins/refreshtoken
        /// Extends the admin session by generating a new access token.
        /// Requires the current access token in the Authorization header.
        /// </remarks>
        /// <param name="request">The refresh token request.</param>
        /// <returns>Admin token response with new JWT tokens.</returns>
        /// <response code="200">Token refreshed successfully.</response>
        /// <response code="401">Invalid or expired refresh token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("refreshtoken")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var token = HttpContext.Request.Headers["Authorization"]
       .FirstOrDefault()?.Replace("Bearer ", "");
            request.AccessToken = token!;
            var response = await _adminService.RefreshTokenAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Retrieves the authenticated admin's profile.
        /// </summary>
        /// <remarks>
        /// Endpoint: GET /api/v1/admins/me
        /// Returns the current authenticated admin's profile information including permissions and roles.
        /// Requires valid JWT token in Authorization header with admin privileges.
        /// </remarks>
        /// <returns>Admin profile response.</returns>
        /// <response code="200">Profile retrieved successfully.</response>
        /// <response code="401">Unauthorized - invalid or missing token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("me")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminTokenResponse>))]
        public async Task<IActionResult> GetProfile()
        {
            var account = User.GetAccount();
            var response = await _adminService.GetAccountAsync(account);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Initiates password reset process for an admin account.
        /// </summary>
        /// <remarks>
        /// Endpoint: GET /api/v1/admins/reset-password/{email}
        /// Generates a password reset token and sends it to the admin's registered email.
        /// </remarks>
        /// <param name="email">The admin's email address.</param>
        /// <returns>Reset password response with token details.</returns>
        /// <response code="200">Password reset initiated successfully.</response>
        /// <response code="404">Admin email not found.</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("reset-password/{email}")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ResetPasswordResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> GetResetPassword([FromRoute] string email)
        {
            var response = await _adminService.GetResetPasswordAsync(email);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Resets admin password using reset token.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/admins/reset-password
        /// Completes the password reset process using the token sent to email.
        /// </remarks>
        /// <param name="request">The reset password request containing new password and reset token.</param>
        /// <returns>Admin token response with new JWT tokens.</returns>
        /// <response code="200">Password reset successfully.</response>
        /// <response code="400">Invalid or expired reset token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("reset-password")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var response = await _adminService.ResetPasswordAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Changes the authenticated admin's password.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/admins/change-password
        /// Updates the password for the authenticated admin.
        /// Requires valid JWT token and the admin's current password.
        /// </remarks>
        /// <param name="request">The change password request containing old and new passwords.</param>
        /// <returns>Admin token response with updated JWT tokens.</returns>
        /// <response code="200">Password changed successfully.</response>
        /// <response code="400">Invalid current password.</response>
        /// <response code="401">Unauthorized - invalid or missing token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("change-password")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AdminTokenResponse>))]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var account = User.GetAccount();
            var response = await _adminService.ChangePassword(request, account);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Retrieves a paged list of all admin accounts. SuperAdmin only.
        /// </summary>
        [HttpGet]
        [Produces(MediaTypeNames.Application.Json)]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmins([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            var response = await _adminService.GetAllAdminsAsync(page, pageSize, search);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Creates a new admin account. SuperAdmin only.
        /// </summary>
        [HttpPost]
        [Produces(MediaTypeNames.Application.Json)]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            var account = User.GetAccount();
            var response = await _adminService.CreateAdminAsync(request, account.Email);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Updates an existing admin account. SuperAdmin only.
        /// </summary>
        [HttpPut("{id}")]
        [Produces(MediaTypeNames.Application.Json)]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateAdmin([FromRoute] string id, [FromBody] UpdateAdminRequest request)
        {
            var account = User.GetAccount();
            var response = await _adminService.UpdateAdminAsync(id, request, account.Email);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Deletes an admin account. SuperAdmin only.
        /// </summary>
        [HttpDelete("{id}")]
        [Produces(MediaTypeNames.Application.Json)]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteAdmin([FromRoute] string id)
        {
            var response = await _adminService.DeleteAdminAsync(id);
            return StatusCode(response.Code, response);
        }

    }
}