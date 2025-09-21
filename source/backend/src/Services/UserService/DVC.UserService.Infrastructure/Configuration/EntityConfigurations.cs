using DVC.UserService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.UserService.Infrastructure.Configuration;

public class UserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Phone)
            .HasMaxLength(20);

        builder.Property(u => u.Department)
            .HasMaxLength(100);

        builder.Property(u => u.Unit)
            .HasMaxLength(100);

        builder.Property(u => u.Position)
            .HasMaxLength(100);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.Salt)
            .HasMaxLength(500);

        builder.Property(u => u.MfaSecret)
            .HasMaxLength(500);

        builder.Property(u => u.RefreshToken)
            .HasMaxLength(500);

        builder.Property(u => u.CreatedBy)
            .HasMaxLength(50);

        builder.Property(u => u.UpdatedBy)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(u => u.Username).IsUnique();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.IsActive);

        // Relationships
        builder.HasMany(u => u.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.AuditLogs)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class RoleEntityConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.DisplayName)
            .HasMaxLength(100);

        builder.Property(r => r.CreatedBy)
            .HasMaxLength(50);

        builder.Property(r => r.UpdatedBy)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(r => r.Name).IsUnique();
        builder.HasIndex(r => r.IsActive);

        // Relationships
        builder.HasMany(r => r.UserRoles)
            .WithOne(ur => ur.Role)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.RolePermissions)
            .WithOne(rp => rp.Role)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PermissionEntityConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("Permissions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Module)
            .HasMaxLength(50);

        builder.Property(p => p.Resource)
            .HasMaxLength(50);

        builder.Property(p => p.Action)
            .HasMaxLength(50);

        builder.Property(p => p.CreatedBy)
            .HasMaxLength(50);

        builder.Property(p => p.UpdatedBy)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasIndex(p => p.Module);
        builder.HasIndex(p => p.IsActive);

        // Relationships
        builder.HasMany(p => p.RolePermissions)
            .WithOne(rp => rp.Permission)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.UserPermissions)
            .WithOne(up => up.Permission)
            .HasForeignKey(up => up.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class UserRoleEntityConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");

        builder.HasKey(ur => ur.Id);

        builder.Property(ur => ur.AssignedBy)
            .HasMaxLength(50);

        builder.Property(ur => ur.Notes)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(ur => new { ur.UserId, ur.RoleId });
        builder.HasIndex(ur => ur.IsActive);
        builder.HasIndex(ur => ur.ExpiresAt);

        // Unique constraint: One active role assignment per user-role combination
        builder.HasIndex(ur => new { ur.UserId, ur.RoleId, ur.IsActive })
            .HasFilter("[IsActive] = 1")
            .IsUnique();
    }
}

public class RolePermissionEntityConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("RolePermissions");

        builder.HasKey(rp => rp.Id);

        // Indexes
        builder.HasIndex(rp => new { rp.RoleId, rp.PermissionId }).IsUnique();
    }
}

public class UserPermissionEntityConfiguration : IEntityTypeConfiguration<UserPermission>
{
    public void Configure(EntityTypeBuilder<UserPermission> builder)
    {
        builder.ToTable("UserPermissions");

        builder.HasKey(up => up.Id);

        builder.Property(up => up.GrantedBy)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(up => new { up.UserId, up.PermissionId });
        builder.HasIndex(up => up.IsGranted);
        builder.HasIndex(up => up.ExpiresAt);
    }
}

public class AuditLogEntityConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Resource)
            .HasMaxLength(100);

        builder.Property(a => a.ResourceId)
            .HasMaxLength(100);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(45); // IPv6 support

        builder.Property(a => a.UserAgent)
            .HasMaxLength(500);

        builder.Property(a => a.SessionId)
            .HasMaxLength(100);

        builder.Property(a => a.ErrorMessage)
            .HasMaxLength(1000);

        // Large text fields
        builder.Property(a => a.OldValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.NewValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.AdditionalData)
            .HasColumnType("nvarchar(max)");

        // Indexes
        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.Action);
        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => a.IsSuccess);
        builder.HasIndex(a => new { a.Resource, a.ResourceId });
    }
}
