# DVC v2 Backend Code Skeleton Implementation Plan

## 📋 Solution Structure Checklist

### ✅ **1. Solution & Global Configuration**
- [ ] Create `DVC.sln` solution file
- [ ] Create `Directory.Packages.props` for central package management
- [ ] Create `Directory.Build.props` for global project properties
- [ ] Create `nuget.config` for NuGet configuration
- [ ] Create `.gitignore` file for .NET projects

### ✅ **2. API Gateway**
- [ ] Create `src/ApiGateway/DVC.ApiGateway/` project
  - [ ] `Program.cs` with YARP configuration
  - [ ] `appsettings.json` with routing config
  - [ ] `Configuration/` folder:
    - [ ] `RouteConfig.cs` for route configurations
    - [ ] `LoadBalancerConfig.cs` for load balancing
    - [ ] `RateLimitConfig.cs` for rate limiting
  - [ ] `Middleware/` folder:
    - [ ] `AuthenticationMiddleware.cs`
    - [ ] `LoggingMiddleware.cs`
    - [ ] `CorsMiddleware.cs`
  - [ ] `Extensions/ServiceCollectionExtensions.cs`

### ✅ **3. Core Microservices**

#### 3.1 User Service
- [ ] `src/Services/UserService/DVC.UserService.Api/`
  - [ ] Controllers: `AuthController.cs`, `UsersController.cs`, `RolesController.cs`, `PermissionsController.cs`
  - [ ] Middleware: `JwtMiddleware.cs`, `AuditMiddleware.cs`
  - [ ] `Program.cs` with service configuration
  - [ ] `appsettings.json`
- [ ] `src/Services/UserService/DVC.UserService.Core/`
  - [ ] Entities: `User.cs`, `Role.cs`, `Permission.cs`, `UserRole.cs`, `AuditLog.cs`
  - [ ] Interfaces: `IUserRepository.cs`, `IAuthService.cs`, etc.
  - [ ] Services: `AuthService.cs`, `UserService.cs`, etc.
  - [ ] DTOs: `LoginDto.cs`, `UserDto.cs`, etc.
  - [ ] Exceptions: `AuthenticationException.cs`, `AuthorizationException.cs`
- [ ] `src/Services/UserService/DVC.UserService.Infrastructure/`
  - [ ] Repositories: `UserRepository.cs`, `RoleRepository.cs`
  - [ ] Data: `UserDbContext.cs`, Migrations folder
  - [ ] External: `LdapService.cs`, `SmsService.cs`
  - [ ] Configuration: Entity configurations

#### 3.2 Workflow Service
- [ ] `src/Services/WorkflowService/DVC.WorkflowService.Api/`
  - [ ] Controllers: `WorkflowController.cs`, `InstanceController.cs`, `DesignerController.cs`
  - [ ] Hubs: `WorkflowHub.cs` for SignalR
  - [ ] `Program.cs` with Elsa configuration
- [ ] `src/Services/WorkflowService/DVC.WorkflowService.Core/`
  - [ ] Entities: `WorkflowDefinition.cs`, `WorkflowInstance.cs`, `WorkflowStep.cs`
  - [ ] Services: `WorkflowEngine.cs`, `ElsaIntegration.cs`, `BpmnService.cs`
  - [ ] Interfaces & DTOs
- [ ] `src/Services/WorkflowService/DVC.WorkflowService.Infrastructure/`
  - [ ] Repositories, DbContext, Elsa configuration
  - [ ] External: `BpmnParser.cs`

#### 3.3 Document Service
- [ ] `src/Services/DocumentService/DVC.DocumentService.Api/`
  - [ ] Controllers: `DocumentController.cs`, `UploadController.cs`, `SignatureController.cs`
- [ ] `src/Services/DocumentService/DVC.DocumentService.Core/`
  - [ ] Entities: `Document.cs`, `DocumentVersion.cs`, `Attachment.cs`, `Signature.cs`
  - [ ] Services: `DocumentProcessor.cs`, `FileUploadService.cs`, `DigitalSignatureService.cs`, `OcrService.cs`
- [ ] `src/Services/DocumentService/DVC.DocumentService.Infrastructure/`
  - [ ] Storage: `MinIOService.cs`, `FileSystemService.cs`
  - [ ] External: `UsbTokenService.cs`, `TesseractOcrService.cs`

