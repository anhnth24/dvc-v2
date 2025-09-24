# Manual Task: Enhanced User Authentication Core Logic

**Task ID:** manual-task-user-authentication-core-logic
**Phase:** Authentication Core Implementation
**Priority:** High
**Status:** Ready
**Estimated Effort:** 3 days
**Created:** 2025-09-21

## Objective

Implement comprehensive authentication core logic including multi-factor authentication (MFA), Active Directory integration fallback, password policies, and enhanced security features as specified in the Backend PRD.

## Current State Analysis

**What Exists:**
- Basic username/password authentication
- Password hashing with salt
- Account lockout after 5 failed attempts
- Basic MFA placeholder (demo code "123456")
- Refresh token mechanism

**What's Missing:**
- Full MFA implementation (SMS OTP, TOTP, PKI certificates)
- Active Directory integration with fallback
- Password policy enforcement
- Backup codes for MFA
- Password change/reset functionality
- Account recovery mechanisms

## Implementation Steps

### Step 1: Password Policy Configuration

**File:** `src/Shared/DVC.Shared.Infrastructure/Configuration/PasswordPolicyOptions.cs` (Create)
```csharp
namespace DVC.Shared.Infrastructure.Configuration;

public class PasswordPolicyOptions
{
    public const string SectionName = "PasswordPolicy";

    public int MinimumLength { get; set; } = 8;
    public int MaximumLength { get; set; } = 128;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecialCharacter { get; set; } = true;
    public int MaxPasswordAge { get; set; } = 90; // days
    public int PasswordHistoryCount { get; set; } = 5;
    public int AccountLockoutThreshold { get; set; } = 5;
    public int AccountLockoutDurationMinutes { get; set; } = 30;
    public int PasswordResetTokenExpirationMinutes { get; set; } = 60;
}
```

### Step 2: MFA Configuration and Entities

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/UserMfaMethod.cs` (Create)
```csharp
using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public enum MfaMethodType
{
    None = 0,
    SmsOtp = 1,
    Totp = 2,
    PkiCertificate = 3,
    BackupCodes = 4
}

