# Coding Standards and Conventions

## Component Rules (Strictly Enforced)
- **Maximum 100 lines** per component/function
- **Single responsibility** principle - one purpose per component
- **CSS files only** - no inline styles allowed
- **Strict TypeScript** - proper interfaces for all props and data
- **Component composition** - break down large components into smaller ones

## File Naming Conventions
- **Components**: `kebab-case.tsx` (e.g., `document-card.tsx`)
- **Hooks**: `use-feature-name.ts` (e.g., `use-document.ts`)
- **Types**: `domain.ts` (e.g., `document.ts`, `auth.ts`)
- **Stores**: `feature-store.ts` (e.g., `document-store.ts`)
- **CSS Files**: Match component names (`component-name.css`)

## Import Organization (Required Order)
1. **React/Next.js imports**
2. **Third-party libraries**
3. **Internal imports** (components, hooks, utils)
4. **Types**
5. **Styles** (last)

## TypeScript Standards
- **Strict mode enabled** - all types must be properly defined
- **No `any` types** - use proper typing or `unknown`
- **Interface over type** for object definitions
- **Path aliases**: Use `@/*` for src imports
- **Export patterns**: Named exports preferred over default

## Code Style (Prettier Configuration)
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in ES5 contexts
- **100 character** line width
- **2 spaces** for indentation
- **No trailing whitespace**

## Architecture Patterns
1. **Feature-based organization**: Components grouped by business domain
2. **Composition over inheritance**: Small, composable components
3. **Custom hooks**: Business logic extracted into reusable hooks
4. **Separation of concerns**: UI, state, and business logic separated
5. **CSS-first styling**: External CSS files, no inline styles

## State Management Patterns
- **Server state**: TanStack Query for API calls and caching
- **Client state**: Zustand stores for UI state and cross-component data
- **Form state**: React Hook Form with Zod validation schemas
- **Real-time updates**: SignalR WebSocket connections via custom hooks

## Security Requirements
- **Input validation**: All forms use Zod schemas
- **File upload validation**: Strict type and size validation
- **HTML sanitization**: Use DOMPurify for user content
- **Permission checks**: Use `use-permissions.ts` hook
- **No secrets in code**: Environment variables for configuration