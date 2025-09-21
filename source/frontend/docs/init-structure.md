# Kế hoạch triển khai khung sườn DVC v2 Frontend

## Tổng quan dự án
Xây dựng hệ thống xử lý văn bản chính phủ với NextJS 14, phục vụ 25,000 công chức với 21,000 kết nối đồng thời.

## CHECKLIST CHI TIẾT - KHÔNG MISS TASK

### 📦 1. Khởi tạo dự án & cấu hình cơ bản
- [ ] Tạo NextJS 14 project với TypeScript
- [ ] Cấu hình package.json với dependencies cần thiết
- [ ] Setup next.config.js với App Router và cấu hình tối ưu
- [ ] Cấu hình TypeScript (tsconfig.json) với strict mode
- [ ] Setup Tailwind CSS (tailwind.config.js)
- [ ] Cấu hình ESLint (.eslintrc.json)
- [ ] Setup Prettier (.prettierrc)
- [ ] Tạo .env.local template
- [ ] Setup Playwright config cho E2E testing

### 🏗️ 2. Cấu trúc thư mục cơ bản
- [ ] Tạo cấu trúc thư mục public/
  - [ ] public/images/
  - [ ] public/icons/
  - [ ] public/documents/
- [ ] Tạo cấu trúc src/ với các thư mục chính
  - [ ] src/app/
  - [ ] src/components/
  - [ ] src/lib/
  - [ ] src/hooks/
  - [ ] src/store/
  - [ ] src/types/
  - [ ] src/styles/

### 📄 3. App Router - Pages Structure
- [ ] Root layout (src/app/layout.tsx)
- [ ] Global error page (src/app/error.tsx)
- [ ] Loading UI (src/app/loading.tsx)
- [ ] 404 page (src/app/not-found.tsx)
- [ ] Homepage (src/app/page.tsx)

**Route Groups:**
- [ ] (auth) group với layout riêng
  - [ ] login/page.tsx
  - [ ] setup-mfa/page.tsx
  - [ ] forgot-password/page.tsx
- [ ] (dashboard) group với layout chính
  - [ ] dashboard/page.tsx
  - [ ] intake/page.tsx, scan/page.tsx, batch/page.tsx
  - [ ] documents/page.tsx với dynamic routes [id]
  - [ ] workflows/page.tsx với designer
  - [ ] procedures/page.tsx
  - [ ] postal/page.tsx với các sub-routes
  - [ ] reports/page.tsx
  - [ ] admin/page.tsx với users/roles/settings

### 🎨 4. UI Components cơ bản
- [ ] Base UI components (src/components/ui/)
  - [ ] button.tsx
  - [ ] input.tsx
  - [ ] modal.tsx
  - [ ] table.tsx
  - [ ] form.tsx
  - [ ] card.tsx
  - [ ] badge.tsx
  - [ ] progress.tsx
  - [ ] toast.tsx
- [ ] Layout components (src/components/layout/)
  - [ ] header.tsx
  - [ ] sidebar.tsx
  - [ ] breadcrumb.tsx
  - [ ] navigation.tsx
  - [ ] footer.tsx

### 🔐 5. Authentication Components
- [ ] login-form.tsx với validation
- [ ] mfa-setup.tsx cho 2FA
- [ ] password-reset.tsx
- [ ] protected-route.tsx wrapper

### 📊 6. Core Feature Components
- [ ] Dashboard components
  - [ ] processing-dashboard.tsx
  - [ ] stats-cards.tsx
  - [ ] document-tabs.tsx
  - [ ] document-list.tsx
  - [ ] workspace-menu.tsx
  - [ ] quick-actions.tsx
- [ ] Document intake components
  - [ ] document-scanner.tsx
  - [ ] batch-processor.tsx
  - [ ] metadata-form.tsx
  - [ ] validation-panel.tsx
- [ ] Workflow components
  - [ ] workflow-designer.tsx (skeleton)
  - [ ] bpmn-canvas.tsx (skeleton)
  - [ ] tool-palette.tsx
  - [ ] properties-panel.tsx

### 🔧 7. Utilities & Configurations
- [ ] API client setup (src/lib/api.ts)
- [ ] Authentication utilities (src/lib/auth.ts)
- [ ] Validation schemas với Zod (src/lib/validations.ts)
- [ ] Constants định nghĩa (src/lib/constants.ts)
- [ ] Date utilities (src/lib/date-utils.ts)
- [ ] File utilities (src/lib/file-utils.ts)
- [ ] Permission checking (src/lib/permissions.ts)

### 🪝 8. Custom Hooks
- [ ] use-auth.ts cho authentication
- [ ] use-api.ts cho API calls
- [ ] use-websocket.ts cho SignalR
- [ ] use-notifications.ts
- [ ] use-document.ts
- [ ] use-workflow.ts
- [ ] use-postal.ts
- [ ] use-permissions.ts
- [ ] use-debounce.ts
- [ ] use-local-storage.ts

### 🗃️ 9. State Management (Zustand)
- [ ] auth-store.ts cho authentication state
- [ ] document-store.ts cho document state
- [ ] notification-store.ts
- [ ] postal-store.ts
- [ ] ui-store.ts cho theme/sidebar
- [ ] workflow-store.ts
- [ ] Store exports trong index.ts

### 📝 10. TypeScript Types
- [ ] auth.ts types (User, Session, etc.)
- [ ] document.ts types (DocumentDto, Status)
- [ ] workflow.ts types (WorkflowNode, Connection)
- [ ] postal.ts types (Shipment, Tracking)
- [ ] api.ts response types
- [ ] notification.ts types
- [ ] Export file index.ts

### 🎨 11. Styling Setup
- [ ] globals.css với Tailwind directives
- [ ] components.css cho component styles
- [ ] themes/light.css
- [ ] themes/dark.css
- [ ] Tailwind custom classes trong globals.css

### 🛣️ 12. API Routes
- [ ] api/auth/route.ts cho authentication
- [ ] api/upload/route.ts cho file uploads
- [ ] api/proxy/[...path]/route.ts cho backend proxy

### ⚙️ 13. Middleware & Config
- [ ] middleware.ts cho authentication check
- [ ] Setup environment variables template

### 🧪 14. Testing Setup
- [ ] Jest config cho unit tests
- [ ] Playwright config cho E2E
- [ ] Sample test files

### 📚 15. Documentation
- [ ] README.md với setup instructions
- [ ] API documentation template
- [ ] Component documentation

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