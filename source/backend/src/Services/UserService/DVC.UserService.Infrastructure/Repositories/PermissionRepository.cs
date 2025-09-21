using DVC.Shared.Core.Exceptions;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Infrastructure.Repositories;

public class PermissionRepository : Repository<Permission>, IPermissionRepository
{
    public PermissionRepository(UserDbContext context, ILogger<PermissionRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<Permission?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission by code: {Code}", code);
            throw new ExternalServiceException("Database", "Error retrieving permission by code", ex);
        }
    }

    public async Task<IReadOnlyList<Permission>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission)
                .Where(p => p.IsActive)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permissions by role: {RoleId}", roleId);
            throw new ExternalServiceException("Database", "Error retrieving permissions by role", ex);
        }
    }

    public async Task<IReadOnlyList<Permission>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get permissions from user roles
            var rolePermissions = await _context.UserRoles
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Where(ur => ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission)
                .Where(p => p.IsActive)
                .ToListAsync(cancellationToken);

            // Get direct user permissions
            var directPermissions = await _context.UserPermissions
                .Where(up => up.UserId == userId && up.IsGranted)
                .Where(up => up.ExpiresAt == null || up.ExpiresAt > DateTime.UtcNow)
                .Include(up => up.Permission)
                .Select(up => up.Permission)
                .Where(p => p.IsActive)
                .ToListAsync(cancellationToken);

            // Combine and deduplicate
            var allPermissions = rolePermissions
                .Concat(directPermissions)
                .GroupBy(p => p.Id)
                .Select(g => g.First())
                .ToList();

            return allPermissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permissions by user: {UserId}", userId);
            throw new ExternalServiceException("Database", "Error retrieving permissions by user", ex);
        }
    }

    public async Task<IReadOnlyList<Permission>> GetActivePermissionsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(p => p.IsActive)
                .OrderBy(p => p.Module)
                .ThenBy(p => p.Resource)
                .ThenBy(p => p.Action)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active permissions");
            throw new ExternalServiceException("Database", "Error retrieving active permissions", ex);
        }
    }
}