# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- **Development server**: `npm run dev` (starts Next.js dev server on http://localhost:3000)
- **Build**: `npm run build` (production build)
- **Start production**: `npm start` (serve production build)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Format**: `npm run format` (Prettier formatting)

### Testing
- **E2E tests**: `npm run test:e2e` (Playwright tests)
- **E2E UI mode**: `npm run test:e2e:ui` (interactive Playwright UI)
- **Test reports**: `npm run test:e2e:report` (show test results)

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + custom CSS files
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright for E2E
- **Real-time**: SignalR WebSocket connections

### Project Structure
- **App Router**: Uses route groups `(auth)` and `(dashboard)` for logical separation
- **Components**: Organized by feature domains (ui/, layout/, auth/, documents/, workflow/, postal/, etc.)
- **State**: Zustand stores in `src/store/` for client state, TanStack Query for server state
- **Hooks**: Custom hooks in `src/hooks/` for business logic and API calls
- **Types**: TypeScript definitions in `src/types/` organized by domain

### Key Architectural Patterns
1. **Feature-based organization**: Components grouped by business domain
2. **Composition over inheritance**: Small, composable components (max 100 lines)
3. **Custom hooks**: Business logic extracted into reusable hooks
4. **Strict typing**: All components and functions have proper TypeScript interfaces
5. **CSS-first styling**: No inline styles, separate CSS files for components

## Coding Standards

### Component Rules (Strictly Enforced)
- **Maximum 100 lines** per component/function
- **Single responsibility** principle - one purpose per component
- **CSS files only** - no inline styles allowed
- **Strict TypeScript** - proper interfaces for all props and data
- **Component composition** - break down large components into smaller ones

### File Naming Conventions
- Components: `kebab-case.tsx` (e.g., `document-card.tsx`)
- Hooks: `use-feature-name.ts` (e.g., `use-document.ts`)
- Types: `domain.ts` (e.g., `document.ts`, `auth.ts`)
- Stores: `feature-store.ts` (e.g., `document-store.ts`)

### Import Organization
```tsx
// 1. React/Next.js imports
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports (components, hooks, utils)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 4. Types
import type { DocumentDto } from '@/types/document';

// 5. Styles (last)
import './component.css';
```

## API and Data Flow

### API Routes
- **Authentication**: `/api/auth` - handles login/logout
- **File uploads**: `/api/upload` - handles document uploads
- **Backend proxy**: `/api/proxy/[...path]` - proxies requests to backend API

### State Management Pattern
- **Server state**: TanStack Query for API calls and caching
- **Client state**: Zustand stores for UI state and cross-component data
- **Form state**: React Hook Form with Zod validation schemas
- **Real-time updates**: SignalR WebSocket connections via custom hooks

### Custom Hooks Pattern
Each feature domain has dedicated hooks:
- `use-auth.ts` - authentication state and operations
- `use-document.ts` - document CRUD operations
- `use-workflow.ts` - workflow operations
- `use-postal.ts` - postal service operations
- `use-websocket.ts` - real-time connections

## Security Requirements

### Input Validation
- All forms use Zod schemas for validation
- File uploads have strict type and size validation
- HTML content is sanitized with DOMPurify before rendering

### Authentication
- Middleware protects dashboard and API routes
- Permission-based access control via `use-permissions.ts`
- MFA support for enhanced security

## Development Guidelines

### Before Making Changes
1. Check existing component patterns in the same feature domain
2. Follow the 100-line limit strictly - break down if needed
3. Use existing utilities and libraries already in the codebase
4. Maintain TypeScript strict mode compliance

### Adding New Features
1. Create feature-specific components in appropriate domain folder
2. Add custom hooks for business logic
3. Define types in `src/types/[domain].ts`
4. Add Zustand store if cross-component state is needed
5. Follow security patterns for data validation

### Testing Requirements
- E2E tests for critical user flows
- Test authentication flows and protected routes
- Validate form submissions and error handling

## Common Patterns

### Form Handling
```tsx
const schema = z.object({
  title: z.string().min(3),
  // ... other fields
});

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  // ...
};
```

### API Calls with TanStack Query
```tsx
const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsApi.getDocuments(filters),
    staleTime: 5 * 60 * 1000
  });
};
```

### Zustand Store Pattern
```tsx
interface FeatureStore {
  data: FeatureData[];
  selectedIds: number[];
  setData: (data: FeatureData[]) => void;
  toggleSelection: (id: number) => void;
}

const useFeatureStore = create<FeatureStore>((set) => ({
  // implementation
}));
```

## Environment Setup
- Copy `.env.local.example` to `.env.local`
- Node.js version: >= 18.17.0
- All dependencies managed via npm (use `npm install`)