public class UserMfaMethod : AuditableEntity
{
    public Guid UserId { get; set; }
    public MfaMethodType MethodType { get; set; }
    public string? Secret { get; set; } // TOTP secret or phone number for SMS
    public bool IsEnabled { get; set; } = false;
    public bool IsPrimary { get; set; } = false;
    public DateTime? LastUsedAt { get; set; }
    public string? DisplayName { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}

public class UserBackupCode : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Code { get; set; } = string.Empty;
    public bool IsUsed { get; set; } = false;
    public DateTime? UsedAt { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}

public class PasswordHistory : AuditableEntity
{
    public Guid UserId { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/User.cs` (Update)
```csharp
// Add to User entity
public ICollection<UserMfaMethod> MfaMethods { get; set; } = new List<UserMfaMethod>();
public ICollection<UserBackupCode> BackupCodes { get; set; } = new List<UserBackupCode>();
public ICollection<PasswordHistory> PasswordHistories { get; set; } = new List<PasswordHistory>();
public DateTime? PasswordChangedAt { get; set; }
public string? PasswordResetToken { get; set; }
public DateTime? PasswordResetTokenExpiry { get; set; }
public bool IsAdUser { get; set; } = false;
public string? AdDomainUsername { get; set; }

// Remove these (moved to UserMfaMethod)
// public bool MfaEnabled { get; set; } = false;
// public string? MfaSecret { get; set; }
```

### Step 3: MFA Services Interface

**File:** `src/Services/UserService/DVC.UserService.Core/Interfaces/IMfaService.cs` (Create)
```csharp
namespace DVC.UserService.Core.Interfaces;

public interface IMfaService
{
    Task<string> GenerateTotpSecretAsync(Guid userId);
    Task<string> GenerateQrCodeAsync(Guid userId, string secret, string appName = "DVC System");
    Task<bool> ValidateTotpCodeAsync(Guid userId, string code);
    Task<bool> ValidateSmsOtpAsync(Guid userId, string code);
    Task<string> SendSmsOtpAsync(Guid userId, string phoneNumber);
    Task<List<string>> GenerateBackupCodesAsync(Guid userId, int count = 10);
    Task<bool> ValidateBackupCodeAsync(Guid userId, string code);
    Task<bool> EnableMfaMethodAsync(Guid userId, MfaMethodType methodType, string? secret = null);
    Task<bool> DisableMfaMethodAsync(Guid userId, MfaMethodType methodType);
    Task<List<UserMfaMethod>> GetUserMfaMethodsAsync(Guid userId);
    Task<bool> HasValidMfaMethodAsync(Guid userId);
}

public interface IPasswordService
{
    string HashPassword(string password, out string salt);
    bool VerifyPassword(string password, string hash, string salt);
    bool ValidatePasswordPolicy(string password, PasswordPolicyOptions policy);
    Task<bool> CheckPasswordHistoryAsync(Guid userId, string password);
    Task SavePasswordHistoryAsync(Guid userId, string passwordHash, string salt);
    string GenerateRandomPassword(int length = 12);
    string GeneratePasswordResetToken();
}

public interface IActiveDirectoryService
{
    Task<bool> AuthenticateAsync(string username, string password);
    Task<AdUserInfo?> GetUserInfoAsync(string username);
    Task<bool> IsAdUserAsync(string username);
    Task SyncUserAsync(string username);
}

public record AdUserInfo(
    string Username,
    string Email,
    string FullName,
    string? Phone,
    string? Department,
    List<string> Groups
);
```

### Step 4: Enhanced Password Service

**File:** `src/Shared/DVC.Shared.Infrastructure/Security/PasswordService.cs` (Update)
```csharp
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using DVC.Shared.Infrastructure.Configuration;
using DVC.UserService.Core.Interfaces;
using Microsoft.Extensions.Options;

namespace DVC.Shared.Infrastructure.Security;

public class PasswordService : IPasswordService
{
    private readonly PasswordPolicyOptions _passwordPolicy;
    private readonly IUnitOfWork _unitOfWork;

    public PasswordService(IOptions<PasswordPolicyOptions> passwordPolicy, IUnitOfWork unitOfWork)
    {
        _passwordPolicy = passwordPolicy.Value;
        _unitOfWork = unitOfWork;
    }

    public string HashPassword(string password, out string salt)
    {
        salt = GenerateSalt();
        using var pbkdf2 = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes(salt), 10000, HashAlgorithmName.SHA256);
        return Convert.ToBase64String(pbkdf2.GetBytes(32));
    }

    public bool VerifyPassword(string password, string hash, string salt)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes(salt), 10000, HashAlgorithmName.SHA256);
        var hashToVerify = Convert.ToBase64String(pbkdf2.GetBytes(32));
        return hashToVerify == hash;
    }

    public bool ValidatePasswordPolicy(string password, PasswordPolicyOptions? policy = null)
    {
        var policyToUse = policy ?? _passwordPolicy;

        if (password.Length < policyToUse.MinimumLength || password.Length > policyToUse.MaximumLength)
            return false;

        if (policyToUse.RequireUppercase && !password.Any(char.IsUpper))
            return false;

        if (policyToUse.RequireLowercase && !password.Any(char.IsLower))
            return false;

        if (policyToUse.RequireDigit && !password.Any(char.IsDigit))
            return false;

        if (policyToUse.RequireSpecialCharacter)
        {
            var specialChars = @"[!@#$%^&*(),.?""{}|<>]";
            if (!Regex.IsMatch(password, specialChars))
                return false;
        }

        return true;
    }

    public async Task<bool> CheckPasswordHistoryAsync(Guid userId, string password)
    {
        var passwordHistories = await _unitOfWork.Users.GetPasswordHistoryAsync(userId, _passwordPolicy.PasswordHistoryCount);

        foreach (var history in passwordHistories)
        {
            if (VerifyPassword(password, history.PasswordHash, history.Salt))
                return false; // Password was used before
        }

        return true; // Password is new
    }

    public async Task SavePasswordHistoryAsync(Guid userId, string passwordHash, string salt)
    {
        var passwordHistory = new PasswordHistory
        {
            UserId = userId,
            PasswordHash = passwordHash,
            Salt = salt
        };

        await _unitOfWork.Users.AddPasswordHistoryAsync(passwordHistory);

        // Clean up old password histories
        await _unitOfWork.Users.CleanupPasswordHistoryAsync(userId, _passwordPolicy.PasswordHistoryCount);
    }

