# Frontend Quick Reference - DVC v2

## Overview
NextJS 14 application serving 25,000 civil servants with 21,000 concurrent connections for government document processing.

## Key Features
- **NextJS 14**: SSR/SSG web platform with App Router
- **Admin Dashboard**: Document processing and workflow management
- **Visual Workflow Designer**: Drag-drop BPMN editor
- **Real-time Updates**: SignalR WebSocket connections
- **Responsive Design**: Desktop and tablet support

## Performance Targets
- **Page Load**: <2 seconds (Google PageSpeed)
- **Concurrent Users**: 21,000 civil servants
- **Satisfaction**: 90% civil servant satisfaction score
- **Accessibility**: WCAG 2.1 AA compliance

## Quick Setup

### NextJS Configuration
```typescript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['dvc-storage.gov.vn'],
  },
};
```

### State Management (Zustand)
```typescript
export const useDocumentStore = create<DocumentState>()((set) => ({
  documents: [],
  selectedDocument: null,
  setDocuments: (documents) => set({ documents }),
  selectDocument: (document) => set({ selectedDocument: document }),
}));
```

### Document Intake Component
```tsx
export default function DocumentIntakePage() {
  const { pendingDocuments } = useDocumentIntake();

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentIntakeQueue documents={pendingDocuments} />
    </div>
  );
}
```

## Project Structure
```
src/
├── app/                    # NextJS 14 App Router
├── components/             # Reusable components
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state management
├── types/                  # TypeScript definitions
└── styles/                 # Styling files
```

## Code Examples
- **Document Intake**: [nextjs-document-intake.tsx](../code-examples/frontend/nextjs-document-intake.tsx)
- **State Management**: [state-management-zustand.ts](../code-examples/frontend/state-management-zustand.ts)

## Full Documentation
- **Complete Guide**: [Frontend PRD](../prd/sub-prd/frontend-prd.md)