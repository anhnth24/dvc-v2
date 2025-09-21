# Database Coding Rules - DVC v2
## SQL Server & Entity Framework Standards

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** SQL Server 2022, Entity Framework Core 8

---

## 1. Table Design Rules

### 1.1 Naming & Types
```sql
-- ✅ GOOD: Consistent naming & proper types
CREATE TABLE Documents (
    Id int IDENTITY(1,1) NOT NULL,
    Title nvarchar(200) NOT NULL,
    Status nvarchar(50) NOT NULL,
    CreatedAt datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted bit NOT NULL DEFAULT 0,

    CONSTRAINT PK_Documents PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Documents_Status CHECK (Status IN ('Draft', 'Pending', 'Completed'))
);

-- ❌ BAD: Inconsistent naming & wrong types
CREATE TABLE document (
    document_id varchar(50),
    doc_title varchar(max),
    status varchar(20),
    create_date datetime
);
```

### 1.2 Standard Audit Fields
```sql
-- ✅ GOOD: Every table has these fields
Id int IDENTITY(1,1) NOT NULL,
CreatedAt datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
UpdatedAt datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
CreatedBy int NOT NULL,
UpdatedBy int NOT NULL,
RowVersion rowversion NOT NULL,
IsDeleted bit NOT NULL DEFAULT 0
```

---

## 2. Indexing Strategy

### 2.1 Smart Indexes
```sql
-- ✅ GOOD: Covering index for common query
CREATE NONCLUSTERED INDEX IX_Documents_UserId_Status_CreatedAt
ON Documents (UserId, Status, CreatedAt DESC)
INCLUDE (Title, DocumentNumber)
WHERE IsDeleted = 0;

-- ❌ BAD: Too broad, not useful
CREATE INDEX IX_Documents_CreatedAt ON Documents (CreatedAt);
```

---

## 3. Query Optimization

### 3.1 Efficient Patterns
```sql
-- ✅ GOOD: Parameterized with pagination
SELECT Id, Title, Status, CreatedAt
FROM Documents
WHERE UserId = @UserId
    AND Status IN ('Pending', 'InProgress')
    AND IsDeleted = 0
ORDER BY CreatedAt DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;

-- ❌ BAD: SELECT *, no pagination, functions in WHERE
SELECT * FROM Documents
WHERE YEAR(CreatedAt) = 2025;
```

### 3.2 Bulk Operations
```sql
-- ✅ GOOD: Use table-valued parameters for bulk updates
CREATE TYPE DocumentUpdateType AS TABLE (
    Id int,
    Status nvarchar(50)
);

-- Bulk update procedure
MERGE Documents AS target
USING @Updates AS source ON target.Id = source.Id
WHEN MATCHED THEN UPDATE SET Status = source.Status, UpdatedAt = GETUTCDATE();
```

---

## 4. Entity Framework Configuration

### 4.1 Entity Setup
```csharp
// ✅ GOOD: Complete entity configuration
public class Document : BaseAuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; }
    public int UserId { get; set; }
    public decimal? ProcessingCost { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Status)
            .HasConversion<string>();

        builder.Property(e => e.ProcessingCost)
            .HasColumnType("decimal(18,2)");

        // Indexes
        builder.HasIndex(e => new { e.UserId, e.Status, e.CreatedAt });

        // Relationships
        builder.HasOne(e => e.User)
            .WithMany(u => u.Documents)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filters
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
```

### 4.2 DbContext Best Practices
```csharp
// ✅ GOOD: Optimized DbContext
public class DvcDbContext : DbContext
{
    public DbSet<Document> Documents { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DvcDbContext).Assembly);

        // Global decimal precision
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update audit fields
        foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        // Handle soft deletes
        foreach (var entry in ChangeTracker.Entries<ISoftDeletable>())
        {
            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

---

## 5. Migration Standards

### 5.1 Safe Migrations
```csharp
// ✅ GOOD: Complete migration with all constraints
public partial class CreateDocumentsTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Documents",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(maxLength: 200, nullable: false),
                Status = table.Column<string>(maxLength: 50, nullable: false),
                UserId = table.Column<int>(nullable: false),
                ProcessingCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                UpdatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                IsDeleted = table.Column<bool>(nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Documents", x => x.Id);
                table.ForeignKey("FK_Documents_Users", x => x.UserId, "Users", "Id");
                table.CheckConstraint("CK_Documents_Status",
                    "Status IN ('Draft', 'Pending', 'Completed')");
            });

        // Create indexes
        migrationBuilder.CreateIndex(
            name: "IX_Documents_UserId_Status_CreatedAt",
            table: "Documents",
            columns: new[] { "UserId", "Status", "CreatedAt" });
    }
}
```

---

## 6. Stored Procedures

### 6.1 Procedure Standards
```sql
-- ✅ GOOD: Well-structured procedure
CREATE PROCEDURE sp_GetDocumentsByUser
    @UserId int,
    @Status nvarchar(50) = NULL,
    @PageNumber int = 1,
    @PageSize int = 20
