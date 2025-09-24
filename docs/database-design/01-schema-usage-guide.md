# SCHEMA USAGE GUIDELINES

## SERVICE BOUNDARY SCHEMAS

```sql
-- Create logical service boundaries using schemas for future microservices migration
-- This provides clear separation while maintaining single database benefits

-- Identity & Access Management
CREATE SCHEMA [identity];
GO

-- Organization Management
CREATE SCHEMA [organization];
GO

-- TTHC (Administrative Procedures) Catalog
CREATE SCHEMA [tthc];
GO

-- Workflow Management
CREATE SCHEMA [workflow];
GO

-- Case/Application Processing
CREATE SCHEMA [case];
GO

-- Document Management
CREATE SCHEMA [document];
GO

-- Payment
CREATE SCHEMA [payment];
GO

-- Notification
CREATE SCHEMA [notification];
GO

-- Shared/Common schemas
CREATE SCHEMA [lookup];   -- Master data tables
GO
CREATE SCHEMA [audit];    -- Audit and logging
GO
CREATE SCHEMA [system];   -- System configuration and multi-tenant management
GO
```

## SCHEMA ORGANIZATION PRINCIPLES

```sql
-- Tables will be organized by service domain (schema-per-bounded-context):
-- [identity].USER_PROFILE           - Identity & users
-- [organization].DM_DONVI           - Organization units
-- [tthc].DM_QG_THUTUCHANHCHINH      - Administrative procedures catalog
-- [workflow].DM_WORKFLOW            - Workflow definitions
-- [case].HOSO                       - Application cases
-- [document].FILE_STORAGE           - Document storage
-- [payment].PHILEPHI_GIAODICH       - Payment transactions
-- [lookup].DM_QG_TINHTRANG          - Shared lookups
-- [audit].SYS_AUDIT_LOG             - Audit trail

-- Cross-schema access rules:
-- 1. Services access ONLY their own schema directly.
-- 2. NO DIRECT FOREIGN KEYS across schemas (loose coupling for microservices).
-- 3. Cross-schema reads via provider-owned, read-only views or API-backed projections.
-- 4. Shared lookups accessible read-only via [lookup] schema.
-- 5. Audit logging centralized in [audit] schema.

-- Example cross-schema view for [tthc] service accessing organization data:
CREATE VIEW [tthc].v_DonViInfo
AS
SELECT
    DonViID,
    TenDonVi,
    CapDonVi,
    TenantID
FROM
    [organization].DM_DONVI
WHERE
    IsActive = 1;
GO

-- Future microservices migration:
-- • Each schema can become a separate database.
-- • Views become API calls or replicated read models (event-driven).
-- • No cross-DB foreign keys; eventual consistency via outbox/inbox patterns.
```

## CROSS-SCHEMA ACCESS PATTERNS

### 1. Direct Schema Access (Current Pattern)
**Allowed**: Only within the same bounded context
```sql
-- ✅ GOOD: Service accessing its own schema
SELECT * FROM [identity].USER_PROFILE WHERE UserID = @userId;

-- ❌ BAD: Service accessing another service's schema directly
SELECT * FROM [organization].DM_DONVI WHERE DonViID = @donViId;
```

### 2. Lookup Schema Access (Exception)
**Allowed**: Read-only access to shared master data
```sql
-- ✅ GOOD: Any service can read lookup data
SELECT * FROM [lookup].DM_QG_GIOITINH WHERE GioiTinhID = @gioiTinhId;

-- ✅ GOOD: Foreign keys to lookup tables are allowed
CONSTRAINT FK_USER_GioiTinh
    FOREIGN KEY (GioiTinhID)
    REFERENCES [lookup].DM_QG_GIOITINH(GioiTinhID)
```

### 3. Cross-Schema Views (Recommended Pattern)
**Pattern**: Owner schema provides read-only views for other services
```sql
-- Provider creates view in consumer's schema
CREATE VIEW [case].v_UserInfo
AS
SELECT
    UserID,
    HoVaTen,
    Email,
    IsActive
FROM
    [identity].USER_PROFILE
WHERE
    IsActive = 1
    AND DeletedAt IS NULL;
GO

-- Consumer uses the view
SELECT * FROM [case].v_UserInfo WHERE UserID = @userId;
```

### 4. Event-Driven Integration (Future Pattern)
**Pattern**: Services communicate via events and maintain their own read models
```sql
-- Future microservices pattern
-- When user is updated in identity service:
-- 1. Identity service publishes UserUpdated event
-- 2. Case service receives event
-- 3. Case service updates its local read model

-- Case service maintains its own copy
CREATE TABLE [case].UserReadModel (
    UserID BIGINT PRIMARY KEY,
    HoVaTen NVARCHAR(255),
    Email NVARCHAR(255),
    LastUpdated DATETIME2,
    Version BIGINT
);
```

## NAMING CONVENTIONS

### Schema Naming
- Use lowercase for schema names
- Single word or hyphenated (avoid underscores)
- Examples: `identity`, `organization`, `case`, `workflow`

### Table Naming
- Use descriptive names in Vietnamese or English
- Prefix with `DM_` for master data (Danh Mục)
- Use `_` for word separation in table names
- Examples: `USER_PROFILE`, `DM_DONVI`, `HOSO`

### Cross-Schema View Naming
- Prefix with `v_` for views
- Use descriptive names indicating the source
- Examples: `v_UserInfo`, `v_DonViInfo`, `v_WorkflowDefinition`

## SECURITY AND ACCESS CONTROL

### Schema-Level Security
```sql
-- Create schema-specific database users
CREATE USER [IdentityService] WITHOUT LOGIN;
CREATE USER [CaseService] WITHOUT LOGIN;
CREATE USER [WorkflowService] WITHOUT LOGIN;

-- Grant schema permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[identity] TO [IdentityService];
GRANT SELECT ON SCHEMA::[lookup] TO [IdentityService];
GRANT SELECT ON SCHEMA::[case] TO [CaseService];
GRANT SELECT ON SCHEMA::[lookup] TO [CaseService];
```

### Application-Level Security
- Use schema-specific connection strings for each service
- Implement role-based access at the application level
- Audit all cross-schema access through views

## MIGRATION STRATEGY

### Phase 1: Modular Monolith (Current)
- Single database with schema separation
- Direct cross-schema views where needed
- Shared lookup tables with foreign key constraints

### Phase 2: Preparation for Microservices
- Replace cross-schema views with API calls
- Implement event-driven communication patterns
- Create read models for cross-service data

### Phase 3: Microservices Extraction
- Extract each schema to separate database
- Remove cross-database foreign keys
- Implement eventual consistency patterns

## DEVELOPMENT GUIDELINES

### Do's ✅
- Access only your service's schema directly
- Use provided cross-schema views for reading other service data
- Reference lookup tables for master data
- Implement proper error handling for cross-service calls
- Design for eventual consistency

### Don'ts ❌
- Create direct foreign keys across service schemas
- Query other services' schemas directly
- Modify data in other services' schemas
- Assume immediate consistency across services
- Bypass schema boundaries for performance shortcuts

## PERFORMANCE CONSIDERATIONS

### Indexing Strategy
- Each schema maintains its own indexes
- Cross-schema views should have appropriate underlying indexes
- Monitor view performance regularly

### Caching Strategy
- Cache lookup data at application level
- Use Redis for cross-service data caching
- Implement cache invalidation strategies

### Query Optimization
- Minimize cross-schema joins in views
- Use projection to limit data transfer
- Implement pagination for large result sets