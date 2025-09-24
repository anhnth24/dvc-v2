# Manual Task: JWT Token Infrastructure Enhancement

**Task ID:** manual-task-jwt-token-infrastructure
**Phase:** Authentication Core Infrastructure
**Priority:** High
**Status:** Ready
**Estimated Effort:** 2 days
**Created:** 2025-09-21

## Objective

Enhance the existing JWT token infrastructure to fully implement the authentication requirements from the Backend PRD, including proper token configuration, advanced security features, and multi-factor authentication support.

## Current State Analysis

**What Exists:**
- Basic JWT service interface in Shared.Infrastructure
- Basic token generation in AuthService
- Basic token validation
- Refresh token mechanism

**What's Missing:**
- JWT configuration options (RSA 256, token expiry settings)
- Device fingerprinting for security
- Concurrent session management (3 per user limit)
- Enhanced token claims structure
- Token revocation support
- Proper MFA integration

## Implementation Steps

### Step 1: Enhance JWT Configuration

**File:** `src/Shared/DVC.Shared.Infrastructure/Configuration/JwtOptions.cs` (Create)
```csharp
public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
    public string Algorithm { get; set; } = SecurityAlgorithms.HmacSha256;
    public bool ValidateIssuer { get; set; } = true;
    public bool ValidateAudience { get; set; } = true;
    public bool ValidateLifetime { get; set; } = true;
    public bool ValidateIssuerSigningKey { get; set; } = true;
    public bool RequireHttpsMetadata { get; set; } = true;
    public int ClockSkewSeconds { get; set; } = 300;
}
```

**File:** `src/Services/UserService/DVC.UserService.Api/appsettings.json` (Update)
```json
{
  "Jwt": {
    "Issuer": "DVC.UserService",
    "Audience": "DVC.Backend",
    "SecretKey": "your-super-secret-key-here-32-characters-minimum",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7,
    "Algorithm": "HS256",
    "ValidateIssuer": true,
    "ValidateAudience": true,
    "ValidateLifetime": true,
    "ValidateIssuerSigningKey": true,
    "RequireHttpsMetadata": true,
    "ClockSkewSeconds": 300
  }
}
```

### Step 2: Enhance JWT Service Interface

**File:** `src/Shared/DVC.Shared.Infrastructure/Security/IJwtService.cs` (Update)
```csharp
public interface IJwtService
{
    string GenerateAccessToken(Guid userId, string username, string email,
        IEnumerable<string> roles, IEnumerable<string> permissions,
        string? deviceFingerprint = null, IDictionary<string, object>? additionalClaims = null);

    string GenerateRefreshToken();

    bool ValidateToken(string token);

    Guid? GetUserIdFromToken(string token);

    string? GetClaimFromToken(string token, string claimType);

    DateTime? GetTokenExpiration(string token);

    Task<bool> IsTokenRevokedAsync(string token);

    Task RevokeTokenAsync(string token);

    Task RevokeAllUserTokensAsync(Guid userId);
}
```

