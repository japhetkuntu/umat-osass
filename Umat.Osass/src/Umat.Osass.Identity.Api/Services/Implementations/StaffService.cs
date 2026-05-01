using System.Security.Claims;
using System.Security.Cryptography;
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

public class StaffService : IStaffService
{
    private const string RegisterAccountPrefix = "registeraccount:staff";
    private const string RefreshTokenPrefix = "refreshtoken:staff";
    private const string ResetPasswordPrefix = "resetpassword:staff";
    private readonly IAuthService _authService;
    private readonly BearerTokenConfig _bearerTokenConfig;
    private readonly IIdentityPgRepository<Staff> _staffRepository;
    private readonly EmailConfig _emailTemplates;
    private readonly ExtraConfig _extraConfig;
    private readonly ILogger<StaffService> _logger;
    private readonly IIdentityPgRepository<Department> _departmentRepository;
    private readonly IIdentityPgRepository<Faculty> _facultyRepository;
    private readonly IIdentityPgRepository<School> _schoolRepository;
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly ActorSystem _actorSystem;
    
   // private readonly INiaService _niaService;
    private readonly IRedisService<IdentityRedisConfig> _redisService;

    public StaffService(ILogger<StaffService> logger,
        IOptions<BearerTokenConfig> bearerTokenConfig,
        IIdentityPgRepository<Staff> staffRepository,
        IRedisService<IdentityRedisConfig> redisService,
        IAuthService authService,
        IOptions<ExtraConfig> extraConfig,
        IOptions<EmailConfig> emailTemplates,
        IEmailNotificationService emailNotificationService,
        IIdentityPgRepository<Department> departmentRepository,
        IIdentityPgRepository<Faculty> facultyRepository,
        IIdentityPgRepository<School> schoolRepository,
        ActorSystem actorSystem
        //  INiaService niaService
    )
    {
        _logger = logger;
        _staffRepository = staffRepository;
        _redisService = redisService;
        _bearerTokenConfig = bearerTokenConfig.Value;
        _authService = authService;
        _departmentRepository = departmentRepository;
        _facultyRepository = facultyRepository;
        _schoolRepository = schoolRepository;
        _emailNotificationService = emailNotificationService;
        _extraConfig = extraConfig.Value;
        _emailTemplates = emailTemplates.Value;
        _authService = authService;
        _actorSystem = actorSystem;

    }

    
    public async Task<IApiResponse<OtpResponse>> RegisterManualAsync(RegisterRequest request)
    {
        try
        {
            _logger.LogInformation("Registering staff with request {@request}", request.Serialize());
            request.Email = request.Email.ToLower();
            var emailDomain = request.Email.Split("@").ToList()[1];
            if (!_extraConfig.UniversityDomain.Equals(emailDomain, StringComparison.InvariantCultureIgnoreCase))
            {
                return new ApiResponse<OtpResponse>("Kindly use your institution email register.", 403);
            }

            var existingStaffRes =
                await _staffRepository.GetOneAsync(x => x.Email.Equals(request.Email));
            if (existingStaffRes != null)
                return new ApiResponse<OtpResponse>("Staff already exists", 400);
            var uniqueId = Guid.NewGuid().ToString("N");
    
            var cacheStaffKey = $"{RegisterAccountPrefix}-{request.Email}";
            var cachedStaff = await _redisService.GetAsync<Staff>(cacheStaffKey);
            var response = new OtpResponse
            {
                Email = request.Email,
                UniqueId = uniqueId
            };
            if (cachedStaff != null)
                return response.ToOkApiResponse(
                    "A verification email has been sent to your email. Kindly check your email to verify your account.");
            var otpCode = RandomNumberGeneratorExtension.GenerateOtp();
            var staff = request.Adapt<StaffCache>();
            staff.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            staff.Email = request.Email.ToLower();
            staff.CreatedAt = DateTime.UtcNow;
            staff.OTP = otpCode;
           


            var cacheKey = $"{RegisterAccountPrefix}-{uniqueId}";

            await _redisService.SetAsync(cacheKey, staff, TimeSpan.FromDays(30));
            await _redisService.SetAsync(cacheStaffKey, staff, TimeSpan.FromDays(30));

            var emailRequest = new SendEmailRequest
            {
                To =
                [
                    new EmailContact
                    {
                        Email = staff.Email,
                        Name = staff.FirstName + " " + staff.LastName
                       
                       
                    }
                ],
                TemplateId = _emailTemplates.Templates.Registration!,
                TemplateVariables = new
                {
                    Otp = otpCode,
                    Email = request.Email!,
                    Name = staff.FirstName,
                
                }
            };

            // Fire-and-forget verification email via actor.
            _actorSystem.SendEmailAsync(emailRequest);
            _logger.LogInformation("Dispatching verification email to {Email} via actor", staff.Email);


            return response.ToOkApiResponse(
                "A verification email has been sent to your email. Kindly check your email to verify your account.");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[RegisterManualAsync] Failed to register Staff");
            return new ApiResponse<OtpResponse>("Failed to register Staff", 500);
        }
    }

