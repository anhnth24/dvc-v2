# DVC v2 Database Design Documentation

## Overview

This directory contains the complete database design specification for the DVC v2 TTHC (Administrative Procedures) Management System. The design is based on a modular monolith architecture using schemas to create clear service boundaries for future microservices migration.

## File Organization

### Core Documentation
- **[00-overview-and-principles.md](./00-overview-and-principles.md)** - Database overview, design principles, and architecture strategy
- **[01-schema-usage-guide.md](./01-schema-usage-guide.md)** - Schema usage guidelines, access patterns, and naming conventions
- **[02-schema-ownership-map.md](./02-schema-ownership-map.md)** - Detailed schema ownership mapping and responsibilities

### Schema-Specific Documentation

#### Service Schemas
- **[03.1-identity-schema.md](./03.1-identity-schema.md)** - Identity & Access Management (users, roles, permissions, RBAC)
- **[03.2-organization-schema.md](./03.2-organization-schema.md)** - Organization structure and administrative units
- **[03.3-tthc-schema.md](./03.3-tthc-schema.md)** - Administrative procedures catalog and definitions
- **[03.4-workflow-schema.md](./03.4-workflow-schema.md)** - Workflow management and process definitions
- **[03.5-case-schema.md](./03.5-case-schema.md)** - Application processing and case management
- **[03.6-document-schema.md](./03.6-document-schema.md)** - Document management and file storage
- **[03.7-payment-schema.md](./03.7-payment-schema.md)** - Payment processing and transactions
- **[03.8-notification-schema.md](./03.8-notification-schema.md)** - Notification system (queue-based)

#### Cross-Cutting Schemas
- **[03.9-lookup-schema.md](./03.9-lookup-schema.md)** - Shared master data and lookup tables
- **[03.10-audit-schema.md](./03.10-audit-schema.md)** - Audit trail and logging system
- **[03.11-system-schema.md](./03.11-system-schema.md)** - System configuration and multi-tenancy

## Architecture Highlights

### Modular Monolith Design
- **Clear Boundaries**: Each schema represents a bounded context
- **Future-Proof**: Easy migration to microservices architecture
- **Loose Coupling**: Minimal cross-schema dependencies
- **Shared Infrastructure**: Common concerns handled centrally

### Key Design Principles
1. **Normalized Structure** - Avoid data duplication, clear relationships
2. **Audit Trail** - Complete change tracking for compliance
3. **Soft Delete** - Preserve critical data integrity
4. **Performance** - Optimized indexes for common queries
5. **Scalability** - Support for partitioning and archiving
6. **Multi-tenant Ready** - Built-in tenant isolation
7. **JSON Support** - Leverage SQL Server 2019 capabilities
8. **Cross-Schema FK Exception** - Lookup tables accessible across schemas

### Technology Stack
- **SQL Server 2019** - Advanced JSON support and performance
- **.NET 8** - Modern ORM with Entity Framework Core
- **Microservices Ready** - Schema-based separation
- **Multi-tenant** - Database-level tenant isolation

## Quick Navigation

### By Functionality
- **User Management**: [Identity Schema](./03.1-identity-schema.md)
- **Administrative Structure**: [Organization Schema](./03.2-organization-schema.md)
- **Procedure Definitions**: [TTHC Schema](./03.3-tthc-schema.md)
- **Process Management**: [Workflow Schema](./03.4-workflow-schema.md)
- **Application Processing**: [Case Schema](./03.5-case-schema.md)
- **File Management**: [Document Schema](./03.6-document-schema.md)
- **Payment Processing**: [Payment Schema](./03.7-payment-schema.md)
- **Reference Data**: [Lookup Schema](./03.9-lookup-schema.md)

### By Development Phase
1. **Planning Phase**: Start with [Overview](./00-overview-and-principles.md) and [Usage Guide](./01-schema-usage-guide.md)
2. **Design Phase**: Review [Ownership Map](./02-schema-ownership-map.md) and individual schemas
3. **Implementation Phase**: Use schema-specific files for detailed table structures
4. **Migration Phase**: Follow deployment guidelines in overview document

## Schema Dependencies

### Core Dependencies
```
[lookup] ← All other schemas (read-only)
[audit] ← All other schemas (write-only for audit)
[system] ← All other schemas (read-only for config)
```

### Service Dependencies
```
[identity] → [lookup]
[organization] → [lookup]
[tthc] → [lookup], [organization] (via views)
[workflow] → [identity], [lookup]
[case] → [tthc], [organization], [workflow], [identity] (via views)
[document] → [case], [tthc] (via views)
[payment] → [case] (via views)
[notification] → [case], [identity] (via events)
```

## Implementation Guidelines

### Development Order
1. **Infrastructure Schemas**: `[lookup]`, `[audit]`, `[system]`
2. **Core Service Schemas**: `[identity]`, `[organization]`
3. **Business Logic Schemas**: `[tthc]`, `[workflow]`
4. **Process Schemas**: `[case]`, `[document]`, `[payment]`
5. **Communication Schema**: `[notification]`

### Cross-Schema Access Rules
- **Direct Access**: Only to owned schema tables
- **Lookup Access**: Read-only to `[lookup]` schema
- **Cross-Schema Views**: Use provider-owned read-only views
- **Event-Driven**: For complex cross-schema operations
- **API Calls**: For future microservices migration

### Performance Considerations
- Comprehensive indexing on all schemas
- Partitioning strategy for high-volume tables
- Optimized for Vietnamese government workloads (800k docs/month)
- Support for 21,000 concurrent users

## Compliance and Security

### Audit Requirements
- Complete audit trail via `[audit]` schema
- Change tracking for all critical operations
- Compliance with Vietnamese government regulations
- Forensic analysis capabilities

### Security Features
- Multi-tenant data isolation
- Role-based access control (RBAC)
- Row-level security (RLS) policies
- Digital signature integration
- USB token support for government PKI

### Data Protection
- Soft delete for critical data
- Backup and recovery procedures
- Data archiving strategies
- Privacy compliance features

## Contributing

When modifying the database design:

1. **Follow Naming Conventions**: Use established patterns from [Usage Guide](./01-schema-usage-guide.md)
2. **Update Documentation**: Keep schema files synchronized with changes
3. **Consider Impact**: Review [Ownership Map](./02-schema-ownership-map.md) for dependencies
4. **Test Migrations**: Validate changes against existing data
5. **Review Performance**: Ensure indexes and partitioning remain optimal

## Support

For questions about the database design:
- Review the appropriate schema documentation file
- Check the [Usage Guide](./01-schema-usage-guide.md) for patterns
- Consult the [Ownership Map](./02-schema-ownership-map.md) for responsibilities
- Follow the architectural principles in [Overview](./00-overview-and-principles.md)