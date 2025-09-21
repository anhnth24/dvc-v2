# Kế hoạch triển khai khung sườn DVC v2 Frontend

## Tổng quan dự án
Xây dựng hệ thống xử lý văn bản chính phủ với NextJS 14, phục vụ 25,000 công chức với 21,000 kết nối đồng thời.

## CHECKLIST CHI TIẾT - KHÔNG MISS TASK

### 📦 1. Khởi tạo dự án & cấu hình cơ bản
- [x] Tạo NextJS 14 project với TypeScript
- [x] Cấu hình package.json với dependencies cần thiết
- [x] Setup next.config.js với App Router và cấu hình tối ưu
- [x] Cấu hình TypeScript (tsconfig.json) với strict mode
- [x] Setup Tailwind CSS (tailwind.config.js)
- [x] Cấu hình ESLint (.eslintrc.json)
- [x] Setup Prettier (.prettierrc)
- [x] Tạo .env.local template
- [x] Setup Playwright config cho E2E testing

### 🏗️ 2. Cấu trúc thư mục cơ bản
- [x] Tạo cấu trúc thư mục public/
  - [x] public/images/
  - [x] public/icons/
  - [x] public/documents/
- [x] Tạo cấu trúc src/ với các thư mục chính
  - [x] src/app/
  - [x] src/components/
  - [x] src/lib/
  - [x] src/hooks/
  - [x] src/store/
  - [x] src/types/
  - [x] src/styles/

### 📄 3. App Router - Pages Structure
- [x] Root layout (src/app/layout.tsx)
- [x] Global error page (src/app/error.tsx)
- [x] Loading UI (src/app/loading.tsx)
- [x] 404 page (src/app/not-found.tsx)
- [x] Homepage (src/app/page.tsx)

**Route Groups:**
- [x] (auth) group với layout riêng
  - [x] login/page.tsx
  - [x] setup-mfa/page.tsx
  - [x] forgot-password/page.tsx
- [x] (dashboard) group với layout chính
  - [x] dashboard/page.tsx
  - [x] intake/page.tsx, scan/page.tsx, batch/page.tsx
  - [x] documents/page.tsx với dynamic routes [id]
  - [x] workflows/page.tsx với designer
  - [x] procedures/page.tsx
  - [x] postal/page.tsx với các sub-routes
  - [x] reports/page.tsx
  - [x] admin/page.tsx với users/roles/settings

### 🎨 4. UI Components cơ bản
- [x] Base UI components (src/components/ui/)
  - [x] button.tsx
  - [x] input.tsx
  - [x] modal.tsx
  - [x] table.tsx
  - [x] form.tsx
  - [x] card.tsx
  - [x] badge.tsx
  - [x] progress.tsx
  - [x] toast.tsx
- [x] Layout components (src/components/layout/)
  - [x] header.tsx
  - [x] sidebar.tsx
  - [x] breadcrumb.tsx
  - [x] navigation.tsx
  - [x] footer.tsx

### 🔐 5. Authentication Components
- [x] login-form.tsx với validation (skeleton)
- [x] mfa-setup.tsx cho 2FA (skeleton)
- [x] password-reset.tsx
- [x] protected-route.tsx wrapper

### 📊 6. Core Feature Components
- [x] Dashboard components
  - [x] processing-dashboard.tsx
  - [x] stats-cards.tsx
  - [x] document-tabs.tsx
  - [x] document-list.tsx
  - [x] workspace-menu.tsx
  - [x] quick-actions.tsx
- [x] Document intake components
  - [x] document-scanner.tsx
  - [x] batch-processor.tsx
  - [x] metadata-form.tsx
  - [x] validation-panel.tsx
- [x] Workflow components
  - [x] workflow-designer.tsx (skeleton)
  - [x] bpmn-canvas.tsx (skeleton)
  - [x] tool-palette.tsx
  - [x] properties-panel.tsx

### 🔧 7. Utilities & Configurations
- [x] API client setup (src/lib/api.ts)
- [x] Authentication utilities (src/lib/auth.ts)
- [x] Validation schemas với Zod (src/lib/validations.ts)
- [x] Constants định nghĩa (src/lib/constants.ts)
- [x] Date utilities (src/lib/date-utils.ts)
- [x] File utilities (src/lib/file-utils.ts)
- [x] Permission checking (src/lib/permissions.ts)

