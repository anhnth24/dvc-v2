# DATABASE DESIGN SPECIFICATION - DVC v2 TTHC MANAGEMENT SYSTEM

## OVERVIEW

Thiết kế database hoàn chỉnh cho hệ thống quản lý Thủ tục Hành chính (TTHC) của DVC v2, dựa trên kiến trúc microservices với .NET 8, Entity Framework Core, và SQL Server 2019.

## DESIGN PRINCIPLES

1. **Normalized Structure**: Tránh duplicate data, relationships rõ ràng
2. **Audit Trail**: Mọi thay đổi đều được tracking
3. **Soft Delete**: Không xóa vật lý data quan trọng
4. **Performance**: Indexes tối ưu cho queries thường dùng
5. **Scalability**: Support partitioning và archiving
6. **JSON Support**: Tận dụng SQL Server 2019 JSON capabilities
7. **Multi-tenant Ready**: Support cho nhiều đơn vị/tỉnh thành
8. **Cross-Schema FK Exception**: Foreign keys to `[lookup]` schema are intentionally allowed as an exception to microservices isolation because lookup tables contain stable master data. In production microservices, validation should be performed via Lookup Service API calls instead of database constraints. Example: `FK_USER_GioiTinh` references `[lookup].DM_QG_GIOITINH(GioiTinhID)`

## ARCHITECTURE OVERVIEW

### Modular Monolith to Microservices Strategy

The database is designed as a modular monolith using schemas to create clear service boundaries. Each schema represents a bounded context that can be extracted into a separate microservice in the future:

- **identity**: User management and authentication
- **organization**: Organizational structure and units
- **tthc**: Administrative procedures catalog
- **workflow**: Workflow engine and definitions
- **case**: Application processing and case management
- **document**: Document storage and management
- **payment**: Payment processing and transactions
- **notification**: Notification system
- **lookup**: Shared master data (cross-cutting concern)
- **audit**: Audit trail and logging (cross-cutting concern)
- **system**: System configuration and multi-tenancy (cross-cutting concern)

### Key Architectural Benefits

1. **Clear Boundaries**: Each schema has well-defined responsibilities
2. **Future-Proof**: Easy migration to microservices architecture
3. **Loose Coupling**: Minimal cross-schema dependencies
4. **Shared Infrastructure**: Common concerns handled centrally
5. **Performance**: Single database benefits during monolith phase
6. **Governance**: Clear ownership and data access patterns

### Technology Stack Alignment

- **SQL Server 2019**: Advanced JSON support, performance optimization
- **.NET 8**: Modern ORM capabilities with Entity Framework Core
- **Microservices Ready**: Schema-based separation for future extraction
- **Multi-tenant**: Built-in tenant isolation at the database level

## FILE ORGANIZATION

This database design is broken down into the following files for better maintainability:

- `00-overview-and-principles.md` - This file: Overview and design principles
- `01-schema-usage-guide.md` - Schema usage guidelines and patterns
- `02-schema-ownership-map.md` - Detailed schema ownership mapping
- `03.1-identity-schema.md` - Identity and user management tables
- `03.2-organization-schema.md` - Organization structure tables
- `03.3-tthc-schema.md` - Administrative procedures catalog
- `03.4-workflow-schema.md` - Workflow management system
- `03.5-case-schema.md` - Application processing system
- `03.6-document-schema.md` - Document management system
- `03.7-payment-schema.md` - Payment processing system
- `03.8-notification-schema.md` - Notification system
- `03.9-lookup-schema.md` - Shared master data tables
- `03.10-audit-schema.md` - Audit and logging system
- `03.11-system-schema.md` - System configuration and multi-tenancy

## NEXT STEPS

1. Review the schema usage guide (`01-schema-usage-guide.md`)
2. Understand ownership mapping (`02-schema-ownership-map.md`)
3. Examine individual schema designs (files `03.x-*.md`)
4. Implement following the deployment sequence and migration strategy