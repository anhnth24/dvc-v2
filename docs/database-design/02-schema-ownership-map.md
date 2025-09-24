# SCHEMA OWNERSHIP MAP

## OVERVIEW

This document defines the clear ownership boundaries for each schema in the DVC v2 database. Each schema represents a bounded context that can be extracted into a separate microservice in the future.

## DETAILED SCHEMA OWNERSHIP

### [identity] Schema - Identity & Access Management Service

**Primary Responsibility**: User authentication, authorization, and session management

**Owned Tables**:
- `USER_PROFILE` - Core user information and authentication
- `USER_SESSIONS` - Active user sessions tracking
- `USER_LOGIN_HISTORY` - Login audit trail
- `ROLE` - System roles definition
- `PERMISSION` - System permissions catalog
- `ROLE_PERMISSION` - Role-to-permission mapping
- `USER_ROLE` - User-to-role assignments
- `ROLE_HIERARCHY` - Hierarchical role relationships

**Key Responsibilities**:
- User authentication and password management
- Role-based access control (RBAC)
- Session management and security
- User profile management
- Two-factor authentication

### [organization] Schema - Organization Management Service

**Primary Responsibility**: Organizational structure and administrative unit management

**Owned Tables**:
- `DM_DONVI` - Administrative units/organizations
- `DM_DONVI_LINHVUC` - Organization domain/field mapping

**Key Responsibilities**:
- Administrative unit hierarchy
- Organization metadata management
- Territorial and administrative boundaries
- Organization-to-domain mapping

### [tthc] Schema - Administrative Procedures Catalog Service

**Primary Responsibility**: TTHC (Thủ tục hành chính) catalog and procedure definitions

**Owned Tables**:
- `DM_QG_THUTUCHANHCHINH` - Core administrative procedures catalog
- `DM_QG_THUTUCHANHCHINH_COQUANTHUCHIEN` - Implementing organizations
- `DM_QG_THUTUCHANHCHINH_CAPTHUCHIEN` - Implementation levels
- `DM_QG_THUTUCHANHCHINH_LINHVUC` - Procedure domains/fields
- `DM_QG_THUTUCHANHCHINH_DOITUONG` - Target audience/objects
- `DM_QG_THUTUCHANHCHINH_CACHTHUC` - Implementation methods
- `DM_QG_THUTUCHANHCHINH_THOIGIAN_PHILEPHI` - Processing time and fees
- `DM_QG_THUTUCHANHCHINH_KETQUA` - Expected results/outcomes
- `DM_QG_THUTUCHANHCHINH_CANCUPHAPLY` - Legal basis/regulations
- `DM_QG_THUTUCHANHCHINH_TRINHTUTHUCHIEN` - Implementation procedures

**Key Responsibilities**:
- Administrative procedure catalog management
- Procedure classification and categorization
- Legal compliance and regulation mapping
- Fee and processing time definitions
- Implementation method specifications

### [workflow] Schema - Workflow Management Service

**Primary Responsibility**: Business process and workflow engine management

**Owned Tables**:
- `DM_WORKFLOW` - Workflow definitions and metadata
- `DM_WORKFLOW_STEP` - Individual workflow step definitions

**Key Responsibilities**:
- Workflow definition and versioning
- Process step configuration
- Business rule enforcement
- Workflow state management
- Process automation logic

### [case] Schema - Application Processing Service

**Primary Responsibility**: Application case management and processing lifecycle

**Owned Tables**:
- `HOSO` - Application cases/dossiers
- `QUATRINHXULY` - Processing history and status tracking
- `HOSOBOSUNG` - Supplementary documents and amendments
- `HOSOKHONGGIAIQUYET` - Unresolved/rejected cases

**Key Responsibilities**:
- Application lifecycle management
- Case status tracking and updates
- Processing history maintenance
- Document requirement management
- Case resolution and closure

### [document] Schema - Document Management Service

**Primary Responsibility**: File and document storage, processing, and versioning

**Owned Tables**:
- `FILEKEMTHEOHOSO` - Files attached to applications
- `FILEXULYHOSO` - Processing-related documents
- `FILEKETQUA` - Result/output documents

**Key Responsibilities**:
- Document storage and retrieval
- File versioning and metadata
- Document processing workflows
- Digital signature integration
- File security and access control

### [payment] Schema - Payment Processing Service

**Primary Responsibility**: Fee collection and payment transaction management

**Owned Tables**:
- `PHILEPHI_GIAODICH` - Payment transactions and fee records

**Key Responsibilities**:
- Fee calculation and collection
- Payment method integration
- Transaction tracking and reconciliation
- Revenue reporting and analytics
- Refund and adjustment processing

