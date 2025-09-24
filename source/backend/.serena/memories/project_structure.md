# Project Structure

## Solution Organization
The DVC.sln solution is organized into logical folders:

```
DVC.sln
├── src/                           # Source code
│   ├── ApiGateway/               # YARP reverse proxy
│   ├── Services/                 # Microservices
│   ├── Shared/                   # Common libraries
│   └── Integrations/             # External service adapters
├── tests/                        # Test projects
│   ├── Unit/                     # Unit tests
│   ├── Integration/              # Integration tests
│   └── Performance/              # Load tests
├── tools/                        # Development tools
└── docker/                       # Containerization files
```

## Service Architecture (Clean Architecture)
Each service follows the Clean Architecture pattern:

```
DVC.ServiceName.Api/              # Presentation layer
├── Controllers/                  # RESTful API endpoints
├── Middleware/                   # Custom middleware
├── Extensions/                   # Service registration
└── Program.cs                    # Application entry point

DVC.ServiceName.Core/             # Business logic layer
├── Entities/                     # Domain entities
├── Interfaces/                   # Repository and service interfaces
├── Services/                     # Business logic services
├── DTOs/                         # Data transfer objects
├── Exceptions/                   # Domain-specific exceptions
├── Validators/                   # FluentValidation rules
└── Mapping/                      # AutoMapper profiles

DVC.ServiceName.Infrastructure/    # Data access layer
├── Repositories/                 # Entity Framework repositories
├── Data/                         # DbContext and configurations
├── External/                     # Third-party service integrations
├── Configuration/                # Entity configurations
└── Migrations/                   # EF migrations
```

## Core Services

### 1. API Gateway (`src/ApiGateway/`)
- **DVC.ApiGateway**: YARP reverse proxy configuration
- **Purpose**: Route requests, load balancing, rate limiting
- **Port**: 5000 (HTTP)

### 2. User Service (`src/Services/UserService/`)
- **DVC.UserService.Api**: Authentication and user management endpoints
- **DVC.UserService.Core**: User entities, RBAC, audit logging
- **DVC.UserService.Infrastructure**: User data access, external auth
- **Port**: 5101

### 3. Workflow Service (`src/Services/WorkflowService/`)
- **DVC.WorkflowService.Api**: Workflow management and execution
- **DVC.WorkflowService.Core**: Elsa workflow integration
- **DVC.WorkflowService.Infrastructure**: Workflow persistence
- **Port**: 5201

### 4. Document Service (`src/Services/DocumentService/`)
- **DVC.DocumentService.Api**: Document processing and storage
- **DVC.DocumentService.Core**: Document entities and processing logic
- **DVC.DocumentService.Infrastructure**: File storage, OCR, digital signature
- **Port**: 5301

### 5. Notification Service (`src/Services/NotificationService/`)
- **DVC.NotificationService.Api**: Real-time notifications, templates
- **DVC.NotificationService.Core**: Notification logic and routing
- **DVC.NotificationService.Infrastructure**: Email, SMS, SignalR providers
- **Port**: 5401

### 6. Postal Service (`src/Services/PostalService/`)
- **DVC.PostalService.Api**: Postal delivery management
- **DVC.PostalService.Core**: Shipment tracking and cost calculation
- **DVC.PostalService.Infrastructure**: VietnamPost integration
- **Port**: 5501

## Background Workers (`src/Services/Workers/`)

### Shared Worker Infrastructure
- **DVC.Workers.Shared**: Common worker base classes and interfaces

### Worker Services
- **DVC.Workers.Notification**: Process email/SMS notifications
- **DVC.Workers.Postal**: Handle shipment tracking and delivery
- **DVC.Workers.Lgsp**: Synchronize with government platform

## Shared Libraries (`src/Shared/`)

### 1. DVC.Shared.Core
- **Common**: Base entities (AuditableEntity, BaseEntity)
- **Constants**: Application-wide constants
- **Exceptions**: Common exception types
- **Extensions**: Utility extension methods
- **Helpers**: Common helper classes

### 2. DVC.Shared.Contracts
- **Commands**: CQRS command definitions
- **DTOs**: Shared data transfer objects
- **Events**: Domain and integration events
- **Queries**: CQRS query definitions

### 3. DVC.Shared.Infrastructure
- **Caching**: Redis distributed caching
- **Database**: Common EF configurations
- **Logging**: Serilog configurations
- **MessageBus**: RabbitMQ messaging
- **Observability**: OpenTelemetry tracing
- **Patterns**: Repository, Unit of Work patterns
- **Resilience**: Polly circuit breaker policies
- **Security**: JWT service, password hashing
- **Versioning**: API versioning configuration

## External Integrations (`src/Integrations/`)
- **DVC.Integration.LGSP**: Government platform adapter
- **DVC.Integration.SMS**: SMS gateway integrations
- **DVC.Integration.Postal**: VietnamPost service adapter
- **DVC.Integration.DigitalSignature**: USB token integration

## Configuration Management

### Central Package Management
- **Directory.Packages.props**: Centralized package version management
- **Directory.Build.props**: Common build properties (.NET 8, nullable enabled)
- **nuget.config**: NuGet package sources

### Service Configuration
- **appsettings.json**: Production configuration
- **appsettings.Development.json**: Development overrides
- **launchSettings.json**: Development server settings

## Development Tools (`tools/`)
- **DatabaseMigration**: Database migration utilities
- **CodeGeneration**: Code scaffolding tools  
- **TestDataSeeder**: Test data generation

## Docker Configuration (`docker/`)
- **docker-compose.yml**: Core services orchestration
- **docker-compose.workers.yml**: Background workers
- **docker-compose.override.yml**: Development overrides
- **services/**: Individual service Dockerfiles

## Key Files
- **DVC.sln**: Main solution file
- **CLAUDE.md**: Project documentation and development guidance
- **Directory.Build.props**: Global MSBuild properties
- **Directory.Packages.props**: Central package management
- **docker-compose.yml**: Service orchestration