# DVC v2 Frontend Project Overview

## Project Purpose
DVC v2 Frontend is a Next.js 14 application that serves as the frontend for a Document Verification and Processing system (DVC). The application handles:

- **Document Management**: Upload, processing, and management of documents
- **Workflow Management**: BPMN-based workflow designer and execution
- **Authentication & Authorization**: User authentication with MFA support and role-based permissions
- **Postal Services**: Shipment tracking, label printing, and cost calculation
- **Intake Processing**: Document scanning, batch processing, and metadata management
- **Administration**: User management, role management, and system settings
- **Reporting**: Data visualization, export functionality, and dashboard widgets

## Key Features
- **Real-time Updates**: WebSocket connections for live notifications and updates
- **Document Processing**: Scanner integration and document validation
- **BPMN Workflow Designer**: Visual workflow creation and management
- **Postal Integration**: Full postal service functionality with tracking
- **Role-based Access Control**: Comprehensive permission system
- **Multi-factor Authentication**: Enhanced security features
- **Responsive Design**: Modern UI with Tailwind CSS

## Architecture Style
- **App Router**: Uses Next.js 14 App Router with route groups for logical separation
- **Feature-based Organization**: Components organized by business domains
- **Micro-frontends Pattern**: Modular component architecture with clear separation
- **Client-Server State Separation**: Clear distinction between UI state and server state