    public string GenerateRandomPassword(int length = 12)
    {
        const string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_-";
        var random = new Random();
        return new string(Enumerable.Repeat(validChars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public string GeneratePasswordResetToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var tokenBytes = new byte[32];
        rng.GetBytes(tokenBytes);
        return Convert.ToBase64String(tokenBytes);
    }

    private static string GenerateSalt()
    {
        using var rng = RandomNumberGenerator.Create();
        var saltBytes = new byte[16];
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }
}
```

### Step 5: MFA Service Implementation

**File:** `src/Services/UserService/DVC.UserService.Core/Services/MfaService.cs` (Create)
```csharp
using System.Security.Cryptography;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using Microsoft.Extensions.Logging;
using OtpNet;
using QRCoder;

namespace DVC.UserService.Core.Services;

public class MfaService : IMfaService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISmsService _smsService;
    private readonly ILogger<MfaService> _logger;
    private readonly Dictionary<Guid, string> _otpCache = new(); // In production, use Redis

    public MfaService(
        IUnitOfWork unitOfWork,
        ISmsService smsService,
        ILogger<MfaService> logger)
    {
        _unitOfWork = unitOfWork;
        _smsService = smsService;
        _logger = logger;
    }

    public async Task<string> GenerateTotpSecretAsync(Guid userId)
    {
        var secret = Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20));

        var existingMethod = await _unitOfWork.UserMfaMethods.GetByUserAndTypeAsync(userId, MfaMethodType.Totp);
        if (existingMethod != null)
        {
            existingMethod.Secret = secret;
            await _unitOfWork.UserMfaMethods.UpdateAsync(existingMethod);
        }
        else
        {
            var mfaMethod = new UserMfaMethod
            {
                UserId = userId,
                MethodType = MfaMethodType.Totp,
                Secret = secret,
                IsEnabled = false,
                DisplayName = "Authenticator App"
            };
            await _unitOfWork.UserMfaMethods.AddAsync(mfaMethod);
        }

