using DVC.Shared.Core.Common;
using DVC.Shared.Core.Exceptions;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly UserDbContext _context;
    protected readonly DbSet<T> _dbSet;
    protected readonly ILogger<Repository<T>> _logger;

    public Repository(UserDbContext context, ILogger<Repository<T>> logger)
    {
        _context = context;
        _dbSet = context.Set<T>();
        _logger = logger;
    }

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting entity by ID: {Id}", id);
            throw new ExternalServiceException("Database", $"Error retrieving {typeof(T).Name}", ex);
        }
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet.ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all entities");
            throw new ExternalServiceException("Database", $"Error retrieving all {typeof(T).Name}", ex);
        }
    }

    public virtual async Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        try
        {
            var totalCount = await _dbSet.CountAsync(cancellationToken);
            var items = await _dbSet
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<T>(items, totalCount, page, pageSize);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting paged entities");
            throw new ExternalServiceException("Database", $"Error retrieving paged {typeof(T).Name}", ex);
        }
    }

    public virtual Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        try
        {
            _dbSet.Add(entity);
            return Task.FromResult(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding entity");
            throw new ExternalServiceException("Database", $"Error adding {typeof(T).Name}", ex);
        }
    }

    public virtual Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        try
        {
            _context.Entry(entity).State = EntityState.Modified;
            return Task.FromResult(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating entity");
            throw new ExternalServiceException("Database", $"Error updating {typeof(T).Name}", ex);
        }
    }

    public virtual async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = await GetByIdAsync(id, cancellationToken);
            if (entity != null)
            {
                _dbSet.Remove(entity);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting entity with ID: {Id}", id);
            throw new ExternalServiceException("Database", $"Error deleting {typeof(T).Name}", ex);
        }
    }

    public virtual async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet.AnyAsync(e => e.Id == id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking entity existence: {Id}", id);
            throw new ExternalServiceException("Database", $"Error checking {typeof(T).Name} existence", ex);
        }
    }
}

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(UserDbContext context, ILogger<UserRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by username: {Username}", username);
            throw new ExternalServiceException("Database", "Error retrieving user by username", ex);
        }
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by email: {Email}", email);
            throw new ExternalServiceException("Database", "Error retrieving user by email", ex);
        }
    }

    public async Task<IReadOnlyList<User>> GetByRoleAsync(string roleName, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u => u.UserRoles.Any(ur => ur.Role.Name == roleName && ur.IsActive))
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users by role: {RoleName}", roleName);
            throw new ExternalServiceException("Database", "Error retrieving users by role", ex);
        }
    }

    public async Task<IReadOnlyList<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(u => u.IsActive)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active users");
            throw new ExternalServiceException("Database", "Error retrieving active users", ex);
        }
    }

    public async Task<bool> IsUsernameExistsAsync(string username, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(u => u.Username == username);
            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.Id != excludeUserId.Value);
            }
            return await query.AnyAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking username existence: {Username}", username);
            throw new ExternalServiceException("Database", "Error checking username existence", ex);
        }
    }

    public async Task<bool> IsEmailExistsAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(u => u.Email == email);
            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.Id != excludeUserId.Value);
            }
            return await query.AnyAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email existence: {Email}", email);
            throw new ExternalServiceException("Database", "Error checking email existence", ex);
        }
    }
}
