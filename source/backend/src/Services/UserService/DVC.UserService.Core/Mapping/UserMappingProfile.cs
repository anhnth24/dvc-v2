using AutoMapper;
using DVC.UserService.Core.DTOs;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;

namespace DVC.UserService.Core.Mapping;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                src.UserRoles
                    .Where(ur => ur.IsActive && (ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow))
                    .Select(ur => ur.Role.Name)
                    .ToList()));

        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Salt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsLocked, opt => opt.Ignore())
            .ForMember(dest => dest.FailedLoginAttempts, opt => opt.Ignore())
            .ForMember(dest => dest.LockedUntil, opt => opt.Ignore())
            .ForMember(dest => dest.MfaEnabled, opt => opt.Ignore())
            .ForMember(dest => dest.MfaSecret, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore())
            .ForMember(dest => dest.LastLoginAt, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.AuditLogs, opt => opt.Ignore());

        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Username, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Salt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsLocked, opt => opt.Ignore())
            .ForMember(dest => dest.FailedLoginAttempts, opt => opt.Ignore())
            .ForMember(dest => dest.LockedUntil, opt => opt.Ignore())
            .ForMember(dest => dest.MfaEnabled, opt => opt.Ignore())
            .ForMember(dest => dest.MfaSecret, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore())
            .ForMember(dest => dest.LastLoginAt, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.AuditLogs, opt => opt.Ignore())
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Role mappings
        CreateMap<Role, RoleDto>()
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src =>
                src.RolePermissions
                    .Where(rp => rp.Permission.IsActive)
                    .Select(rp => rp.Permission.Code)
                    .ToList()));

        CreateMap<CreateRoleDto, Role>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsSystemRole, opt => opt.Ignore())
            .ForMember(dest => dest.Priority, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.RolePermissions, opt => opt.Ignore());

        CreateMap<UpdateRoleDto, Role>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Name, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsSystemRole, opt => opt.Ignore())
            .ForMember(dest => dest.Priority, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.RolePermissions, opt => opt.Ignore())
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Permission mappings
        CreateMap<Permission, PermissionDto>();

        CreateMap<CreatePermissionDto, Permission>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsSystemPermission, opt => opt.Ignore())
            .ForMember(dest => dest.RolePermissions, opt => opt.Ignore())
            .ForMember(dest => dest.UserPermissions, opt => opt.Ignore());

        // UserRole mappings
        CreateMap<UserRole, UserRoleDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));

        CreateMap<AssignRoleDto, UserRole>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.AssignedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.Ignore());

        // AuditLog mappings
        CreateMap<AuditLog, AuditLogDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null));

        // Authentication mappings
        CreateMap<LoginDto, LoginRequest>()
            .ConstructUsing(src => new LoginRequest(src.Username, src.Password, src.MfaCode));

        CreateMap<AuthResult, LoginResponseDto>()
            .ForMember(dest => dest.User, opt => opt.Ignore()); // Will be set separately
    }
}

// Extension methods for easy mapping
public static class MappingExtensions
{
    public static UserDto ToDto(this User user, IMapper mapper)
    {
        return mapper.Map<UserDto>(user);
    }

    public static User ToEntity(this CreateUserDto dto, IMapper mapper)
    {
        return mapper.Map<User>(dto);
    }

    public static RoleDto ToDto(this Role role, IMapper mapper)
    {
        return mapper.Map<RoleDto>(role);
    }

    public static Role ToEntity(this CreateRoleDto dto, IMapper mapper)
    {
        return mapper.Map<Role>(dto);
    }

    public static PermissionDto ToDto(this Permission permission, IMapper mapper)
    {
        return mapper.Map<PermissionDto>(permission);
    }

    public static Permission ToEntity(this CreatePermissionDto dto, IMapper mapper)
    {
        return mapper.Map<Permission>(dto);
    }

    public static AuditLogDto ToDto(this AuditLog auditLog, IMapper mapper)
    {
        return mapper.Map<AuditLogDto>(auditLog);
    }

    public static LoginResponseDto ToDto(this AuthResult authResult, IMapper mapper, UserDto? userDto = null)
    {
        var result = mapper.Map<LoginResponseDto>(authResult);
        return result with { User = userDto };
    }
}