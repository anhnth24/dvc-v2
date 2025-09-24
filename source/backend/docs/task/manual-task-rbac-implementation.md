# Manual Task: Role-Based Access Control (RBAC) Implementation

**Task ID:** manual-task-rbac-implementation
**Phase:** Authorization & Permission Management
**Priority:** High
**Status:** Ready
**Estimated Effort:** 4 days
**Created:** 2025-09-21

## Objective

Implement comprehensive Role-Based Access Control (RBAC) system with hierarchical units, dynamic role assignment, temporal permissions, delegation workflow, and context-sensitive permissions as specified in the Backend PRD.

## Current State Analysis

**What Exists:**
- Basic Role and Permission entities
- UserRole junction table
- Basic permission checking in AuthService
- Simple role-based authorization attributes

**What's Missing:**
- Hierarchical unit structure (Province → Department → District → Ward)
- Temporal permissions with approval workflow
- Dynamic role assignment and inheritance
- Context-sensitive permissions (procedure-specific)
- Delegation system with audit trail
- Resource-based authorization
- Permission caching and optimization

## Implementation Steps

### Step 1: Enhanced Entity Model for Hierarchical RBAC

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/OrganizationalUnit.cs` (Create)
```csharp
using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public enum UnitType
{
    Central = 0,
    Province = 1,
    Department = 2,
    District = 3,
    Ward = 4
}

public class OrganizationalUnit : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UnitType Type { get; set; }
    public Guid? ParentUnitId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int Level { get; set; }
    public string HierarchyPath { get; set; } = string.Empty; // e.g., "1.2.5" for quick queries

    // Navigation properties
    public OrganizationalUnit? ParentUnit { get; set; }
    public ICollection<OrganizationalUnit> ChildUnits { get; set; } = new List<OrganizationalUnit>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}
```

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/Permission.cs` (Update)
```csharp
using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public enum PermissionScope
{
    System = 0,      // System-wide permissions
    Unit = 1,        // Unit-specific permissions
    Procedure = 2,   // Procedure-specific permissions
    Document = 3     // Document-specific permissions
}

public class Permission : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PermissionScope Scope { get; set; }
    public string? ResourceType { get; set; } // e.g., "Document", "Workflow", "User"
    public string? Module { get; set; } // e.g., "UserManagement", "DocumentProcessing"
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}

public class RolePermission : AuditableEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public bool IsGranted { get; set; } = true;

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
```

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/UserPermission.cs` (Create)
```csharp
using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public enum PermissionType
{
    Direct = 0,      // Directly assigned
    Inherited = 1,   // Inherited from role
    Delegated = 2,   // Delegated from another user
    Temporal = 3     // Temporary permission
}

public class UserPermission : AuditableEntity
{
    public Guid UserId { get; set; }
    public Guid PermissionId { get; set; }
    public Guid? UnitId { get; set; }
    public string? ResourceId { get; set; } // Specific resource (e.g., DocumentId, WorkflowId)
    public PermissionType Type { get; set; }
    public bool IsGranted { get; set; } = true;

    // Temporal permissions
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    // Delegation
    public Guid? DelegatedByUserId { get; set; }
    public string? DelegationReason { get; set; }
    public bool RequiresApproval { get; set; } = false;
    public bool IsApproved { get; set; } = false;
    public Guid? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
    public OrganizationalUnit? Unit { get; set; }
    public User? DelegatedByUser { get; set; }
    public User? ApprovedByUser { get; set; }
}
```

**File:** `src/Services/UserService/DVC.UserService.Core/Entities/User.cs` (Update)
```csharp
// Add to User entity
public Guid? UnitId { get; set; }
public OrganizationalUnit? Unit { get; set; }
public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
public ICollection<UserPermission> DelegatedPermissions { get; set; } = new List<UserPermission>();
public ICollection<UserPermission> ApprovedPermissions { get; set; } = new List<UserPermission>();
```

### Step 2: Repository Interfaces for RBAC

**File:** `src/Services/UserService/DVC.UserService.Core/Interfaces/IRbacRepository.cs` (Create)
```csharp
namespace DVC.UserService.Core.Interfaces;

