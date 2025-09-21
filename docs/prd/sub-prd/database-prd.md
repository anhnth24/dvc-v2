# Database Product Requirements Document (PRD)
## Hệ Thống Quản Lý Thủ Tục Hành Chính - Database Architecture

**Version:** 1.0
**Ngày tạo:** 20/12/2024
**Người tạo:** Database Architecture Team
**Trạng thái:** Draft
**Parent Document:** [Main PRD](../PRD.MD)

---

## 1. Executive Summary

Database infrastructure nội bộ hỗ trợ 800,000 hồ sơ/tháng với 21,000 concurrent civil servants qua SQL Server 2022 CQRS architecture. Sharding theo province_id với 3 regional clusters (North/Central/South), read replicas 2-3 per region. Redis Enterprise cache layer với 6-node cluster, MinIO object storage với erasure coding (8+4) cho 200TB→500TB scaling. Performance targets: <20ms database queries, 11-nines data durability, 99.9% availability với automatic failover <30s cho hệ thống cán bộ công chức.

## 2. Scope & Objectives

### 2.1 In Scope
- **SQL Server 2022:** CQRS implementation, Always On Availability Groups cho hệ thống nội bộ
- **Redis Enterprise:** Multi-layer caching, session management, real-time data
- **MinIO Object Storage:** S3-compatible, erasure coding, document storage
- **Elasticsearch 8:** Full-text search, analytics, audit logs
- **Backup & Recovery:** Automated backup, point-in-time recovery, DR planning
- **Monitoring & Performance:** Query optimization, capacity planning, alerting
- **Internal Data:** Government employee sessions, document processing data

### 2.2 Out of Scope
- Citizen personal data storage (handled by separate citizen portal systems)
- Table schemas and data models (separate design document)
- Application-specific queries (handled in backend PRD)
- Data migration from legacy systems (separate migration plan)
- Business intelligence and data warehouse (Phase 2)

### 2.3 Success Criteria
- Query response time <20ms average
- Support 270 documents/second throughput for civil servant operations
- 99.9% database availability
- 11-nines data durability (99.999999999%)
- Zero data loss with <15 minute RPO
- Support 21,000 concurrent civil servant sessions

---

## 3. SQL Server 2022 Architecture

### 3.1 CQRS Implementation Pattern

#### 3.1.1 Command Side (Write Model)
**Write Database Configuration:**
```sql
-- Normalized schema optimized for writes
-- All tables in 3NF for data integrity
-- ACID compliance with row-level locking
-- Immediate consistency requirements

-- Database settings for write optimization
ALTER DATABASE DVC_CommandDB SET
  COMPATIBILITY_LEVEL = 160,
  AUTO_CREATE_STATISTICS ON,
  AUTO_UPDATE_STATISTICS ON,
  DELAYED_DURABILITY = DISABLED, -- Ensure durability for critical data
  QUERY_STORE = ON (
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    MAX_STORAGE_SIZE_MB = 1000,
    INTERVAL_LENGTH_MINUTES = 60
  );
```

**Write Optimization Features:**
- **Row-level Locking:** Minimize write contention
- **Write-ahead Logging:** Transaction log optimization
- **Indexed Views:** Maintain data integrity constraints
- **Triggers:** Audit trail and event publishing
- **Partitioning:** Large tables partitioned by date

**Transaction Management:**
```sql
-- Example transaction pattern for document submission
BEGIN TRANSACTION;

  INSERT INTO Documents (Id, Title, ProcedureId, SubmitterId, SubmissionDate)
  VALUES (@DocumentId, @Title, @ProcedureId, @SubmitterId, GETUTCDATE());

  INSERT INTO WorkflowInstances (Id, DocumentId, WorkflowDefinitionId, Status)
  VALUES (@WorkflowId, @DocumentId, @WorkflowDefId, 'Initiated');

  INSERT INTO AuditLog (EntityType, EntityId, Action, UserId, Timestamp)
  VALUES ('Document', @DocumentId, 'Created', @UserId, GETUTCDATE());

COMMIT TRANSACTION;
```

#### 3.1.2 Query Side (Read Model)
**Read Database Configuration:**
```sql
-- Denormalized views optimized for reads
-- Materialized views for complex aggregations
-- Columnstore indexes for analytics
-- Eventually consistent with write model

-- Read-only database configuration
ALTER DATABASE DVC_QueryDB SET
  READ_ONLY,
  QUERY_STORE = ON (
    OPERATION_MODE = READ_ONLY,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 60)
  );

-- Columnstore indexes for reporting
CREATE COLUMNSTORE INDEX IX_Documents_Analytics
ON DocumentsReadModel (
  SubmissionDate, ProcedureCategory, ProcessingUnit,
  Status, Priority, CompletionDate
);
```

**Read Optimization Patterns:**
- **Materialized Views:** Pre-computed aggregations updated via ETL
- **Covering Indexes:** Include all columns needed for queries
- **Query Hints:** Force optimal execution plans
- **Read-only Replicas:** Distribute read load across replicas

**Example Optimized Read Views:**
```sql
-- Document dashboard view
CREATE VIEW vw_DocumentDashboard AS
SELECT
  d.Id,
  d.Title,
  d.SubmissionDate,
  p.Name AS ProcedureName,
  pu.Name AS ProcessingUnit,
  ws.CurrentStep,
  ws.Status,
  ws.DeadlineDate,
  CASE
    WHEN ws.DeadlineDate < GETUTCDATE() THEN 'Overdue'
    WHEN DATEDIFF(hour, GETUTCDATE(), ws.DeadlineDate) <= 1 THEN 'Due Soon'
    ELSE 'On Time'
  END AS UrgencyStatus
FROM Documents d
INNER JOIN Procedures p ON d.ProcedureId = p.Id
INNER JOIN ProcessingUnits pu ON d.ProcessingUnitId = pu.Id
INNER JOIN WorkflowStatus ws ON d.Id = ws.DocumentId
WHERE d.IsActive = 1;

-- Performance metrics view
CREATE VIEW vw_PerformanceMetrics AS
SELECT
  pu.Name AS ProcessingUnit,
  p.Category AS ProcedureCategory,
  COUNT(*) AS TotalDocuments,
  AVG(DATEDIFF(hour, d.SubmissionDate, d.CompletionDate)) AS AvgProcessingTime,
  SUM(CASE WHEN d.CompletionDate <= d.DeadlineDate THEN 1 ELSE 0 END) AS OnTimeCount,
  CAST(SUM(CASE WHEN d.CompletionDate <= d.DeadlineDate THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS OnTimePercentage
FROM Documents d
INNER JOIN Procedures p ON d.ProcedureId = p.Id
INNER JOIN ProcessingUnits pu ON d.ProcessingUnitId = pu.Id
WHERE d.CompletionDate IS NOT NULL
  AND d.SubmissionDate >= DATEADD(month, -1, GETUTCDATE())
GROUP BY pu.Name, p.Category;
```

### 3.2 High Availability Configuration

#### 3.2.1 Always On Availability Groups
**Primary Replica Configuration:**
```sql
-- Create Availability Group
CREATE AVAILABILITY GROUP DVC_AG
WITH (
  AUTOMATED_BACKUP_PREFERENCE = SECONDARY,
  FAILURE_CONDITION_LEVEL = 3,
  HEALTH_CHECK_TIMEOUT = 30000
)
FOR DATABASE DVC_CommandDB, DVC_QueryDB
REPLICA ON
  'SQL-PRIMARY-01' WITH (
    ENDPOINT_URL = 'TCP://sql-primary-01.dvc.local:5022',
    AVAILABILITY_MODE = SYNCHRONOUS_COMMIT,
    FAILOVER_MODE = AUTOMATIC,
    BACKUP_PRIORITY = 10,
    SECONDARY_ROLE(ALLOW_CONNECTIONS = READ_ONLY)
  ),
  'SQL-SECONDARY-01' WITH (
    ENDPOINT_URL = 'TCP://sql-secondary-01.dvc.local:5022',
    AVAILABILITY_MODE = SYNCHRONOUS_COMMIT,
    FAILOVER_MODE = AUTOMATIC,
    BACKUP_PRIORITY = 50,
    SECONDARY_ROLE(ALLOW_CONNECTIONS = READ_ONLY)
  ),
  'SQL-SECONDARY-02' WITH (
    ENDPOINT_URL = 'TCP://sql-secondary-02.dvc.local:5022',
    AVAILABILITY_MODE = ASYNCHRONOUS_COMMIT,
    FAILOVER_MODE = MANUAL,
    BACKUP_PRIORITY = 90,
    SECONDARY_ROLE(ALLOW_CONNECTIONS = READ_ONLY)
  );
```

**Failover Configuration:**
- **Automatic Failover:** <30 seconds detection + failover
- **Synchronous Commit:** Zero data loss for primary replicas
- **Asynchronous DR:** Disaster recovery to remote site
- **Read-only Routing:** Distribute read queries automatically

**Monitoring Availability Group Health:**
```sql
-- Health monitoring query
SELECT
  ag.name AS AvailabilityGroup,
  r.replica_server_name AS ReplicaServer,
  r.availability_mode_desc AS AvailabilityMode,
  r.failover_mode_desc AS FailoverMode,
  rs.role_desc AS CurrentRole,
  rs.operational_state_desc AS OperationalState,
  rs.connected_state_desc AS ConnectedState,
  rs.synchronization_health_desc AS SyncHealth
FROM sys.availability_groups ag
INNER JOIN sys.availability_replicas r ON ag.group_id = r.group_id
INNER JOIN sys.dm_hadr_availability_replica_states rs ON r.replica_id = rs.replica_id;
```

#### 3.2.2 Read-only Routing
**Connection String Configuration:**
```csharp
// Application connection strings
public class DatabaseConfiguration
{
    public string WriteConnectionString { get; set; } =
        "Server=DVC-AG-Listener;Database=DVC_CommandDB;Integrated Security=true;ApplicationIntent=ReadWrite;MultiSubnetFailover=true;";

    public string ReadConnectionString { get; set; } =
        "Server=DVC-AG-Listener;Database=DVC_QueryDB;Integrated Security=true;ApplicationIntent=ReadOnly;MultiSubnetFailover=true;";

    public int ConnectionTimeout { get; set; } = 30;
    public int CommandTimeout { get; set; } = 60;
}
```

**Read-only Routing List:**
```sql
-- Configure read-only routing
ALTER AVAILABILITY GROUP DVC_AG
MODIFY REPLICA ON 'SQL-PRIMARY-01'
WITH (PRIMARY_ROLE (READ_ONLY_ROUTING_LIST = (
  'SQL-SECONDARY-01',
  'SQL-SECONDARY-02'
)));

ALTER AVAILABILITY GROUP DVC_AG
MODIFY REPLICA ON 'SQL-SECONDARY-01'
WITH (SECONDARY_ROLE (READ_ONLY_ROUTING_URL = 'TCP://sql-secondary-01.dvc.local:1433'));

ALTER AVAILABILITY GROUP DVC_AG
MODIFY REPLICA ON 'SQL-SECONDARY-02'
WITH (SECONDARY_ROLE (READ_ONLY_ROUTING_URL = 'TCP://sql-secondary-02.dvc.local:1433'));
```

### 3.3 Sharding Strategy

#### 3.3.1 Province-based Horizontal Sharding
**Shard Mapping:**
```json
{
  "shardGroups": [
    {
      "name": "North",
      "provinces": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      "connectionString": "Server=SQL-NORTH-CLUSTER;Database=DVC_North;...",
      "capacity": "7000 concurrent users"
    },
    {
      "name": "Central",
      "provinces": [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
      "connectionString": "Server=SQL-CENTRAL-CLUSTER;Database=DVC_Central;...",
      "capacity": "5000 concurrent users"
    },
    {
      "name": "South",
      "provinces": [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
      "connectionString": "Server=SQL-SOUTH-CLUSTER;Database=DVC_South;...",
      "capacity": "9000 concurrent users"
    }
  ]
}
```

