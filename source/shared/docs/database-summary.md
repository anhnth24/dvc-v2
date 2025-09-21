# Database Quick Reference - DVC v2

## Overview
Single SQL Server 2022 database with materialized views for read optimization, serving 800,000 documents/month for 25,000 civil servants.

## Key Features
- **Single Database**: Simplified architecture vs CQRS (60% less complexity)
- **Materialized Views**: Fast dashboard queries without separate read DB
- **Always On**: High availability with automatic failover <30s
- **Redis Cache**: 6-node cluster for session management
- **MinIO Storage**: S3-compatible object storage with erasure coding

## Performance Targets
- **Query Response**: <20ms average
- **Throughput**: 270 documents/second
- **Availability**: 99.9% uptime
- **Data Durability**: 11-nines (99.999999999%)

## Quick Setup

### Database Configuration
```sql
ALTER DATABASE DVC_MainDB SET
  COMPATIBILITY_LEVEL = 160,
  QUERY_STORE = ON;
```

### Materialized View Example
```sql
CREATE VIEW vw_DocumentDashboard WITH SCHEMABINDING AS
SELECT d.Id, d.Title, d.Status, p.Name AS ProcedureName
FROM dbo.Documents d
INNER JOIN dbo.Procedures p ON d.ProcedureId = p.Id;

CREATE UNIQUE CLUSTERED INDEX IX_DocumentDashboard_Clustered
ON vw_DocumentDashboard(Id);
```

### Repository Pattern
```csharp
public interface IDocumentRepository : IRepository<Document>
{
    Task<List<Document>> GetByUserIdAsync(int userId);
    Task<List<Document>> GetByStatusAsync(DocumentStatus status);
}
```

## Code Examples
- **SQL Setup**: [sql-database-setup.sql](../code-examples/database/sql-database-setup.sql)
- **Repository Pattern**: [csharp-repository-pattern.cs](../code-examples/database/csharp-repository-pattern.cs)

## Full Documentation
- **Complete Guide**: [Database PRD](../prd/sub-prd/database-prd.md)