# Technology Stack

## Core Framework
- **.NET 8**: All services and workers
- **Entity Framework Core 8.0**: Data access with SQL Server/PostgreSQL
- **ASP.NET Core 8.0**: Web APIs
- **C# Latest**: Programming language with nullable enabled

## Key Libraries and Frameworks
- **YARP 2.0**: API Gateway (reverse proxy)
- **Elsa 3.0**: Workflow engine with BPMN 2.0
- **MediatR**: CQRS pattern implementation  
- **AutoMapper**: Object-to-object mapping
- **FluentValidation**: Input validation
- **JWT**: Authentication and authorization
- **Polly**: Circuit breaker and resilience patterns

## Infrastructure Components
- **RabbitMQ**: Message queue for service communication
- **Redis**: Distributed caching and session storage
- **MinIO**: Object storage for documents
- **SignalR**: Real-time communications
- **SQL Server/PostgreSQL**: Primary databases

## Observability and Monitoring  
- **OpenTelemetry**: Distributed tracing
- **Serilog**: Structured logging to Console, File, and Elasticsearch
- **Health Checks**: Service availability monitoring

## Testing Framework
- **xUnit**: Primary testing framework
- **Moq**: Mocking framework
- **FluentAssertions**: Assertion library
- **Microsoft.AspNetCore.Mvc.Testing**: Integration testing
- **coverlet.collector**: Code coverage

## External Service Integrations
- **MailKit/MimeKit**: Email services
- **Twilio**: SMS gateway (additional Vietnamese SMS providers)
- **Tesseract**: OCR for document processing
- **Minio**: Cloud storage client

## Build and Deployment
- **Docker**: Containerization
- **Docker Compose**: Local development orchestration
- **Central Package Management**: Directory.Packages.props
- **Microsoft.NET.Test.Sdk**: Test execution