**Shard Resolution Logic:**
```csharp
public class ShardResolver
{
    private readonly Dictionary<int, string> _shardMap;

    public string GetConnectionString(int provinceId)
    {
        return provinceId switch
        {
            >= 1 and <= 25 => _configuration.NorthShardConnectionString,
            >= 26 and <= 43 => _configuration.CentralShardConnectionString,
            >= 44 and <= 63 => _configuration.SouthShardConnectionString,
            _ => throw new ArgumentException($"Invalid province ID: {provinceId}")
        };
    }

    public async Task<IEnumerable<T>> QueryAcrossShards<T>(string sql, object parameters)
    {
        var tasks = _shardMap.Values.Select(async connectionString =>
        {
            using var connection = new SqlConnection(connectionString);
            return await connection.QueryAsync<T>(sql, parameters);
        });

        var results = await Task.WhenAll(tasks);
        return results.SelectMany(r => r);
    }
}
```

#### 3.3.2 Cross-shard Operations
**Federation Queries:**
```sql
-- Cross-shard aggregation using linked servers
SELECT
  'North' AS Region,
  COUNT(*) AS DocumentCount,
  AVG(ProcessingTimeHours) AS AvgProcessingTime
FROM [SQL-NORTH-CLUSTER].[DVC_North].[dbo].[Documents]
WHERE SubmissionDate >= DATEADD(month, -1, GETUTCDATE())

UNION ALL

SELECT
  'Central' AS Region,
  COUNT(*) AS DocumentCount,
  AVG(ProcessingTimeHours) AS AvgProcessingTime
FROM [SQL-CENTRAL-CLUSTER].[DVC_Central].[dbo].[Documents]
WHERE SubmissionDate >= DATEADD(month, -1, GETUTCDATE())

UNION ALL

SELECT
  'South' AS Region,
  COUNT(*) AS DocumentCount,
  AVG(ProcessingTimeHours) AS AvgProcessingTime
FROM [SQL-SOUTH-CLUSTER].[DVC_South].[dbo].[Documents]
WHERE SubmissionDate >= DATEADD(month, -1, GETUTCDATE());
```

**Distributed Transaction Coordination:**
```csharp
// Handle cross-shard operations
public class DistributedDocumentService
{
    public async Task<string> TransferDocument(string documentId, int fromProvinceId, int toProvinceId)
    {
        var sourceConnectionString = _shardResolver.GetConnectionString(fromProvinceId);
        var targetConnectionString = _shardResolver.GetConnectionString(toProvinceId);

        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        try
        {
            // Extract from source shard
            var document = await ExtractDocument(sourceConnectionString, documentId);

            // Insert into target shard
            var newDocumentId = await InsertDocument(targetConnectionString, document);

            // Mark as transferred in source
            await MarkAsTransferred(sourceConnectionString, documentId, newDocumentId);

            scope.Complete();
            return newDocumentId;
        }
        catch
        {
            // Transaction will rollback automatically
            throw;
        }
    }
}
```

### 3.4 Performance Optimization

#### 3.4.1 Indexing Strategy
**Primary Indexes:**
```sql
-- Document management indexes
CREATE NONCLUSTERED INDEX IX_Documents_ProcessingUnit_Status
ON Documents (ProcessingUnitId, Status)
INCLUDE (Id, Title, SubmissionDate, DeadlineDate);

CREATE NONCLUSTERED INDEX IX_Documents_Submitter_Date
ON Documents (SubmitterId, SubmissionDate DESC)
INCLUDE (Id, Title, Status, ProcedureId);

CREATE NONCLUSTERED INDEX IX_Documents_Procedure_Date
ON Documents (ProcedureId, SubmissionDate DESC)
WHERE Status IN ('InProgress', 'Pending', 'UnderReview');

-- Workflow indexes
CREATE NONCLUSTERED INDEX IX_WorkflowInstances_Document_Status
ON WorkflowInstances (DocumentId, Status)
INCLUDE (CurrentStepId, AssignedUserId, DeadlineDate);

-- Audit trail indexes (partitioned by date)
CREATE NONCLUSTERED INDEX IX_AuditLog_Entity_Date
ON AuditLog (EntityType, EntityId, Timestamp DESC)
INCLUDE (Action, UserId, Details);
```

**Columnstore Indexes for Analytics:**
```sql
-- Real-time analytics index
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Documents_Analytics
ON Documents (
  SubmissionDate, CompletionDate, ProcessingUnitId,
  ProcedureId, Status, Priority, DeadlineDate
);

-- Historical reporting index
CREATE CLUSTERED COLUMNSTORE INDEX IX_DocumentHistory_CCI
ON DocumentHistory;
```

#### 3.4.2 Query Optimization
**Performance Monitoring:**
```sql
-- Query performance monitoring
SELECT
  qs.sql_handle,
  qs.statement_start_offset,
  qs.statement_end_offset,
  qs.creation_time,
  qs.last_execution_time,
  qs.execution_count,
  qs.total_worker_time / qs.execution_count AS avg_cpu_time,
  qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
  qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
  SUBSTRING(st.text,
    (qs.statement_start_offset/2) + 1,
    ((CASE statement_end_offset
      WHEN -1 THEN DATALENGTH(st.text)
      ELSE qs.statement_end_offset
    END - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats AS qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
WHERE qs.total_elapsed_time / qs.execution_count > 1000 -- Queries > 1ms avg
ORDER BY qs.total_elapsed_time / qs.execution_count DESC;
```

**Automatic Tuning:**
```sql
-- Enable automatic tuning
ALTER DATABASE DVC_CommandDB SET AUTOMATIC_TUNING (FORCE_LAST_GOOD_PLAN = ON);
ALTER DATABASE DVC_CommandDB SET AUTOMATIC_TUNING (CREATE_INDEX = ON);
ALTER DATABASE DVC_CommandDB SET AUTOMATIC_TUNING (DROP_INDEX = ON);

-- Query Store recommendations
SELECT
  qsrs.recommendation_id,
  qsrs.type_desc,
  qsrs.reason_desc,
  qsrs.valid_since,
  qsrs.last_refresh,
  qsrs.state_desc,
  qsrs.estimated_impact,
  qsrs.script
FROM sys.dm_db_tuning_recommendations qsrs
WHERE qsrs.state_desc = 'Active';
```

#### 3.4.3 Memory Optimization
**In-Memory OLTP Tables:**
```sql
-- Memory-optimized session table
CREATE TABLE SessionCache (
  SessionId NVARCHAR(128) NOT NULL PRIMARY KEY NONCLUSTERED HASH WITH (BUCKET_COUNT = 1000000),
  UserId INT NOT NULL,
  Data NVARCHAR(MAX),
  ExpiryTime DATETIME2 NOT NULL,
  INDEX IX_SessionCache_Expiry NONCLUSTERED (ExpiryTime)
) WITH (MEMORY_OPTIMIZED = ON, DURABILITY = SCHEMA_ONLY);

-- Memory-optimized temporary workflow data
CREATE TABLE WorkflowStateCache (
  WorkflowInstanceId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY NONCLUSTERED HASH WITH (BUCKET_COUNT = 100000),
  DocumentId UNIQUEIDENTIFIER NOT NULL,
  CurrentState NVARCHAR(50) NOT NULL,
  StateData NVARCHAR(MAX),
  LastUpdated DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  INDEX IX_WorkflowState_Document NONCLUSTERED (DocumentId)
) WITH (MEMORY_OPTIMIZED = ON, DURABILITY = SCHEMA_AND_DATA);
```

---

## 4. Redis Enterprise Cluster

### 4.1 Cache Architecture

#### 4.1.1 Multi-layer Caching Strategy
**L1 Cache (Application Level):**
```csharp
// In-memory application cache
public class L1CacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly MemoryCacheEntryOptions _staticDataOptions;
    private readonly MemoryCacheEntryOptions _sessionDataOptions;

    public L1CacheService(IMemoryCache memoryCache)
    {
        _memoryCache = memoryCache;

        _staticDataOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
            SlidingExpiration = TimeSpan.FromHours(6),
            Priority = CacheItemPriority.High
        };

        _sessionDataOptions = new MemoryCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromMinutes(30),
            Priority = CacheItemPriority.Normal
        };
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, CacheType type = CacheType.Default)
    {
        if (_memoryCache.TryGetValue(key, out T cachedValue))
            return cachedValue;

        var value = await factory();
        var options = type switch
        {
            CacheType.StaticData => _staticDataOptions,
            CacheType.SessionData => _sessionDataOptions,
            _ => new MemoryCacheEntryOptions { SlidingExpiration = TimeSpan.FromMinutes(5) }
        };

        _memoryCache.Set(key, value, options);
        return value;
    }
}
```

**L2 Cache (Redis Distributed):**
```csharp
// Redis distributed cache
public class RedisL2CacheService
{
    private readonly IDatabase _database;
    private readonly ILogger<RedisL2CacheService> _logger;

    private static readonly RedisKey PROCEDURES_KEY = "procedures:all";
    private static readonly RedisKey USER_SESSIONS_KEY = "sessions:user:{0}";
    private static readonly RedisKey DOCUMENT_METADATA_KEY = "documents:metadata:{0}";
    private static readonly RedisKey WORKFLOW_DEFINITIONS_KEY = "workflows:definitions";

    public async Task<IEnumerable<Procedure>> GetProceduresAsync()
    {
        var cached = await _database.HashGetAllAsync(PROCEDURES_KEY);
        if (cached.Any())
        {
            return cached.Select(x => JsonSerializer.Deserialize<Procedure>(x.Value));
        }

        // Fallback to database
        var procedures = await _procedureRepository.GetAllAsync();

        // Cache for 24 hours
        var hash = procedures.ToDictionary(
            p => (RedisValue)p.Id.ToString(),
            p => (RedisValue)JsonSerializer.Serialize(p)
        );

        await _database.HashSetAsync(PROCEDURES_KEY, hash.ToArray());
        await _database.KeyExpireAsync(PROCEDURES_KEY, TimeSpan.FromHours(24));

        return procedures;
    }

    public async Task InvalidateProcedureCache()
    {
        await _database.KeyDeleteAsync(PROCEDURES_KEY);
        _logger.LogInformation("Procedure cache invalidated");
    }
}
```

#### 4.1.2 Session Management
**Distributed Session Storage:**
```csharp
public class RedisSessionManager
{
    private readonly IDatabase _database;
    private readonly TimeSpan _sessionTimeout = TimeSpan.FromMinutes(30);

    public async Task<UserSession> GetSessionAsync(string sessionId)
    {
        var sessionKey = $"session:{sessionId}";
        var sessionData = await _database.HashGetAllAsync(sessionKey);

        if (!sessionData.Any())
            return null;

        var session = new UserSession
        {
            SessionId = sessionId,
            UserId = sessionData.FirstOrDefault(x => x.Name == "UserId").Value,
            UserName = sessionData.FirstOrDefault(x => x.Name == "UserName").Value,
            Permissions = JsonSerializer.Deserialize<string[]>(
                sessionData.FirstOrDefault(x => x.Name == "Permissions").Value),
            LastActivity = DateTime.Parse(
                sessionData.FirstOrDefault(x => x.Name == "LastActivity").Value)
        };

        // Extend session timeout
        await _database.KeyExpireAsync(sessionKey, _sessionTimeout);

        return session;
    }

    public async Task SetSessionAsync(UserSession session)
    {
        var sessionKey = $"session:{session.SessionId}";
        var sessionData = new HashEntry[]
        {
            new("UserId", session.UserId),
            new("UserName", session.UserName),
            new("Permissions", JsonSerializer.Serialize(session.Permissions)),
            new("LastActivity", DateTime.UtcNow.ToString("O")),
            new("CreatedAt", session.CreatedAt.ToString("O"))
        };

        await _database.HashSetAsync(sessionKey, sessionData);
        await _database.KeyExpireAsync(sessionKey, _sessionTimeout);
    }

    public async Task RemoveSessionAsync(string sessionId)
    {
        await _database.KeyDeleteAsync($"session:{sessionId}");
    }
}
```

