# Project Structure - DVC v2
## Hệ Thống Quản Lý Thủ Tục Hành Chính

**Version:** 1.0
**Ngày tạo:** 20/12/2024
**Nguồn:** [Frontend PRD](../sub-prd/frontend-prd.md) & [Backend PRD](../sub-prd/backend-prd.md)

---

## 1. Overall Project Structure

```
dvc-v2/
├── src/
│   ├── frontend/                    # NextJS 14 Application
│   ├── backend/                     # .NET 8 Services
│   ├── shared/                      # Shared libraries/contracts
│   └── infrastructure/              # Infrastructure as Code
├── tests/
│   ├── frontend/                    # Frontend unit/integration tests
│   ├── backend/                     # Backend unit/integration tests
│   └── e2e/                         # End-to-end tests
├── docs/
│   ├── prd/                         # Product Requirements
│   ├── api/                         # API documentation
│   ├── deployment/                  # Deployment guides
│   └── user-guides/                 # User documentation
├── scripts/
│   ├── build/                       # Build scripts
│   ├── deployment/                  # Deployment scripts
│   └── database/                    # Database migration scripts
├── docker/                          # Docker configurations
├── k8s/                            # Kubernetes manifests
└── tools/                          # Development tools
```

---

## 2. Frontend Structure (NextJS 14)

