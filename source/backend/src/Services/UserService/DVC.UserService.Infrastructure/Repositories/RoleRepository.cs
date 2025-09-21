using DVC.Shared.Core.Exceptions;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Infrastructure.Repositories;

public class RoleRepository : Repository<Role>, IRoleRepository
{
    public RoleRepository(UserDbContext context, ILogger<RoleRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Name == name, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by name: {Name}", name);
            throw new ExternalServiceException("Database", "Error retrieving role by name", ex);
        }
    }

    public async Task<IReadOnlyList<Role>> GetActiveRolesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(r => r.IsActive)
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .OrderBy(r => r.Priority)
                .ThenBy(r => r.Name)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active roles");
            throw new ExternalServiceException("Database", "Error retrieving active roles", ex);
        }
    }

    public async Task<IReadOnlyList<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.UserRoles
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Where(ur => ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow)
                .Include(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .Select(ur => ur.Role)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user roles for user: {UserId}", userId);
            throw new ExternalServiceException("Database", "Error retrieving user roles", ex);
        }
    }
}