#### 4.1.3 Real-time Data Caching
**Live Dashboard Data:**
```csharp
public class RealTimeDashboardCache
{
    private readonly IDatabase _database;
    private readonly ISubscriber _subscriber;

    public async Task UpdateDocumentCountAsync(string processingUnitId, int count)
    {
        var key = $"dashboard:counts:{processingUnitId}";
        var data = new
        {
            Total = count,
            LastUpdated = DateTime.UtcNow,
            ProcessingUnitId = processingUnitId
        };

        await _database.StringSetAsync(key, JsonSerializer.Serialize(data), TimeSpan.FromMinutes(2));

        // Publish update to subscribers
        await _subscriber.PublishAsync("dashboard:updates", JsonSerializer.Serialize(new
        {
            Type = "DocumentCountUpdate",
            ProcessingUnitId = processingUnitId,
            Count = count,
            Timestamp = DateTime.UtcNow
        }));
    }

    public async Task<DashboardStats> GetDashboardStatsAsync(string processingUnitId)
    {
        var pattern = $"dashboard:counts:{processingUnitId}:*";
        var server = _database.Multiplexer.GetServer(_database.Multiplexer.GetEndPoints().First());
        var keys = server.Keys(pattern: pattern);

        var pipeline = _database.CreateBatch();
        var tasks = keys.Select(key => pipeline.StringGetAsync(key)).ToArray();

        pipeline.Execute();

        var results = await Task.WhenAll(tasks);
        var stats = results
            .Where(r => r.HasValue)
            .Select(r => JsonSerializer.Deserialize<DashboardStatsItem>(r))
            .ToList();

        return new DashboardStats
        {
            ProcessingUnitId = processingUnitId,
            Items = stats,
            LastUpdated = stats.Any() ? stats.Max(s => s.LastUpdated) : DateTime.UtcNow
        };
    }
}
```

### 4.2 Redis Modules Integration

#### 4.2.1 RedisJSON for Document Metadata
```csharp
public class DocumentMetadataCache
{
    private readonly IDatabase _database;

    public async Task StoreDocumentMetadataAsync(string documentId, DocumentMetadata metadata)
    {
        var key = $"doc:meta:{documentId}";
        var json = JsonSerializer.Serialize(metadata);

        // Store as JSON with 1-hour TTL
        await _database.ExecuteAsync("JSON.SET", key, "$", json);
        await _database.KeyExpireAsync(key, TimeSpan.FromHours(1));
    }

    public async Task<DocumentMetadata> GetDocumentMetadataAsync(string documentId)
    {
        var key = $"doc:meta:{documentId}";
        var result = await _database.ExecuteAsync("JSON.GET", key, "$");

        if (result.IsNull)
            return null;

        return JsonSerializer.Deserialize<DocumentMetadata>(result);
    }

    public async Task UpdateDocumentStatusAsync(string documentId, string status)
    {
        var key = $"doc:meta:{documentId}";
        await _database.ExecuteAsync("JSON.SET", key, "$.status", $"\"{status}\"");
        await _database.ExecuteAsync("JSON.SET", key, "$.lastUpdated", $"\"{DateTime.UtcNow:O}\"");
    }

    public async Task<IEnumerable<DocumentMetadata>> SearchByStatusAsync(string status)
    {
        // Use RedisJSON query capabilities
        var result = await _database.ExecuteAsync("JSON.GET", "*", "$[?(@.status == '" + status + "')]");

        if (result.IsNull)
            return Enumerable.Empty<DocumentMetadata>();

        return JsonSerializer.Deserialize<IEnumerable<DocumentMetadata>>(result);
    }
}
```

#### 4.2.2 RedisSearch for Full-text Search
```csharp
public class DocumentSearchCache
{
    private readonly IDatabase _database;
    private const string SEARCH_INDEX = "documents_idx";

    public async Task CreateSearchIndexAsync()
    {
        // Create search index for documents
        await _database.ExecuteAsync("FT.CREATE", SEARCH_INDEX, "ON", "JSON", "PREFIX", "1", "doc:search:",
            "SCHEMA",
            "$.title", "AS", "title", "TEXT", "WEIGHT", "5.0",
            "$.content", "AS", "content", "TEXT", "WEIGHT", "1.0",
            "$.procedureType", "AS", "procedure", "TAG",
            "$.status", "AS", "status", "TAG",
            "$.submissionDate", "AS", "submission_date", "NUMERIC", "SORTABLE");
    }

    public async Task IndexDocumentAsync(string documentId, DocumentSearchData document)
    {
        var key = $"doc:search:{documentId}";
        var json = JsonSerializer.Serialize(document);

        await _database.ExecuteAsync("JSON.SET", key, "$", json);
    }

    public async Task<SearchResult<DocumentSearchData>> SearchDocumentsAsync(
        string query,
        int offset = 0,
        int limit = 20,
        string[] filters = null)
    {
        var searchArgs = new List<object> { SEARCH_INDEX, query };

        if (filters?.Any() == true)
        {
            searchArgs.Add("FILTER");
            searchArgs.AddRange(filters);
        }

        searchArgs.AddRange(new object[] { "LIMIT", offset, limit, "RETURN", "1", "$" });

        var result = await _database.ExecuteAsync("FT.SEARCH", searchArgs.ToArray());

        // Parse RedisSearch results
        var resultArray = (RedisResult[])result;
        var totalCount = (int)resultArray[0];
        var documents = new List<DocumentSearchData>();

        for (int i = 1; i < resultArray.Length; i += 2)
        {
            var docJson = (string)resultArray[i + 1][1];
            documents.Add(JsonSerializer.Deserialize<DocumentSearchData>(docJson));
        }

        return new SearchResult<DocumentSearchData>
        {
            Total = totalCount,
            Documents = documents,
            Offset = offset,
            Limit = limit
        };
    }
}
```

#### 4.2.3 RedisTimeSeries for Performance Metrics
```csharp
public class PerformanceMetricsCache
{
    private readonly IDatabase _database;

    public async Task RecordResponseTimeAsync(string endpoint, double responseTimeMs)
    {
        var key = $"metrics:response_time:{endpoint}";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        await _database.ExecuteAsync("TS.ADD", key, timestamp, responseTimeMs,
            "RETENTION", "86400000", // 24 hours in milliseconds
            "LABELS", "endpoint", endpoint, "metric", "response_time");
    }

    public async Task RecordThroughputAsync(string service, int requestCount)
    {
        var key = $"metrics:throughput:{service}";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        await _database.ExecuteAsync("TS.ADD", key, timestamp, requestCount,
            "RETENTION", "86400000",
            "LABELS", "service", service, "metric", "throughput");
    }

    public async Task<MetricsData> GetResponseTimeMetricsAsync(string endpoint, TimeSpan period)
    {
        var key = $"metrics:response_time:{endpoint}";
        var fromTime = DateTimeOffset.UtcNow.Subtract(period).ToUnixTimeMilliseconds();
        var toTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var result = await _database.ExecuteAsync("TS.RANGE", key, fromTime, toTime,
            "AGGREGATION", "avg", 60000); // 1-minute aggregation

        // Parse time series data
        var dataPoints = ((RedisResult[])result).Select(point =>
        {
            var pointArray = (RedisResult[])point;
            return new MetricPoint
            {
                Timestamp = DateTimeOffset.FromUnixTimeMilliseconds((long)pointArray[0]),
                Value = (double)pointArray[1]
            };
        }).ToList();

        return new MetricsData
        {
            Endpoint = endpoint,
            MetricType = "response_time",
            DataPoints = dataPoints,
            Average = dataPoints.Any() ? dataPoints.Average(p => p.Value) : 0,
            Maximum = dataPoints.Any() ? dataPoints.Max(p => p.Value) : 0,
            Minimum = dataPoints.Any() ? dataPoints.Min(p => p.Value) : 0
        };
    }
}
```

### 4.3 Redis Cluster Configuration

#### 4.3.1 6-Node Cluster Setup
**Cluster Architecture:**
```yaml
# Redis Enterprise Cluster Configuration
nodes:
  - name: redis-node-01
    role: master
    memory: 128GB
    persistence: AOF
    replication: redis-node-04
    slots: 0-5461

  - name: redis-node-02
    role: master
    memory: 128GB
    persistence: AOF
    replication: redis-node-05
    slots: 5462-10922

  - name: redis-node-03
    role: master
    memory: 128GB
    persistence: AOF
    replication: redis-node-06
    slots: 10923-16383

  - name: redis-node-04
    role: replica
    memory: 128GB
    master: redis-node-01

  - name: redis-node-05
    role: replica
    memory: 128GB
    master: redis-node-02

  - name: redis-node-06
    role: replica
    memory: 128GB
    master: redis-node-03

persistence:
  aof_enabled: true
  aof_rewrite_incremental_fsync: true
  save_frequency: "900 1 300 10 60 10000"

clustering:
  enabled: true
  failover_timeout: 15000
  migration_barrier: 1
```

#### 4.3.2 High Availability Configuration
**Sentinel Configuration:**
```conf
# Sentinel configuration for automatic failover
sentinel monitor dvc-redis-cluster redis-node-01 6379 2
sentinel down-after-milliseconds dvc-redis-cluster 5000
sentinel failover-timeout dvc-redis-cluster 10000
sentinel parallel-syncs dvc-redis-cluster 1

# Authentication
sentinel auth-pass dvc-redis-cluster <strong-password>

# Notification scripts
sentinel notification-script dvc-redis-cluster /opt/redis/scripts/notify.sh
sentinel client-reconfig-script dvc-redis-cluster /opt/redis/scripts/reconfig.sh
```

**Application Connection Handling:**
```csharp
public class RedisConnectionManager
{
    private readonly ConfigurationOptions _connectionOptions;
    private readonly ConnectionMultiplexer _connection;
    private readonly ILogger<RedisConnectionManager> _logger;

    public RedisConnectionManager(IConfiguration configuration, ILogger<RedisConnectionManager> logger)
    {
        _logger = logger;
        _connectionOptions = new ConfigurationOptions
        {
            EndPoints = {
                "redis-node-01:6379",
                "redis-node-02:6379",
                "redis-node-03:6379"
            },
            Password = configuration.GetConnectionString("Redis:Password"),
            ConnectTimeout = 5000,
            SyncTimeout = 5000,
            AsyncTimeout = 5000,
            ConnectRetry = 3,
            ReconnectRetryPolicy = new ExponentialRetry(1000, 30000),
            AbortOnConnectFail = false,
            KeepAlive = 180
        };

        _connection = ConnectionMultiplexer.Connect(_connectionOptions);
        _connection.ConnectionFailed += OnConnectionFailed;
        _connection.ConnectionRestored += OnConnectionRestored;
        _connection.InternalError += OnInternalError;
    }

    private void OnConnectionFailed(object sender, ConnectionFailedEventArgs e)
    {
        _logger.LogError("Redis connection failed: {Endpoint} - {FailureType}: {Exception}",
            e.EndPoint, e.FailureType, e.Exception?.Message);
    }

    private void OnConnectionRestored(object sender, ConnectionFailedEventArgs e)
    {
        _logger.LogInformation("Redis connection restored: {Endpoint}", e.EndPoint);
    }

    private void OnInternalError(object sender, InternalErrorEventArgs e)
    {
        _logger.LogError("Redis internal error: {Exception}", e.Exception?.Message);
    }

    public IDatabase GetDatabase(int db = -1) => _connection.GetDatabase(db);
    public ISubscriber GetSubscriber() => _connection.GetSubscriber();
}
```