### 2.1 Application Structure
```
src/frontend/
├── public/                          # Static assets
│   ├── images/
│   ├── icons/
│   └── documents/                   # Template documents
├── src/
│   ├── app/                         # App Router (NextJS 14)
│   │   ├── (auth)/                  # Authentication route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── setup-mfa/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/             # Main application routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Main dashboard
│   │   │   ├── intake/              # Document intake module
│   │   │   │   ├── page.tsx
│   │   │   │   ├── scan/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── batch/
│   │   │   │       └── page.tsx
│   │   │   ├── documents/           # Document processing
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── workflow/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── bulk/
│   │   │   │       └── page.tsx
│   │   │   ├── workflows/           # Workflow designer
│   │   │   │   ├── page.tsx
│   │   │   │   ├── designer/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── procedures/          # Procedure management
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── postal/              # Postal service management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tracking/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── shipments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── labels/
│   │   │   │       ├── page.tsx
│   │   │   │       └── print/
│   │   │   │           └── page.tsx
│   │   │   ├── reports/             # Analytics & reporting
│   │   │   │   ├── page.tsx
│   │   │   │   ├── performance/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── workload/
│   │   │   │       └── page.tsx
│   │   │   └── admin/               # System administration
│   │   │       ├── page.tsx
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       ├── roles/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   ├── api/                     # NextJS API routes
│   │   │   ├── auth/
│   │   │   │   └── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── proxy/               # Backend proxy routes
│   │   │       └── [...path]/
│   │   │           └── route.ts
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   ├── loading.tsx              # Global loading UI
│   │   ├── error.tsx                # Global error UI
│   │   └── not-found.tsx            # 404 page
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   ├── layout/                  # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── footer.tsx
│   │   ├── auth/                    # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   ├── mfa-setup.tsx
│   │   │   ├── password-reset.tsx
│   │   │   └── protected-route.tsx
│   │   ├── intake/                  # Document intake components
│   │   │   ├── document-scanner.tsx
│   │   │   ├── batch-processor.tsx
│   │   │   ├── metadata-form.tsx
│   │   │   ├── validation-panel.tsx
│   │   │   └── procedure-selector.tsx
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── processing-dashboard.tsx
│   │   │   ├── stats-cards.tsx
│   │   │   ├── document-tabs.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── workspace-menu.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── documents/               # Document processing components
│   │   │   ├── document-viewer.tsx
│   │   │   ├── document-processor.tsx
│   │   │   ├── upload-wizard.tsx
│   │   │   ├── bulk-operations.tsx
│   │   │   ├── workflow-status.tsx
│   │   │   ├── processing-form.tsx
│   │   │   └── signature-panel.tsx
│   │   ├── workflow/                # Workflow components
│   │   │   ├── workflow-designer.tsx
│   │   │   ├── bpmn-canvas.tsx
│   │   │   ├── tool-palette.tsx
│   │   │   ├── properties-panel.tsx
│   │   │   ├── mini-map.tsx
│   │   │   └── workflow-validator.tsx
│   │   ├── notifications/           # Notification components
│   │   │   ├── notification-center.tsx
│   │   │   ├── notification-item.tsx
│   │   │   ├── toast-provider.tsx
│   │   │   └── live-updates.tsx
│   │   ├── postal/                  # Postal service components
│   │   │   ├── shipment-modal.tsx
│   │   │   ├── tracking-dashboard.tsx
│   │   │   ├── shipment-list.tsx
│   │   │   ├── tracking-details.tsx
│   │   │   ├── label-printer.tsx
│   │   │   ├── cost-calculator.tsx
│   │   │   ├── address-selector.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── live-tracking.tsx
│   │   ├── reports/                 # Reporting components
│   │   │   ├── chart-components.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── filter-builder.tsx
│   │   │   ├── export-button.tsx
│   │   │   └── dashboard-widgets.tsx
│   │   └── admin/                   # Admin components
│   │       ├── user-management.tsx
│   │       ├── role-editor.tsx
│   │       ├── permission-matrix.tsx
│   │       └── system-settings.tsx
│   ├── lib/                         # Utilities and configurations
│   │   ├── auth.ts                  # Authentication config & utilities
│   │   ├── api.ts                   # API client configuration
│   │   ├── utils.ts                 # General utility functions
│   │   ├── validations.ts           # Form validation schemas (Zod)
│   │   ├── constants.ts             # Application constants
│   │   ├── permissions.ts           # Permission checking utilities
│   │   ├── date-utils.ts            # Date formatting utilities
│   │   ├── file-utils.ts            # File handling utilities
│   │   └── encryption.ts            # Client-side encryption helpers
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-auth.ts              # Authentication hooks
│   │   ├── use-api.ts               # API calling hooks
│   │   ├── use-websocket.ts         # WebSocket connection hooks
│   │   ├── use-notifications.ts     # Notification management
│   │   ├── use-document.ts          # Document operations
│   │   ├── use-workflow.ts          # Workflow operations
│   │   ├── use-postal.ts            # Postal service operations
│   │   ├── use-tracking.ts          # Shipment tracking hooks
│   │   ├── use-permissions.ts       # Permission checking
│   │   ├── use-debounce.ts          # Debouncing hook
│   │   ├── use-local-storage.ts     # Local storage hook
│   │   └── use-theme.ts             # Theme management
│   ├── store/                       # State management (Zustand)
│   │   ├── auth-store.ts            # Authentication state
│   │   ├── document-store.ts        # Document state
│   │   ├── notification-store.ts    # Notification state
│   │   ├── postal-store.ts          # Postal service state
│   │   ├── ui-store.ts              # UI state (theme, sidebar, etc.)
│   │   ├── workflow-store.ts        # Workflow designer state
│   │   └── index.ts                 # Store exports
│   ├── types/                       # TypeScript definitions
│   │   ├── auth.ts                  # Authentication types
│   │   ├── document.ts              # Document types
│   │   ├── workflow.ts              # Workflow types
│   │   ├── postal.ts                # Postal service types
│   │   ├── user.ts                  # User types
│   │   ├── api.ts                   # API response types
│   │   ├── notification.ts          # Notification types
│   │   └── index.ts                 # Type exports
│   ├── styles/                      # Styling files
│   │   ├── globals.css              # Global styles
│   │   ├── components.css           # Component-specific styles
│   │   ├── tailwind.css             # Tailwind directives
│   │   └── themes/                  # Theme files
│   │       ├── light.css
│   │       └── dark.css
│   └── middleware.ts                # NextJS middleware
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .eslintrc.json
└── playwright.config.ts
```

---

## 3. Backend Structure (.NET 8)

