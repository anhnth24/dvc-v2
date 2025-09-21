namespace DVC.UserService.Core.DTOs;

// Authentication DTOs
public record LoginDto(string Username, string Password, string? MfaCode = null);

public record LoginResponseDto(
    bool Success,
    string? AccessToken = null,
    string? RefreshToken = null,
    DateTime? ExpiresAt = null,
    string? ErrorMessage = null,
    bool RequiresMfa = false,
    UserDto? User = null
);

public record RefreshTokenDto(string RefreshToken);

// User DTOs
public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string FullName,
    string? Phone = null,
    string? Department = null,
    string? Unit = null,
    string? Position = null,
    bool IsActive = true,
    DateTime? LastLoginAt = null,
    IReadOnlyList<string> Roles = null!
)
{
    public IReadOnlyList<string> Roles { get; init; } = Roles ?? new List<string>();
}

public record CreateUserDto(
    string Username,
    string Email,
    string FullName,
    string Password,
    string? Phone = null,
    string? Department = null,
    string? Unit = null,
    string? Position = null,
    IReadOnlyList<string>? RoleNames = null
)
{
    public IReadOnlyList<string> RoleNames { get; init; } = RoleNames ?? new List<string>();
}

public record UpdateUserDto(
    string Email,
    string FullName,
    string? Phone = null,
    string? Department = null,
    string? Unit = null,
    string? Position = null,
    bool? IsActive = null
);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record ResetPasswordDto(string NewPassword, string ResetToken);

// Role DTOs
public record RoleDto(
    Guid Id,
    string Name,
    string? Description = null,
    string? DisplayName = null,
    bool IsActive = true,
    IReadOnlyList<string> Permissions = null!
)
{
    public IReadOnlyList<string> Permissions { get; init; } = Permissions ?? new List<string>();
}

public record CreateRoleDto(
    string Name,
    string? Description = null,
    string? DisplayName = null,
    IReadOnlyList<string>? PermissionCodes = null
)
{
    public IReadOnlyList<string> PermissionCodes { get; init; } = PermissionCodes ?? new List<string>();
}

public record UpdateRoleDto(
    string? Description = null,
    string? DisplayName = null,
    bool? IsActive = null,
    IReadOnlyList<string>? PermissionCodes = null
);

// Permission DTOs
public record PermissionDto(
    Guid Id,
    string Code,
    string Name,
    string? Description = null,
    string? Module = null,
    string? Resource = null,
    string? Action = null,
    bool IsActive = true
);

public record CreatePermissionDto(
    string Code,
    string Name,
    string? Description = null,
    string? Module = null,
    string? Resource = null,
    string? Action = null
);

// User Role Assignment DTOs
public record AssignRoleDto(Guid UserId, Guid RoleId, DateTime? ExpiresAt = null, string? Notes = null);

public record UserRoleDto(
    Guid UserId,
    Guid RoleId,
    string RoleName,
    DateTime AssignedAt,
    DateTime? ExpiresAt = null,
    string? AssignedBy = null,
    bool IsActive = true,
    string? Notes = null
);

// Search and Filter DTOs
public record UserSearchDto(
    string? Username = null,
    string? Email = null,
    string? FullName = null,
    string? Department = null,
    string? Unit = null,
    bool? IsActive = null,
    string? RoleName = null,
    int Page = 1,
    int PageSize = 20
);

public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string? Username,
    string Action,
    string? Resource,
    string? ResourceId,
    string? OldValues,
    string? NewValues,
    DateTime Timestamp,
    bool IsSuccess,
    string? ErrorMessage,
    string? IpAddress
);