---

## 5. MinIO Object Storage

### 5.1 Storage Architecture

#### 5.1.1 Erasure Coding Configuration
**8+4 Erasure Coding Setup:**
```yaml
# MinIO cluster configuration
version: '3.8'
services:
  minio-1:
    image: minio/minio:RELEASE.2024-01-01T00-00-00Z
    command: server --console-address ":9001" http://minio-{1...12}/data{1...2}
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: <strong-password>
      MINIO_ERASURE_SET_DRIVE_COUNT: 12
      MINIO_STORAGE_CLASS_STANDARD: "EC:4"  # 8+4 configuration
    volumes:
      - minio1-data1:/data1
      - minio1-data2:/data2
    networks:
      - minio-network

# Repeat for minio-2 through minio-12...

networks:
  minio-network:
    driver: bridge

volumes:
  minio1-data1:
  minio1-data2:
  # ... continue for all nodes and drives
```

**Storage Classes Configuration:**
```bash
# Configure storage classes
mc admin config set myminio storage_class standard=EC:4,reduced_redundancy=EC:2

# Set lifecycle policies
mc ilm add myminio/documents --expiry-days 2555  # 7 years retention
mc ilm add myminio/temp --expiry-days 1          # 24 hours for temp files
mc ilm add myminio/archive --transition-days 90 --storage-class GLACIER
```

#### 5.1.2 Bucket Organization Strategy
**Bucket Structure:**
```
dvc-documents/
├── active/
│   ├── 2024/
│   │   ├── 01/        # Monthly partitioning
│   │   ├── 02/
│   │   └── ...
│   └── 2025/
├── archived/
│   ├── 2017/
│   └── ...
├── temp/              # 24-hour retention
└── templates/         # Form templates

dvc-workflows/
├── definitions/       # Workflow BPMN files
├── schemas/          # Validation schemas
└── assets/           # Workflow resources

dvc-system/
├── backups/          # Database backups
├── logs/             # Application logs
└── exports/          # Report exports
```