### 3.1 Solution Structure
```
src/backend/
├── DVC.sln                          # Solution file
├── src/
│   ├── ApiGateway/                  # YARP API Gateway
│   │   ├── DVC.ApiGateway/
│   │   │   ├── Program.cs
│   │   │   ├── appsettings.json
│   │   │   ├── Configuration/
│   │   │   │   ├── RouteConfig.cs
│   │   │   │   ├── LoadBalancerConfig.cs
│   │   │   │   └── RateLimitConfig.cs
│   │   │   ├── Middleware/
│   │   │   │   ├── AuthenticationMiddleware.cs
│   │   │   │   ├── LoggingMiddleware.cs
│   │   │   │   └── CorsMiddleware.cs
│   │   │   └── Extensions/
│   │   │       └── ServiceCollectionExtensions.cs
│   │   └── DVC.ApiGateway.csproj
│   ├── Services/                    # Microservices
│   │   ├── UserService/             # User & Authentication Service
│   │   │   ├── DVC.UserService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── AuthController.cs
│   │   │   │   │   ├── UsersController.cs
│   │   │   │   │   ├── RolesController.cs
│   │   │   │   │   └── PermissionsController.cs
│   │   │   │   ├── Program.cs
│   │   │   │   ├── appsettings.json
│   │   │   │   ├── Middleware/
│   │   │   │   │   ├── JwtMiddleware.cs
│   │   │   │   │   └── AuditMiddleware.cs
│   │   │   │   └── Extensions/
│   │   │   │       └── ServiceRegistration.cs
│   │   │   ├── DVC.UserService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── User.cs
│   │   │   │   │   ├── Role.cs
│   │   │   │   │   ├── Permission.cs
│   │   │   │   │   ├── UserRole.cs
│   │   │   │   │   └── AuditLog.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IUserRepository.cs
│   │   │   │   │   ├── IRoleRepository.cs
│   │   │   │   │   ├── IAuthService.cs
│   │   │   │   │   └── IAuditService.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── AuthService.cs
│   │   │   │   │   ├── UserService.cs
│   │   │   │   │   ├── RoleService.cs
│   │   │   │   │   ├── PermissionService.cs
│   │   │   │   │   └── AuditService.cs
│   │   │   │   ├── DTOs/
│   │   │   │   │   ├── LoginDto.cs
│   │   │   │   │   ├── UserDto.cs
│   │   │   │   │   ├── RoleDto.cs
│   │   │   │   │   └── PermissionDto.cs
│   │   │   │   └── Exceptions/
│   │   │   │       ├── AuthenticationException.cs
│   │   │   │       └── AuthorizationException.cs
│   │   │   ├── DVC.UserService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── UserRepository.cs
│   │   │   │   │   ├── RoleRepository.cs
│   │   │   │   │   └── AuditRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── UserDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── External/
│   │   │   │   │   ├── LdapService.cs
│   │   │   │   │   └── SmsService.cs
│   │   │   │   └── Configuration/
│   │   │   │       ├── UserEntityConfiguration.cs
│   │   │   │       └── RoleEntityConfiguration.cs
│   │   │   └── DVC.UserService.Tests/
│   │   │       ├── Unit/
│   │   │       ├── Integration/
│   │   │       └── TestFixtures/
│   │   ├── WorkflowService/          # Workflow Engine Service
│   │   │   ├── DVC.WorkflowService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── WorkflowController.cs
│   │   │   │   │   ├── InstanceController.cs
│   │   │   │   │   └── DesignerController.cs
│   │   │   │   ├── Hubs/
│   │   │   │   │   └── WorkflowHub.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.WorkflowService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── WorkflowDefinition.cs
│   │   │   │   │   ├── WorkflowInstance.cs
│   │   │   │   │   ├── WorkflowStep.cs
│   │   │   │   │   └── WorkflowVariable.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── WorkflowEngine.cs
│   │   │   │   │   ├── WorkflowDesigner.cs
│   │   │   │   │   ├── ElsaIntegration.cs
│   │   │   │   │   └── BpmnService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IWorkflowEngine.cs
│   │   │   │   │   ├── IWorkflowRepository.cs
│   │   │   │   │   └── IBpmnService.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── WorkflowDefinitionDto.cs
│   │   │   │       ├── WorkflowInstanceDto.cs
│   │   │   │       └── WorkflowStepDto.cs
│   │   │   ├── DVC.WorkflowService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── WorkflowRepository.cs
│   │   │   │   │   └── InstanceRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── WorkflowDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Elsa/
│   │   │   │   │   ├── ElsaConfiguration.cs
│   │   │   │   │   ├── CustomActivities/
│   │   │   │   │   └── WorkflowHandlers/
│   │   │   │   └── External/
│   │   │   │       └── BpmnParser.cs
│   │   │   └── DVC.WorkflowService.Tests/
│   │   ├── DocumentService/          # Document Processing Service
│   │   │   ├── DVC.DocumentService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── DocumentController.cs
│   │   │   │   │   ├── UploadController.cs
│   │   │   │   │   ├── SignatureController.cs
│   │   │   │   │   └── ProcessingController.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.DocumentService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── Document.cs
│   │   │   │   │   ├── DocumentVersion.cs
│   │   │   │   │   ├── Attachment.cs
│   │   │   │   │   ├── Signature.cs
│   │   │   │   │   └── ProcessingLog.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── DocumentProcessor.cs
│   │   │   │   │   ├── FileUploadService.cs
│   │   │   │   │   ├── DigitalSignatureService.cs
│   │   │   │   │   ├── OcrService.cs
│   │   │   │   │   └── ValidationService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IDocumentRepository.cs
│   │   │   │   │   ├── IFileStorageService.cs
│   │   │   │   │   ├── ISignatureService.cs
│   │   │   │   │   └── IOcrService.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── DocumentDto.cs
│   │   │   │       ├── UploadDto.cs
│   │   │   │       └── SignatureDto.cs
│   │   │   ├── DVC.DocumentService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── DocumentRepository.cs
│   │   │   │   │   └── AttachmentRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── DocumentDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Storage/
│   │   │   │   │   ├── MinIOService.cs
│   │   │   │   │   └── FileSystemService.cs
│   │   │   │   ├── External/
│   │   │   │   │   ├── UsbTokenService.cs
│   │   │   │   │   ├── TesseractOcrService.cs
│   │   │   │   │   └── LibreOfficeConverter.cs
│   │   │   │   └── Configuration/
│   │   │   │       └── DocumentEntityConfiguration.cs
│   │   │   └── DVC.DocumentService.Tests/
│   │   ├── NotificationService/      # Notification Service
│   │   │   ├── DVC.NotificationService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── NotificationController.cs
│   │   │   │   │   └── TemplateController.cs
│   │   │   │   ├── Hubs/
│   │   │   │   │   └── NotificationHub.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.NotificationService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── Notification.cs
│   │   │   │   │   ├── NotificationTemplate.cs
│   │   │   │   │   ├── DeliveryLog.cs
│   │   │   │   │   └── Subscription.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── NotificationService.cs
│   │   │   │   │   ├── TemplateService.cs
│   │   │   │   │   ├── SmsService.cs
│   │   │   │   │   ├── EmailService.cs
│   │   │   │   │   └── WebSocketService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── INotificationRepository.cs
│   │   │   │   │   ├── ISmsProvider.cs
│   │   │   │   │   ├── IEmailProvider.cs
│   │   │   │   │   └── ITemplateEngine.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── NotificationDto.cs
│   │   │   │       ├── TemplateDto.cs
│   │   │   │       └── DeliveryStatusDto.cs
│   │   │   ├── DVC.NotificationService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── NotificationRepository.cs
│   │   │   │   │   └── TemplateRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── NotificationDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Providers/
│   │   │   │   │   ├── ViettelSmsProvider.cs
│   │   │   │   │   ├── MobiFoneSmsProvider.cs
│   │   │   │   │   └── SmtpEmailProvider.cs
│   │   │   │   ├── External/
│   │   │   │   │   └── SignalRService.cs
│   │   │   │   └── Templates/
│   │   │   │       ├── RazorTemplateEngine.cs
│   │   │   │       └── DefaultTemplates/
│   │   │   └── DVC.NotificationService.Tests/
│   │   └── PostalService/            # Postal Service
│   │       ├── DVC.PostalService.Api/
│   │       │   ├── Controllers/
│   │       │   │   ├── ShipmentController.cs
│   │       │   │   ├── TrackingController.cs
│   │       │   │   ├── LabelController.cs
│   │       │   │   └── CostController.cs
│   │       │   ├── Program.cs
│   │       │   └── appsettings.json
│   │       ├── DVC.PostalService.Core/
│   │       │   ├── Entities/
│   │       │   │   ├── PostalShipment.cs
│   │       │   │   ├── TrackingEvent.cs
│   │       │   │   ├── DeliveryAddress.cs
│   │       │   │   ├── ShippingLabel.cs
│   │       │   │   └── PostalRate.cs
│   │       │   ├── Services/
│   │       │   │   ├── PostalService.cs
│   │       │   │   ├── TrackingService.cs
│   │       │   │   ├── LabelService.cs
│   │       │   │   ├── CostCalculationService.cs
│   │       │   │   └── VietnamPostService.cs
│   │       │   ├── Interfaces/
│   │       │   │   ├── IPostalRepository.cs
│   │       │   │   ├── IPostalProvider.cs
│   │       │   │   ├── ITrackingService.cs
│   │       │   │   ├── ILabelService.cs
│   │       │   │   └── ICostCalculator.cs
│   │       │   └── DTOs/
│   │       │       ├── ShipmentDto.cs
│   │       │       ├── TrackingDto.cs
│   │       │       ├── LabelDto.cs
│   │       │       └── CostDto.cs
│   │       ├── DVC.PostalService.Infrastructure/
│   │       │   ├── Repositories/
│   │       │   │   ├── PostalRepository.cs
│   │       │   │   └── TrackingRepository.cs
│   │       │   ├── Data/
│   │       │   │   ├── PostalDbContext.cs
│   │       │   │   └── Migrations/
│   │       │   ├── Providers/
│   │       │   │   ├── VietnamPostProvider.cs
│   │       │   │   ├── EmsProvider.cs
│   │       │   │   └── DhlProvider.cs
│   │       │   ├── External/
│   │       │   │   ├── VietnamPostApiClient.cs
│   │       │   │   └── AddressValidationService.cs
│   │       │   └── Configuration/
│   │       │       └── PostalEntityConfiguration.cs
│   │       └── DVC.PostalService.Tests/
│   ├── Shared/                       # Shared libraries
│   │   ├── DVC.Shared.Core/          # Core shared library
│   │   │   ├── Common/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   ├── AuditableEntity.cs
│   │   │   │   ├── PagedResult.cs
│   │   │   │   └── ApiResponse.cs
│   │   │   ├── Extensions/
│   │   │   │   ├── StringExtensions.cs
│   │   │   │   ├── DateTimeExtensions.cs
│   │   │   │   └── EnumExtensions.cs
│   │   │   ├── Helpers/
│   │   │   │   ├── CryptographyHelper.cs
│   │   │   │   ├── ValidationHelper.cs
│   │   │   │   └── FileHelper.cs
│   │   │   ├── Constants/
│   │   │   │   ├── AppConstants.cs
│   │   │   │   ├── RoleConstants.cs
│   │   │   │   └── ErrorMessages.cs
│   │   │   └── Exceptions/
│   │   │       ├── DvcException.cs
│   │   │       ├── BusinessException.cs
│   │   │       └── ValidationException.cs
│   │   ├── DVC.Shared.Contracts/     # Service contracts
│   │   │   ├── Events/
│   │   │   │   ├── DocumentEvents.cs
│   │   │   │   ├── WorkflowEvents.cs
│   │   │   │   ├── PostalEvents.cs
│   │   │   │   └── UserEvents.cs
│   │   │   ├── Commands/
│   │   │   │   ├── DocumentCommands.cs
│   │   │   │   ├── WorkflowCommands.cs
│   │   │   │   ├── PostalCommands.cs
│   │   │   │   └── UserCommands.cs
│   │   │   ├── Queries/
│   │   │   │   ├── DocumentQueries.cs
│   │   │   │   ├── WorkflowQueries.cs
│   │   │   │   ├── PostalQueries.cs
│   │   │   │   └── UserQueries.cs
│   │   │   └── DTOs/
│   │   │       ├── Common/
│   │   │       ├── Document/
│   │   │       ├── Workflow/
│   │   │       ├── Postal/
│   │   │       └── User/
│   │   ├── DVC.Shared.Infrastructure/ # Shared infrastructure
│   │   │   ├── Database/
│   │   │   │   ├── BaseDbContext.cs
│   │   │   │   ├── UnitOfWork.cs
│   │   │   │   └── Repository.cs
│   │   │   ├── MessageBus/
│   │   │   │   ├── RabbitMqService.cs
│   │   │   │   ├── MessagePublisher.cs
│   │   │   │   └── MessageConsumer.cs
│   │   │   ├── Caching/
│   │   │   │   ├── RedisService.cs
│   │   │   │   ├── CacheManager.cs
│   │   │   │   └── DistributedCache.cs
│   │   │   ├── Logging/
│   │   │   │   ├── StructuredLogger.cs
│   │   │   │   ├── LoggingMiddleware.cs
│   │   │   │   └── LoggingExtensions.cs
│   │   │   ├── Security/
│   │   │   │   ├── JwtService.cs
│   │   │   │   ├── EncryptionService.cs
│   │   │   │   └── HashingService.cs
│   │   │   └── Monitoring/
│   │   │       ├── HealthChecks.cs
│   │   │       ├── MetricsCollector.cs
│   │   │       └── PerformanceMonitor.cs
│   │   └── DVC.Shared.Tests/         # Shared test utilities
│   │       ├── Fixtures/
│   │       ├── Builders/
│   │       └── Helpers/
│   └── Integrations/                 # External system integrations
│       ├── DVC.Integration.LGSP/     # LGSP integration
│       │   ├── Services/
│       │   │   ├── LgspApiClient.cs
│       │   │   └── LgspDataSync.cs
│       │   ├── Models/
│       │   │   ├── LgspRequest.cs
│       │   │   └── LgspResponse.cs
│       │   └── Configuration/
│       │       └── LgspConfiguration.cs
│       ├── DVC.Integration.SMS/      # SMS gateway integration
│       │   ├── Providers/
│       │   │   ├── IMessageProvider.cs
│       │   │   ├── ViettelProvider.cs
│       │   │   ├── MobiFoneProvider.cs
│       │   │   └── VinaPhoneProvider.cs
│       │   └── Models/
│       │       ├── SmsMessage.cs
│       │       └── DeliveryReport.cs
│       ├── DVC.Integration.Postal/   # Postal service integration
│       │   ├── Services/
│       │   │   ├── VietnamPostClient.cs
│       │   │   ├── EmsApiClient.cs
│       │   │   └── PostalWebhookHandler.cs
│       │   ├── Models/
│       │   │   ├── PostalRequest.cs
│       │   │   ├── PostalResponse.cs
│       │   │   ├── TrackingUpdate.cs
│       │   │   └── PostalWebhook.cs
│       │   └── Configuration/
│       │       └── PostalConfiguration.cs
│       └── DVC.Integration.DigitalSignature/ # Digital signature
│           ├── Services/
│           │   ├── UsbTokenService.cs
│           │   └── CertificateValidator.cs
│           └── Models/
│               ├── Certificate.cs
│               └── SignatureResult.cs
├── tests/                            # Test projects
│   ├── Unit/
│   │   ├── DVC.UserService.Tests/
│   │   ├── DVC.WorkflowService.Tests/
│   │   ├── DVC.DocumentService.Tests/
│   │   ├── DVC.NotificationService.Tests/
│   │   └── DVC.PostalService.Tests/
│   ├── Integration/
│   │   ├── DVC.Integration.Tests/
│   │   └── DVC.Api.Tests/
│   └── Performance/
│       ├── DVC.LoadTests/
│       └── DVC.StressTests/
├── tools/                            # Development tools
│   ├── DatabaseMigration/
│   ├── CodeGeneration/
│   └── TestDataSeeder/
└── docker/                           # Docker configurations
    ├── Dockerfile.ApiGateway
    ├── Dockerfile.UserService
    ├── Dockerfile.WorkflowService
    ├── Dockerfile.DocumentService
    ├── Dockerfile.NotificationService
    ├── Dockerfile.PostalService
    └── docker-compose.yml
```