AS
BEGIN
    SET NOCOUNT ON;

    -- Input validation
    IF @UserId <= 0
    BEGIN
        RAISERROR('Invalid UserId', 16, 1);
        RETURN;
    END

    IF @PageSize > 100 SET @PageSize = 100;

    -- Main query
    SELECT d.Id, d.Title, d.Status, d.CreatedAt, u.FullName
    FROM Documents d
    INNER JOIN Users u ON d.UserId = u.Id
    WHERE d.UserId = @UserId
        AND d.IsDeleted = 0
        AND (@Status IS NULL OR d.Status = @Status)
    ORDER BY d.CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
```

---

## 7. Performance Rules

### 7.1 Query Performance
```sql
-- ✅ GOOD: Efficient reporting query
SELECT
    COUNT(*) AS TotalDocuments,
    COUNT(CASE WHEN Status = 'Completed' THEN 1 END) AS CompletedCount,
    AVG(CASE WHEN Status = 'Completed'
        THEN DATEDIFF(HOUR, CreatedAt, UpdatedAt) END) AS AvgHours
FROM Documents
WHERE CreatedAt >= @FromDate
    AND CreatedAt <= @ToDate
    AND IsDeleted = 0;
```

---

## 8. Security Best Practices

### 8.1 Row Level Security
```sql
-- ✅ GOOD: Implement RLS for data isolation
ALTER TABLE Documents ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION fn_DocumentAccessFilter(@UserId int)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN (
    SELECT 1 AS AccessResult
    WHERE @UserId = USER_ID()
        OR IS_ROLEMEMBER('Administrator') = 1
);

CREATE SECURITY POLICY DocumentAccessPolicy
ADD FILTER PREDICATE fn_DocumentAccessFilter(UserId) ON Documents;
```

---

## 9. Maintenance

### 9.1 Regular Maintenance
```sql
-- ✅ GOOD: Automated maintenance procedure
CREATE PROCEDURE sp_DatabaseMaintenance
AS
BEGIN
    -- Update statistics
    EXEC sp_updatestats;

    -- Clean old audit logs (90 days)
    DELETE FROM AuditLogs
    WHERE CreatedAt < DATEADD(DAY, -90, GETUTCDATE());

    -- Rebuild fragmented indexes
    DECLARE @SQL nvarchar(MAX) = '';
    SELECT @SQL = @SQL +
        CASE WHEN avg_fragmentation_in_percent > 30
        THEN 'ALTER INDEX ' + i.name + ' ON ' + o.name + ' REBUILD;'
        END
    FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
    INNER JOIN sys.objects o ON ips.object_id = o.object_id
    INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
    WHERE avg_fragmentation_in_percent > 30;

    IF LEN(@SQL) > 0 EXEC sp_executesql @SQL;
END
```

---

## 10. Key Rules Summary

### Must Follow:
1. **Consistent naming** - PascalCase for tables/columns
2. **Proper data types** - nvarchar for text, datetime2 for dates
3. **Standard audit fields** - CreatedAt, UpdatedAt, IsDeleted, etc.
4. **Smart indexing** - Cover common queries, use WHERE filters
5. **Parameterized queries** - Never use dynamic SQL without parameters
6. **Entity Framework** - Use configurations, not attributes
7. **Soft deletes** - Use IsDeleted flag, never hard delete
8. **Migration safety** - Include all constraints and indexes
9. **Performance first** - Optimize queries, use pagination
10. **Security always** - Row-level security, input validation