        await _unitOfWork.SaveChangesAsync();
        return secret;
    }

    public async Task<string> GenerateQrCodeAsync(Guid userId, string secret, string appName = "DVC System")
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) throw new ArgumentException("User not found");

        var uri = $"otpauth://totp/{appName}:{user.Email}?secret={secret}&issuer={appName}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(uri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new Base64QRCode(qrCodeData);

        return qrCode.GetGraphic(20);
    }

    public async Task<bool> ValidateTotpCodeAsync(Guid userId, string code)
    {
        var mfaMethod = await _unitOfWork.UserMfaMethods.GetByUserAndTypeAsync(userId, MfaMethodType.Totp);
        if (mfaMethod?.Secret == null || !mfaMethod.IsEnabled)
            return false;

        var secretBytes = Base32Encoding.ToBytes(mfaMethod.Secret);
        var totp = new Totp(secretBytes);
        var isValid = totp.VerifyTotp(code, out _, VerificationWindow.RfcSpecifiedNetworkDelay);

        if (isValid)
        {
            mfaMethod.LastUsedAt = DateTime.UtcNow;
            await _unitOfWork.UserMfaMethods.UpdateAsync(mfaMethod);
            await _unitOfWork.SaveChangesAsync();
        }

        return isValid;
    }

    public async Task<bool> ValidateSmsOtpAsync(Guid userId, string code)
    {
        if (_otpCache.TryGetValue(userId, out var storedCode))
        {
            if (storedCode == code)
            {
                _otpCache.Remove(userId);

                var mfaMethod = await _unitOfWork.UserMfaMethods.GetByUserAndTypeAsync(userId, MfaMethodType.SmsOtp);
                if (mfaMethod != null)
                {
                    mfaMethod.LastUsedAt = DateTime.UtcNow;
                    await _unitOfWork.UserMfaMethods.UpdateAsync(mfaMethod);
                    await _unitOfWork.SaveChangesAsync();
                }

                return true;
            }
        }

        return false;
    }

    public async Task<string> SendSmsOtpAsync(Guid userId, string phoneNumber)
    {
        var code = GenerateOtpCode();
        _otpCache[userId] = code;

        // Schedule removal after 5 minutes
        _ = Task.Delay(TimeSpan.FromMinutes(5)).ContinueWith(_ => _otpCache.Remove(userId));

        var message = $"Mã xác thực DVC: {code}. Mã có hiệu lực trong 5 phút.";
        await _smsService.SendAsync(phoneNumber, message);

        _logger.LogInformation("SMS OTP sent to user {UserId}", userId);
        return code;
    }

    public async Task<List<string>> GenerateBackupCodesAsync(Guid userId, int count = 10)
    {
        // Remove existing backup codes
        await _unitOfWork.UserBackupCodes.RemoveAllForUserAsync(userId);

        var codes = new List<string>();
        for (int i = 0; i < count; i++)
        {
            var code = GenerateBackupCode();
            codes.Add(code);

            var backupCode = new UserBackupCode
            {
                UserId = userId,
                Code = code,
                IsUsed = false
            };
            await _unitOfWork.UserBackupCodes.AddAsync(backupCode);
        }

        await _unitOfWork.SaveChangesAsync();
        return codes;
    }

    public async Task<bool> ValidateBackupCodeAsync(Guid userId, string code)
    {
        var backupCode = await _unitOfWork.UserBackupCodes.GetUnusedCodeAsync(userId, code);
        if (backupCode == null) return false;

        backupCode.IsUsed = true;
        backupCode.UsedAt = DateTime.UtcNow;
        await _unitOfWork.UserBackupCodes.UpdateAsync(backupCode);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> EnableMfaMethodAsync(Guid userId, MfaMethodType methodType, string? secret = null)
    {
        var existingMethod = await _unitOfWork.UserMfaMethods.GetByUserAndTypeAsync(userId, methodType);

        if (existingMethod != null)
        {
            existingMethod.IsEnabled = true;
            if (!string.IsNullOrEmpty(secret))
                existingMethod.Secret = secret;
            await _unitOfWork.UserMfaMethods.UpdateAsync(existingMethod);
        }
        else
        {
            var mfaMethod = new UserMfaMethod
            {
                UserId = userId,
                MethodType = methodType,
                Secret = secret,
                IsEnabled = true,
                IsPrimary = methodType == MfaMethodType.Totp,
                DisplayName = methodType.ToString()
            };
            await _unitOfWork.UserMfaMethods.AddAsync(mfaMethod);
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DisableMfaMethodAsync(Guid userId, MfaMethodType methodType)
    {
        var mfaMethod = await _unitOfWork.UserMfaMethods.GetByUserAndTypeAsync(userId, methodType);
        if (mfaMethod == null) return false;

        mfaMethod.IsEnabled = false;
        await _unitOfWork.UserMfaMethods.UpdateAsync(mfaMethod);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<List<UserMfaMethod>> GetUserMfaMethodsAsync(Guid userId)
    {
        return await _unitOfWork.UserMfaMethods.GetByUserAsync(userId);
    }

    public async Task<bool> HasValidMfaMethodAsync(Guid userId)
    {
        var methods = await _unitOfWork.UserMfaMethods.GetByUserAsync(userId);
        return methods.Any(m => m.IsEnabled);
    }

    private static string GenerateOtpCode()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var code = BitConverter.ToUInt32(bytes, 0) % 1000000;
        return code.ToString("D6");
    }

    private static string GenerateBackupCode()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[5];
        rng.GetBytes(bytes);
        return Convert.ToHexString(bytes).ToLower();
    }
}
```

### Step 6: Enhanced Authentication Service with MFA

**File:** `src/Services/UserService/DVC.UserService.Core/Services/AuthService.cs` (Update LoginAsync method)
```csharp
public async Task<AuthResult> LoginAsync(LoginRequest request, string? deviceFingerprint = null, string? ipAddress = null, CancellationToken cancellationToken = default)
{
    try
    {
        User? user = null;

        // Try Active Directory first if it looks like a domain user
        if (request.Username.Contains("@") || request.Username.Contains("\\"))
        {
            var adUser = await _activeDirectoryService.GetUserInfoAsync(request.Username);
            if (adUser != null)
            {
                var isAuthenticated = await _activeDirectoryService.AuthenticateAsync(request.Username, request.Password);
                if (isAuthenticated)
                {
                    user = await _unitOfWork.Users.GetByUsernameAsync(adUser.Username, cancellationToken);
                    if (user == null)
                    {
                        // Auto-create AD user
                        user = await CreateAdUserAsync(adUser, cancellationToken);
                    }
                    else
                    {
                        // Sync AD user data
                        await SyncAdUserAsync(user, adUser, cancellationToken);
                    }
                }
            }
        }

        // Fallback to local authentication
        if (user == null)
        {
            user = await _unitOfWork.Users.GetByUsernameAsync(request.Username, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent username: {Username} from IP: {IpAddress}",
                    request.Username, ipAddress);
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidCredentials);
            }

            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash, user.Salt ?? string.Empty))
            {
                await HandleFailedLoginAsync(user, cancellationToken);
                _logger.LogWarning("Failed login attempt for user: {UserId}", user.Id);
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidCredentials);
            }
        }

        // Common validation
        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt with inactive user: {UserId}", user.Id);
            return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.AccountDisabled);
        }

        if (user.IsLocked && user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
        {
            _logger.LogWarning("Login attempt with locked user: {UserId}", user.Id);
            return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.AccountLocked);
        }

        // Check MFA if enabled
        var hasMfaEnabled = await _mfaService.HasValidMfaMethodAsync(user.Id);
        if (hasMfaEnabled)
        {
            if (string.IsNullOrEmpty(request.MfaCode))
            {
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.MfaRequired, RequiresMfa: true);
            }

            var mfaValid = false;

            // Try TOTP first
            if (await _mfaService.ValidateTotpCodeAsync(user.Id, request.MfaCode))
            {
                mfaValid = true;
            }
            // Try SMS OTP
            else if (await _mfaService.ValidateSmsOtpAsync(user.Id, request.MfaCode))
            {
                mfaValid = true;
            }
            // Try backup code
            else if (await _mfaService.ValidateBackupCodeAsync(user.Id, request.MfaCode))
            {
                mfaValid = true;
            }

            if (!mfaValid)
            {
                _logger.LogWarning("Invalid MFA code for user: {UserId}", user.Id);
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidMfaCode);
            }
        }

        // Continue with session management and token generation...
        // (Rest of the method from previous task)

        return new AuthResult(true, accessToken, refreshToken, DateTime.UtcNow.AddMinutes(15));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during login for username: {Username} from IP: {IpAddress}",
            request.Username, ipAddress);
        return new AuthResult(false, ErrorMessage: ErrorMessages.InternalError);
    }
}

