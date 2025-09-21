using DVC.Shared.Core.Exceptions;
using DVC.UserService.Core.Entities;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Infrastructure.Repositories;

public class AuditRepository : Repository<AuditLog>, IAuditRepository
{
    public AuditRepository(UserDbContext context, ILogger<AuditRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IReadOnlyList<AuditLog>> GetByUserAsync(Guid userId, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(a => a.UserId == userId)
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting audit logs by user: {UserId}", userId);
            throw new ExternalServiceException("Database", "Error retrieving audit logs by user", ex);
        }
    }

    public async Task<IReadOnlyList<AuditLog>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(a => a.Action == action)
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Take(1000) // Limit to prevent performance issues
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting audit logs by action: {Action}", action);
            throw new ExternalServiceException("Database", "Error retrieving audit logs by action", ex);
        }
    }

    public async Task<IReadOnlyList<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(a => a.Timestamp >= from && a.Timestamp <= to)
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Take(10000) // Limit to prevent performance issues
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting audit logs by date range: {From} - {To}", from, to);
            throw new ExternalServiceException("Database", "Error retrieving audit logs by date range", ex);
        }
    }
}