---

## 4. Infrastructure Structure

### 4.1 Deployment Infrastructure
```
src/infrastructure/
├── terraform/                       # Infrastructure as Code
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── production/
│   ├── modules/
│   │   ├── networking/
│   │   ├── compute/
│   │   ├── database/
│   │   ├── storage/
│   │   ├── monitoring/
│   │   └── security/
│   └── scripts/
├── kubernetes/                      # K8s manifests
│   ├── namespaces/
│   ├── configmaps/
│   ├── secrets/
│   ├── deployments/
│   │   ├── api-gateway.yaml
│   │   ├── user-service.yaml
│   │   ├── workflow-service.yaml
│   │   ├── document-service.yaml
│   │   ├── notification-service.yaml
│   │   └── postal-service.yaml
│   ├── services/
│   ├── ingress/
│   ├── hpa/                         # Horizontal Pod Autoscaler
│   └── monitoring/
│       ├── prometheus/
│       ├── grafana/
│       └── alertmanager/
├── helm/                            # Helm charts
│   ├── dvc-platform/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-dev.yaml
│   │   ├── values-prod.yaml
│   │   └── templates/
│   └── databases/
│       ├── sqlserver/
│       ├── redis/
│       ├── rabbitmq/
│       └── elasticsearch/
├── ansible/                         # Configuration management
│   ├── playbooks/
│   ├── roles/
│   └── inventory/
└── monitoring/                      # Monitoring configurations
    ├── prometheus/
    │   ├── prometheus.yml
    │   └── rules/
    ├── grafana/
    │   ├── dashboards/
    │   └── datasources/
    ├── elasticsearch/
    │   ├── mappings/
    │   └── pipelines/
    └── kibana/
        └── dashboards/
```

