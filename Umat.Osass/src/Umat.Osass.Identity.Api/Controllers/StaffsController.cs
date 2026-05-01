using System.Net.Mime;
using Akka.Actor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Identity.Api.Actors;
using Umat.Osass.Identity.Api.Actors.Messages;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Models.Responses;
using Umat.Osass.Identity.Api.Services.Interfaces;

namespace Umat.Osass.Identity.Api.Controllers
{
    /// <summary>
    /// API controller for customer authentication and account management endpoints.
    /// Handles customer registration, login, email verification, password management,
    /// token refresh, and profile management operations.
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
    [Authorize(AuthenticationSchemes = $"{Common.Sdk.Models.CommonConstants.AuthScheme.Bearer}")]
    public class StaffsController : DefaultController
    {
        private readonly ILogger<StaffsController> _logger;
        private readonly IStaffService _staffService;

        /// <summary>
        /// Initializes a new instance of the StaffsController.
        /// </summary>
        /// <param name="logger">Logger instance for logging customer controller operations.</param>
        /// <param name="staffService">The customer service for handling business logic.</param>
        public StaffsController(ILogger<StaffsController> logger, IStaffService staffService)
        {
            _logger = logger;
            _staffService = staffService;

        }

        /// <summary>
        /// Authenticates a customer using email and password.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/login
        /// This endpoint allows customers to log in with their credentials.
        /// Returns JWT tokens on successful authentication.
        /// </remarks>
        /// <param name="request">The login request containing email and password.</param>
        /// <returns>OTP response with authentication details.</returns>
        /// <response code="200">Login successful, OTP sent to email.</response>
        /// <response code="401">Invalid credentials.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("login")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _staffService.AccountLoginAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Authenticates an academic staff member. Non-academic staff are denied access.
        /// </summary>
        [HttpPost("login/academic")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden, Type = typeof(ApiResponse<object>))]
        [AllowAnonymous]
        public async Task<IActionResult> LoginAcademic([FromBody] LoginRequest request)
        {
            var response = await _staffService.AccountLoginAsync(request);
            if (response.Code == StatusCodes.Status200OK &&
                !string.Equals(response.Data?.MetaData?.StaffCategory, "Academic", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Access denied. This portal is for academic staff only." });
            }
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Authenticates a non-academic staff member. Academic staff are denied access.
        /// </summary>
        [HttpPost("login/non-academic")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden, Type = typeof(ApiResponse<object>))]
        [AllowAnonymous]
        public async Task<IActionResult> LoginNonAcademic([FromBody] LoginRequest request)
        {
            var response = await _staffService.AccountLoginAsync(request);
            if (response.Code == StatusCodes.Status200OK &&
                !string.Equals(response.Data?.MetaData?.StaffCategory, "Non-Academic", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Access denied. This portal is for non-academic staff only." });
            }
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Registers a new customer account.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/register
        /// Creates a new customer account and sends an OTP to the provided email for verification.
        /// </remarks>
        /// <param name="request">The registration request containing email and password.</param>
        /// <returns>OTP response with registration confirmation details.</returns>
        /// <response code="200">Registration successful, OTP sent to email.</response>
        /// <response code="400">Invalid request data or email already registered.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("register")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<OtpResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterOwner([FromBody] RegisterRequest request)
        {
           
            var response = await _staffService.RegisterManualAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Resends the OTP to the customer's email.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/register/resend-otp
        /// Use this when customer didn't receive the original OTP or it expired.
        /// </remarks>
        /// <param name="request">The resend OTP request containing the email address.</param>
        /// <returns>New OTP response.</returns>
        /// <response code="200">OTP resent successfully.</response>
        /// <response code="404">Email not found or account already verified.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("register/resend-top")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<OtpResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequest request)
        {
            var response = await _staffService.ResendOtp(request);
            return StatusCode(response.Code, response);
        }
        
        /// <summary>
        /// Verifies customer email with OTP code.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/register/verify-email
        /// Validates the OTP and completes the email verification process.
        /// Returns JWT tokens upon successful verification.
        /// </remarks>
        /// <param name="request">The verify email request containing email and OTP.</param>
        /// <returns>Staff token response with JWT tokens.</returns>
        /// <response code="200">Email verified successfully.</response>
        /// <response code="400">Invalid or expired OTP.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("register/verify-email")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var response = await _staffService.VerifyEmail(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Refreshes the access token using refresh token.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/refreshtoken
        /// Extends the customer session by generating a new access token.
        /// Requires the current access token in the Authorization header.
        /// </remarks>
        /// <param name="request">The refresh token request.</param>
        /// <returns>Staff token response with new JWT tokens.</returns>
        /// <response code="200">Token refreshed successfully.</response>
        /// <response code="401">Invalid or expired refresh token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("refreshtoken")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var token = HttpContext.Request.Headers["Authorization"]
       .FirstOrDefault()?.Replace("Bearer ", "");
            request.AccessToken = token!;
            var response = await _staffService.RefreshTokenAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Retrieves the authenticated customer's profile.
        /// </summary>
        /// <remarks>
        /// Endpoint: GET /api/v1/customers/me
        /// Returns the current authenticated customer's profile information.
        /// Requires valid JWT token in Authorization header.
        /// </remarks>
        /// <returns>Staff profile response.</returns>
        /// <response code="200">Profile retrieved successfully.</response>
        /// <response code="401">Unauthorized - invalid or missing token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("me")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        public async Task<IActionResult> GetProfile()
        {
            var account = User.GetAccount();
            var response = await _staffService.GetAccountAsync(account);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Initiates password reset process.
        /// </summary>
        /// <remarks>
        /// Endpoint: GET /api/v1/customers/reset-password/{email}
        /// Generates a password reset token and sends it to the customer's email.
        /// </remarks>
        /// <param name="email">The customer's email address.</param>
        /// <returns>Reset password response with token details.</returns>
        /// <response code="200">Password reset initiated successfully.</response>
        /// <response code="404">Staff email not found.</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("reset-password/{email}")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ResetPasswordResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> GetResetPassword([FromRoute] string email)
        {
            var response = await _staffService.GetResetPasswordAsync(email);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Resets customer password using reset token.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/reset-password
        /// Completes the password reset process using the token sent to email.
        /// </remarks>
        /// <param name="request">The reset password request containing new password and reset token.</param>
        /// <returns>Staff token response with new JWT tokens.</returns>
        /// <response code="200">Password reset successfully.</response>
        /// <response code="400">Invalid or expired reset token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("reset-password")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var response = await _staffService.ResetPasswordAsync(request);
            return StatusCode(response.Code, response);
        }

        /// <summary>
        /// Changes the authenticated customer's password.
        /// </summary>
        /// <remarks>
        /// Endpoint: POST /api/v1/customers/change-password
        /// Updates the password for the authenticated customer.
        /// Requires valid JWT token and the customer's current password.
        /// </remarks>
        /// <param name="request">The change password request containing old and new passwords.</param>
        /// <returns>Staff token response with updated JWT tokens.</returns>
        /// <response code="200">Password changed successfully.</response>
        /// <response code="400">Invalid current password.</response>
        /// <response code="401">Unauthorized - invalid or missing token.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("change-password")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var account = User.GetAccount();
            var response = await _staffService.ChangePassword(request, account);
            return StatusCode(response.Code, response);
        }

        [HttpPost("add-bulk")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<StaffTokenResponse>))]
        public async Task<IActionResult> AddBulkStaff(IFormFile file)
        {
            var account = User.GetAccount();
            if (file == null)
            {
                return BadRequest("An Excel file is required");
            }
            if (!Path.GetExtension(file.FileName)
                    .Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only Excel (.xlsx) files are supported");
            }
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);

            TopLevelActors.GetActor<MainActor>().Tell(
                new AddBulkStaffMessage(
                    new AddBulkStaffData
                    {
                        AuthData = account,
                        FileBytes = ms.ToArray(),
                        FileName = file.FileName,
                        ContentType = file.ContentType
                    }
                )
            );

            return Ok();
        }
    }
}