    public async Task<IApiResponse<OtpResponse>> ResendOtp(ResendOtpRequest request)
    {
        try
        {
            _logger.LogInformation("Received request to resend OTP with request {@request}", request.Serialize());
            var cacheKey = $"{RegisterAccountPrefix}-{request.UniqueId}";
            var staff = await _redisService.GetAsync<StaffCache>(cacheKey);
            if (staff == null)
                return new ApiResponse<OtpResponse>("Invalid Request. Kindly try again later",
                    400);
            
            var emailRequest = new SendEmailRequest
            {
                To =
                [
                    new EmailContact
                    {
                        Email = staff.Email,
                        Name = staff.FirstName + " " + staff.LastName
                    }
                ],
                TemplateId = _emailTemplates.Templates.Registration!,
                TemplateVariables = new
                {
                    Name = staff.FirstName,
                    Otp = staff.OTP,
                    Email = staff.Email!,
                    Source = staff.Source!
                }
            };
            var response = new OtpResponse
            {
                Email = staff.Email,
                UniqueId = request.UniqueId
            };

            // Fire-and-forget OTP email via actor.
            _actorSystem.SendEmailAsync(emailRequest);
            
            return response.ToOkApiResponse("OTP sent successfully.");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ResendOtp] Failed to resend OTP for request:{@Request}", request.Serialize());
            return new ApiResponse<OtpResponse>("Failed to resend OTP", 500);
        }
    }

    public async Task<IApiResponse<StaffTokenResponse>> VerifyEmail(VerifyEmailRequest request)
    {
        try
        {
            _logger.LogInformation("Verifying email with request {@request}", request.Serialize());
            var cacheKey = $"{RegisterAccountPrefix}-{request.UniqueId}";
            var staff = await _redisService.GetAsync<StaffCache>(cacheKey);
            if (staff == null)
                return new ApiResponse<StaffTokenResponse>("Staff not found or has expired",
                    400);
            if (staff.OTP != request.OTP)
            {
                await _redisService.RemoveAsync(cacheKey);
                return new ApiResponse<StaffTokenResponse>("Invalid OTP", 400);
                
            }
            var newStaff = staff.Adapt<Staff>();
            newStaff.UpdatedAt = DateTime.UtcNow;
            var addedResult = await _staffRepository.AddAsync(newStaff);
            if (addedResult < 1)
                return new ApiResponse<StaffTokenResponse>("Failed to verify Email", 500);
 

        
            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = staff.Id,
                Email = staff.Email,
                FirstName = staff.FirstName!,
                LastName = staff.LastName!,
                OnboardingId = request.UniqueId,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey,
                Issuer = _bearerTokenConfig.Issuer,
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime
            });

            // Remove from cache
            await _redisService.RemoveAsync(cacheKey);
            var refreshToken = await GenerateCacheRefreshToken(staff.Id);
            var response = new StaffTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new StaffLoginMetaData
                {
                    Id = staff.Id,
                    Email = staff.Email,
                    FirstName = staff.FirstName!,
                    LastName = staff.LastName!
                }
            };

            return response.ToOkApiResponse("Staff onboarded successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[VerifyEmail] Failed to verify emai for request:{@Request}", request.Serialize());
            return new ApiResponse<StaffTokenResponse>("Failed to verify email", 500);
        }
    }
    
    public async Task<IApiResponse<StaffProfileResponse>> GetAccountAsync(AuthData auth)
    {
        try
        {
            _logger.LogInformation("Getting staff with auth {@auth}", auth.Serialize());
            var staff = await _staffRepository.GetOneAsync(x => x.Id.Equals(auth.Id));
            if (staff == null)
                return new ApiResponse<StaffProfileResponse>("Staff not found", 400);
            
            var response = staff.Adapt<StaffProfileResponse>();

            return response.ToOkApiResponse("Staff retrieved successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetAccountAsync] Failed to get Staff");
            return new ApiResponse<StaffProfileResponse>("Failed to get Staff", 500);
        }
    }
    
    public async Task<IApiResponse<StaffTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            _logger.LogInformation("[.RefreshTokenAsync] Received request to refresh token with request {request}",
                request.Serialize());
            var claimToken = new AuthClaimData
            {
                Token = request.AccessToken, Audience = _bearerTokenConfig.Audience, Issuer = _bearerTokenConfig.Issuer,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey
            };

            var principal = _authService.GetPrincipalFromExpiredToken(claimToken);
            if (principal == null)
                return new ApiResponse<StaffTokenResponse>("Invalid access token.", 401);

            var email = principal.FindFirst(ClaimTypes.Email)?.Value?.ToLower();
            var staff = await _staffRepository.GetOneAsync(x => x.Email.Equals(email));


            if (staff == null)
                return new ApiResponse<StaffTokenResponse>("Account does not exist", 401);
            var refreshtokenKey = GetRefreshTokenKey(staff.Id);
            var redisRefreshToken = await _redisService.GetAsync<string>(refreshtokenKey);
            if (redisRefreshToken == null || redisRefreshToken != request.RefreshToken)
                return new ApiResponse<StaffTokenResponse>("Invalid or expired refresh token", 401);

            var refreshToken = await GenerateCacheRefreshToken(staff.Id);
         
            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = staff.Id,
                Email = staff.Email,
                FirstName = staff.FirstName!,
                LastName = staff.LastName!,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey,
                Issuer = _bearerTokenConfig.Issuer,
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime
            });

            var response = new StaffTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new StaffLoginMetaData
                {
                    Id = staff.Id,
                    Email = staff.Email,
                    FirstName = staff.FirstName!,
                    LastName = staff.LastName!,
                    Position = staff.Position,
                    Title = staff.Title!,
                    StaffCategory = staff.StaffCategory!,
                    UniversityRole = staff.UniversityRole!,
                    StaffId = staff.Id,

                }
            };

            return response.ToOkApiResponse("Token Refreshed Successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to refreshed token request {request}", request.Serialize());
            return new ApiResponse<StaffTokenResponse>("Oops something went wrong", 500);
        }
    }
    public async Task<IApiResponse<StaffTokenResponse>> ChangePassword(ChangePasswordRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("Changing password for staff with auth {@auth}", auth.Serialize());

            var staff = await _staffRepository.GetOneAsync(x => x.Id.Equals(auth.Id));
            if (staff == null)
            {
                return new ApiResponse<StaffTokenResponse>("Staff not found", 400);
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, staff.Password!))
            {
                return new ApiResponse<StaffTokenResponse>("Invalid current password", 400);
            }

            staff.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            staff.UpdatedAt = DateTime.UtcNow;
            var updateResult = await _staffRepository.UpdateAsync(staff);
            if (updateResult < 1)
            {
                return new ApiResponse<StaffTokenResponse>("Failed to update account", 500);
            }

            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = staff.Id,
                Email = staff.Email,
                FirstName = staff.FirstName!,
                LastName = staff.LastName!,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey, 
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience, 
                DurationInHours =  _bearerTokenConfig.AccessTokenLifetime
            });
            var refreshToken = await GenerateCacheRefreshToken(staff.Id);
            var response = new StaffTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new StaffLoginMetaData
                {
                    Id = staff.Id,
                    Email = staff.Email,
                    FirstName = staff.FirstName!,
                    LastName = staff.LastName!,
                    Position = staff.Position,
                    Title = staff.Title!,
                    StaffCategory = staff.StaffCategory!,
                    UniversityRole = staff.UniversityRole!,
                    StaffId = staff.Id,

                }

            };

            return response.ToOkApiResponse("Password changed successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ChangePassword] Failed to change password for staff with auth {@auth}", auth.Serialize());
            return new ApiResponse<StaffTokenResponse>("Failed to change password", 500);
        }
    }
    public async Task<object?> AddStaff(AddStaffRequest request, AuthData auth)
    {
        try
        {
            _logger.LogInformation("About to add staff with rawRequest: {Request} by {Auth}", request.Serialize(), auth.Serialize());
            request.Email = request.Email.ToLower();
            var emailDomain = request.Email.Split("@").ToList()[1];
            if (!_extraConfig.UniversityDomain.Equals(emailDomain, StringComparison.InvariantCultureIgnoreCase))
            {
                return new ApiResponse<OtpResponse>("Kindly use your institution email register.", 403);
            }

            var emailAlreadyExist = await _staffRepository.GetOneAsync(x => x.Email.Equals(request.Email));
            if (emailAlreadyExist != null)
            {
                _logger.LogInformation("Email already exists for staff with email {Email}", request.Email);
                return null;
            }
            var newStaff = request.Adapt<Staff>();
            var password = GenerateDefaultPassword(newStaff.Email);
            newStaff.Password =BCrypt.Net.BCrypt.HashPassword(password);


            var departmentRes = await _departmentRepository.GetByIdAsync(request.DepartmentId);
            if (departmentRes == null)
            {
                _logger.LogInformation("Department does not exist with ID: {Id}", request.DepartmentId);
                return null;
            }
            newStaff.DepartmentId = request.DepartmentId;
            newStaff.SchoolId = departmentRes.SchoolId;
            newStaff.FacultyId = departmentRes.FacultyId ?? departmentRes.SchoolId;
            var addedRes = await _staffRepository.AddAsync(newStaff);

            if (addedRes >= 1)
            {
                // Fire-and-forget onboarding email via actor.
                _actorSystem.SendStaffRegistrationNotificationAsync(new StaffRegistrationPayload
                {
                    RecipientEmail = newStaff.Email,
                    RecipientName = $"{newStaff.FirstName} {newStaff.LastName}",
                    staffId = newStaff.StaffId,
                    FirstName = newStaff.FirstName!,
                    LastName = newStaff.LastName!,
                    TemporalPassword = password,
                    StaffCategory = newStaff.StaffCategory ?? "Non-Academic",
                    PortalLoginUrl = "https://osass.umat.edu.gh/login",
                    PasswordChangeRequiredUrl = "https://osass.umat.edu.gh/password/change"
                });

                return newStaff;
            }

            _logger.LogInformation("Failed to add staff with email {Email}", request.Email);
            return null;

        }
        catch (Exception e)
        {
           _logger.LogError(e, "[AddStaff] Failed to add staff");
           return null;
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

            var staff = await _staffRepository.GetOneAsync(x => x.Email.Equals(email));
            if (staff == null)
            {
                return new ApiResponse<ResetPasswordResponse>("Staff not found", 400);
            }

            //send a verification email to staff
            var verificationCode = Guid.NewGuid().ToString("N");
            var otpCode = RandomNumberGeneratorExtension.GenerateOtp();
           
            //cache the verification code
            var cacheKey = $"{ResetPasswordPrefix}-{verificationCode}";
            var staffCache = staff.Adapt<StaffCache>();
            staffCache.OTP = otpCode;
            
            await _redisService.SetAsync(cacheKey, staffCache, TimeSpan.FromMinutes(30));
            var emailRequest = new SendEmailRequest
            {
                To =
                [
                    new EmailContact {
                        Email = staff.Email,
                        Name = staff.FirstName + " " + staff.LastName
                    }
                ],
                TemplateId = _emailTemplates.Templates.ResetPassword!,
                TemplateVariables = new { 
                    Name = staff.FirstName,
                    Otp = otpCode,
                    Email = staff.Email!
                    
                }
            };

            TopLevelActors.GetActor<MainActor>()
                .Tell(new SendEmailMessage(emailRequest));

            var response = new ResetPasswordResponse
            {
                Email = staff.Email,
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
    public async Task<IApiResponse<StaffTokenResponse>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Resetting password with request {@request}", request.Serialize());

            var cacheKey = $"{ResetPasswordPrefix}-{request.UniqueId}";
            var staffCache = await _redisService.GetAsync<StaffCache>(cacheKey);
            if (staffCache == null || staffCache.OTP != request.OtpCode)
            {
                return new ApiResponse<StaffTokenResponse>("Invalid or expired verification code", 400);
            }

            var staff = await _staffRepository.GetOneAsync(x => x.Email.Equals(staffCache.Email));
            if (staff == null)
            {
                return new ApiResponse<StaffTokenResponse>("Staff not found", 400);
            }

            staff.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            staff.UpdatedAt = DateTime.UtcNow;
            staff.LastLoginAt = DateTime.UtcNow;
            var updateResult = await _staffRepository.UpdateAsync(staff);
            if (updateResult < 1)
            {
                return new ApiResponse<StaffTokenResponse>("Failed to update password", 500);
            }

            // Remove the verification code from cache
            await _redisService.RemoveAsync(cacheKey);

            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = staff.Id,
                Email = staff.Email,
                FirstName = staff.FirstName!,
                LastName = staff.LastName!,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey,
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime
            });
            var refreshToken = await GenerateCacheRefreshToken(staff.Id);
            var response = new StaffTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new StaffLoginMetaData
                {
                    Id = staff.Id,
                    Email = staff.Email,
                    FirstName = staff.FirstName!,
                    LastName = staff.LastName!,
                    Position = staff.Position,
                    Title = staff.Title!,
                    StaffCategory = staff.StaffCategory!,
                    UniversityRole = staff.UniversityRole!,
                    StaffId = staff.Id,

                }
            };

            return response.ToOkApiResponse("Password reset successfully");


        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ResetPasswordAsync] Failed to reset password with request {@request}", request.Serialize());
            return new ApiResponse<StaffTokenResponse>("Failed to reset password", 500);
        }
    }
    public async Task<IApiResponse<StaffTokenResponse>> AccountLoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Custom login with request {@request}", request.Serialize());
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return new ApiResponse<StaffTokenResponse>("Email or password is missing", 400);
            }

            request.Email = request.Email.ToLower();

            var staff = await _staffRepository.GetOneAsync(x => x.Email.Equals(request.Email));
            if (staff == null || !BCrypt.Net.BCrypt.Verify(request.Password, staff.Password!))
            {
                return new ApiResponse<StaffTokenResponse>("Invalid username or password", 400);
            }


            var accessToken = _authService.GenerateJwtToken(new AuthClaimData
            {
                Id = staff.Id,
                Email = staff.Email,
                FirstName = staff.FirstName!,
                LastName = staff.LastName!,
                SigningKey = _bearerTokenConfig.ApplicantSigningKey, 
                Issuer = _bearerTokenConfig.Issuer, 
                Audience = _bearerTokenConfig.Audience,
                DurationInHours = _bearerTokenConfig.AccessTokenLifetime
            });

            var refreshToken = await GenerateCacheRefreshToken(staff.Id);
            var response = new StaffTokenResponse()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                MetaData = new StaffLoginMetaData
                {
                    Id = staff.Id,
                    Email = staff.Email,
                    FirstName = staff.FirstName!,
                    LastName = staff.LastName!,
                    Position = staff.Position,
                    Title = staff.Title!,
                    StaffCategory = staff.StaffCategory!,
                    UniversityRole = staff.UniversityRole!,
                    StaffId = staff.Id,

                }
            };

            return response.ToOkApiResponse("Login successful");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[CustomLoginAsync] Failed to login Staff");
            return new ApiResponse<StaffTokenResponse>("Failed to login Staff", 500);
        }
    }
    private string GetRefreshTokenKey(string staffId)
    {
        return $"{RefreshTokenPrefix}-{staffId}";
    }
    private async Task<string> GenerateCacheRefreshToken(string staffId)
    {
        var refreshToken = _authService.GenerateRefreshToken();
        var refreshTokenKey = GetRefreshTokenKey(staffId);
        await _redisService.SetAsync(refreshTokenKey, refreshToken, TimeSpan.FromDays( _bearerTokenConfig.RefreshTokenLifetime));
        return refreshToken;
    }
    private static string GenerateDefaultPassword(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                throw new ArgumentException("Invalid email");

            var prefix = email.Split('@')[0];

            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var buffer = new byte[4];

            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(buffer);

            var randomPart = new char[4];
            for (int i = 0; i < buffer.Length; i++)
            {
                randomPart[i] = chars[buffer[i] % chars.Length];
            }

            return $"{prefix}@{new string(randomPart)}";
        }

}