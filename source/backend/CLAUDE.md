# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DVC v2 Backend is a .NET 8 microservices architecture for a Vietnamese government administrative procedures system. It handles 800,000 documents/month with 21,000 concurrent civil servants through 4 core services: User Service (authentication/RBAC), Workflow Service (Elsa engine), Document Service (processing/digital signature), and Notification Service.

## Architecture

### Core Services (Clean Architecture Pattern)
- **API Gateway**: YARP for routing, load balancing, rate limiting
- **User Service**: Authentication, RBAC, delegation, audit trail
- **Workflow Service**: Elsa 3.0 engine with BPMN 2.0 support
- **Document Service**: File processing, OCR, digital signatures, storage
- **Notification Service**: Real-time notifications, SMS, email
- **Postal Service**: VietnamPost integration for physical document delivery

### Background Workers
- **Notification Worker**: Email/SMS processing
- **Postal Worker**: Shipment tracking and delivery
- **LGSP Worker**: Government platform synchronization

### Shared Libraries
- **DVC.Shared.Core**: Common entities, exceptions, helpers
- **DVC.Shared.Contracts**: Events, commands, queries, DTOs
- **DVC.Shared.Infrastructure**: Repositories, messaging, caching, security

### External Integrations
- **LGSP**: Government service platform integration
- **SMS Gateways**: Viettel, MobiFone, VinaPhone
- **Digital Signature**: USB token integration
- **MinIO**: Object storage for documents

## Technology Stack

- **.NET 8**: All services and workers
- **Entity Framework Core 8.0**: Data access with SQL Server
- **YARP 2.0**: API Gateway
- **Elsa 3.0**: Workflow engine
- **RabbitMQ**: Message queue
- **Redis**: Distributed caching
- **MinIO**: Object storage
- **SignalR**: Real-time communications
- **OpenTelemetry**: Distributed tracing
- **Serilog**: Structured logging

## Development Commands

### Build and Test
```bash
# Build entire solution
dotnet build DVC.sln

# Run tests
dotnet test

# Run specific service locally
dotnet run --project src/Services/UserService/DVC.UserService.Api

# Run API Gateway
dotnet run --project src/ApiGateway/DVC.ApiGateway
```

### Docker
```bash
# Build and run all services
docker-compose up -d

# Run only core services (excluding workers)
docker-compose up -d apigateway userservice workflowservice documentservice notificationservice

# Run workers separately
docker-compose -f docker-compose.workers.yml up -d
```

### Database Operations
```bash
# Add migration for specific service
dotnet ef migrations add InitialCreate --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Update database
dotnet ef database update --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Run database seeder
dotnet run --project tools/TestDataSeeder
```

## Code Organization

### Service Structure (Clean Architecture)
```
DVC.ServiceName.Api/         # Controllers, middleware, API configuration
├── Controllers/             # RESTful API endpoints
├── Middleware/             # Custom middleware
├── Extensions/             # Service registration
└── Program.cs              # Application entry point

DVC.ServiceName.Core/        # Business logic, entities, interfaces
├── Entities/               # Domain entities
├── Interfaces/             # Repository and service interfaces
├── Services/               # Business logic services
├── DTOs/                   # Data transfer objects
└── Exceptions/             # Domain-specific exceptions

DVC.ServiceName.Infrastructure/ # Data access, external services
├── Repositories/           # Entity Framework repositories
├── Data/                   # DbContext and configurations
├── External/               # Third-party service integrations
└── Configuration/          # Entity configurations
```

### Key Patterns
- **Repository Pattern**: All data access through repositories
- **Unit of Work**: Transaction management across repositories
- **Event-Driven**: RabbitMQ for service communication
- **Circuit Breaker**: Polly for external service resilience
- **Cache-Aside**: Redis for performance optimization

## Coding Standards

### Function Rules
- Maximum 100 lines per function
- Single Responsibility Principle
- Async/await for all I/O operations
- Descriptive naming (methods end with `Async`)

### Error Handling
- Structured exception handling with custom exceptions
- Comprehensive logging with Serilog
- Standardized API responses
- Circuit breakers for external services

### Security
- Input validation with FluentValidation
- Resource-based authorization
- JWT authentication with role-based access
- Input sanitization for all user data

### Performance
- Entity Framework query optimization with `AsNoTracking()`
- Pagination for large datasets
- Parallel execution with `Task.WhenAll()`
- Connection pooling and caching strategies

## Configuration

### Central Package Management
All package versions are managed centrally in `Directory.Packages.props`. Individual projects reference packages without version numbers.

### Environment Configuration
- Development: `appsettings.Development.json`
- Production: Environment variables and Azure Key Vault
- Docker: `docker-compose.override.yml` for local development

### Service Discovery
Services communicate through:
- API Gateway routing (external clients)
- Direct HTTP calls (internal services)
- Message queues (async operations)

## Testing

### Test Structure
```
tests/
├── Unit/                   # Unit tests per service
├── Integration/            # Cross-service integration tests
└── Performance/            # Load and stress tests
```

### Test Commands
```bash
# Run all unit tests
dotnet test tests/Unit/

# Run integration tests
dotnet test tests/Integration/

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Message Queue Architecture

### Single Exchange Pattern
All events flow through one RabbitMQ exchange (`dvc.events`) with hierarchical routing keys:
- `document.*` - Document lifecycle events
- `workflow.*` - Workflow state changes
- `notification.*` - Notification requests
- `external.*` - External service events
- `system.*` - System-wide broadcasts

### Message Processing
- Idempotent message handling
- Retry with exponential backoff (3 attempts)
- Dead letter queue for failed messages
- Priority queues for urgent documents

## Deployment Notes

### Service Dependencies
1. Start infrastructure services first (SQL Server, Redis, RabbitMQ)
2. Deploy core services (User, Document, Workflow, Notification)
3. Deploy API Gateway
4. Start background workers

### Health Checks
Each service exposes health check endpoints at `/health` for:
- Database connectivity
- Message queue connectivity
- External service availability
- Resource utilization

### Monitoring
- OpenTelemetry for distributed tracing
- Serilog for structured logging
- Custom metrics for business KPIs
- Health check monitoring for service availability

## Key Files and Locations

- **Solution File**: `DVC.sln`
- **Package Management**: `Directory.Packages.props`, `Directory.Build.props`
- **Docker Configuration**: `docker-compose.yml`, `docker-compose.workers.yml`
- **Documentation**: `docs/` folder contains PRDs, architecture diagrams, coding rules
- **API Gateway Config**: `src/ApiGateway/DVC.ApiGateway/appsettings.json`
- **Shared Libraries**: `src/Shared/` for common functionality across services

## Important Notes

- This is an internal government system - security and audit trail are critical
- All file uploads must be validated and scanned for viruses
- Digital signatures use USB tokens with PKI certificates
- LGSP integration provides fallback to cached data when unavailable
- Multi-tier connection management optimizes for 21,000 concurrent users
- Vietnamese language support throughout the system