### 🪝 8. Custom Hooks
- [x] use-auth.ts cho authentication
- [x] use-api.ts cho API calls
- [x] use-websocket.ts cho SignalR
- [x] use-notifications.ts
- [x] use-document.ts
- [x] use-workflow.ts
- [x] use-postal.ts
- [x] use-permissions.ts
- [x] use-debounce.ts
- [x] use-local-storage.ts

### 🗃️ 9. State Management (Zustand)
- [x] auth-store.ts cho authentication state
- [x] document-store.ts cho document state
- [x] notification-store.ts
- [x] postal-store.ts
- [x] ui-store.ts cho theme/sidebar
- [x] workflow-store.ts
- [x] Store exports trong index.ts

### 📝 10. TypeScript Types
- [x] auth.ts types (User, Session, etc.)
- [x] document.ts types (DocumentDto, Status)
- [x] workflow.ts types (WorkflowNode, Connection)
- [x] postal.ts types (Shipment, Tracking)
- [x] api.ts response types
- [x] notification.ts types
- [x] Export file index.ts

### 🎨 11. Styling Setup
- [x] globals.css với Tailwind directives
- [x] components.css cho component styles
- [x] themes/light.css
- [x] themes/dark.css
- [x] Tailwind custom classes trong globals.css

### 🛣️ 12. API Routes
- [x] api/auth/route.ts cho authentication
- [x] api/upload/route.ts cho file uploads
- [x] api/proxy/[...path]/route.ts cho backend proxy

### ⚙️ 13. Middleware & Config
- [x] middleware.ts cho authentication check
- [x] Setup environment variables template

### 🧪 14. Testing Setup
- [ ] Jest config cho unit tests
- [x] Playwright config cho E2E
- [x] Sample test files

### 📚 15. Documentation
- [x] README.md với setup instructions
- [x] API documentation template
- [x] Component documentation

## Nguyên tắc Implementation

### Code Standards
1. **Không tạo code ví dụ** - chỉ tạo skeleton/boilerplate
2. **Tuân thủ quy tắc 100 dòng/component**
3. **Sử dụng CSS files, không inline styles**
4. **TypeScript strict mode**
5. **Single responsibility cho mỗi component**
6. **Security first - validation tất cả inputs**

### File Structure Principles
- Mỗi component có file CSS riêng
- Export components qua index.ts files
- TypeScript interfaces cho tất cả props
- Consistent naming conventions

## Dependencies cần thiết

### Core Framework
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### Styling
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "clsx": "^2.0.0"
}
```

### State Management
```json
{
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.45.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### Security & Utils
```json
{
  "dompurify": "^3.0.0",
  "@microsoft/signalr": "^7.0.0",
  "date-fns": "^2.30.0"
}
```

### Development
```json
{
  "eslint": "^8.48.0",
  "prettier": "^3.0.0",
  "@types/node": "^20.5.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "playwright": "^1.37.0",
  "@playwright/test": "^1.37.0"
}
```

## Thứ tự triển khai

### Phase 1: Foundation (Ngày 1-2)
1. Khởi tạo project & config
2. Tạo cấu trúc thư mục
3. Setup routing & layouts
4. Implement base components

### Phase 2: Core Infrastructure (Ngày 3-4)
5. Setup state management
6. Implement hooks & utilities
7. Setup API integration
8. Add authentication flow

### Phase 3: Features (Ngày 5-7)
9. Implement core features
10. Setup testing
11. Documentation
12. Performance optimization

## Expected Deliverables

### File Count Estimate
- **Total files**: ~150+ files
- **Components**: ~60 files
- **Pages**: ~25 files
- **Hooks**: ~15 files
- **Utils**: ~10 files
- **Types**: ~8 files
- **Stores**: ~6 files
- **Config files**: ~10 files

### Performance Targets
- Initial bundle size: <500KB gzipped
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

---

**Component**: Frontend Skeleton Plan
**Created**: September 21, 2025
**Technology**: NextJS 14, TypeScript, Tailwind CSS