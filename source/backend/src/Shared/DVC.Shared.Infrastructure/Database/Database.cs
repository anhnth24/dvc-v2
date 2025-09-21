using Microsoft.EntityFrameworkCore;

namespace DVC.Shared.Infrastructure.Database;

public abstract class BaseDbContext : DbContext
{
    protected BaseDbContext(DbContextOptions options) : base(options) { }
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public class UnitOfWork : IUnitOfWork
{
    private readonly DbContext _context;
    public UnitOfWork(DbContext context) { _context = context; }
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);
}

public class Repository<T> where T : class
{
    protected readonly DbContext Context;
    protected DbSet<T> Set => Context.Set<T>();
    public Repository(DbContext context) { Context = context; }
}