### 4.2 Database Structure
```
database/
├── sqlserver/                       # SQL Server databases
│   ├── DVC_Command/                 # Write database
│   │   ├── schemas/
│   │   │   ├── dbo/
│   │   │   ├── audit/
│   │   │   ├── workflow/
│   │   │   └── security/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_audit_tables.sql
│   │   │   └── 003_workflow_tables.sql
│   │   ├── stored-procedures/
│   │   ├── functions/
│   │   ├── triggers/
│   │   └── indexes/
│   ├── DVC_Query/                   # Read database
│   │   ├── views/
│   │   │   ├── vw_document_dashboard.sql
│   │   │   ├── vw_performance_metrics.sql
│   │   │   └── vw_workload_distribution.sql
│   │   ├── materialized-views/
│   │   ├── columnstore-indexes/
│   │   └── aggregation-tables/
│   └── sharding/
│       ├── north-region/
│       ├── central-region/
│       └── south-region/
├── redis/                           # Redis configurations
│   ├── cluster-config/
│   ├── sentinel-config/
│   ├── lua-scripts/
│   └── modules/
│       ├── redisearch/
│       ├── redisjson/
│       └── redistimeseries/
├── elasticsearch/                   # Elasticsearch setup
│   ├── index-templates/
│   ├── mapping-templates/
│   ├── ingest-pipelines/
│   ├── ilm-policies/
│   └── cluster-settings/
└── minio/                          # Object storage
    ├── bucket-policies/
    ├── lifecycle-policies/
    ├── encryption-config/
    └── access-policies/
```

