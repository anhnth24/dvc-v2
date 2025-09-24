# DVC v2 Backend Project Overview

## Project Purpose
DVC v2 Backend is a .NET 8 microservices architecture for a Vietnamese government administrative procedures system. It handles 800,000 documents/month with 21,000 concurrent civil servants through multiple core services.

## Architecture Overview
The system follows Clean Architecture pattern with these main components:

### Core Services
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

## Key Features
- Handles 800,000 documents per month
- Supports 21,000 concurrent civil servants
- Vietnamese language support throughout
- Digital signature with USB tokens and PKI certificates
- Real-time notifications via SignalR
- Government service platform integration
- Audit trail for all operations
- Multi-tier connection management for performance

## Business Context
This is an internal Vietnamese government system focused on administrative procedures processing. Security and audit capabilities are critical requirements due to the government context.