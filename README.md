# DVC v2 - Administrative Procedures Management System

Hệ thống quản lý thủ tục hành chính quốc gia with separated backend and frontend architecture.

## 🏗️ Project Structure

```
dvc-v2/
├── source/
│   ├── backend/           # .NET 8 Microservices
│   │   ├── docs/          # Backend documentation
│   │   └── ...            # Backend source code
│   ├── frontend/          # NextJS 14 Application
│   │   ├── docs/          # Frontend documentation
│   │   └── ...            # Frontend source code
│   └── shared/            # Shared resources
│       ├── docs/          # Database & design patterns docs
│       └── ...            # Shared utilities
├── docs/                  # Legacy documentation (archived)
└── README.md             # This file
```

## 📖 Documentation

### 🎯 Quick Start by Role

#### Backend Developers (.NET 8)
- Start here: **[Backend Documentation](source/backend/docs/README.md)**
- Key files: API patterns, backend rules, microservices architecture

#### Frontend Developers (NextJS 14)
- Start here: **[Frontend Documentation](source/frontend/docs/README.md)**
- Key files: Component structure, state management, UI/UX standards

#### Database Architects & DevOps
- Start here: **[Shared Documentation](source/shared/docs/README.md)**
- Key files: Database design, performance optimization, deployment

### 📋 Documentation Structure

| Component | Location | Focus |
|-----------|----------|-------|
| **Backend** | `source/backend/docs/` | .NET 8 microservices, API design, workers |
| **Frontend** | `source/frontend/docs/` | NextJS 14, components, state management |
| **Shared** | `source/shared/docs/` | Database, design patterns, project structure |
| **Legacy** | `docs/` | Original documentation (archived) |

## 🎯 System Overview

### Scale & Performance
- **800,000 documents/month** processing capacity
- **25,000 civil servants** across 63 provinces
- **21,000 concurrent connections** support
- **2000 administrative procedures** digitized

### Technology Stack
- **Backend**: .NET 8 microservices with clean architecture
- **Frontend**: NextJS 14 with TypeScript and Tailwind CSS
- **Database**: SQL Server 2022 with materialized views
- **Cache**: Redis Enterprise 6-node cluster
- **Storage**: MinIO S3-compatible object storage
- **Observability**: OpenTelemetry + Jaeger + Grafana

### Performance Targets
- **Database queries**: <20ms average response time
- **Page load**: <2 seconds (Google PageSpeed)
- **API response**: <100ms for 95th percentile
- **Availability**: 99.9% uptime with <30s failover

## 🚀 Getting Started

1. **Choose your role** and navigate to the appropriate docs folder
2. **Read the README** in your component's docs folder
3. **Review quick reference** summaries for immediate needs
4. **Deep dive** into detailed PRD documents when needed

## 📊 Documentation Quality

- **20+ documentation files** organized by component
- **15,000+ lines** of technical specifications
- **35% size reduction** through optimization and organization
- **Clear navigation** with role-based entry points

---

**Project Status**: Production Ready
**Last Updated**: September 21, 2025
**Documentation Version**: 2.0 (Reorganized Structure)