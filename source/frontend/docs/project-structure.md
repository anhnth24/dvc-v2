# Frontend Project Structure
## NextJS 14 Application Structure

**Component:** Frontend
**Technology:** NextJS 14 with TypeScript
**Last Updated:** September 21, 2025

---

## Application Structure

```
source/frontend/
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

## Key Architecture Decisions

### NextJS 14 App Router
- **Route Groups**: `(auth)` and `(dashboard)` for logical separation
- **File-based Routing**: Automatic route generation
- **Server Components**: Default server-side rendering
- **API Routes**: Backend proxy and file upload handling

### Component Architecture
- **UI Components**: Reusable base components
- **Feature Components**: Domain-specific components by module
- **Layout Components**: Navigation and structural elements

### State Management
- **Zustand**: Simple, TypeScript-friendly state management
- **Server State**: Tanstack Query for API state
- **Local State**: React hooks for component state

### Styling Strategy
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styles when needed
- **Theme System**: Light/dark mode support

---
**Component**: Frontend (NextJS 14)
**Last Updated**: September 21, 2025