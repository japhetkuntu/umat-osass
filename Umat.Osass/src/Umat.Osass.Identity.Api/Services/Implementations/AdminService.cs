using System.Security.Claims;
using Akka.Actor;
using Mapster;
using Microsoft.Extensions.Options;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.Common.Sdk.Options;
using Umat.Osass.Common.Sdk.Services;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Options;
using Umat.Osass.Email.Sdk.Services.Interfaces;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Redis.Sdk.Services;
using Umat.Osass.Identity.Api.Extensions;
using Umat.Osass.Identity.Api.Actors;
using Umat.Osass.Identity.Api.Actors.Messages;
using Umat.Osass.Identity.Api.Models;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Models.Responses;
using Umat.Osass.Identity.Api.Options;
using Umat.Osass.Identity.Api.Services.Interfaces;

namespace Umat.Osass.Identity.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private const string RegisterAccountPrefix = "registeraccount:admin";
    private const string RefreshTokenPrefix = "refreshtoken:admin";
    private const string ResetPasswordPrefix = "resetpassword:admin";
    private readonly IAuthService _authService;
    private readonly BearerTokenConfig _bearerTokenConfig;
    private readonly IIdentityPgRepository<Admin> _adminRepository;
    private readonly EmailConfig _emailTemplates;
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly ExtraConfig _extraConfig;
    private readonly ILogger<AdminService> _logger;
    private readonly ActorSystem _actorSystem;
  
    private readonly IRedisService<IdentityRedisConfig> _redisService;

    public AdminService(ILogger<AdminService> logger,
        IOptions<BearerTokenConfig> bearerTokenConfig,
        IIdentityPgRepository<Admin> adminRepository,
        IRedisService<IdentityRedisConfig> redisService,
        IAuthService authService,
        IOptions<ExtraConfig> extraConfig,
        IOptions<EmailConfig> emailTemplates,
        IEmailNotificationService emailNotificationService,
        ActorSystem actorSystem
    
    )
    {
        _logger = logger;
        _adminRepository = adminRepository;
        _redisService = redisService;
        _bearerTokenConfig = bearerTokenConfig.Value;
        _authService = authService;
        _extraConfig = extraConfig.Value;
        _emailTemplates = emailTemplates.Value;
        _emailNotificationService = emailNotificationService;
        _authService = authService;
        _actorSystem = actorSystem;

    }
    
    public async Task<IApiResponse<AdminProfileResponse>> GetAccountAsync(AuthData auth)
    {
        try
        {
            _logger.LogInformation("Getting account with auth {@auth}", auth.Serialize());
            var admin = await _adminRepository.GetOneAsync(x => x.Id.Equals(auth.Id));
            if (admin == null)
                return new ApiResponse<AdminProfileResponse>("Account not found", 400);
            
            var response = admin.Adapt<AdminProfileResponse>();

            return response.ToOkApiResponse("Account retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetAccountAsync] Failed to get Admin");
            return new ApiResponse<AdminProfileResponse>("Failed to get account", 500);
        }
    }
    
    public async Task<IApiResponse<AdminTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            _logger.LogInformation("[.RefreshTokenAsync] Received request to refresh token with request {request}",
                request.Serialize());
            var claimToken = new AuthClaimData
            {
                Token = request.AccessToken, Audience = _bearerTokenConfig.Audience, Issuer = _bearerTokenConfig.Issuer,
                SigningKey = _bearerTokenConfig.AdminSigningKey
            };

            var principal = _authService.GetPrincipalFromExpiredToken(claimToken);
            if (principal == null)
                return new ApiResponse<AdminTokenResponse>("Invalid access token.", 401);

            var email = principal.FindFirst(ClaimTypes.Email)?.Value?.ToLower();
            var admin = await _adminRepository.GetOneAsync(x => x.Email.Equals(email));


            if (admin == null)
                return new ApiResponse<AdminTokenResponse>("Account does not exist", 401);
            var refreshtokenKey = GetRefreshTokenKey(admin.Id);
            var redisRefreshToken = await _redisService.GetAsync<string>(refreshtokenKey);
            if (redisRefreshToken == null || redisRefreshToken != request.RefreshToken)
                return new ApiResponse<AdminTokenResponse>("Invalid or expired refresh token", 401);

            var refreshToken = await GenerateCacheRefreshToken(admin.Id);

            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName!,
                LastName = admin.LastName!,
                SigningKey = _bearerTokenConfig.AdminSigningKey,
                Issuer = _bearerTokenConfig.Issuer,
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime,
                Role = admin.Role,
            });

            var response = new AdminTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new AdminLoginMetaData()
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FirstName = admin.FirstName!,
                    LastName = admin.LastName!,
                   Role = admin.Role
                }
            };

            return response.ToOkApiResponse("Token Refreshed Successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to refreshed token request {request}", request.Serialize());
            return new ApiResponse<AdminTokenResponse>("Oops something went wrong", 500);
        }
    }
    
    
    public async Task<IApiResponse<AdminTokenResponse>> ChangePassword(ChangePasswordRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Changing password for admin with auth {@auth}", auth.Serialize());

            var admin = await _adminRepository.GetOneAsync(x => x.Id.Equals(auth.Id));
            if (admin == null)
            {
                return new ApiResponse<AdminTokenResponse>("Admin not found", 400);
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, admin.Password!))
            {
                return new ApiResponse<AdminTokenResponse>("Invalid current password", 400);
            }

            admin.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            admin.UpdatedAt = DateTime.UtcNow;
            var updateResult = await _adminRepository.UpdateAsync(admin);
            if (updateResult < 1)
            {
                return new ApiResponse<AdminTokenResponse>("Failed to update account", 500);
            }

            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName!,
                LastName = admin.LastName!,
                SigningKey = _bearerTokenConfig.AdminSigningKey, 
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience, 
                DurationInHours =  _bearerTokenConfig.AccessTokenLifetime,
                Role = admin.Role,
            });
            var refreshToken = await GenerateCacheRefreshToken(admin.Id);
            var response = new AdminTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new AdminLoginMetaData
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FirstName = admin.FirstName!,
                    LastName = admin.LastName!,
                    Role = admin.Role,
                }

            };

            return response.ToOkApiResponse("Password changed successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ChangePassword] Failed to change password for admin with auth {@auth}", auth.Serialize());
            return new ApiResponse<AdminTokenResponse>("Failed to change password", 500);
        }
    }
  public async Task<IApiResponse<ResetPasswordResponse>> GetResetPasswordAsync(string email)
    {
        try
        {
            _logger.LogInformation("Resetting password for email {Email}", email);
            if (string.IsNullOrWhiteSpace(email))
            {
                return new ApiResponse<ResetPasswordResponse>("Email or new password is missing", 400);
            }
            email = email.ToLower();

            var admin = await _adminRepository.GetOneAsync(x => x.Email.Equals(email));
            if (admin == null)
            {
                return new ApiResponse<ResetPasswordResponse>("Admin not found", 400);
            }

            //send a verification email to admin
            var verificationCode = Guid.NewGuid().ToString("N");
            var otpCode = RandomNumberGeneratorExtension.GenerateOtp();
           
            //cache the verification code
            var cacheKey = $"{ResetPasswordPrefix}-{verificationCode}";
            var adminCache = admin.Adapt<ResetPasswordCache>();
            adminCache.OtpCode = otpCode;
            
            await _redisService.SetAsync(cacheKey, adminCache, TimeSpan.FromMinutes(30));
            var emailRequest = new SendEmailRequest
            {
                To =
                [
                    new EmailContact {
                        Email = admin.Email,
                        Name = admin.FirstName + " " + admin.LastName
                    }
                ],
                TemplateId = _emailTemplates.Templates.ResetPassword!,
                TemplateVariables = new { 
                    Name = admin.FirstName,
                    Otp = otpCode,
                    Email = admin.Email!
                }
            };

            // Fire-and-forget reset-password email via actor.
            _actorSystem.SendEmailAsync(emailRequest);

            var response = new ResetPasswordResponse
            {
                Email = admin.Email,
                UniqueId = verificationCode
            };

            return response.ToOkApiResponse("Password reset successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ResetPasswordAsync] Failed to reset password for email {Email}", email);
            return new ApiResponse<ResetPasswordResponse>("Failed to reset password", 500);
        }
    }

    public async Task<IApiResponse<AdminTokenResponse>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Resetting password with request {@request}", request.Serialize());

            var cacheKey = $"{ResetPasswordPrefix}-{request.UniqueId}";
            var adminCache = await _redisService.GetAsync<ResetPasswordCache>(cacheKey);
            if (adminCache == null || adminCache.OtpCode != request.OtpCode)
            {
                return new ApiResponse<AdminTokenResponse>("Invalid or expired verification code", 400);
            }

            var admin = await _adminRepository.GetOneAsync(x => x.Email.Equals(adminCache.Email));
            if (admin == null)
            {
                return new ApiResponse<AdminTokenResponse>("Admin not found", 400);
            }

            admin.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            admin.UpdatedAt = DateTime.UtcNow;
            admin.LastLoginAt = DateTime.UtcNow;
            var updateResult = await _adminRepository.UpdateAsync(admin);
            if (updateResult < 1)
            {
                return new ApiResponse<AdminTokenResponse>("Failed to update password", 500);
            }

            // Remove the verification code from cache
            await _redisService.RemoveAsync(cacheKey);

            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName!,
                LastName = admin.LastName!,
                SigningKey = _bearerTokenConfig.AdminSigningKey,
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime,
                Role = admin.Role,
            });
            var refreshToken = await GenerateCacheRefreshToken(admin.Id);
            var response = new AdminTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new AdminLoginMetaData
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FirstName = admin.FirstName!,
                    LastName = admin.LastName!,
                    Role = admin.Role,
                }
            };

            return response.ToOkApiResponse("Password reset successfully");


        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ResetPasswordAsync] Failed to reset password with request {@request}", request.Serialize());
            return new ApiResponse<AdminTokenResponse>("Failed to reset password", 500);
        }
    }
          public async Task<IApiResponse<AdminTokenResponse>> AccountLoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Custom login with request {@request}", request.Serialize());
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return new ApiResponse<AdminTokenResponse>("Email or password is missing", 400);
            }

            request.Email = request.Email.ToLower();

            var admin = await _adminRepository.GetOneAsync(x => x.Email.Equals(request.Email));
            if (admin == null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.Password!))
            {
                return new ApiResponse<AdminTokenResponse>("Invalid username or password", 400);
            }


            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName!,
                LastName = admin.LastName!,
                SigningKey = _bearerTokenConfig.AdminSigningKey, 
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime,
                Role = admin.Role,
            });

            var refreshToken = await GenerateCacheRefreshToken(admin.Id);
            var response = new AdminTokenResponse()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new AdminLoginMetaData()
                {
                    Id = admin.Id,
                    Email = admin.Email,
                    FirstName = admin.FirstName!,
                    LastName = admin.LastName!,
                    Role = admin.Role,
                }
            };

            return response.ToOkApiResponse("Login successful");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[CustomLoginAsync] Failed to login Admin");
            return new ApiResponse<AdminTokenResponse>("Failed to login Admin", 500);
        }
    }
    private string GetRefreshTokenKey(string adminId)
    {
        return $"{RefreshTokenPrefix}-{adminId}";
    }


    private async Task<string> GenerateCacheRefreshToken(string adminId)
    {
        var refreshToken = _authService.GenerateRefreshToken();
        var refreshTokenKey = GetRefreshTokenKey(adminId);
        await _redisService.SetAsync(refreshTokenKey, refreshToken, TimeSpan.FromDays( _bearerTokenConfig.RefreshTokenLifetime));
        return refreshToken;
    }
}