using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public class Permission : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Module { get; set; }
    public string? Resource { get; set; }
    public string? Action { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsSystemPermission { get; set; } = false;

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}

public class UserPermission : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid PermissionId { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsGranted { get; set; } = true;
    public string? GrantedBy { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
