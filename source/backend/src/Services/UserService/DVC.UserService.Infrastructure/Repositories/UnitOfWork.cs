using DVC.Shared.Core.Exceptions;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace DVC.UserService.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly UserDbContext _context;
    private readonly ILogger<UnitOfWork> _logger;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(
        UserDbContext context,
        IUserRepository users,
        IRoleRepository roles,
        IPermissionRepository permissions,
        IAuditRepository auditLogs,
        ILogger<UnitOfWork> logger)
    {
        _context = context;
        _logger = logger;
        Users = users;
        Roles = roles;
        Permissions = permissions;
        AuditLogs = auditLogs;
    }

    public IUserRepository Users { get; }
    public IRoleRepository Roles { get; }
    public IPermissionRepository Permissions { get; }
    public IAuditRepository AuditLogs { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving changes to database");
            throw new ExternalServiceException("Database", "Error saving changes", ex);
        }
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction != null)
            {
                throw new InvalidOperationException("Transaction already started");
            }

            _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            _logger.LogDebug("Database transaction started");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting database transaction");
            throw new ExternalServiceException("Database", "Error starting transaction", ex);
        }
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction == null)
            {
                throw new InvalidOperationException("No active transaction to commit");
            }

            await _transaction.CommitAsync(cancellationToken);
            _logger.LogDebug("Database transaction committed");

            await _transaction.DisposeAsync();
            _transaction = null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error committing database transaction");
            await RollbackTransactionAsync(cancellationToken);
            throw new ExternalServiceException("Database", "Error committing transaction", ex);
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync(cancellationToken);
                _logger.LogWarning("Database transaction rolled back");

                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rolling back database transaction");
            throw new ExternalServiceException("Database", "Error rolling back transaction", ex);
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposing)
        {
            try
            {
                _transaction?.Dispose();
                _context?.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing UnitOfWork");
            }
        }
    }
}