**Bucket Policy Configuration:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::*:user/dvc-application"},
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dvc-documents/active/*"
    },
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::*:user/dvc-archive"},
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::dvc-documents/archived/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::dvc-documents/archived/*"
    }
  ]
}
```

#### 5.1.3 Multi-part Upload Implementation
```csharp
public class MinIODocumentService
{
    private readonly MinioClient _minioClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MinIODocumentService> _logger;

    private const int MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB
    private const int PART_SIZE = 5 * 1024 * 1024; // 5MB per part

    public async Task<string> UploadDocumentAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        long fileSize,
        IProgress<UploadProgress> progress = null)
    {
        try
        {
            if (fileSize > MULTIPART_THRESHOLD)
            {
                return await UploadLargeFileAsync(bucketName, objectName, fileStream, fileSize, progress);
            }
            else
            {
                return await UploadSmallFileAsync(bucketName, objectName, fileStream, fileSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload document {ObjectName} to bucket {BucketName}",
                objectName, bucketName);
            throw;
        }
    }

    private async Task<string> UploadLargeFileAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        long fileSize,
        IProgress<UploadProgress> progress)
    {
        var uploadId = await _minioClient.CreateMultipartUploadAsync(bucketName, objectName);
        var parts = new List<PartInfo>();
        var partNumber = 1;
        var uploadedBytes = 0L;

        try
        {
            while (uploadedBytes < fileSize)
            {
                var remainingBytes = fileSize - uploadedBytes;
                var currentPartSize = Math.Min(PART_SIZE, remainingBytes);

                var partData = new byte[currentPartSize];
                await fileStream.ReadAsync(partData, 0, (int)currentPartSize);

                using var partStream = new MemoryStream(partData);
                var etag = await _minioClient.UploadPartAsync(
                    bucketName, objectName, uploadId, partNumber, partStream, currentPartSize);

                parts.Add(new PartInfo(partNumber, etag));

                uploadedBytes += currentPartSize;
                partNumber++;

                // Report progress
                progress?.Report(new UploadProgress
                {
                    UploadedBytes = uploadedBytes,
                    TotalBytes = fileSize,
                    PercentComplete = (double)uploadedBytes / fileSize * 100
                });
            }

            // Complete multipart upload
            await _minioClient.CompleteMultipartUploadAsync(bucketName, objectName, uploadId, parts);

            _logger.LogInformation("Successfully uploaded large file {ObjectName} ({FileSize} bytes)",
                objectName, fileSize);

            return objectName;
        }
        catch (Exception ex)
        {
            // Abort multipart upload on error
            await _minioClient.AbortMultipartUploadAsync(bucketName, objectName, uploadId);
            throw;
        }
    }

    private async Task<string> UploadSmallFileAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        long fileSize)
    {
        var metadata = new Dictionary<string, string>
        {
            ["Content-Type"] = GetContentType(objectName),
            ["Upload-Date"] = DateTime.UtcNow.ToString("O"),
            ["Original-Size"] = fileSize.ToString()
        };

        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithStreamData(fileStream)
            .WithObjectSize(fileSize)
            .WithHeaders(metadata));

        return objectName;
    }

    public async Task<Stream> GetDocumentAsync(string bucketName, string objectName)
    {
        var memoryStream = new MemoryStream();

        await _minioClient.GetObjectAsync(new GetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithCallbackStream(stream => stream.CopyTo(memoryStream)));

        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task<bool> DeleteDocumentAsync(string bucketName, string objectName)
    {
        try
        {
            await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName));

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete document {ObjectName} from bucket {BucketName}",
                objectName, bucketName);
            return false;
        }
    }
}
```

### 5.2 Performance Optimization

#### 5.2.1 CDN Integration
```csharp
public class CDNOptimizedDocumentService : IDocumentService
{
    private readonly MinIODocumentService _minioService;
    private readonly ICDNService _cdnService;
    private readonly IConfiguration _configuration;

    public async Task<string> GetDocumentUrlAsync(string documentId, bool usecdn = true)
    {
        var objectName = $"documents/{documentId}";

        if (usecdn && IsStaticContent(documentId))
        {
            // Use CDN for static content (forms, templates)
            return _cdnService.GetCachedUrl(objectName);
        }
        else
        {
            // Generate pre-signed URL for dynamic content
            var presignedUrl = await _minioService.PresignedGetObjectAsync(
                "dvc-documents",
                objectName,
                expiry: (int)TimeSpan.FromHours(1).TotalSeconds);

            return presignedUrl;
        }
    }

    public async Task<string> UploadWithOptimizationAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        DocumentType documentType)
    {
        // Optimize based on document type
        Stream optimizedStream = documentType switch
        {
            DocumentType.Image => await OptimizeImageAsync(fileStream),
            DocumentType.PDF => await OptimizePDFAsync(fileStream),
            DocumentType.Office => await ConvertToPDFAsync(fileStream),
            _ => fileStream
        };

        var result = await _minioService.UploadDocumentAsync(
            bucketName, objectName, optimizedStream, optimizedStream.Length);

        // Trigger CDN invalidation for static content
        if (IsStaticContent(objectName))
        {
            await _cdnService.InvalidateCacheAsync(objectName);
        }

        return result;
    }

    private async Task<Stream> OptimizeImageAsync(Stream imageStream)
    {
        // Compress images to reduce storage
        using var image = Image.Load(imageStream);

        // Resize if too large
        if (image.Width > 1920 || image.Height > 1080)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(1920, 1080),
                Mode = ResizeMode.Max
            }));
        }

        var optimizedStream = new MemoryStream();
        await image.SaveAsJpegAsync(optimizedStream, new JpegEncoder { Quality = 85 });
        optimizedStream.Position = 0;

        return optimizedStream;
    }
}
```

#### 5.2.2 Bandwidth Throttling
```csharp
public class ThrottledMinIOService
{
    private readonly MinIODocumentService _baseService;
    private readonly SemaphoreSlim _uploadSemaphore;
    private readonly SemaphoreSlim _downloadSemaphore;

    public ThrottledMinIOService(MinIODocumentService baseService)
    {
        _baseService = baseService;
        _uploadSemaphore = new SemaphoreSlim(10, 10); // Max 10 concurrent uploads
        _downloadSemaphore = new SemaphoreSlim(50, 50); // Max 50 concurrent downloads
    }

    public async Task<string> UploadDocumentAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        long fileSize,
        CancellationToken cancellationToken = default)
    {
        await _uploadSemaphore.WaitAsync(cancellationToken);
        try
        {
            return await _baseService.UploadDocumentAsync(bucketName, objectName, fileStream, fileSize);
        }
        finally
        {
            _uploadSemaphore.Release();
        }
    }

    public async Task<Stream> GetDocumentAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken = default)
    {
        await _downloadSemaphore.WaitAsync(cancellationToken);
        try
        {
            return await _baseService.GetDocumentAsync(bucketName, objectName);
        }
        finally
        {
            _downloadSemaphore.Release();
        }
    }
}
```

---

## 6. Elasticsearch 8 Cluster

### 6.1 Search Architecture

#### 6.1.1 Index Strategy
**Time-based Index Configuration:**
```json
{
  "index_patterns": ["documents-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "documents_policy",
      "index.lifecycle.rollover_alias": "documents",
      "refresh_interval": "30s",
      "analysis": {
        "analyzer": {
          "vietnamese_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
              "lowercase",
              "vietnamese_stop",
              "vietnamese_stemmer"
            ]
          }
        },
        "filter": {
          "vietnamese_stop": {
            "type": "stop",
            "stopwords": ["và", "của", "trong", "với", "từ", "theo", "để", "là", "có", "được"]
          },
          "vietnamese_stemmer": {
            "type": "stemmer",
            "language": "light_vietnamese"
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "documentId": { "type": "keyword" },
        "title": {
          "type": "text",
          "analyzer": "vietnamese_analyzer",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "content": {
          "type": "text",
          "analyzer": "vietnamese_analyzer"
        },
        "procedureType": { "type": "keyword" },
        "category": { "type": "keyword" },
        "status": { "type": "keyword" },
        "submissionDate": { "type": "date" },
        "completionDate": { "type": "date" },
        "processingUnit": { "type": "keyword" },
        "submitterId": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "attachments": {
          "type": "nested",
          "properties": {
            "fileName": { "type": "text" },
            "fileType": { "type": "keyword" },
            "content": { "type": "text", "analyzer": "vietnamese_analyzer" }
          }
        },
        "workflow": {
          "type": "object",
          "properties": {
            "currentStep": { "type": "keyword" },
            "assignedUser": { "type": "keyword" },
            "deadlineDate": { "type": "date" }
          }
        },
        "location": {
          "type": "object",
          "properties": {
            "province": { "type": "keyword" },
            "district": { "type": "keyword" },
            "ward": { "type": "keyword" }
          }
        }
      }
    }
  }
}
```

**Index Lifecycle Management:**
```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "30d",
            "max_docs": 10000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "90d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0,
            "require": {
              "box_type": "cold"
            }
          },
          "set_priority": {
            "priority": 0
          }
        }
      },
      "frozen": {
        "min_age": "365d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "found-snapshots"
          }
        }
      }
    }
  }
}
```

#### 6.1.2 Search Service Implementation
```csharp
public class ElasticsearchDocumentService
{
    private readonly ElasticClient _client;
    private readonly ILogger<ElasticsearchDocumentService> _logger;

    public async Task<SearchResponse<DocumentSearchModel>> SearchDocumentsAsync(
        DocumentSearchRequest request)
    {
        var searchDescriptor = new SearchDescriptor<DocumentSearchModel>()
            .Index("documents")
            .Size(request.Size ?? 20)
            .From(request.From ?? 0)
            .TrackTotalHits(true);

        // Build query
        if (!string.IsNullOrEmpty(request.Query))
        {
            searchDescriptor = searchDescriptor.Query(q => q
                .Bool(b => b
                    .Should(
                        sh => sh.MultiMatch(mm => mm
                            .Fields(f => f
                                .Field(doc => doc.Title, boost: 2.0)
                                .Field(doc => doc.Content)
                                .Field("attachments.content"))
                            .Query(request.Query)
                            .Type(TextQueryType.BestFields)
                            .Fuzziness(Fuzziness.Auto)
                        ),
                        sh => sh.Nested(n => n
                            .Path("attachments")
                            .Query(nq => nq
                                .Match(m => m
                                    .Field("attachments.content")
                                    .Query(request.Query)
                                )
                            )
                        )
                    )
                    .MinimumShouldMatch(1)
                )
            );
        }

        // Apply filters
        var filterQueries = new List<Func<QueryContainerDescriptor<DocumentSearchModel>, QueryContainer>>();

        if (request.Filters?.Any() == true)
        {
            foreach (var filter in request.Filters)
            {
                switch (filter.Field.ToLower())
                {
                    case "status":
                        filterQueries.Add(fq => fq.Terms(t => t.Field(f => f.Status).Terms(filter.Values)));
                        break;
                    case "proceduretype":
                        filterQueries.Add(fq => fq.Terms(t => t.Field(f => f.ProcedureType).Terms(filter.Values)));
                        break;
                    case "submissiondate":
                        if (filter.DateRange != null)
                        {
                            filterQueries.Add(fq => fq.DateRange(dr => dr
                                .Field(f => f.SubmissionDate)
                                .GreaterThanOrEquals(filter.DateRange.From)
                                .LessThanOrEquals(filter.DateRange.To)));
                        }
                        break;
                    case "processingunit":
                        filterQueries.Add(fq => fq.Terms(t => t.Field(f => f.ProcessingUnit).Terms(filter.Values)));
                        break;
                }
            }
        }

        if (filterQueries.Any())
        {
            searchDescriptor = searchDescriptor.PostFilter(pf => pf
                .Bool(b => b.Must(filterQueries.ToArray())));
        }

        // Apply sorting
        if (!string.IsNullOrEmpty(request.SortField))
        {
            var sortOrder = request.SortDirection?.ToLower() == "desc" ? SortOrder.Descending : SortOrder.Ascending;

            searchDescriptor = request.SortField.ToLower() switch
            {
                "submissiondate" => searchDescriptor.Sort(s => s.Field(f => f.SubmissionDate, sortOrder)),
                "title" => searchDescriptor.Sort(s => s.Field("title.keyword", sortOrder)),
                "status" => searchDescriptor.Sort(s => s.Field(f => f.Status, sortOrder)),
                _ => searchDescriptor.Sort(s => s.Score(SortOrder.Descending))
            };
        }

        // Add aggregations
        searchDescriptor = searchDescriptor.Aggregations(a => a
            .Terms("status_counts", t => t.Field(f => f.Status).Size(10))
            .Terms("procedure_counts", t => t.Field(f => f.ProcedureType).Size(20))
            .Terms("processing_unit_counts", t => t.Field(f => f.ProcessingUnit).Size(100))
            .DateHistogram("submission_timeline", dh => dh
                .Field(f => f.SubmissionDate)
                .CalendarInterval(DateInterval.Month)
                .MinimumDocumentCount(1))
        );

        // Add highlighting
        searchDescriptor = searchDescriptor.Highlight(h => h
            .Fields(
                f => f.Field(doc => doc.Title).FragmentSize(100).NumberOfFragments(1),
                f => f.Field(doc => doc.Content).FragmentSize(150).NumberOfFragments(2),
                f => f.Field("attachments.content").FragmentSize(100).NumberOfFragments(1)
            )
            .PreTags("<mark>")
            .PostTags("</mark>")
        );

        var response = await _client.SearchAsync<DocumentSearchModel>(searchDescriptor);

        if (!response.IsValid)
        {
            _logger.LogError("Elasticsearch search failed: {Error}", response.OriginalException?.Message);
            throw new SearchException("Search operation failed", response.OriginalException);
        }

        return response;
    }

    public async Task IndexDocumentAsync(DocumentSearchModel document)
    {
        var indexResponse = await _client.IndexAsync(document, idx => idx
            .Index($"documents-{DateTime.UtcNow:yyyy-MM}")
            .Id(document.DocumentId)
            .Refresh(Refresh.WaitFor));

        if (!indexResponse.IsValid)
        {
            _logger.LogError("Failed to index document {DocumentId}: {Error}",
                document.DocumentId, indexResponse.OriginalException?.Message);
            throw new IndexingException($"Failed to index document {document.DocumentId}", indexResponse.OriginalException);
        }
    }

    public async Task<SuggestResponse> GetAutocompleteSuggestionsAsync(string query, int size = 5)
    {
        var response = await _client.SearchAsync<DocumentSearchModel>(s => s
            .Index("documents")
            .Size(0)
            .Suggest(sug => sug
                .Completion("title_suggestions", c => c
                    .Field("title.suggest")
                    .Prefix(query)
                    .Size(size)
                )
                .Term("title_corrections", t => t
                    .Field("title")
                    .Text(query)
                    .Size(size)
                )
            )
        );

        return response.Suggest;
    }
}
```

#### 6.1.3 Analytics and Reporting Queries
```csharp
public class ElasticsearchAnalyticsService
{
    private readonly ElasticClient _client;

    public async Task<ProcessingEfficiencyReport> GetProcessingEfficiencyAsync(
        DateTime fromDate,
        DateTime toDate,
        string processingUnit = null)
    {
        var searchDescriptor = new SearchDescriptor<DocumentSearchModel>()
            .Index("documents")
            .Size(0)
            .Query(q => q
                .Bool(b => b
                    .Must(
                        m => m.DateRange(dr => dr
                            .Field(f => f.SubmissionDate)
                            .GreaterThanOrEquals(fromDate)
                            .LessThanOrEquals(toDate)
                        ),
                        m => m.Exists(e => e.Field(f => f.CompletionDate))
                    )
                    .Filter(processingUnit != null
                        ? new Func<QueryContainerDescriptor<DocumentSearchModel>, QueryContainer>[] {
                            f => f.Term(t => t.Field(doc => doc.ProcessingUnit).Value(processingUnit))
                        }
                        : new Func<QueryContainerDescriptor<DocumentSearchModel>, QueryContainer>[0]
                    )
                )
            )
            .Aggregations(a => a
                .Terms("by_processing_unit", t => t
                    .Field(f => f.ProcessingUnit)
                    .Size(100)
                    .Aggregations(aa => aa
                        .Average("avg_processing_time", av => av
                            .Script(sc => sc
                                .Source("(doc['completionDate'].value.millis - doc['submissionDate'].value.millis) / (1000 * 60 * 60)")
                            )
                        )
                        .Terms("on_time_status", ot => ot
                            .Script(sc => sc
                                .Source("doc['completionDate'].value.millis <= doc['workflow.deadlineDate'].value.millis ? 'on_time' : 'overdue'")
                            )
                        )
                        .Percentiles("processing_time_percentiles", p => p
                            .Script(sc => sc
                                .Source("(doc['completionDate'].value.millis - doc['submissionDate'].value.millis) / (1000 * 60 * 60)")
                            )
                            .Percents(50, 75, 90, 95, 99)
                        )
                    )
                )
                .DateHistogram("completion_timeline", dh => dh
                    .Field(f => f.CompletionDate)
                    .CalendarInterval(DateInterval.Day)
                    .Aggregations(aa => aa
                        .Average("daily_avg_time", av => av
                            .Script(sc => sc
                                .Source("(doc['completionDate'].value.millis - doc['submissionDate'].value.millis) / (1000 * 60 * 60)")
                            )
                        )
                    )
                )
            );

        var response = await _client.SearchAsync<DocumentSearchModel>(searchDescriptor);

        // Process aggregation results into report
        var report = new ProcessingEfficiencyReport
        {
            FromDate = fromDate,
            ToDate = toDate,
            ProcessingUnit = processingUnit,
            GeneratedAt = DateTime.UtcNow
        };

        // Extract data from aggregation buckets
        var unitAgg = response.Aggregations.Terms("by_processing_unit");
        foreach (var bucket in unitAgg.Buckets)
        {
            var unitData = new ProcessingUnitData
            {
                UnitName = bucket.Key,
                TotalDocuments = (int)bucket.DocCount,
                AverageProcessingTimeHours = bucket.Average("avg_processing_time").Value ?? 0
            };

            var onTimeAgg = bucket.Terms("on_time_status");
            foreach (var statusBucket in onTimeAgg.Buckets)
            {
                if (statusBucket.Key == "on_time")
                    unitData.OnTimeCount = (int)statusBucket.DocCount;
                else
                    unitData.OverdueCount = (int)statusBucket.DocCount;
            }

            unitData.OnTimePercentage = unitData.TotalDocuments > 0
                ? (double)unitData.OnTimeCount / unitData.TotalDocuments * 100
                : 0;

            report.ProcessingUnits.Add(unitData);
        }

        return report;
    }

    public async Task<WorkloadDistributionReport> GetWorkloadDistributionAsync(DateTime date)
    {
        var response = await _client.SearchAsync<DocumentSearchModel>(s => s
            .Index("documents")
            .Size(0)
            .Query(q => q
                .Bool(b => b
                    .Filter(
                        f => f.DateRange(dr => dr
                            .Field(doc => doc.SubmissionDate)
                            .GreaterThanOrEquals(date.Date)
                            .LessThan(date.Date.AddDays(1))
                        )
                    )
                )
            )
            .Aggregations(a => a
                .Terms("by_procedure", t => t
                    .Field(f => f.ProcedureType)
                    .Size(50)
                    .Aggregations(aa => aa
                        .Terms("by_status", ts => ts
                            .Field(f => f.Status)
                        )
                        .Terms("by_processing_unit", tu => tu
                            .Field(f => f.ProcessingUnit)
                            .Size(20)
                        )
                    )
                )
                .DateHistogram("hourly_distribution", dh => dh
                    .Field(f => f.SubmissionDate)
                    .FixedInterval(Time.FromTimeSpan(TimeSpan.FromHours(1)))
                )
            )
        );

        // Process results into report...
        return new WorkloadDistributionReport(); // Implementation details...
    }
}
```

---

## 7. Backup & Recovery Strategy

### 7.1 SQL Server Backup Strategy

#### 7.1.1 Automated Backup Configuration
```sql
-- Full backup job (daily at 2 AM)
USE msdb;
GO
EXEC dbo.sp_add_job
    @job_name = N'DVC_Full_Backup';

EXEC dbo.sp_add_jobstep
    @job_name = N'DVC_Full_Backup',
    @step_name = N'Backup All Databases',
    @command = N'
        DECLARE @BackupPath NVARCHAR(500) = ''E:\Backups\Full\'' + FORMAT(GETDATE(), ''yyyy-MM-dd'') + ''\'';
        EXEC xp_create_subdir @BackupPath;

        BACKUP DATABASE DVC_CommandDB
        TO DISK = @BackupPath + ''DVC_CommandDB_Full.bak''
        WITH COMPRESSION, CHECKSUM, INIT,
        NAME = ''DVC Command DB Full Backup'',
        DESCRIPTION = ''Full backup of DVC Command database'';

        BACKUP DATABASE DVC_QueryDB
        TO DISK = @BackupPath + ''DVC_QueryDB_Full.bak''
        WITH COMPRESSION, CHECKSUM, INIT,
        NAME = ''DVC Query DB Full Backup'',
        DESCRIPTION = ''Full backup of DVC Query database'';

        -- Verify backups
        RESTORE VERIFYONLY FROM DISK = @BackupPath + ''DVC_CommandDB_Full.bak'';
        RESTORE VERIFYONLY FROM DISK = @BackupPath + ''DVC_QueryDB_Full.bak'';
    ';

-- Differential backup job (every 6 hours)
EXEC dbo.sp_add_job
    @job_name = N'DVC_Differential_Backup';

EXEC dbo.sp_add_jobstep
    @job_name = N'DVC_Differential_Backup',
    @step_name = N'Differential Backup',
    @command = N'
        DECLARE @BackupPath NVARCHAR(500) = ''E:\Backups\Differential\'' + FORMAT(GETDATE(), ''yyyy-MM-dd-HH'') + ''\'';
        EXEC xp_create_subdir @BackupPath;

        BACKUP DATABASE DVC_CommandDB
        TO DISK = @BackupPath + ''DVC_CommandDB_Diff.bak''
        WITH DIFFERENTIAL, COMPRESSION, CHECKSUM, INIT;

        BACKUP DATABASE DVC_QueryDB
        TO DISK = @BackupPath + ''DVC_QueryDB_Diff.bak''
        WITH DIFFERENTIAL, COMPRESSION, CHECKSUM, INIT;
    ';

-- Transaction log backup job (every 15 minutes)
EXEC dbo.sp_add_job
    @job_name = N'DVC_Log_Backup';

EXEC dbo.sp_add_jobstep
    @job_name = N'DVC_Log_Backup',
    @step_name = N'Log Backup',
    @command = N'
        DECLARE @BackupPath NVARCHAR(500) = ''E:\Backups\Log\'' + FORMAT(GETDATE(), ''yyyy-MM-dd'') + ''\'';
        EXEC xp_create_subdir @BackupPath;

        BACKUP LOG DVC_CommandDB
        TO DISK = @BackupPath + ''DVC_CommandDB_'' + FORMAT(GETDATE(), ''HHmm'') + ''.trn''
        WITH COMPRESSION, CHECKSUM, INIT;

        BACKUP LOG DVC_QueryDB
        TO DISK = @BackupPath + ''DVC_QueryDB_'' + FORMAT(GETDATE(), ''HHmm'') + ''.trn''
        WITH COMPRESSION, CHECKSUM, INIT;
    ';
```

#### 7.1.2 Cross-region Backup Replication
```powershell
# PowerShell script for backup replication
param(
    [string]$SourcePath = "E:\Backups",
    [string]$RemotePath = "\\backup-server-dr\DVC_Backups",
    [int]$RetentionDays = 30
)

# Function to replicate backups to DR site
function Copy-BackupsToRemote {
    param($LocalPath, $RemotePath)

    $lastWriteTime = (Get-Date).AddHours(-1)
    $recentBackups = Get-ChildItem -Path $LocalPath -Recurse -File |
        Where-Object { $_.LastWriteTime -ge $lastWriteTime }

    foreach ($backup in $recentBackups) {
        $relativePath = $backup.FullName.Substring($LocalPath.Length)
        $remotePath = Join-Path $RemotePath $relativePath
        $remoteDir = Split-Path $remotePath -Parent

        if (!(Test-Path $remoteDir)) {
            New-Item -Path $remoteDir -ItemType Directory -Force
        }

        try {
            Copy-Item -Path $backup.FullName -Destination $remotePath -Force
            Write-Host "Copied: $($backup.Name) to $remotePath"
        }
        catch {
            Write-Error "Failed to copy $($backup.Name): $($_.Exception.Message)"
        }
    }
}

# Function to clean old backups
function Remove-OldBackups {
    param($Path, $RetentionDays)

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $Path -Recurse -File |
        Where-Object { $_.LastWriteTime -lt $cutoffDate }

    foreach ($oldBackup in $oldBackups) {
        try {
            Remove-Item -Path $oldBackup.FullName -Force
            Write-Host "Removed old backup: $($oldBackup.Name)"
        }
        catch {
            Write-Error "Failed to remove $($oldBackup.Name): $($_.Exception.Message)"
        }
    }
}

# Execute replication
Copy-BackupsToRemote -LocalPath $SourcePath -RemotePath $RemotePath
Remove-OldBackups -Path $SourcePath -RetentionDays $RetentionDays
Remove-OldBackups -Path $RemotePath -RetentionDays ($RetentionDays * 2)
```

### 7.2 Point-in-Time Recovery Procedures

#### 7.2.1 Automated Recovery Script
```sql
-- Point-in-time recovery procedure
CREATE PROCEDURE sp_PointInTimeRecover
    @TargetDateTime DATETIME2,
    @DatabaseName NVARCHAR(128),
    @RecoveryDatabaseName NVARCHAR(128) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @RecoveryDatabaseName IS NULL
        SET @RecoveryDatabaseName = @DatabaseName + '_Recovery_' + FORMAT(@TargetDateTime, 'yyyyMMddHHmm');

    DECLARE @FullBackupPath NVARCHAR(500);
    DECLARE @DiffBackupPath NVARCHAR(500);
    DECLARE @LogBackupPath NVARCHAR(500);
    DECLARE @SQL NVARCHAR(MAX);

    -- Find the most recent full backup before target time
    SELECT TOP 1 @FullBackupPath = physical_device_name
    FROM msdb.dbo.backupset bs
    INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
    WHERE bs.database_name = @DatabaseName
        AND bs.type = 'D' -- Full backup
        AND bs.backup_finish_date <= @TargetDateTime
    ORDER BY bs.backup_finish_date DESC;

    -- Find the most recent differential backup before target time
    SELECT TOP 1 @DiffBackupPath = physical_device_name
    FROM msdb.dbo.backupset bs
    INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
    WHERE bs.database_name = @DatabaseName
        AND bs.type = 'I' -- Differential backup
        AND bs.backup_finish_date <= @TargetDateTime
        AND bs.backup_finish_date > (
            SELECT backup_finish_date FROM msdb.dbo.backupset
            WHERE media_set_id = (
                SELECT media_set_id FROM msdb.dbo.backupmediafamily
                WHERE physical_device_name = @FullBackupPath
            )
        )
    ORDER BY bs.backup_finish_date DESC;

    -- Step 1: Restore full backup
    SET @SQL = 'RESTORE DATABASE [' + @RecoveryDatabaseName + '] FROM DISK = ''' + @FullBackupPath + ''' WITH NORECOVERY, REPLACE';
    PRINT 'Restoring full backup: ' + @SQL;
    EXEC sp_executesql @SQL;

    -- Step 2: Restore differential backup if exists
    IF @DiffBackupPath IS NOT NULL
    BEGIN
        SET @SQL = 'RESTORE DATABASE [' + @RecoveryDatabaseName + '] FROM DISK = ''' + @DiffBackupPath + ''' WITH NORECOVERY';
        PRINT 'Restoring differential backup: ' + @SQL;
        EXEC sp_executesql @SQL;
    END

    -- Step 3: Restore log backups up to target time
    DECLARE log_cursor CURSOR FOR
        SELECT bmf.physical_device_name
        FROM msdb.dbo.backupset bs
        INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
        WHERE bs.database_name = @DatabaseName
            AND bs.type = 'L' -- Log backup
            AND bs.backup_finish_date <= @TargetDateTime
            AND bs.backup_start_date >= COALESCE(
                (SELECT backup_finish_date FROM msdb.dbo.backupset
                 WHERE media_set_id = (
                     SELECT media_set_id FROM msdb.dbo.backupmediafamily
                     WHERE physical_device_name = @DiffBackupPath
                 )),
                (SELECT backup_finish_date FROM msdb.dbo.backupset
                 WHERE media_set_id = (
                     SELECT media_set_id FROM msdb.dbo.backupmediafamily
                     WHERE physical_device_name = @FullBackupPath
                 ))
            )
        ORDER BY bs.backup_start_date;

    OPEN log_cursor;
    FETCH NEXT FROM log_cursor INTO @LogBackupPath;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @SQL = 'RESTORE LOG [' + @RecoveryDatabaseName + '] FROM DISK = ''' + @LogBackupPath + ''' WITH NORECOVERY';
        PRINT 'Restoring log backup: ' + @SQL;
        EXEC sp_executesql @SQL;

        FETCH NEXT FROM log_cursor INTO @LogBackupPath;
    END

    CLOSE log_cursor;
    DEALLOCATE log_cursor;

    -- Step 4: Final recovery to target point in time
    SET @SQL = 'RESTORE DATABASE [' + @RecoveryDatabaseName + '] WITH RECOVERY, STOPAT = ''' + CONVERT(VARCHAR(25), @TargetDateTime, 120) + '''';
    PRINT 'Final recovery: ' + @SQL;
    EXEC sp_executesql @SQL;

    PRINT 'Point-in-time recovery completed for database: ' + @RecoveryDatabaseName;
END
```

### 7.3 Disaster Recovery Testing

#### 7.3.1 Automated DR Test Script
```csharp
public class DisasterRecoveryTester
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DisasterRecoveryTester> _logger;

    public async Task<DrTestResult> ExecuteFullDrTestAsync()
    {
        var testResult = new DrTestResult
        {
            TestStartTime = DateTime.UtcNow,
            TestScenario = "Full DR Site Failover"
        };

        try
        {
            // Step 1: Test database connectivity to DR site
            var dbTestResult = await TestDatabaseConnectivityAsync();
            testResult.DatabaseTest = dbTestResult;

            // Step 2: Test application services startup
            var appTestResult = await TestApplicationServicesAsync();
            testResult.ApplicationTest = appTestResult;

            // Step 3: Test data integrity
            var dataTestResult = await TestDataIntegrityAsync();
            testResult.DataIntegrityTest = dataTestResult;

            // Step 4: Test business operations
            var businessTestResult = await TestBusinessOperationsAsync();
            testResult.BusinessOperationsTest = businessTestResult;

            // Step 5: Test backup systems
            var backupTestResult = await TestBackupSystemsAsync();
            testResult.BackupSystemTest = backupTestResult;

            testResult.OverallSuccess = new[] {
                dbTestResult.Success,
                appTestResult.Success,
                dataTestResult.Success,
                businessTestResult.Success,
                backupTestResult.Success
            }.All(x => x);

            testResult.TestEndTime = DateTime.UtcNow;
            testResult.TotalDuration = testResult.TestEndTime - testResult.TestStartTime;

            // Generate detailed report
            await GenerateTestReportAsync(testResult);

            return testResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DR test execution failed");
            testResult.OverallSuccess = false;
            testResult.ErrorMessage = ex.Message;
            return testResult;
        }
    }

    private async Task<TestResult> TestDatabaseConnectivityAsync()
    {
        var result = new TestResult { TestName = "Database Connectivity" };
        var startTime = DateTime.UtcNow;

        try
        {
            // Test primary databases
            using var commandConnection = new SqlConnection(_configuration.GetConnectionString("CommandDatabase_DR"));
            await commandConnection.OpenAsync();

            var commandResult = await commandConnection.QueryFirstAsync<int>("SELECT COUNT(*) FROM sys.databases WHERE name = 'DVC_CommandDB'");

            using var queryConnection = new SqlConnection(_configuration.GetConnectionString("QueryDatabase_DR"));
            await queryConnection.OpenAsync();

            var queryResult = await queryConnection.QueryFirstAsync<int>("SELECT COUNT(*) FROM sys.databases WHERE name = 'DVC_QueryDB'");

            // Test Always On status
            var agStatus = await commandConnection.QueryAsync<AvailabilityGroupStatus>(@"
                SELECT
                    ag.name AS GroupName,
                    rs.role_desc AS Role,
                    rs.operational_state_desc AS OperationalState,
                    rs.synchronization_health_desc AS SyncHealth
                FROM sys.availability_groups ag
                INNER JOIN sys.dm_hadr_availability_replica_states rs ON ag.group_id = rs.group_id
                WHERE rs.is_local = 1
            ");

            result.Success = commandResult > 0 && queryResult > 0 &&
                           agStatus.All(s => s.OperationalState == "ONLINE");
            result.Details = $"Command DB: {commandResult}, Query DB: {queryResult}, AG Status: {string.Join(", ", agStatus.Select(s => s.SyncHealth))}";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
        }

        result.Duration = DateTime.UtcNow - startTime;
        return result;
    }

    private async Task<TestResult> TestApplicationServicesAsync()
    {
        var result = new TestResult { TestName = "Application Services" };
        var startTime = DateTime.UtcNow;

        try
        {
            var httpClient = new HttpClient();
            var services = new[]
            {
                "UserService",
                "WorkflowService",
                "DocumentService",
                "NotificationService"
            };

            var healthCheckTasks = services.Select(async service =>
            {
                var url = $"{_configuration[$"Services:{service}:BaseUrl"]}/health";
                var response = await httpClient.GetAsync(url);
                return new { Service = service, Healthy = response.IsSuccessStatusCode };
            });

            var healthResults = await Task.WhenAll(healthCheckTasks);

            result.Success = healthResults.All(r => r.Healthy);
            result.Details = string.Join(", ", healthResults.Select(r => $"{r.Service}: {(r.Healthy ? "OK" : "FAIL")}"));
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
        }

        result.Duration = DateTime.UtcNow - startTime;
        return result;
    }

    private async Task<TestResult> TestDataIntegrityAsync()
    {
        var result = new TestResult { TestName = "Data Integrity" };
        var startTime = DateTime.UtcNow;

        try
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("CommandDatabase_DR"));

            // Check critical table counts
            var tableCounts = await connection.QueryAsync<TableCount>(@"
                SELECT
                    'Documents' AS TableName, COUNT(*) AS RecordCount
                FROM Documents WHERE SubmissionDate >= DATEADD(day, -30, GETUTCDATE())
                UNION ALL
                SELECT
                    'Users' AS TableName, COUNT(*) AS RecordCount
                FROM Users WHERE IsActive = 1
                UNION ALL
                SELECT
                    'WorkflowInstances' AS TableName, COUNT(*) AS RecordCount
                FROM WorkflowInstances WHERE CreatedDate >= DATEADD(day, -30, GETUTCDATE())
            ");

            // Check referential integrity
            var integrityCheck = await connection.QueryFirstAsync<int>(@"
                DECLARE @ErrorCount INT = 0;

                -- Check document-user references
                SELECT @ErrorCount = @ErrorCount + COUNT(*)
                FROM Documents d
                LEFT JOIN Users u ON d.SubmitterId = u.Id
                WHERE u.Id IS NULL;

                -- Check workflow-document references
                SELECT @ErrorCount = @ErrorCount + COUNT(*)
                FROM WorkflowInstances wi
                LEFT JOIN Documents d ON wi.DocumentId = d.Id
                WHERE d.Id IS NULL;

                SELECT @ErrorCount;
            ");

            result.Success = integrityCheck == 0 && tableCounts.All(t => t.RecordCount > 0);
            result.Details = $"Integrity errors: {integrityCheck}, Table counts: {string.Join(", ", tableCounts.Select(t => $"{t.TableName}: {t.RecordCount}"))}";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
        }

        result.Duration = DateTime.UtcNow - startTime;
        return result;
    }

    private async Task GenerateTestReportAsync(DrTestResult testResult)
    {
        var report = new StringBuilder();
        report.AppendLine($"# Disaster Recovery Test Report");
        report.AppendLine($"**Test Date:** {testResult.TestStartTime:yyyy-MM-dd HH:mm:ss} UTC");
        report.AppendLine($"**Test Duration:** {testResult.TotalDuration.TotalMinutes:F2} minutes");
        report.AppendLine($"**Overall Result:** {(testResult.OverallSuccess ? "✅ PASS" : "❌ FAIL")}");
        report.AppendLine();

        var tests = new[] {
            testResult.DatabaseTest,
            testResult.ApplicationTest,
            testResult.DataIntegrityTest,
            testResult.BusinessOperationsTest,
            testResult.BackupSystemTest
        };

        foreach (var test in tests.Where(t => t != null))
        {
            report.AppendLine($"## {test.TestName}");
            report.AppendLine($"- **Result:** {(test.Success ? "✅ PASS" : "❌ FAIL")}");
            report.AppendLine($"- **Duration:** {test.Duration.TotalSeconds:F2} seconds");
            report.AppendLine($"- **Details:** {test.Details}");
            if (!string.IsNullOrEmpty(test.ErrorMessage))
                report.AppendLine($"- **Error:** {test.ErrorMessage}");
            report.AppendLine();
        }

        // Save report to file and send email notification
        var reportPath = Path.Combine(_configuration["Reports:Path"], $"DR_Test_{testResult.TestStartTime:yyyyMMdd_HHmmss}.md");
        await File.WriteAllTextAsync(reportPath, report.ToString());

        _logger.LogInformation("DR test report generated: {ReportPath}", reportPath);
    }
}
```

---

## 8. Performance Monitoring & Optimization

### 8.1 Database Performance Monitoring

#### 8.1.1 Real-time Performance Dashboard
```sql
-- Performance monitoring views
CREATE VIEW vw_DatabasePerformanceMetrics AS
SELECT
    -- CPU metrics
    (SELECT cpu_count FROM sys.dm_os_sys_info) AS LogicalCPUs,
    (SELECT cpu_count / hyperthread_ratio FROM sys.dm_os_sys_info) AS PhysicalCPUs,

    -- Memory metrics
    (SELECT total_physical_memory_kb / 1024 FROM sys.dm_os_sys_info) AS TotalPhysicalMemoryMB,
    (SELECT available_physical_memory_kb / 1024 FROM sys.dm_os_sys_info) AS AvailablePhysicalMemoryMB,
    (SELECT committed_kb / 1024 FROM sys.dm_os_process_memory) AS SQLServerMemoryMB,

    -- Wait statistics
    (SELECT TOP 1 wait_type FROM sys.dm_os_wait_stats
     WHERE wait_type NOT IN ('CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE', 'SLEEP_TASK')
     ORDER BY wait_time_ms DESC) AS TopWaitType,

    -- Connection count
    (SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1) AS UserConnections,

    -- Database sizes
    (SELECT SUM(size * 8.0 / 1024) FROM sys.master_files WHERE type = 0) AS TotalDataSizeMB,
    (SELECT SUM(size * 8.0 / 1024) FROM sys.master_files WHERE type = 1) AS TotalLogSizeMB,

    -- Current timestamp
    GETUTCDATE() AS MetricTimestamp;

-- Query performance monitoring
CREATE VIEW vw_TopQueries AS
SELECT TOP 20
    qs.sql_handle,
    qs.execution_count,
    qs.total_worker_time / 1000 AS total_cpu_ms,
    qs.total_elapsed_time / 1000 AS total_elapsed_ms,
    qs.total_logical_reads,
    qs.total_logical_writes,
    qs.total_physical_reads,
    (qs.total_worker_time / qs.execution_count) / 1000 AS avg_cpu_ms,
    (qs.total_elapsed_time / qs.execution_count) / 1000 AS avg_elapsed_ms,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
    qs.creation_time,
    qs.last_execution_time,
    SUBSTRING(st.text,
        (qs.statement_start_offset/2) + 1,
        ((CASE statement_end_offset
          WHEN -1 THEN DATALENGTH(st.text)
          ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS query_text
FROM sys.dm_exec_query_stats AS qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
WHERE st.text NOT LIKE '%sys.dm_%'
ORDER BY qs.total_elapsed_time DESC;

-- Index usage monitoring
CREATE VIEW vw_IndexUsageStats AS
SELECT
    OBJECT_SCHEMA_NAME(i.object_id) AS schema_name,
    OBJECT_NAME(i.object_id) AS table_name,
    i.name AS index_name,
    i.type_desc AS index_type,
    ius.user_seeks,
    ius.user_scans,
    ius.user_lookups,
    ius.user_updates,
    ius.user_seeks + ius.user_scans + ius.user_lookups AS total_reads,
    ius.last_user_seek,
    ius.last_user_scan,
    ius.last_user_lookup,
    ius.last_user_update
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ius ON i.object_id = ius.object_id AND i.index_id = ius.index_id
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
    AND i.type_desc != 'HEAP'
ORDER BY total_reads DESC;
```

#### 8.1.2 Automated Performance Alerts
```csharp
public class DatabasePerformanceMonitor
{
    private readonly string _connectionString;
    private readonly ILogger<DatabasePerformanceMonitor> _logger;
    private readonly INotificationService _notificationService;
    private readonly Timer _monitoringTimer;

    public DatabasePerformanceMonitor(
        IConfiguration configuration,
        ILogger<DatabasePerformanceMonitor> logger,
        INotificationService notificationService)
    {
        _connectionString = configuration.GetConnectionString("Monitoring");
        _logger = logger;
        _notificationService = notificationService;

        // Run monitoring every 60 seconds
        _monitoringTimer = new Timer(RunPerformanceCheck, null, TimeSpan.Zero, TimeSpan.FromSeconds(60));
    }

    private async void RunPerformanceCheck(object state)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Check CPU usage
            var cpuUsage = await CheckCpuUsageAsync(connection);
            if (cpuUsage > 80)
            {
                await SendAlert(AlertType.HighCpu, $"CPU usage is {cpuUsage}%");
            }

            // Check memory usage
            var memoryUsage = await CheckMemoryUsageAsync(connection);
            if (memoryUsage > 90)
            {
                await SendAlert(AlertType.HighMemory, $"Memory usage is {memoryUsage}%");
            }

            // Check blocking processes
            var blockingProcesses = await CheckBlockingProcessesAsync(connection);
            if (blockingProcesses.Any())
            {
                await SendAlert(AlertType.BlockingProcesses,
                    $"Found {blockingProcesses.Count} blocking processes");
            }

            // Check long-running queries
            var longRunningQueries = await CheckLongRunningQueriesAsync(connection);
            if (longRunningQueries.Any())
            {
                await SendAlert(AlertType.LongRunningQueries,
                    $"Found {longRunningQueries.Count} queries running > 30 seconds");
            }

            // Check deadlocks
            var deadlockCount = await CheckDeadlocksAsync(connection);
            if (deadlockCount > 0)
            {
                await SendAlert(AlertType.Deadlocks,
                    $"Detected {deadlockCount} deadlocks in the last minute");
            }

            // Check disk space
            var diskSpaceIssues = await CheckDiskSpaceAsync(connection);
            if (diskSpaceIssues.Any())
            {
                await SendAlert(AlertType.LowDiskSpace,
                    string.Join(", ", diskSpaceIssues.Select(d => $"{d.Drive}: {d.FreeSpacePercent}%")));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Performance monitoring check failed");
        }
    }

    private async Task<double> CheckCpuUsageAsync(SqlConnection connection)
    {
        var query = @"
            SELECT TOP 1
                100 - AVG(record.value('(./Record/SchedulerMonitorEvent/SystemHealth/SystemIdle)[1]', 'int')) AS CPUUsage
            FROM (
                SELECT timestamp, CONVERT(xml, record) AS record
                FROM sys.dm_os_ring_buffers
                WHERE ring_buffer_type = N'RING_BUFFER_SCHEDULER_MONITOR'
                    AND record LIKE '%<SystemHealth>%'
                    AND timestamp > DATEADD(minute, -2, GETUTCDATE())
            ) AS x";

        return await connection.QueryFirstOrDefaultAsync<double>(query);
    }

    private async Task<double> CheckMemoryUsageAsync(SqlConnection connection)
    {
        var query = @"
            SELECT
                100.0 * (1.0 - CAST(available_physical_memory_kb AS FLOAT) / CAST(total_physical_memory_kb AS FLOAT)) AS MemoryUsagePercent
            FROM sys.dm_os_sys_info";

        return await connection.QueryFirstOrDefaultAsync<double>(query);
    }

    private async Task<List<BlockingProcess>> CheckBlockingProcessesAsync(SqlConnection connection)
    {
        var query = @"
            SELECT
                blocking_session_id AS BlockingSessionId,
                session_id AS BlockedSessionId,
                wait_time / 1000 AS WaitTimeSeconds,
                wait_type AS WaitType,
                wait_resource AS WaitResource
            FROM sys.dm_exec_requests
            WHERE blocking_session_id <> 0
                AND wait_time > 5000"; // Blocked for more than 5 seconds

        return (await connection.QueryAsync<BlockingProcess>(query)).ToList();
    }

    private async Task<List<LongRunningQuery>> CheckLongRunningQueriesAsync(SqlConnection connection)
    {
        var query = @"
            SELECT
                r.session_id AS SessionId,
                r.start_time AS StartTime,
                DATEDIFF(second, r.start_time, GETUTCDATE()) AS DurationSeconds,
                r.cpu_time AS CpuTimeMs,
                r.logical_reads AS LogicalReads,
                SUBSTRING(st.text, (r.statement_start_offset/2)+1,
                    ((CASE r.statement_end_offset
                        WHEN -1 THEN DATALENGTH(st.text)
                        ELSE r.statement_end_offset
                    END - r.statement_start_offset)/2) + 1) AS QueryText
            FROM sys.dm_exec_requests r
            CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
            WHERE r.session_id > 50
                AND DATEDIFF(second, r.start_time, GETUTCDATE()) > 30"; // Running for more than 30 seconds

        return (await connection.QueryAsync<LongRunningQuery>(query)).ToList();
    }

    private async Task SendAlert(AlertType alertType, string message)
    {
        var alert = new PerformanceAlert
        {
            AlertType = alertType,
            Message = message,
            Timestamp = DateTime.UtcNow,
            Severity = GetSeverity(alertType)
        };

        _logger.LogWarning("Performance alert: {AlertType} - {Message}", alertType, message);

        // Send to notification service
        await _notificationService.SendAlertAsync(alert);

        // Store in database for trending
        await StoreAlertAsync(alert);
    }

    private AlertSeverity GetSeverity(AlertType alertType)
    {
        return alertType switch
        {
            AlertType.HighCpu => AlertSeverity.High,
            AlertType.HighMemory => AlertSeverity.High,
            AlertType.BlockingProcesses => AlertSeverity.Medium,
            AlertType.LongRunningQueries => AlertSeverity.Medium,
            AlertType.Deadlocks => AlertSeverity.High,
            AlertType.LowDiskSpace => AlertSeverity.Critical,
            _ => AlertSeverity.Low
        };
    }
}
```

### 8.2 Capacity Planning

#### 8.2.1 Growth Projection Models
```csharp
public class CapacityPlanningService
{
    private readonly ILogger<CapacityPlanningService> _logger;
    private readonly string _connectionString;

    public async Task<CapacityForecast> GenerateCapacityForecastAsync(int monthsAhead = 12)
    {
        var historicalData = await GetHistoricalGrowthDataAsync();
        var currentMetrics = await GetCurrentCapacityMetricsAsync();

        var forecast = new CapacityForecast
        {
            GeneratedAt = DateTime.UtcNow,
            ForecastPeriodMonths = monthsAhead,
            CurrentMetrics = currentMetrics
        };

        // Database storage growth
        var storageGrowthRate = CalculateGrowthRate(historicalData.StorageUsage);
        forecast.DatabaseStorageProjection = ProjectGrowth(
            currentMetrics.DatabaseStorageMB,
            storageGrowthRate,
            monthsAhead);

        // Document count growth
        var documentGrowthRate = CalculateGrowthRate(historicalData.DocumentCounts);
        forecast.DocumentCountProjection = ProjectGrowth(
            currentMetrics.TotalDocuments,
            documentGrowthRate,
            monthsAhead);

        // User growth
        var userGrowthRate = CalculateGrowthRate(historicalData.UserCounts);
        forecast.UserCountProjection = ProjectGrowth(
            currentMetrics.ActiveUsers,
            userGrowthRate,
            monthsAhead);

        // Object storage growth
        var objectStorageGrowthRate = CalculateGrowthRate(historicalData.ObjectStorageUsage);
        forecast.ObjectStorageProjection = ProjectGrowth(
            currentMetrics.ObjectStorageGB,
            objectStorageGrowthRate,
            monthsAhead);

        // CPU and memory utilization trends
        forecast.CpuUtilizationTrend = AnalyzeTrend(historicalData.CpuUtilization);
        forecast.MemoryUtilizationTrend = AnalyzeTrend(historicalData.MemoryUtilization);

        // Generate recommendations
        forecast.Recommendations = GenerateRecommendations(forecast);

        return forecast;
    }

    private async Task<HistoricalGrowthData> GetHistoricalGrowthDataAsync()
    {
        using var connection = new SqlConnection(_connectionString);

        // Get monthly storage usage for last 24 months
        var storageUsage = await connection.QueryAsync<MonthlyMetric>(@"
            WITH MonthlyStorage AS (
                SELECT
                    YEAR(backup_start_date) AS Year,
                    MONTH(backup_start_date) AS Month,
                    AVG(backup_size / 1024.0 / 1024) AS AvgSizeMB
                FROM msdb.dbo.backupset
                WHERE type = 'D' AND backup_start_date >= DATEADD(month, -24, GETDATE())
                GROUP BY YEAR(backup_start_date), MONTH(backup_start_date)
            )
            SELECT Year, Month, AvgSizeMB AS Value
            FROM MonthlyStorage
            ORDER BY Year, Month
        ");

        // Get monthly document counts
        var documentCounts = await connection.QueryAsync<MonthlyMetric>(@"
            SELECT
                YEAR(SubmissionDate) AS Year,
                MONTH(SubmissionDate) AS Month,
                COUNT(*) AS Value
            FROM Documents
            WHERE SubmissionDate >= DATEADD(month, -24, GETDATE())
            GROUP BY YEAR(SubmissionDate), MONTH(SubmissionDate)
            ORDER BY Year, Month
        ");

        // Get monthly active user counts
        var userCounts = await connection.QueryAsync<MonthlyMetric>(@"
            SELECT
                YEAR(LastLoginDate) AS Year,
                MONTH(LastLoginDate) AS Month,
                COUNT(DISTINCT UserId) AS Value
            FROM UserSessions
            WHERE LastLoginDate >= DATEADD(month, -24, GETDATE())
            GROUP BY YEAR(LastLoginDate), MONTH(LastLoginDate)
            ORDER BY Year, Month
        ");

        return new HistoricalGrowthData
        {
            StorageUsage = storageUsage.ToList(),
            DocumentCounts = documentCounts.ToList(),
            UserCounts = userCounts.ToList(),
            // Additional metrics would be populated from monitoring database
        };
    }

    private double CalculateGrowthRate(List<MonthlyMetric> data)
    {
        if (data.Count < 2) return 0;

        // Calculate compound monthly growth rate
        var firstValue = data.First().Value;
        var lastValue = data.Last().Value;
        var months = data.Count - 1;

        if (firstValue <= 0) return 0;

        return Math.Pow(lastValue / firstValue, 1.0 / months) - 1.0;
    }

    private List<ProjectedValue> ProjectGrowth(double currentValue, double monthlyGrowthRate, int months)
    {
        var projections = new List<ProjectedValue>();
        var value = currentValue;

        for (int i = 1; i <= months; i++)
        {
            value *= (1 + monthlyGrowthRate);
            projections.Add(new ProjectedValue
            {
                Month = DateTime.UtcNow.AddMonths(i),
                Value = value,
                ConfidenceLevel = CalculateConfidenceLevel(i) // Decreases over time
            });
        }

        return projections;
    }

    private double CalculateConfidenceLevel(int monthsOut)
    {
        // Confidence decreases as we project further out
        return Math.Max(0.5, 0.95 - (monthsOut * 0.05));
    }

    private List<CapacityRecommendation> GenerateRecommendations(CapacityForecast forecast)
    {
        var recommendations = new List<CapacityRecommendation>();

        // Database storage recommendations
        var storageIn12Months = forecast.DatabaseStorageProjection.LastOrDefault()?.Value ?? 0;
        if (storageIn12Months > forecast.CurrentMetrics.DatabaseStorageMB * 2)
        {
            recommendations.Add(new CapacityRecommendation
            {
                Category = "Database Storage",
                Priority = RecommendationPriority.High,
                Description = "Database storage is projected to double within 12 months",
                Action = "Plan for storage expansion or implement data archiving strategy",
                TimeFrame = "3-6 months"
            });
        }

        // Object storage recommendations
        var objectStorageIn12Months = forecast.ObjectStorageProjection.LastOrDefault()?.Value ?? 0;
        if (objectStorageIn12Months > 400) // 400GB threshold
        {
            recommendations.Add(new CapacityRecommendation
            {
                Category = "Object Storage",
                Priority = RecommendationPriority.Medium,
                Description = "Object storage will exceed 400GB within 12 months",
                Action = "Consider implementing storage lifecycle policies or compression",
                TimeFrame = "6-9 months"
            });
        }

        // Performance recommendations
        if (forecast.CpuUtilizationTrend.Slope > 0.05) // Increasing by 5% per month
        {
            recommendations.Add(new CapacityRecommendation
            {
                Category = "CPU Performance",
                Priority = RecommendationPriority.Medium,
                Description = "CPU utilization trend is increasing significantly",
                Action = "Monitor query performance and consider scaling up or optimizing queries",
                TimeFrame = "2-4 months"
            });
        }

        return recommendations;
    }
}
```

---

## 9. Success Metrics & KPIs

### 9.1 Technical Performance KPIs

| Metric Category | KPI | Target | Current | Measurement Method |
|-----------------|-----|--------|---------|-------------------|
| **Database Performance** | Query response time | <20ms average | TBD | Query execution time monitoring |
| **Storage Performance** | IOPS | >10,000 IOPS | TBD | Disk performance counters |
| **Availability** | Database uptime | 99.9% | TBD | Always On monitoring |
| **Backup Success** | Backup completion rate | 100% | TBD | Backup job monitoring |
| **Recovery Testing** | RTO achievement | <1 hour | TBD | DR test results |
| **Data Integrity** | Checksum failures | 0 | TBD | DBCC checks |

### 9.2 Capacity & Scalability KPIs

| Metric | Current | Target (Year 1) | Target (Year 3) |
|--------|---------|------------------|-----------------|
| **Concurrent Users** | 21,000 | 25,000 | 40,000 |
| **Documents/Month** | 800,000 | 1,000,000 | 2,000,000 |
| **Database Size** | 20TB | 30TB | 50TB |
| **Object Storage** | 200TB | 300TB | 500TB |
| **Query Throughput** | 50,000 qps | 75,000 qps | 150,000 qps |

### 9.3 Operational KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Backup Window** | <4 hours | Backup duration monitoring |
| **Recovery Time** | <1 hour | DR test measurements |
| **Data Loss** | <15 minutes | RPO monitoring |
| **Maintenance Window** | <2 hours monthly | Scheduled maintenance tracking |
| **Alert Response Time** | <5 minutes | Incident response metrics |

---

## 10. References

- **Parent Document:** [Main PRD](../PRD.MD) - Sections 3, 4.2, 4.3
- **SQL Server Documentation:** Always On Availability Groups, Query Store
- **Redis Documentation:** Enterprise clustering, modules
- **MinIO Documentation:** Erasure coding, lifecycle management
- **Elasticsearch Documentation:** Index lifecycle management, cluster configuration

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** 20/12/2024
- **Next Review:** 27/12/2024
- **Approval Required:** Database Architect, Infrastructure Lead, Security Officer