private async Task<User> CreateAdUserAsync(AdUserInfo adUser, CancellationToken cancellationToken)
{
    var randomPassword = _passwordService.GenerateRandomPassword();
    var passwordHash = _passwordService.HashPassword(randomPassword, out var salt);

    var user = new User
    {
        Username = adUser.Username,
        Email = adUser.Email,
        FullName = adUser.FullName,
        Phone = adUser.Phone,
        Department = adUser.Department,
        PasswordHash = passwordHash,
        Salt = salt,
        IsActive = true,
        IsAdUser = true,
        AdDomainUsername = adUser.Username
    };

    var createdUser = await _unitOfWork.Users.AddAsync(user, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    _logger.LogInformation("AD user auto-created: {UserId}", createdUser.Id);
    return createdUser;
}
```

## Acceptance Criteria

- [ ] Multi-factor authentication fully implemented (TOTP, SMS OTP, backup codes)
- [ ] Password policy enforcement with configurable rules
- [ ] Active Directory integration with local fallback
- [ ] Password history tracking prevents reuse
- [ ] Password reset functionality with secure tokens
- [ ] Account lockout with configurable thresholds
- [ ] Enhanced security logging and audit trail
- [ ] MFA setup and management endpoints
- [ ] Backup codes generation and validation
- [ ] All existing authentication flows preserved

## Dependencies

- **Before:** JWT Token Infrastructure task must be completed
- **After:** This enables RBAC and security features implementation

## Files to Create/Modify

**Create:**
- `src/Shared/DVC.Shared.Infrastructure/Configuration/PasswordPolicyOptions.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/UserMfaMethod.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/UserBackupCode.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/PasswordHistory.cs`
- `src/Services/UserService/DVC.UserService.Core/Interfaces/IMfaService.cs`
- `src/Services/UserService/DVC.UserService.Core/Services/MfaService.cs`

**Modify:**
- `src/Shared/DVC.Shared.Infrastructure/Security/PasswordService.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/User.cs`
- `src/Services/UserService/DVC.UserService.Core/Services/AuthService.cs`

## Testing Requirements

1. **Unit Tests:**
   - Password policy validation
   - MFA code generation and validation
   - Password history checking
   - Active Directory authentication flow

2. **Integration Tests:**
   - Complete authentication flow with MFA
   - Password reset process
   - Account lockout and recovery

3. **Security Tests:**
   - MFA bypass attempts
   - Password policy circumvention
   - Brute force protection

## Notes

- This task implements comprehensive authentication as specified in the PRD
- MFA implementation supports multiple methods for user convenience and security
- Active Directory integration provides enterprise authentication with fallback
- Password policies ensure strong security while being configurable
- All security events are logged for compliance and monitoring