### Step 3: Enhanced User Session Management

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/UserSession.cs` (Create)
```csharp
using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public class UserSession : AuditableEntity
{
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpiryTime { get; set; }
    public DateTime LastAccessedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Location { get; set; }
    public string? DeviceType { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/User.cs` (Update)
```csharp
// Add to User entity
public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();

// Remove these properties (moved to UserSession)
// public string? RefreshToken { get; set; }
// public DateTime? RefreshTokenExpiryTime { get; set; }
```

### Step 4: Session Repository Interface

**File:** `src/Services/UserService/DVC.UserService.Core/Interfaces/IUserSessionRepository.cs` (Create)
```csharp
namespace DVC.UserService.Core.Interfaces;

public interface IUserSessionRepository : IRepository<UserSession>
{
    Task<UserSession?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserSession>> GetActiveSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserSession?> GetByDeviceFingerprintAsync(Guid userId, string deviceFingerprint, CancellationToken cancellationToken = default);
    Task RevokeAllUserSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task RevokeOldestSessionsAsync(Guid userId, int keepCount = 3, CancellationToken cancellationToken = default);
    Task CleanupExpiredSessionsAsync(CancellationToken cancellationToken = default);
}
```

### Step 5: Device Fingerprinting Service

**File:** `src/Services/UserService/DVC.UserService.Core/Services/DeviceFingerprintService.cs` (Create)
```csharp
using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using System.Text;

namespace DVC.UserService.Core.Services;

public interface IDeviceFingerprintService
{
    string GenerateFingerprint(HttpContext httpContext);
}

public class DeviceFingerprintService : IDeviceFingerprintService
{
    public string GenerateFingerprint(HttpContext httpContext)
    {
        var request = httpContext.Request;
        var components = new List<string>
        {
            request.Headers.UserAgent.ToString(),
            request.Headers.AcceptLanguage.ToString(),
            request.Headers.AcceptEncoding.ToString(),
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
        };

        var combinedString = string.Join("|", components);
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(combinedString));
        return Convert.ToBase64String(hashBytes);
    }
}
```

### Step 6: Enhanced Authentication Service

**File:** `src/Services/UserService/DVC.UserService.Core/Services/AuthService.cs` (Update LoginAsync method)
```csharp
public async Task<AuthResult> LoginAsync(LoginRequest request, string? deviceFingerprint = null, string? ipAddress = null, CancellationToken cancellationToken = default)
{
    try
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("Login attempt with non-existent username: {Username} from IP: {IpAddress}",
                request.Username, ipAddress);
            return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidCredentials);
        }

        // Existing validation logic...

        // After successful authentication:

        // Check concurrent session limit
        var activeSessions = await _unitOfWork.UserSessions.GetActiveSessionsAsync(user.Id, cancellationToken);
        if (activeSessions.Count >= 3)
        {
            // Remove oldest session
            await _unitOfWork.UserSessions.RevokeOldestSessionsAsync(user.Id, 2, cancellationToken);
        }

        // Generate tokens with device fingerprint
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);
        var roles = await _unitOfWork.Roles.GetUserRolesAsync(user.Id, cancellationToken);
        var roleNames = roles.Select(r => r.Name).ToList();

        var additionalClaims = new Dictionary<string, object>
        {
            { "device_fingerprint", deviceFingerprint ?? "unknown" },
            { "ip_address", ipAddress ?? "unknown" },
            { "login_time", DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
        };

        var accessToken = _jwtService.GenerateAccessToken(
            user.Id, user.Username, user.Email, roleNames, permissions,
            deviceFingerprint, additionalClaims);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Create user session
        var userSession = new UserSession
        {
            UserId = user.Id,
            DeviceFingerprint = deviceFingerprint ?? "unknown",
            IpAddress = ipAddress ?? "unknown",
            UserAgent = request.UserAgent ?? "unknown",
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7),
            LastAccessedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _unitOfWork.UserSessions.AddAsync(userSession, cancellationToken);

        // Update user last login
        user.LastLoginAt = DateTime.UtcNow;
        user.FailedLoginAttempts = 0;
        user.IsLocked = false;
        user.LockedUntil = null;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successful login for user: {UserId} from IP: {IpAddress} with device: {DeviceFingerprint}",
            user.Id, ipAddress, deviceFingerprint);

        return new AuthResult(
            true,
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(15)
        );
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during login for username: {Username} from IP: {IpAddress}",
            request.Username, ipAddress);
        return new AuthResult(false, ErrorMessage: ErrorMessages.InternalError);
    }
}
```

### Step 7: Update Controller for Device Fingerprinting

**File:** `src/Services/UserService/DVC.UserService.Api/Controllers/AuthController.cs` (Update LoginAsync method)
```csharp
[HttpPost("login")]
public async Task<ActionResult<ApiResponse<LoginResponseDto>>> LoginAsync([FromBody] LoginDto loginDto)
{
    try
    {
        // Validate input
        var validationResult = await _loginValidator.ValidateAsync(loginDto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<LoginResponseDto>.ErrorResult("Dữ liệu không hợp lệ", errors));
        }

        // Get device fingerprint and IP address
        var deviceFingerprint = _deviceFingerprintService.GenerateFingerprint(HttpContext);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        // Convert to service request
        var loginRequest = new LoginRequest(loginDto.Username, loginDto.Password, loginDto.MfaCode)
        {
            UserAgent = userAgent
        };

        // Authenticate with device info
        var authResult = await _authService.LoginAsync(loginRequest, deviceFingerprint, ipAddress);

        if (!authResult.Success)
        {
            _logger.LogWarning("Login failed for username: {Username} from IP: {IpAddress}",
                loginDto.Username, ipAddress);
            return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResult(
                authResult.ErrorMessage ?? "Đăng nhập thất bại"));
        }

        // Rest of the method remains the same...
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during login for username: {Username}", loginDto.Username);
        return StatusCode(500, ApiResponse<LoginResponseDto>.ErrorResult("Lỗi hệ thống"));
    }
}
```

## Acceptance Criteria

- [ ] JWT configuration properly set up with RSA 256 algorithm
- [ ] Device fingerprinting implemented for security tracking
- [ ] Concurrent session management enforces 3 session limit per user
- [ ] Enhanced token claims include device and security information
- [ ] Token revocation mechanism implemented
- [ ] User session tracking in database
- [ ] Cleanup of expired sessions implemented
- [ ] All existing authentication flows continue to work
- [ ] Comprehensive logging for security events
- [ ] Unit tests cover new functionality

## Dependencies

- **Before:** Existing JWT infrastructure
- **After:** This task enables enhanced security features and MFA implementation

## Files to Create/Modify

**Create:**
- `src/Shared/DVC.Shared.Infrastructure/Configuration/JwtOptions.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/UserSession.cs`
- `src/Services/UserService/DVC.UserService.Core/Interfaces/IUserSessionRepository.cs`
- `src/Services/UserService/DVC.UserService.Core/Services/DeviceFingerprintService.cs`

**Modify:**
- `src/Shared/DVC.Shared.Infrastructure/Security/IJwtService.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/User.cs`
- `src/Services/UserService/DVC.UserService.Core/Services/AuthService.cs`
- `src/Services/UserService/DVC.UserService.Api/Controllers/AuthController.cs`
- `src/Services/UserService/DVC.UserService.Api/appsettings.json`

## Testing Requirements

1. **Unit Tests:**
   - Device fingerprint generation consistency
   - Session management logic
   - Token generation with enhanced claims
   - Concurrent session limit enforcement

2. **Integration Tests:**
   - Login flow with device tracking
   - Session cleanup processes
   - Token validation across services

3. **Security Tests:**
   - Token revocation effectiveness
   - Session hijacking prevention
   - Concurrent session handling

## Notes

- This task enhances existing authentication without breaking changes
- Device fingerprinting provides security tracking without being overly restrictive
- Session management follows the PRD requirement of 3 concurrent sessions per user
- All security events are properly logged for audit purposes
- The implementation supports future MFA and advanced security features