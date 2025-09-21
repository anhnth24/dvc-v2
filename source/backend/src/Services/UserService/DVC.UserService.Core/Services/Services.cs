using DVC.Shared.Core.Constants;
using DVC.Shared.Core.Exceptions;
using DVC.Shared.Infrastructure.Security;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using Microsoft.Extensions.Logging;
using IJwtService = DVC.Shared.Infrastructure.Security.IJwtService;
using IPasswordService = DVC.Shared.Infrastructure.Security.IPasswordService;

namespace DVC.UserService.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtService jwtService,
        IPasswordService passwordService,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent username: {Username}", request.Username);
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidCredentials);
            }

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

            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash, user.Salt ?? string.Empty))
            {
                await HandleFailedLoginAsync(user, cancellationToken);
                _logger.LogWarning("Failed login attempt for user: {UserId}", user.Id);
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidCredentials);
            }

            // Check MFA if enabled
            if (user.MfaEnabled)
            {
                if (string.IsNullOrEmpty(request.MfaCode))
                {
                    return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.MfaRequired, RequiresMfa: true);
                }

                // TODO: Implement MFA validation
                // For now, just check if code is "123456" (demo purposes)
                if (request.MfaCode != "123456")
                {
                    _logger.LogWarning("Invalid MFA code for user: {UserId}", user.Id);
                    return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.InvalidMfaCode);
                }
            }

            // Reset failed login attempts
            user.FailedLoginAttempts = 0;
            user.IsLocked = false;
            user.LockedUntil = null;
            user.LastLoginAt = DateTime.UtcNow;

            // Generate tokens
            var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);
            var roles = await _unitOfWork.Roles.GetUserRolesAsync(user.Id, cancellationToken);
            var roleNames = roles.Select(r => r.Name).ToList();

            var accessToken = _jwtService.GenerateAccessToken(
                user.Id, user.Username, user.Email, roleNames, permissions);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successful login for user: {UserId}", user.Id);

            return new AuthResult(
                true,
                accessToken,
                refreshToken,
                DateTime.UtcNow.AddMinutes(15)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username: {Username}", request.Username);
            return new AuthResult(false, ErrorMessage: ErrorMessages.InternalError);
        }
    }

    public async Task<AuthResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetAllAsync(cancellationToken);
            var userWithToken = user.FirstOrDefault(u => u.RefreshToken == refreshToken);

            if (userWithToken == null || userWithToken.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired refresh token");
                return new AuthResult(false, ErrorMessage: ErrorMessages.Authentication.TokenExpired);
            }

            var permissions = await GetUserPermissionsAsync(userWithToken.Id, cancellationToken);
            var roles = await _unitOfWork.Roles.GetUserRolesAsync(userWithToken.Id, cancellationToken);
            var roleNames = roles.Select(r => r.Name).ToList();

            var newAccessToken = _jwtService.GenerateAccessToken(
                userWithToken.Id, userWithToken.Username, userWithToken.Email, roleNames, permissions);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            userWithToken.RefreshToken = newRefreshToken;
            userWithToken.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _unitOfWork.Users.UpdateAsync(userWithToken, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new AuthResult(
                true,
                newAccessToken,
                newRefreshToken,
                DateTime.UtcNow.AddMinutes(15)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return new AuthResult(false, ErrorMessage: ErrorMessages.InternalError);
        }
    }

    public async Task<bool> LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
            return false;
        }
    }

    public Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_jwtService.ValidateToken(token));
    }

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var permissions = await _unitOfWork.Permissions.GetByUserAsync(userId, cancellationToken);
        return permissions.Select(p => p.Code).ToList();
    }

    public Guid? GetUserIdFromToken(string token)
    {
        return _jwtService.GetUserIdFromToken(token);
    }

    private async Task HandleFailedLoginAsync(User user, CancellationToken cancellationToken)
    {
        user.FailedLoginAttempts++;

        if (user.FailedLoginAttempts >= 5)
        {
            user.IsLocked = true;
            user.LockedUntil = DateTime.UtcNow.AddMinutes(30);
        }

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IPasswordService passwordService,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Check if username already exists
        if (await _unitOfWork.Users.IsUsernameExistsAsync(request.Username, cancellationToken: cancellationToken))
        {
            throw new ConflictException($"Username '{request.Username}' already exists");
        }

        // Check if email already exists
        if (await _unitOfWork.Users.IsEmailExistsAsync(request.Email, cancellationToken: cancellationToken))
        {
            throw new ConflictException($"Email '{request.Email}' already exists");
        }

        var passwordHash = _passwordService.HashPassword(request.Password, out var salt);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            Department = request.Department,
            Unit = request.Unit,
            Position = request.Position,
            PasswordHash = passwordHash,
            Salt = salt,
            IsActive = true
        };

        var createdUser = await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User created: {UserId}", createdUser.Id);

        return createdUser;
    }

    public async Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
    }
}

