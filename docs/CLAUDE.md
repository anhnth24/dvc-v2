# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DVC v2 is a Vietnamese government administrative procedures management system with a microservices architecture. The system processes 800,000 documents/month for 25,000 civil servants across 63 provinces, supporting 21,000 concurrent connections and managing 2000 digitized administrative procedures.

## Repository Structure

```
dvc-v2/
├── source/
│   ├── backend/           # .NET 8 Microservices
│   ├── frontend/          # Next.js 14 Application
│   └── shared/            # Shared resources
├── docs/                  # Project documentation
└── README.md
```

## Technology Stack

- **Backend**: .NET 8 microservices with clean architecture
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: SQL Server 2022 with materialized views
- **Cache**: Redis Enterprise 6-node cluster
- **Storage**: MinIO S3-compatible object storage
- **Observability**: OpenTelemetry + Jaeger + Grafana

## Development Commands

### Backend (.NET 8)
Navigate to `source/backend/` directory:

```bash
# Build entire solution
dotnet build DVC.sln

# Run tests
dotnet test

# Run specific service locally
dotnet run --project src/Services/UserService/DVC.UserService.Api

# Run API Gateway
dotnet run --project src/ApiGateway/DVC.ApiGateway

# Docker - all services
docker-compose up -d

# Docker - core services only
docker-compose up -d apigateway userservice workflowservice documentservice notificationservice

# Docker - workers
docker-compose -f docker-compose.workers.yml up -d

# Database migrations
dotnet ef migrations add InitialCreate --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Database update
dotnet ef database update --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Database seeder
dotnet run --project tools/TestDataSeeder
```

### Frontend (Next.js 14)
Navigate to `source/frontend/` directory:

```bash
# Development server (http://localhost:3000)
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Show test reports
npm run test:e2e:report
```

## Backend Architecture

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

### Service Structure (Clean Architecture)
```
DVC.ServiceName.Api/         # Controllers, middleware, API configuration
DVC.ServiceName.Core/        # Business logic, entities, interfaces
DVC.ServiceName.Infrastructure/ # Data access, external services
```

### Key Patterns
- Repository Pattern with Unit of Work
- Event-Driven architecture with RabbitMQ
- Circuit Breaker pattern with Polly
- Cache-Aside pattern with Redis

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + custom CSS files
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright for E2E
- **Real-time**: SignalR WebSocket connections

### Project Structure
- **App Router**: Uses route groups `(auth)` and `(dashboard)`
- **Components**: Feature-based organization (ui/, layout/, auth/, documents/, workflow/, postal/)
- **State**: Zustand stores in `src/store/`, TanStack Query for server state
- **Hooks**: Custom hooks in `src/hooks/` for business logic
- **Types**: TypeScript definitions in `src/types/`

### Coding Standards (Strictly Enforced)
- **Maximum 100 lines** per component/function
- **Single responsibility** principle
- **CSS files only** - no inline styles
- **Strict TypeScript** with proper interfaces
- **Component composition** over large components

## Message Queue Architecture

All events flow through one RabbitMQ exchange (`dvc.events`) with hierarchical routing keys:
- `document.*` - Document lifecycle events
- `workflow.*` - Workflow state changes
- `notification.*` - Notification requests
- `external.*` - External service events
- `system.*` - System-wide broadcasts

## Performance Targets

- **Database queries**: <20ms average response time
- **Page load**: <2 seconds (Google PageSpeed)
- **API response**: <100ms for 95th percentile
- **Availability**: 99.9% uptime with <30s failover

## Security Requirements

- Input validation with FluentValidation (backend) and Zod (frontend)
- Resource-based authorization with JWT
- Digital signatures using USB tokens with PKI certificates
- File upload validation and virus scanning
- HTML content sanitization with DOMPurify

## Configuration Files

### Backend Key Files
- **Solution**: `source/backend/DVC.sln`
- **Docker**: `source/backend/docker-compose.yml`, `docker-compose.workers.yml`
- **Packages**: `source/backend/Directory.Packages.props`
- **API Gateway**: `source/backend/src/ApiGateway/DVC.ApiGateway/appsettings.json`

### Frontend Key Files
- **Package**: `source/frontend/package.json`
- **Config**: `source/frontend/next.config.js`
- **Tailwind**: `source/frontend/tailwind.config.js`
- **Playwright**: `source/frontend/playwright.config.ts`

## Testing

### Backend Tests
```bash
# All tests
dotnet test

# Unit tests only
dotnet test tests/Unit/

# Integration tests
dotnet test tests/Integration/

# With coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Tests
```bash
# E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui
```

## Important Notes

- This is an internal government system - security and audit trail are critical
- All file uploads must be validated and virus-scanned
- LGSP integration provides fallback to cached data when unavailable
- Multi-tier connection management optimizes for 21,000 concurrent users
- Vietnamese language support throughout the system
- Both frontend and backend have dedicated CLAUDE.md files with detailed guidance

## Documentation

- **Backend docs**: `source/backend/docs/` - PRDs, architecture diagrams, coding rules
- **Frontend docs**: Referenced in `source/frontend/` structure and patterns
- **Legacy docs**: `docs/` folder contains original documentation (archived)
- **Database design**: Comprehensive schema documentation in `docs/database-design/`