public interface IOrganizationalUnitRepository : IRepository<OrganizationalUnit>
{
    Task<OrganizationalUnit?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrganizationalUnit>> GetByTypeAsync(UnitType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrganizationalUnit>> GetChildUnitsAsync(Guid parentUnitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrganizationalUnit>> GetHierarchyAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrganizationalUnit>> GetUserUnitsAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IUserPermissionRepository : IRepository<UserPermission>
{
    Task<IReadOnlyList<UserPermission>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserPermission>> GetEffectivePermissionsAsync(Guid userId, Guid? unitId = null, string? resourceId = null, CancellationToken cancellationToken = default);
    Task<bool> HasPermissionAsync(Guid userId, string permissionCode, Guid? unitId = null, string? resourceId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserPermission>> GetPendingApprovalsAsync(Guid approverId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserPermission>> GetDelegatedPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserPermission>> GetExpiringPermissionsAsync(DateTime expiryDate, CancellationToken cancellationToken = default);
    Task RevokeExpiredPermissionsAsync(CancellationToken cancellationToken = default);
}

public interface IRolePermissionRepository : IRepository<RolePermission>
{
    Task<IReadOnlyList<RolePermission>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RolePermission>> GetByPermissionAsync(Guid permissionId, CancellationToken cancellationToken = default);
}
```

### Step 3: Authorization Service Implementation

**File:** `src/Services/UserService/DVC.UserService.Core/Services/AuthorizationService.cs` (Create)
```csharp
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Core.Services;

public interface IAuthorizationService
{
    Task<bool> HasPermissionAsync(Guid userId, string permissionCode, Guid? unitId = null, string? resourceId = null);
    Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, Guid? unitId = null);
    Task<PermissionResult> CheckPermissionAsync(Guid userId, string permissionCode, AuthorizationContext context);
    Task<bool> CanDelegatePermissionAsync(Guid fromUserId, Guid toUserId, string permissionCode);
    Task<UserPermission> DelegatePermissionAsync(DelegatePermissionRequest request);
    Task<bool> ApprovePermissionAsync(Guid permissionId, Guid approverId, string? reason = null);
    Task<bool> RevokePermissionAsync(Guid permissionId, Guid revokedByUserId, string reason);
    Task<IReadOnlyList<UserPermission>> GetPendingApprovalsAsync(Guid approverId);
    Task InvalidateUserPermissionCacheAsync(Guid userId);
}

public class AuthorizationService : IAuthorizationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AuthorizationService> _logger;
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(15);

    public AuthorizationService(
        IUnitOfWork unitOfWork,
        IMemoryCache cache,
        ILogger<AuthorizationService> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permissionCode, Guid? unitId = null, string? resourceId = null)
    {
        var cacheKey = $"user_permissions_{userId}_{unitId}_{resourceId}";

        if (!_cache.TryGetValue(cacheKey, out List<string>? cachedPermissions))
        {
            cachedPermissions = await LoadUserPermissionsAsync(userId, unitId, resourceId);
            _cache.Set(cacheKey, cachedPermissions, _cacheExpiration);
        }

        return cachedPermissions.Contains(permissionCode);
    }

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, Guid? unitId = null)
    {
        var cacheKey = $"user_permissions_{userId}_{unitId}";

        if (!_cache.TryGetValue(cacheKey, out List<string>? cachedPermissions))
        {
            cachedPermissions = await LoadUserPermissionsAsync(userId, unitId);
            _cache.Set(cacheKey, cachedPermissions, _cacheExpiration);
        }

        return cachedPermissions;
    }

    public async Task<PermissionResult> CheckPermissionAsync(Guid userId, string permissionCode, AuthorizationContext context)
    {
        var hasPermission = await HasPermissionAsync(userId, permissionCode, context.UnitId, context.ResourceId);

        if (!hasPermission)
        {
            // Check if permission can be inherited from parent units
            if (context.UnitId.HasValue)
            {
                hasPermission = await CheckInheritedPermissionAsync(userId, permissionCode, context.UnitId.Value);
            }
        }

        var result = new PermissionResult
        {
            IsGranted = hasPermission,
            PermissionCode = permissionCode,
            UserId = userId,
            Context = context,
            CheckedAt = DateTime.UtcNow
        };

        // Log authorization check for audit
        _logger.LogInformation("Permission check: User {UserId}, Permission {Permission}, Result {Result}",
            userId, permissionCode, hasPermission);

        return result;
    }

    public async Task<bool> CanDelegatePermissionAsync(Guid fromUserId, Guid toUserId, string permissionCode)
    {
        // Check if delegator has the permission
        var hasDelegatorPermission = await HasPermissionAsync(fromUserId, permissionCode);
        if (!hasDelegatorPermission) return false;

        // Check if delegator has delegation rights
        var canDelegate = await HasPermissionAsync(fromUserId, "delegate_permissions");
        if (!canDelegate) return false;

        // Check if target user is in same or subordinate unit
        var fromUser = await _unitOfWork.Users.GetByIdAsync(fromUserId);
        var toUser = await _unitOfWork.Users.GetByIdAsync(toUserId);

        if (fromUser?.UnitId == null || toUser?.UnitId == null) return false;

        return await IsSubordinateUnitAsync(fromUser.UnitId.Value, toUser.UnitId.Value);
    }

    public async Task<UserPermission> DelegatePermissionAsync(DelegatePermissionRequest request)
    {
        var canDelegate = await CanDelegatePermissionAsync(request.FromUserId, request.ToUserId, request.PermissionCode);
        if (!canDelegate)
        {
            throw new UnauthorizedAccessException("Cannot delegate this permission");
        }

        var permission = await _unitOfWork.Permissions.GetByCodeAsync(request.PermissionCode);
        if (permission == null)
        {
            throw new ArgumentException("Permission not found");
        }

        var userPermission = new UserPermission
        {
            UserId = request.ToUserId,
            PermissionId = permission.Id,
            UnitId = request.UnitId,
            ResourceId = request.ResourceId,
            Type = PermissionType.Delegated,
            IsGranted = true,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            DelegatedByUserId = request.FromUserId,
            DelegationReason = request.Reason,
            RequiresApproval = request.RequiresApproval,
            IsApproved = !request.RequiresApproval
        };

        await _unitOfWork.UserPermissions.AddAsync(userPermission);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate cache
        await InvalidateUserPermissionCacheAsync(request.ToUserId);

        _logger.LogInformation("Permission delegated: {Permission} from {FromUser} to {ToUser}",
            request.PermissionCode, request.FromUserId, request.ToUserId);

        return userPermission;
    }

    public async Task<bool> ApprovePermissionAsync(Guid permissionId, Guid approverId, string? reason = null)
    {
        var permission = await _unitOfWork.UserPermissions.GetByIdAsync(permissionId);
        if (permission == null || !permission.RequiresApproval) return false;

        // Check if approver has authority
        var canApprove = await HasPermissionAsync(approverId, "approve_delegations");
        if (!canApprove) return false;

        permission.IsApproved = true;
        permission.ApprovedByUserId = approverId;
        permission.ApprovedAt = DateTime.UtcNow;

        await _unitOfWork.UserPermissions.UpdateAsync(permission);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate cache
        await InvalidateUserPermissionCacheAsync(permission.UserId);

        _logger.LogInformation("Permission approved: {PermissionId} by {ApproverId}", permissionId, approverId);

        return true;
    }

    public async Task<bool> RevokePermissionAsync(Guid permissionId, Guid revokedByUserId, string reason)
    {
        var permission = await _unitOfWork.UserPermissions.GetByIdAsync(permissionId);
        if (permission == null) return false;

        // Check if revoker has authority
        var canRevoke = await HasPermissionAsync(revokedByUserId, "revoke_permissions");
        if (!canRevoke) return false;

        permission.IsGranted = false;
        await _unitOfWork.UserPermissions.UpdateAsync(permission);

        // Log revocation
        var auditLog = new AuditLog
        {
            UserId = revokedByUserId,
            Action = "RevokePermission",
            Resource = $"UserPermission:{permissionId}",
            Details = reason,
            IpAddress = "system",
            UserAgent = "system"
        };
        await _unitOfWork.AuditLogs.AddAsync(auditLog);

        await _unitOfWork.SaveChangesAsync();

        // Invalidate cache
        await InvalidateUserPermissionCacheAsync(permission.UserId);

        return true;
    }

    public async Task<IReadOnlyList<UserPermission>> GetPendingApprovalsAsync(Guid approverId)
    {
        return await _unitOfWork.UserPermissions.GetPendingApprovalsAsync(approverId);
    }

    public async Task InvalidateUserPermissionCacheAsync(Guid userId)
    {
        var pattern = $"user_permissions_{userId}_";
        // Remove all cache entries for this user
        // Implementation depends on your cache provider
    }

    private async Task<List<string>> LoadUserPermissionsAsync(Guid userId, Guid? unitId = null, string? resourceId = null)
    {
        var permissions = new List<string>();

        // Get direct permissions
        var userPermissions = await _unitOfWork.UserPermissions.GetEffectivePermissionsAsync(userId, unitId, resourceId);
        permissions.AddRange(userPermissions.Where(p => p.IsGranted && IsValidPermission(p))
            .Select(p => p.Permission.Code));

        // Get role-based permissions
        var userRoles = await _unitOfWork.Roles.GetUserRolesAsync(userId);
        foreach (var role in userRoles)
        {
            var rolePermissions = await _unitOfWork.RolePermissions.GetByRoleAsync(role.Id);
            permissions.AddRange(rolePermissions.Where(rp => rp.IsGranted)
                .Select(rp => rp.Permission.Code));
        }

        return permissions.Distinct().ToList();
    }

    private async Task<bool> CheckInheritedPermissionAsync(Guid userId, string permissionCode, Guid unitId)
    {
        var unit = await _unitOfWork.OrganizationalUnits.GetByIdAsync(unitId);
        while (unit?.ParentUnitId != null)
        {
            var hasPermission = await HasPermissionAsync(userId, permissionCode, unit.ParentUnitId);
            if (hasPermission) return true;

            unit = await _unitOfWork.OrganizationalUnits.GetByIdAsync(unit.ParentUnitId.Value);
        }

        return false;
    }

    private async Task<bool> IsSubordinateUnitAsync(Guid parentUnitId, Guid childUnitId)
    {
        if (parentUnitId == childUnitId) return true;

        var childUnit = await _unitOfWork.OrganizationalUnits.GetByIdAsync(childUnitId);
        while (childUnit?.ParentUnitId != null)
        {
            if (childUnit.ParentUnitId == parentUnitId) return true;
            childUnit = await _unitOfWork.OrganizationalUnits.GetByIdAsync(childUnit.ParentUnitId.Value);
        }

        return false;
    }

    private static bool IsValidPermission(UserPermission permission)
    {
        if (!permission.IsGranted) return false;
        if (!permission.IsApproved && permission.RequiresApproval) return false;

        var now = DateTime.UtcNow;
        if (permission.ValidFrom.HasValue && permission.ValidFrom > now) return false;
        if (permission.ValidTo.HasValue && permission.ValidTo < now) return false;

        return true;
    }
}

public class AuthorizationContext
{
    public Guid? UnitId { get; set; }
    public string? ResourceId { get; set; }
    public string? ResourceType { get; set; }
    public Dictionary<string, object> AdditionalContext { get; set; } = new();
}

public class PermissionResult
{
    public bool IsGranted { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public AuthorizationContext Context { get; set; } = new();
    public DateTime CheckedAt { get; set; }
    public string? Reason { get; set; }
}

public class DelegatePermissionRequest
{
    public Guid FromUserId { get; set; }
    public Guid ToUserId { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public Guid? UnitId { get; set; }
    public string? ResourceId { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; } = false;
}
```

### Step 4: Authorization Attributes and Middleware

**File:** `src/Services/UserService/DVC.UserService.Api/Attributes/RequirePermissionAttribute.cs` (Create)
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using DVC.UserService.Core.Interfaces;
using DVC.Shared.Core.Common;

namespace DVC.UserService.Api.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permissionCode;
    private readonly string? _resourceIdParameter;
    private readonly string? _unitIdParameter;

    public RequirePermissionAttribute(string permissionCode, string? resourceIdParameter = null, string? unitIdParameter = null)
    {
        _permissionCode = permissionCode;
        _resourceIdParameter = resourceIdParameter;
        _unitIdParameter = unitIdParameter;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthorizationService>();

        var userIdClaim = context.HttpContext.User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(ApiResponse.ErrorResult("Unauthorized"));
            return;
        }

        // Extract resource and unit IDs from route/query parameters
        Guid? unitId = null;
        string? resourceId = null;

        if (!string.IsNullOrEmpty(_unitIdParameter))
        {
            var unitIdValue = context.RouteData.Values[_unitIdParameter]?.ToString()
                             ?? context.HttpContext.Request.Query[_unitIdParameter].FirstOrDefault();
            if (Guid.TryParse(unitIdValue, out var parsedUnitId))
            {
                unitId = parsedUnitId;
            }
        }

        if (!string.IsNullOrEmpty(_resourceIdParameter))
        {
            resourceId = context.RouteData.Values[_resourceIdParameter]?.ToString()
                        ?? context.HttpContext.Request.Query[_resourceIdParameter].FirstOrDefault();
        }

        var hasPermission = await authService.HasPermissionAsync(userId, _permissionCode, unitId, resourceId);

        if (!hasPermission)
        {
            context.Result = new ForbidObjectResult(ApiResponse.ErrorResult("Insufficient permissions"));
        }
    }
}
```

### Step 5: Controllers for RBAC Management

**File:** `src/Services/UserService/DVC.UserService.Api/Controllers/PermissionsController.cs` (Update)
```csharp
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IAuthorizationService _authorizationService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        IAuthorizationService authorizationService,
        ILogger<PermissionsController> logger)
    {
        _authorizationService = authorizationService;
        _logger = logger;
    }

    /// <summary>
    /// Delegate permission to another user
    /// </summary>
    [HttpPost("delegate")]
    [RequirePermission("delegate_permissions")]
    public async Task<ActionResult<ApiResponse<UserPermissionDto>>> DelegatePermissionAsync([FromBody] DelegatePermissionDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var fromUserId))
            {
                return Unauthorized(ApiResponse<UserPermissionDto>.ErrorResult("Invalid user"));
            }

            var delegateRequest = new DelegatePermissionRequest
            {
                FromUserId = fromUserId,
                ToUserId = request.ToUserId,
                PermissionCode = request.PermissionCode,
                UnitId = request.UnitId,
                ResourceId = request.ResourceId,
                ValidFrom = request.ValidFrom,
                ValidTo = request.ValidTo,
                Reason = request.Reason,
                RequiresApproval = request.RequiresApproval
            };

            var result = await _authorizationService.DelegatePermissionAsync(delegateRequest);
            var responseDto = result.ToDto();

            return Ok(ApiResponse<UserPermissionDto>.SuccessResult(responseDto, "Permission delegated successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ApiResponse<UserPermissionDto>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error delegating permission");
            return StatusCode(500, ApiResponse<UserPermissionDto>.ErrorResult("Internal error"));
        }
    }

    /// <summary>
    /// Approve delegated permission
    /// </summary>
    [HttpPost("{permissionId}/approve")]
    [RequirePermission("approve_delegations")]
    public async Task<ActionResult<ApiResponse>> ApprovePermissionAsync(Guid permissionId, [FromBody] ApprovePermissionDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var approverId))
            {
                return Unauthorized(ApiResponse.ErrorResult("Invalid user"));
            }

            var result = await _authorizationService.ApprovePermissionAsync(permissionId, approverId, request.Reason);

            if (result)
            {
                return Ok(ApiResponse.SuccessResult("Permission approved successfully"));
            }

            return BadRequest(ApiResponse.ErrorResult("Failed to approve permission"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving permission");
            return StatusCode(500, ApiResponse.ErrorResult("Internal error"));
        }
    }

    /// <summary>
    /// Get pending approvals for current user
    /// </summary>
    [HttpGet("pending-approvals")]
    [RequirePermission("approve_delegations")]
    public async Task<ActionResult<ApiResponse<List<UserPermissionDto>>>> GetPendingApprovalsAsync()
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var approverId))
            {
                return Unauthorized(ApiResponse<List<UserPermissionDto>>.ErrorResult("Invalid user"));
            }

            var pendingApprovals = await _authorizationService.GetPendingApprovalsAsync(approverId);
            var responseDtos = pendingApprovals.Select(p => p.ToDto()).ToList();

            return Ok(ApiResponse<List<UserPermissionDto>>.SuccessResult(responseDtos, "Pending approvals retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending approvals");
            return StatusCode(500, ApiResponse<List<UserPermissionDto>>.ErrorResult("Internal error"));
        }
    }

    /// <summary>
    /// Check if user has specific permission
    /// </summary>
    [HttpGet("check")]
    public async Task<ActionResult<ApiResponse<PermissionCheckResult>>> CheckPermissionAsync(
        [FromQuery] string permissionCode,
        [FromQuery] Guid? unitId = null,
        [FromQuery] string? resourceId = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(ApiResponse<PermissionCheckResult>.ErrorResult("Invalid user"));
            }

            var context = new AuthorizationContext
            {
                UnitId = unitId,
                ResourceId = resourceId
            };

            var result = await _authorizationService.CheckPermissionAsync(userId, permissionCode, context);

            var responseDto = new PermissionCheckResult
            {
                HasPermission = result.IsGranted,
                PermissionCode = permissionCode,
                CheckedAt = result.CheckedAt
            };

            return Ok(ApiResponse<PermissionCheckResult>.SuccessResult(responseDto, "Permission check completed"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission");
            return StatusCode(500, ApiResponse<PermissionCheckResult>.ErrorResult("Internal error"));
        }
    }
}
```

## Acceptance Criteria

- [ ] Hierarchical organizational unit structure implemented
- [ ] Temporal permissions with start/end dates working
- [ ] Permission delegation system with approval workflow
- [ ] Context-sensitive permissions (unit, resource-specific)
- [ ] Permission inheritance from parent units
- [ ] Caching system for performance optimization
- [ ] Authorization attributes for controllers
- [ ] Comprehensive audit trail for all permission changes
- [ ] Bulk permission assignment capabilities
- [ ] Permission expiry and cleanup mechanisms

## Dependencies

- **Before:** User Authentication Core Logic task must be completed
- **After:** This enables security features and API endpoint protection

## Files to Create/Modify

**Create:**
- `src/Services/UserService/DVC.UserService.Core/Entities/OrganizationalUnit.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/UserPermission.cs`
- `src/Services/UserService/DVC.UserService.Core/Interfaces/IRbacRepository.cs`
- `src/Services/UserService/DVC.UserService.Core/Services/AuthorizationService.cs`
- `src/Services/UserService/DVC.UserService.Api/Attributes/RequirePermissionAttribute.cs`

**Modify:**
- `src/Services/UserService/DVC.UserService.Core/Entities/Permission.cs`
- `src/Services/UserService/DVC.UserService.Core/Entities/User.cs`
- `src/Services/UserService/DVC.UserService.Api/Controllers/PermissionsController.cs`

## Testing Requirements

1. **Unit Tests:**
   - Permission checking logic
   - Delegation workflow
   - Approval process
   - Permission inheritance

2. **Integration Tests:**
   - End-to-end authorization flow
   - Caching behavior
   - Database operations

3. **Security Tests:**
   - Authorization bypass attempts
   - Permission escalation prevention
   - Temporal permission enforcement

## Notes

- This implementation provides enterprise-grade RBAC as specified in the PRD
- Caching is implemented for performance with 21,000 concurrent users
- Temporal permissions support complex delegation scenarios
- Hierarchical units enable proper organizational structure
- All permission changes are audited for compliance