---

## 5. Configuration Structure

### 5.1 Configuration Files
```
config/
├── environments/
│   ├── development.json
│   ├── staging.json
│   ├── production.json
│   └── local.json
├── services/
│   ├── api-gateway.json
│   ├── user-service.json
│   ├── workflow-service.json
│   ├── document-service.json
│   ├── notification-service.json
│   └── postal-service.json
├── integrations/
│   ├── lgsp-config.json
│   ├── sms-providers.json
│   ├── postal-providers.json
│   └── signature-config.json
├── security/
│   ├── jwt-config.json
│   ├── cors-policy.json
│   └── ssl-certificates/
├── database/
│   ├── connection-strings.json
│   ├── migration-settings.json
│   └── performance-settings.json
└── logging/
    ├── serilog-config.json
    ├── elasticsearch-config.json
    └── structured-logging.json
```

### 5.2 Secrets Management
```
secrets/
├── development/
│   ├── database-passwords
│   ├── api-keys
│   ├── certificates
│   └── encryption-keys
├── staging/
└── production/
    ├── database-passwords
    ├── api-keys
    ├── certificates
    ├── encryption-keys
    ├── oauth-secrets
    └── third-party-tokens
```

---

## 6. Documentation Structure

### 6.1 Technical Documentation
```
docs/
├── prd/                             # Product Requirements
│   ├── PRD.MD                       # Main PRD
│   ├── sub-prd/                     # Specialized PRDs
│   │   ├── frontend-prd.md
│   │   ├── backend-prd.md
│   │   └── database-prd.md
│   └── structure/                   # This document
│       └── project-structure.md
├── architecture/
│   ├── system-overview.md
│   ├── microservices-design.md
│   ├── database-design.md
│   ├── integration-patterns.md
│   └── security-architecture.md
├── api/
│   ├── swagger/                     # OpenAPI specs
│   │   ├── user-service.yaml
│   │   ├── workflow-service.yaml
│   │   ├── document-service.yaml
│   │   ├── notification-service.yaml
│   │   └── postal-service.yaml
│   ├── postman/                     # API collections
│   └── examples/                    # Request/response examples
├── deployment/
│   ├── installation-guide.md
│   ├── configuration-guide.md
│   ├── scaling-guide.md
│   ├── backup-procedures.md
│   └── disaster-recovery.md
├── development/
│   ├── getting-started.md
│   ├── coding-standards.md
│   ├── testing-guidelines.md
│   ├── debugging-guide.md
│   └── contribution-guidelines.md
├── user-guides/
│   ├── civil-servant-manual.md
│   ├── admin-guide.md
│   ├── workflow-designer-guide.md
│   └── troubleshooting.md
└── operations/
    ├── monitoring-guide.md
    ├── performance-tuning.md
    ├── security-checklist.md
    └── maintenance-procedures.md
```