#### 3.4 Notification Service
- [ ] `src/Services/NotificationService/DVC.NotificationService.Api/`
  - [ ] Controllers: `NotificationController.cs`, `TemplateController.cs`
  - [ ] Hubs: `NotificationHub.cs`
- [ ] `src/Services/NotificationService/DVC.NotificationService.Core/`
  - [ ] Entities: `Notification.cs`, `NotificationTemplate.cs`, `DeliveryLog.cs`
  - [ ] Services: `NotificationService.cs`, `SmsService.cs`, `EmailService.cs`
- [ ] `src/Services/NotificationService/DVC.NotificationService.Infrastructure/`
  - [ ] Providers: `ViettelSmsProvider.cs`, `MobiFoneSmsProvider.cs`, `SmtpEmailProvider.cs`
  - [ ] Templates: `RazorTemplateEngine.cs`

#### 3.5 Postal Service
- [ ] `src/Services/PostalService/DVC.PostalService.Api/`
  - [ ] Controllers: `ShipmentController.cs`, `TrackingController.cs`, `LabelController.cs`, `CostController.cs`
- [ ] `src/Services/PostalService/DVC.PostalService.Core/`
  - [ ] Entities: `PostalShipment.cs`, `TrackingEvent.cs`, `DeliveryAddress.cs`, `ShippingLabel.cs`
  - [ ] Services: `PostalService.cs`, `TrackingService.cs`, `VietnamPostService.cs`
- [ ] `src/Services/PostalService/DVC.PostalService.Infrastructure/`
  - [ ] Providers: `VietnamPostProvider.cs`, `EmsProvider.cs`, `DhlProvider.cs`
  - [ ] External: `VietnamPostApiClient.cs`, `AddressValidationService.cs`

### ✅ **4. Background Workers**

#### 4.1 Notification Worker
- [ ] `src/Services/Workers/DVC.Workers.Notification/`
  - [ ] Workers: `EmailWorkerService.cs`, `SmsWorkerService.cs`
  - [ ] Services: `TemplateEngine.cs`, `SmsProviderFactory.cs`
  - [ ] Models: `EmailMessage.cs`, `SmsMessage.cs`
  - [ ] Configuration: Worker options classes
  - [ ] `Program.cs` with hosted service setup

#### 4.2 Postal Worker
- [ ] `src/Services/Workers/DVC.Workers.Postal/`
  - [ ] Workers: `PostalWorkerService.cs`, `PostalTrackingWorkerService.cs`
  - [ ] Services: `PostalStatusUpdateService.cs`
  - [ ] Models: `PostalMessage.cs`, `TrackingMessage.cs`

#### 4.3 LGSP Worker
- [ ] `src/Services/Workers/DVC.Workers.Lgsp/`
  - [ ] Workers: `LgspSyncWorkerService.cs`, `LgspSubmissionWorkerService.cs`
  - [ ] Services: `LgspCacheService.cs`, `LgspProcedureSyncService.cs`
  - [ ] Models: `LgspMessage.cs`, `LgspSubmission.cs`

#### 4.4 Shared Worker Infrastructure
- [ ] `src/Services/Workers/DVC.Workers.Shared/`
  - [ ] Base: `BaseWorkerService.cs`, `BaseMessage.cs`, `WorkerOptions.cs`
  - [ ] Interfaces: `IMessagePublisher.cs`, `IMessageConsumer.cs`, `IWorkerMetrics.cs`
  - [ ] Services: `RabbitMqPublisher.cs`, `RabbitMqConsumer.cs`, `RetryHandler.cs`

### ✅ **5. Shared Libraries**

#### 5.1 Core Shared
- [ ] `src/Shared/DVC.Shared.Core/`
  - [ ] Common: `BaseEntity.cs`, `AuditableEntity.cs`, `PagedResult.cs`, `ApiResponse.cs`
  - [ ] Extensions: `StringExtensions.cs`, `DateTimeExtensions.cs`
  - [ ] Helpers: `CryptographyHelper.cs`, `ValidationHelper.cs`
  - [ ] Constants: `AppConstants.cs`, `RoleConstants.cs`, `ErrorMessages.cs`
  - [ ] Exceptions: `DvcException.cs`, `BusinessException.cs`, `ValidationException.cs`

