using DVC.Shared.Core.Common;

namespace DVC.UserService.Core.Entities;

public class Role : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DisplayName { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsSystemRole { get; set; } = false;
    public int Priority { get; set; } = 0;

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission : BaseEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