---

## 7. Testing Structure

### 7.1 Test Organization
```
tests/
├── frontend/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── stores/
│   ├── integration/
│   │   ├── api-integration/
│   │   ├── authentication/
│   │   └── workflow-integration/
│   ├── e2e/
│   │   ├── document-processing.spec.ts
│   │   ├── workflow-designer.spec.ts
│   │   ├── user-management.spec.ts
│   │   └── notifications.spec.ts
│   └── visual/
│       ├── screenshots/
│       └── visual-regression/
├── backend/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   └── utilities/
│   ├── integration/
│   │   ├── database/
│   │   ├── external-apis/
│   │   ├── message-queue/
│   │   └── file-storage/
│   ├── contract/
│   │   ├── api-contracts/
│   │   └── message-contracts/
│   └── performance/
│       ├── load-tests/
│       ├── stress-tests/
│       └── spike-tests/
├── infrastructure/
│   ├── terraform-tests/
│   ├── kubernetes-tests/
│   └── security-tests/
└── test-data/
    ├── fixtures/
    ├── mock-data/
    ├── sample-documents/
    └── test-scenarios/
```

---

## 8. Build & Deployment Structure

### 8.1 CI/CD Pipeline Structure
```
.github/                             # GitHub Actions
├── workflows/
│   ├── frontend-ci.yml
│   ├── backend-ci.yml
│   ├── infrastructure-ci.yml
│   ├── security-scan.yml
│   ├── performance-test.yml
│   └── deployment.yml
├── actions/                         # Custom actions
│   ├── setup-dotnet/
│   ├── setup-node/
│   ├── deploy-service/
│   └── notify-teams/
└── templates/
    ├── pr-template.md
    └── issue-template.md

scripts/
├── build/
│   ├── build-frontend.sh
│   ├── build-backend.sh
│   ├── build-docker.sh
│   └── build-all.sh
├── deployment/
│   ├── deploy-dev.sh
│   ├── deploy-staging.sh
│   ├── deploy-prod.sh
│   ├── rollback.sh
│   └── health-check.sh
├── database/
│   ├── migrate-up.sh
│   ├── migrate-down.sh
│   ├── seed-data.sh
│   └── backup-db.sh
└── utilities/
    ├── generate-certs.sh
    ├── setup-environment.sh
    ├── cleanup.sh
    └── monitor-health.sh
```