#### 5.2 Contracts
- [ ] `src/Shared/DVC.Shared.Contracts/`
  - [ ] Events: `DocumentEvents.cs`, `WorkflowEvents.cs`, `PostalEvents.cs`, `UserEvents.cs`
  - [ ] Commands: CQRS command classes
  - [ ] Queries: CQRS query classes
  - [ ] DTOs: Shared DTOs organized by domain

#### 5.3 Infrastructure
- [ ] `src/Shared/DVC.Shared.Infrastructure/`
  - [ ] Database: `BaseDbContext.cs`, `UnitOfWork.cs`, `Repository.cs`
  - [ ] Patterns:
    - [ ] Repository pattern implementation
    - [ ] CQRS pattern implementation
    - [ ] Strategy, Observer, Factory patterns
    - [ ] Progressive Complexity, Hybrid Connection patterns
  - [ ] MessageBus: `RabbitMqService.cs`, `MessagePublisher.cs`, `MessageConsumer.cs`
  - [ ] Resilience: Circuit breaker, Retry with Polly
  - [ ] Caching: `RedisService.cs`, `CacheManager.cs`, `DistributedCache.cs`
  - [ ] Logging: `StructuredLogger.cs`, `LoggingMiddleware.cs`
  - [ ] Security: `JwtService.cs`, `EncryptionService.cs`
  - [ ] Observability: Tracing, Correlation, Instrumentation with OpenTelemetry
  - [ ] Versioning: API versioning infrastructure
  - [ ] Monitoring: `HealthChecks.cs`, `MetricsCollector.cs`

### ✅ **6. External Integrations**
- [ ] `src/Integrations/DVC.Integration.LGSP/` - LGSP integration adapter
- [ ] `src/Integrations/DVC.Integration.SMS/` - SMS gateway adapter
- [ ] `src/Integrations/DVC.Integration.Postal/` - Postal service adapter
- [ ] `src/Integrations/DVC.Integration.DigitalSignature/` - Digital signature adapter

### ✅ **7. Test Projects**
- [ ] `tests/Unit/` - Unit test projects for each service
- [ ] `tests/Integration/DVC.Integration.Tests/` - Integration tests
- [ ] `tests/Performance/DVC.LoadTests/` - Load testing projects

### ✅ **8. Development Tools**
- [ ] `tools/DatabaseMigration/` - EF migration tools
- [ ] `tools/CodeGeneration/` - Code generation utilities
- [ ] `tools/TestDataSeeder/` - Test data seeding tools

### ✅ **9. Docker Configuration**
- [ ] `docker/services/` - Dockerfiles for each service
- [ ] `docker/workers/` - Dockerfiles for workers
- [ ] `docker-compose.yml` - Main compose file
- [ ] `docker-compose.workers.yml` - Workers compose
- [ ] `docker-compose.override.yml` - Local overrides

## 🔧 Implementation Notes

### Package Versions (Directory.Packages.props):
- .NET 8.0
- Entity Framework Core 8.0.0
- MediatR 12.1.1
- AutoMapper 12.0.1
- FluentValidation 11.7.1
- Polly 7.2.4
- RabbitMQ.Client 6.6.0
- StackExchange.Redis 2.7.4
- OpenTelemetry 1.6.0
- Serilog.AspNetCore 7.0.0
- xUnit 2.4.2

### Coding Standards:
- Max 100 lines per function
- Single responsibility principle
- Repository pattern for data access
- Service layer for business logic
- FluentValidation for input validation
- Structured exception handling
- Async/await best practices
- No hardcoded strings - use constants
- Comprehensive logging with Serilog

### Architecture Patterns:
- Clean Architecture (Api/Core/Infrastructure layers)
- CQRS with MediatR
- Repository & Unit of Work patterns
- Circuit breaker with Polly
- Cache-aside pattern with Redis
- Event-driven with RabbitMQ
- API versioning
- OpenTelemetry distributed tracing

This skeleton will provide a complete foundation for implementing all the microservices following .NET 8 best practices and Clean Architecture principles.