### [notification] Schema - Notification Service

**Primary Responsibility**: Multi-channel notification and communication management

**Owned Tables**:
- (To be defined based on notification requirements)
- Potential tables: `NOTIFICATION_QUEUE`, `NOTIFICATION_HISTORY`, `NOTIFICATION_TEMPLATES`, `NOTIFICATION_PREFERENCES`

**Key Responsibilities**:
- Email notification delivery
- SMS notification management
- In-app notification system
- Notification templates and personalization
- Delivery status tracking

### [lookup] Schema - Shared Master Data (Cross-Cutting Concern)

**Primary Responsibility**: System-wide reference data and lookup tables

**Owned Tables**:
- `DM_QG_TINHTRANG` - Status/state master data
- `DM_QG_GIOITINH` - Gender lookup
- `DM_QG_LINHVUC` - Domain/field categories
- `DM_CAPTHUCHIEN` - Implementation levels
- `DM_KENH` - Communication channels
- `DM_HINHTHUCTHANHTOAN` - Payment methods
- `DM_NGUONHOSO` - Application source types
- `DM_TCTK_*` - Statistical and reporting lookup tables

**Key Responsibilities**:
- System-wide reference data
- Standardized lookup values
- Data consistency across services
- Master data governance
- Centralized value validation

**Access Pattern**: Read-only access from all services

### [audit] Schema - Audit and Logging Service (Cross-Cutting Concern)

**Primary Responsibility**: System-wide audit trail and compliance logging

**Owned Tables**:
- `SYS_AUDIT_LOG` - System audit trail
- Append-only audit tables for compliance
- Change tracking and history tables

**Key Responsibilities**:
- Audit trail maintenance
- Compliance logging
- Change detection and tracking
- Security event logging
- Forensic analysis support

**Access Pattern**: Write-only from all services, read access for audit/compliance

### [system] Schema - System Configuration Service (Cross-Cutting Concern)

**Primary Responsibility**: Multi-tenancy, configuration, and system-wide settings

**Owned Tables**:
- Tenant configuration tables
- System feature flags
- Environment-specific configurations
- Global system settings

**Key Responsibilities**:
- Multi-tenant data isolation
- Feature flag management
- System configuration
- Environment settings
- Global parameter management

**Access Pattern**: Read-only from all services

## CROSS-SCHEMA DEPENDENCIES

### Allowed Dependencies

1. **Any schema → [lookup] schema**: Read-only access to master data
2. **Any schema → [audit] schema**: Write-only for audit logging
3. **Any schema → [system] schema**: Read-only for configuration

### Forbidden Dependencies

1. **Direct foreign keys across service schemas** (except to lookup)
2. **Direct writes to other service schemas**
3. **Direct queries to other service schemas** (use views or APIs)

### Recommended Integration Patterns

1. **Cross-schema views**: Owner schema provides read-only views
2. **Event-driven updates**: Services publish events for data changes
3. **API-based integration**: Services expose APIs for data access
4. **Read model replication**: Services maintain local copies of needed data

## MICROSERVICES MIGRATION READINESS

### High Migration Priority (Loosely Coupled)
- `[identity]` - Self-contained user management
- `[notification]` - Independent communication service
- `[payment]` - Isolated transaction processing

### Medium Migration Priority (Some Dependencies)
- `[document]` - Depends on case management
- `[workflow]` - Integrated with multiple services
- `[organization]` - Referenced by many services

### Low Migration Priority (Highly Integrated)
- `[case]` - Central to business process
- `[tthc]` - Core domain model
- `[lookup]` - Shared by all services

### Infrastructure Services (Last to Migrate)
- `[audit]` - Cross-cutting concern
- `[system]` - Foundation service

## GOVERNANCE AND MAINTENANCE

### Schema Owner Responsibilities

1. **Data Integrity**: Maintain data quality within owned schema
2. **API Design**: Design stable APIs for cross-service access
3. **Performance**: Optimize queries and indexes for owned tables
4. **Security**: Implement proper access controls and data protection
5. **Documentation**: Maintain schema documentation and change logs
6. **Backwards Compatibility**: Ensure API changes don't break consumers

### Change Management Process

1. **Schema Changes**: Must be reviewed by schema owner and affected consumers
2. **Cross-Schema Views**: Changes require consumer notification
3. **API Changes**: Follow versioning and deprecation policies
4. **Migration Planning**: Coordinate with other schema owners for dependencies

### Monitoring and Alerting

- Monitor cross-schema view performance
- Track API usage and errors
- Measure data consistency across schemas
- Alert on schema boundary violations