---

## 9. Security & Compliance Structure

### 9.1 Security Components
```
security/
├── certificates/
│   ├── ca-certificates/
│   ├── service-certificates/
│   └── client-certificates/
├── policies/
│   ├── network-policies.yaml
│   ├── pod-security-policies.yaml
│   ├── rbac-policies.yaml
│   └── admission-controllers.yaml
├── scanning/
│   ├── container-scan-configs/
│   ├── dependency-scan-configs/
│   └── vulnerability-reports/
├── compliance/
│   ├── audit-rules/
│   ├── compliance-reports/
│   └── security-checklists/
└── monitoring/
    ├── security-alerts/
    ├── intrusion-detection/
    └── compliance-monitoring/
```

---

## 10. Implementation Priority

### 10.1 Development Phases

**Phase 1: Foundation (Week 1-8)**
```
✅ Core project structure setup
✅ User Service basic implementation
✅ Basic authentication & authorization
✅ Database schema & migrations
✅ API Gateway configuration
✅ Frontend authentication pages
```

**Phase 2: Core Features (Week 9-16)**
```
✅ Document Service implementation
✅ Workflow Service with Elsa integration
✅ Document intake & processing UI
✅ Basic dashboard implementation
✅ File upload & storage integration
```

**Phase 3: Advanced Features (Week 17-22)**
```
✅ Workflow Designer UI
✅ Digital signature integration
✅ Real-time notifications
✅ Advanced document processing
✅ Reporting & analytics
```

**Phase 4: Integration & Testing (Week 23-26)**
```
✅ LGSP integration
✅ SMS gateway integration
✅ End-to-end testing
✅ Performance optimization
✅ Security hardening
```

---

This structure provides a comprehensive foundation for implementing the DVC v2 system based on the frontend and backend PRD specifications.