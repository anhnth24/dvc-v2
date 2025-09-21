# Frontend Product Requirements Document (PRD)
## Hệ Thống Quản Lý Thủ Tục Hành Chính - Frontend Applications

**Version:** 1.0
**Ngày tạo:** 20/12/2024
**Người tạo:** Frontend Architecture Team
**Trạng thái:** Draft
**Parent Document:** [Main PRD](../PRD.MD)
**Quick Reference:** [Frontend Summary](../../quick-reference/frontend-summary.md)
**Code Examples:** [Frontend Examples](../../code-examples/frontend/)

---

## 1. Executive Summary

Frontend system nội bộ phục vụ 25,000 cán bộ công chức với 21,000 concurrent connections qua NextJS 14 application. Bao gồm Admin Dashboard (xử lý hồ sơ), Workflow Designer (thiết kế quy trình), Document Processing Interface, và Real-time Analytics. SSR/SSG tối ưu performance <2s page load, responsive design cross-platform, real-time updates qua SignalR WebSocket. State management với Zustand, UI components với TypeScript, accessibility WCAG 2.1 AA.

## 2. Scope & Objectives

### 2.1 In Scope
- **NextJS 14 Application:** SSR/SSG web platform cho cán bộ công chức
- **Admin Dashboard:** Document processing, workflow management
- **Document Processing Interface:** Tiếp nhận, xử lý, phê duyệt hồ sơ
- **Visual Workflow Designer:** Drag-drop BPMN editor
- **Real-time Features:** WebSocket notifications, live updates
- **Responsive Design:** Desktop, tablet support

### 2.2 Out of Scope
- Portal nộp hồ sơ cho công dân (hệ thống riêng biệt)
- Portal tra cứu công khai cho công dân (hệ thống riêng biệt)
- Native mobile applications (Phase 2)
- Offline-first capabilities (Phase 2)
- Third-party widget embeds (Phase 3)
- Advanced analytics dashboards (Phase 3)

### 2.3 Success Criteria
- Page load time <2 seconds (Google PageSpeed)
- Support 21,000 concurrent civil servants
- 90% civil servant satisfaction score
- WCAG 2.1 AA accessibility compliance
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Document processing efficiency improved by 50%

---

## 3. NextJS 14 Application Architecture

### 3.1 Rendering Strategies

#### 3.1.1 Server-Side Rendering (SSR)
**SSR Pages:**
```typescript
// Authentication pages
pages/auth/login.tsx                     // Login for government employees
pages/auth/forgot-password.tsx           // Password recovery
pages/auth/setup-mfa.tsx                 // Multi-factor authentication setup

// Internal portal pages
pages/index.tsx                          // Dashboard homepage
pages/procedures/[id].tsx                // Procedure management pages
pages/help/index.tsx                     // Internal help documentation
```

**Performance Optimizations:**
- **Incremental Static Regeneration (ISR):** Procedure catalog pages (revalidate every 1 hour)
- **Edge Runtime:** Authentication pages for faster cold starts
- **Streaming:** Large document lists with React Suspense
- **Partial Hydration:** Above-the-fold content priority

#### 3.1.2 Static Site Generation (SSG)
**SSG Pages:**
```typescript
// Static content
pages/help/index.tsx                     // Help documentation
pages/help/[category]/[article].tsx      // Knowledge base
pages/forms/templates/[id].tsx           // Downloadable forms
pages/about/index.tsx                    // Government information
```

**Build-time Optimizations:**
- **Image Optimization:** Next.js Image component with WebP
- **Code Splitting:** Route-based and component-based splitting
- **Bundle Analysis:** Webpack bundle analyzer integration
- **Static Assets:** CDN distribution for images/documents

#### 3.1.3 Client-Side Rendering (CSR)
**CSR Components:**
```typescript
// Interactive dashboards
components/Dashboard/AdminDashboard.tsx   // Real-time data updates
components/Workflow/Designer.tsx          // Visual workflow editor
components/Documents/UploadWizard.tsx     // File upload with progress
components/Analytics/ReportsView.tsx      // Dynamic charts and graphs
```

### 3.2 Project Structure
```
src/
├── app/                                 # App Router (NextJS 14)
│   ├── (auth)/                         # Route groups
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/                    # Protected routes
│   │   ├── admin/page.tsx
│   │   ├── documents/page.tsx
│   │   └── workflows/page.tsx
│   ├── api/                           # API routes
│   │   ├── auth/route.ts
│   │   └── upload/route.ts
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Homepage
├── components/                        # Reusable components
│   ├── ui/                           # Base UI components
│   ├── forms/                        # Form components
│   ├── layout/                       # Layout components
│   └── dashboard/                    # Dashboard-specific
├── lib/                              # Utilities and configurations
│   ├── auth.ts                       # Authentication config
│   ├── api.ts                        # API client
│   ├── utils.ts                      # Utility functions
│   └── validations.ts                # Form validation schemas
├── hooks/                            # Custom React hooks
├── store/                            # State management
├── types/                            # TypeScript definitions
└── styles/                           # Styling files
```

---

## 4. Core Application Modules

### 4.1 Document Intake Interface

#### 4.1.1 Document Reception Module
**Document Intake Dashboard (`pages/intake/index.tsx`):**
```tsx
export default function DocumentIntakePage() {
  const { pendingDocuments, scanningQueue } = useDocumentIntake();

  return (
    <div className="min-h-screen bg-gray-50">
      <IntakeHeader />
      <div className="grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-3">
          <QuickActions />          {/* Scan, Upload, Batch Process */}
          <RecentActivity />        {/* Recently processed documents */}
          <ProcedureGuide />        {/* Quick reference */}
        </aside>
        <main className="col-span-9">
          <IntakeTabs>
            <TabPanel label="Chờ tiếp nhận" count={pendingDocuments.length}>
              <DocumentIntakeQueue documents={pendingDocuments} />
            </TabPanel>
            <TabPanel label="Đang scan" count={scanningQueue.length}>
              <ScanningProgress documents={scanningQueue} />
            </TabPanel>
          </IntakeTabs>
        </main>
      </div>
    </div>
  );
}
```

**Document Digitization Interface (`components/DocumentDigitization.tsx`):**
```tsx
const DocumentDigitization = () => {
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');
  const { uploadDocument, validateDocument } = useDocumentProcessing();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <ScanModeSelector mode={scanMode} onChange={setScanMode} />

        {scanMode === 'single' ? (
          <SingleDocumentProcessor
            onUpload={uploadDocument}
            onValidate={validateDocument}
          />
        ) : (
          <BatchDocumentProcessor
            onBatchUpload={uploadDocument}
            onBatchValidate={validateDocument}
          />
        )}

        <DocumentValidationPanel />
        <ProcedureAssignment />
      </div>
    </div>
  );
};
```

#### 4.1.2 Document Information Entry
**Document Metadata Form:**
```tsx
const DocumentMetadataForm = ({ documentId }: { documentId: string }) => {
  const { procedures } = useProcedures();
  const { submitMetadata } = useDocumentMetadata();

  return (
    <Form onSubmit={submitMetadata}>
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Loại thủ tục">
          <ProcedureSelector
            procedures={procedures}
            required
          />
        </FormField>

        <FormField label="Độ ưu tiên">
          <PrioritySelector
            options={['Thường', 'Khẩn', 'Hỏa tốc']}
            default="Thường"
          />
        </FormField>

        <FormField label="Thông tin người nộp" className="col-span-2">
          <SubmitterInfoEntry />
        </FormField>

        <FormField label="Ghi chú tiếp nhận" className="col-span-2">
          <ReceptionNotes />
        </FormField>
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit">Hoàn tất tiếp nhận</Button>
      </div>
    </Form>
  );
};
```

### 4.2 Document Processing Dashboard

#### 4.2.1 Main Processing Interface
**Main Dashboard (`components/Dashboard/ProcessingDashboard.tsx`):**
```tsx
const ProcessingDashboard = () => {
  const { user } = useAuth();
  const { documents } = useAssignedDocuments(user.id);
  const { stats } = useDashboardStats();

  return (
    <div className="space-y-6">
      <DashboardHeader stats={stats} />

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <WorkspaceMenu />
          <QuickActions />
          <RecentActivity />
        </aside>

        <main className="col-span-9">
          <DocumentTabs>
            <TabPanel label="Chờ xử lý" count={documents.pending.length}>
              <DocumentList documents={documents.pending} />
            </TabPanel>
            <TabPanel label="Đang xử lý" count={documents.inProgress.length}>
              <DocumentList documents={documents.inProgress} />
            </TabPanel>
            <TabPanel label="Quá hạn" count={documents.overdue.length}>
              <DocumentList documents={documents.overdue} />
            </TabPanel>
            <TabPanel label="Hoàn thành" count={documents.completed.length}>
              <DocumentList documents={documents.completed} />
            </TabPanel>
          </DocumentTabs>
        </main>
      </div>
    </div>
  );
};
```

**Document Processing Modal:**
```tsx
interface DocumentProcessorProps {
  documentId: string;
  onClose: () => void;
}

const DocumentProcessor = ({ documentId, onClose }: DocumentProcessorProps) => {
  const { document } = useDocument(documentId);
  const { updateDocument } = useDocumentMutation();

  return (
    <Modal size="xl" onClose={onClose}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <DocumentViewer files={document.attachments} />
        </div>
        <div className="col-span-4">
          <DocumentInfo document={document} />
          <WorkflowStatus workflow={document.workflow} />
          <ProcessingForm
            document={document}
            onSubmit={updateDocument}
          />
        </div>
      </div>
    </Modal>
  );
};
```

#### 4.2.2 Bulk Operations Interface
**Bulk Selection Component:**
```tsx
const BulkOperationsBar = () => {
  const { selectedDocuments, clearSelection } = useDocumentSelection();
  const { bulkAssign, bulkApprove, bulkReject } = useBulkOperations();

  if (selectedDocuments.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span>Đã chọn {selectedDocuments.length} hồ sơ</span>
        <div className="space-x-2">
          <Button onClick={() => bulkAssign(selectedDocuments)}>
            Giao việc
          </Button>
          <Button onClick={() => bulkApprove(selectedDocuments)}>
            Phê duyệt
          </Button>
          <Button variant="outline" onClick={clearSelection}>
            Bỏ chọn
          </Button>
        </div>
      </div>
    </div>
  );
};
```

#### 4.2.3 Advanced Filtering & Search
**Filter Builder Component:**
```tsx
const AdvancedFilter = () => {
  const [filters, setFilters] = useState<FilterRule[]>([]);

  const filterOptions = [
    { field: 'submissionDate', label: 'Ngày nộp', type: 'dateRange' },
    { field: 'procedure', label: 'Thủ tục', type: 'select' },
    { field: 'status', label: 'Trạng thái', type: 'multiSelect' },
    { field: 'assignee', label: 'Người xử lý', type: 'user' },
    { field: 'priority', label: 'Độ ưu tiên', type: 'select' }
  ];

  return (
    <Card>
      <CardHeader>Bộ lọc nâng cao</CardHeader>
      <CardContent>
        {filters.map((filter, index) => (
          <FilterRule
            key={index}
            rule={filter}
            options={filterOptions}
            onChange={(newRule) => updateFilter(index, newRule)}
            onRemove={() => removeFilter(index)}
          />
        ))}
        <Button onClick={addFilter}>Thêm điều kiện</Button>
      </CardContent>
    </Card>
  );
};
```

### 4.3 Visual Workflow Designer

#### 4.3.1 BPMN Editor Interface
**Main Designer Component:**
```tsx
const WorkflowDesigner = () => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>();
  const [selectedElement, setSelectedElement] = useState<BpmnElement>();

  return (
    <div className="h-screen flex">
      <ToolPalette />

      <div className="flex-1 relative">
        <DesignerToolbar />
        <BpmnCanvas
          workflow={workflow}
          onElementSelect={setSelectedElement}
          onWorkflowChange={setWorkflow}
        />
        <MiniMap />
      </div>

      <PropertiesPanel
        element={selectedElement}
        onChange={updateElementProperties}
      />
    </div>
  );
};
```

**Element Palette:**
```tsx
const ToolPalette = () => {
  const elements = [
    { type: 'start-event', icon: PlayIcon, label: 'Bắt đầu' },
    { type: 'task', icon: TaskIcon, label: 'Nhiệm vụ' },
    { type: 'gateway', icon: DiamondIcon, label: 'Cổng điều kiện' },
    { type: 'end-event', icon: StopIcon, label: 'Kết thúc' }
  ];

  return (
    <div className="w-64 bg-gray-50 border-r">
      <div className="p-4">
        <h3 className="font-semibold mb-4">Thành phần</h3>
        {elements.map(element => (
          <DraggableElement
            key={element.type}
            type={element.type}
            icon={element.icon}
            label={element.label}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 4.3.2 Properties Configuration Panel
**Dynamic Form Builder:**
```tsx
const PropertiesPanel = ({ element, onChange }) => {
  if (!element) return <EmptyState />;

  const getPropertiesForm = (elementType: string) => {
    switch (elementType) {
      case 'task':
        return (
          <TaskProperties
            task={element}
            onChange={onChange}
          />
        );
      case 'gateway':
        return (
          <GatewayProperties
            gateway={element}
            onChange={onChange}
          />
        );
      default:
        return <BaseProperties element={element} onChange={onChange} />;
    }
  };

  return (
    <div className="w-80 bg-white border-l">
      <div className="p-4">
        <h3 className="font-semibold mb-4">Thuộc tính</h3>
        {getPropertiesForm(element.type)}
      </div>
    </div>
  );
};
```

**Task Properties Form:**
```tsx
const TaskProperties = ({ task, onChange }) => {
  return (
    <Form>
      <FormField label="Tên bước">
        <Input
          value={task.name}
          onChange={(name) => onChange({ ...task, name })}
        />
      </FormField>

      <FormField label="Thời gian xử lý">
        <div className="flex space-x-2">
          <Input
            type="number"
            value={task.duration.value}
            onChange={(value) => onChange({
              ...task,
              duration: { ...task.duration, value: parseInt(value) }
            })}
          />
          <Select
            value={task.duration.unit}
            onChange={(unit) => onChange({
              ...task,
              duration: { ...task.duration, unit }
            })}
          >
            <option value="hours">Giờ</option>
            <option value="days">Ngày</option>
          </Select>
        </div>
      </FormField>

      <FormField label="Vai trò xử lý">
        <RoleSelector
          value={task.assignedRoles}
          onChange={(roles) => onChange({ ...task, assignedRoles: roles })}
        />
      </FormField>

      <FormField label="Điều kiện hoàn thành">
        <ConditionBuilder
          conditions={task.completionConditions}
          onChange={(conditions) => onChange({
            ...task,
            completionConditions: conditions
          })}
        />
      </FormField>
    </Form>
  );
};
```

### 4.4 Postal Service Management Interface

#### 4.4.1 Postal Shipment Creation
**Shipment Creation Modal (`components/Postal/ShipmentModal.tsx`):**
```tsx
const ShipmentCreationModal = ({ documentId, onClose }: ShipmentModalProps) => {
  const { document } = useDocument(documentId);
  const { createShipment } = usePostalService();
  const [shipmentData, setShipmentData] = useState<ShipmentRequest>();

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tạo vận đơn bưu chính</h2>

        <Form onSubmit={handleCreateShipment}>
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Loại dịch vụ">
              <Select
                value={shipmentData?.serviceType}
                onChange={(value) => setShipmentData(prev => ({
                  ...prev,
                  serviceType: value
                }))}
              >
                <option value="EMS">EMS - Chuyển phát nhanh</option>
                <option value="STANDARD">Chuyển phát thường</option>
                <option value="EXPRESS">Chuyển phát hỏa tốc</option>
              </Select>
            </FormField>

            <FormField label="Trọng lượng (gram)">
              <Input
                type="number"
                value={shipmentData?.weight}
                onChange={(value) => setShipmentData(prev => ({
                  ...prev,
                  weight: parseInt(value)
                }))}
              />
            </FormField>

            <FormField label="Địa chỉ người nhận" className="col-span-2">
              <div className="space-y-3">
                <Input
                  placeholder="Họ tên người nhận"
                  value={shipmentData?.recipient?.fullName}
                  onChange={(value) => updateRecipient('fullName', value)}
                />
                <Input
                  placeholder="Số điện thoại"
                  value={shipmentData?.recipient?.phone}
                  onChange={(value) => updateRecipient('phone', value)}
                />
                <Textarea
                  placeholder="Địa chỉ chi tiết"
                  value={shipmentData?.recipient?.address}
                  onChange={(value) => updateRecipient('address', value)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <ProvinceSelector
                    value={shipmentData?.recipient?.province}
                    onChange={(value) => updateRecipient('province', value)}
                  />
                  <DistrictSelector
                    province={shipmentData?.recipient?.province}
                    value={shipmentData?.recipient?.district}
                    onChange={(value) => updateRecipient('district', value)}
                  />
                  <WardSelector
                    district={shipmentData?.recipient?.district}
                    value={shipmentData?.recipient?.ward}
                    onChange={(value) => updateRecipient('ward', value)}
                  />
                </div>
              </div>
            </FormField>

            <FormField label="Nội dung vận chuyển" className="col-span-2">
              <Textarea
                placeholder="Mô tả nội dung gửi..."
                value={shipmentData?.description}
                onChange={(value) => setShipmentData(prev => ({
                  ...prev,
                  description: value
                }))}
              />
            </FormField>
          </div>

          <div className="flex justify-between mt-6">
            <ShippingCostEstimate
              weight={shipmentData?.weight}
              serviceType={shipmentData?.serviceType}
              destination={shipmentData?.recipient}
            />
            <div className="space-x-3">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" loading={isCreating}>
                Tạo vận đơn
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
```

**Shipping Cost Calculator:**
```tsx
const ShippingCostEstimate = ({ weight, serviceType, destination }: CostProps) => {
  const { data: cost, isLoading } = useShippingCost({
    weight,
    serviceType,
    destination
  });

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">Ước tính phí vận chuyển</h4>
      {isLoading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Phí gửi:</span>
            <span className="font-medium">{cost?.baseFee?.toLocaleString()} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí gia tăng:</span>
            <span className="font-medium">{cost?.extraFee?.toLocaleString()} VNĐ</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Tổng cộng:</span>
            <span>{cost?.totalFee?.toLocaleString()} VNĐ</span>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 4.4.2 Postal Tracking Dashboard
**Main Tracking Interface (`pages/postal/tracking.tsx`):**
```tsx
const PostalTrackingPage = () => {
  const [trackingFilter, setTrackingFilter] = useState<TrackingFilter>({
    status: 'all',
    dateRange: null
  });
  const { shipments } = usePostalShipments(trackingFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Quản lý vận chuyển bưu chính" />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3">
            <TrackingFilters
              filters={trackingFilter}
              onChange={setTrackingFilter}
            />
            <PostalServiceStats />
          </aside>

          <main className="col-span-9">
            <TrackingTabs>
              <TabPanel label="Tất cả" count={shipments.total}>
                <ShipmentList shipments={shipments.all} />
              </TabPanel>
              <TabPanel label="Đang gửi" count={shipments.inTransit.length}>
                <ShipmentList shipments={shipments.inTransit} />
              </TabPanel>
              <TabPanel label="Đã giao" count={shipments.delivered.length}>
                <ShipmentList shipments={shipments.delivered} />
              </TabPanel>
              <TabPanel label="Trả về" count={shipments.returned.length}>
                <ShipmentList shipments={shipments.returned} />
              </TabPanel>
            </TrackingTabs>
          </main>
        </div>
      </div>
    </div>
  );
};
```

**Shipment List Component:**
```tsx
const ShipmentList = ({ shipments }: { shipments: PostalShipment[] }) => {
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <BulkShipmentActions
        selectedShipments={selectedShipments}
        onClearSelection={() => setSelectedShipments([])}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedShipments.length === shipments.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Mã vận đơn</TableHead>
              <TableHead>Hồ sơ liên quan</TableHead>
              <TableHead>Người nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Dự kiến giao</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map(shipment => (
              <ShipmentRow
                key={shipment.id}
                shipment={shipment}
                selected={selectedShipments.includes(shipment.id)}
                onSelect={handleShipmentSelect}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
```

**Individual Shipment Row:**
```tsx
const ShipmentRow = ({ shipment, selected, onSelect }: ShipmentRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className={cn(selected && 'bg-blue-50')}>
        <TableCell>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(shipment.id)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{shipment.trackingNumber}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <Link href={`/documents/${shipment.documentId}`} className="text-blue-600 hover:underline">
            {shipment.documentTitle}
          </Link>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">{shipment.recipient.fullName}</div>
            <div className="text-sm text-gray-500">{shipment.recipient.phone}</div>
          </div>
        </TableCell>
        <TableCell>
          <PostalStatusBadge status={shipment.status} />
        </TableCell>
        <TableCell>
          {format(new Date(shipment.sentDate), 'dd/MM/yyyy HH:mm')}
        </TableCell>
        <TableCell>
          {shipment.estimatedDelivery &&
            format(new Date(shipment.estimatedDelivery), 'dd/MM/yyyy')
          }
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => openTrackingDetails(shipment.id)}>
                Chi tiết tracking
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printLabel(shipment.id)}>
                In nhãn vận chuyển
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateDeliveryInfo(shipment.id)}>
                Cập nhật thông tin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={8}>
            <ShipmentDetails shipment={shipment} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
```

#### 4.4.3 Real-time Tracking Updates
**Live Tracking Component:**
```tsx
const LiveTrackingUpdates = ({ shipmentId }: { shipmentId: string }) => {
  const { connection } = useSignalR();
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    if (connection && shipmentId) {
      connection.invoke('JoinShipmentGroup', shipmentId);

      connection.on('ShipmentStatusChanged', (updatedShipment) => {
        if (updatedShipment.id === shipmentId) {
          setTrackingEvents(prev => [
            ...prev,
            {
              timestamp: new Date(),
              status: updatedShipment.status,
              location: updatedShipment.currentLocation,
              description: updatedShipment.statusDescription
            }
          ]);
        }
      });

      return () => {
        connection.off('ShipmentStatusChanged');
        connection.invoke('LeaveShipmentGroup', shipmentId);
      };
    }
  }, [connection, shipmentId]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Theo dõi vận chuyển</h3>
      <Timeline>
        {trackingEvents.map((event, index) => (
          <TimelineItem
            key={index}
            timestamp={event.timestamp}
            status={event.status}
            location={event.location}
            description={event.description}
          />
        ))}
      </Timeline>
    </div>
  );
};
```

**Tracking Details Modal:**
```tsx
const TrackingDetailsModal = ({ shipmentId, onClose }: TrackingModalProps) => {
  const { data: trackingInfo } = useTrackingDetails(shipmentId);

  return (
    <Modal size="xl" onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Chi tiết vận chuyển - {trackingInfo?.trackingNumber}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printTrackingInfo(shipmentId)}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            In phiếu
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <ShipmentBasicInfo shipment={trackingInfo} />
            <RecipientInfo recipient={trackingInfo?.recipient} />
          </div>
          <div>
            <LiveTrackingUpdates shipmentId={shipmentId} />
            <DeliveryEstimation shipment={trackingInfo} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
```

#### 4.4.4 Label Printing Interface
**Label Printing Component:**
```tsx
const PostalLabelPrinter = ({ shipmentIds }: { shipmentIds: string[] }) => {
  const { printLabels, isPrinting } = usePostalPrinting();
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    labelsPerPage: 4
  });

  const handlePrint = async () => {
    try {
      const printData = await printLabels(shipmentIds, printSettings);

      // Open print preview in new window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printData.html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      toast.error('Lỗi in nhãn: ' + error.message);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">In nhãn vận chuyển</h3>

      <div className="space-y-4">
        <FormField label="Khổ giấy">
          <Select
            value={printSettings.paperSize}
            onChange={(value) => setPrintSettings(prev => ({
              ...prev,
              paperSize: value
            }))}
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="LABEL">Giấy nhãn</option>
          </Select>
        </FormField>

        <FormField label="Hướng in">
          <RadioGroup
            value={printSettings.orientation}
            onChange={(value) => setPrintSettings(prev => ({
              ...prev,
              orientation: value
            }))}
          >
            <Radio value="portrait">Dọc</Radio>
            <Radio value="landscape">Ngang</Radio>
          </RadioGroup>
        </FormField>

        <FormField label="Số nhãn trên trang">
          <Select
            value={printSettings.labelsPerPage.toString()}
            onChange={(value) => setPrintSettings(prev => ({
              ...prev,
              labelsPerPage: parseInt(value)
            }))}
          >
            <option value="1">1 nhãn</option>
            <option value="2">2 nhãn</option>
            <option value="4">4 nhãn</option>
            <option value="6">6 nhãn</option>
          </Select>
        </FormField>

        <div className="pt-4">
          <Button
            onClick={handlePrint}
            loading={isPrinting}
            className="w-full"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            In {shipmentIds.length} nhãn
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

### 4.5 Real-time Features

#### 4.5.1 WebSocket Integration
**SignalR Connection Manager:**
```tsx
const useSignalR = () => {
  const [connection, setConnection] = useState<HubConnection>();
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('/api/hubs/notifications')
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      setConnection(newConnection);
      setConnectionState('Connected');
    });

    return () => newConnection.stop();
  }, []);

  const subscribeToNotifications = useCallback((userId: string) => {
    if (connection) {
      connection.invoke('JoinUserGroup', userId);
    }
  }, [connection]);

  return { connection, connectionState, subscribeToNotifications };
};
```

**Real-time Notification Component:**
```tsx
const NotificationCenter = () => {
  const { connection } = useSignalR();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveNotification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          action: <Button size="sm">Xem</Button>
        });
      });
    }
  }, [connection]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      </PopoverContent>
    </Popover>
  );
};
```

#### 4.4.2 Live Document Updates
**Document Status Tracker:**
```tsx
const useDocumentStatus = (documentId: string) => {
  const [status, setStatus] = useState<DocumentStatus>();
  const { connection } = useSignalR();

  useEffect(() => {
    if (connection && documentId) {
      connection.invoke('JoinDocumentGroup', documentId);

      connection.on('DocumentStatusChanged', (updatedDocument) => {
        if (updatedDocument.id === documentId) {
          setStatus(updatedDocument.status);
        }
      });

      return () => {
        connection.off('DocumentStatusChanged');
        connection.invoke('LeaveDocumentGroup', documentId);
      };
    }
  }, [connection, documentId]);

  return status;
};
```

**Live Progress Indicator:**
```tsx
const LiveProgressIndicator = ({ documentId }: { documentId: string }) => {
  const status = useDocumentStatus(documentId);
  const { connection } = useSignalR();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (connection) {
      connection.on('ProcessingProgress', ({ documentId: id, progress: p }) => {
        if (id === documentId) {
          setProgress(p);
        }
      });
    }
  }, [connection, documentId]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Tiến độ xử lý</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-sm text-gray-500">
        Trạng thái: {status?.displayName}
      </div>
    </div>
  );
};
```

---

## 5. State Management

### 5.1 Global State Architecture

#### 5.1.1 Zustand Store Configuration
```typescript
interface AppStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  permissions: Permission[];

  // UI state
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  activeModal: string | null;

  // Document state
  documents: Document[];
  selectedDocuments: string[];
  filters: FilterState;

  // Notification state
  notifications: Notification[];
  unreadCount: number;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  toggleSidebar: () => void;
  selectDocument: (id: string) => void;
  addNotification: (notification: Notification) => void;
}

const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  permissions: [],
  theme: 'light',
  sidebarCollapsed: false,
  activeModal: null,
  documents: [],
  selectedDocuments: [],
  filters: { status: 'all', dateRange: null },
  notifications: [],
  unreadCount: 0,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    permissions: []
  }),
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  })),
  selectDocument: (id) => set((state) => ({
    selectedDocuments: state.selectedDocuments.includes(id)
      ? state.selectedDocuments.filter(docId => docId !== id)
      : [...state.selectedDocuments, id]
  })),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  }))
}));
```

#### 5.1.2 Persistence Configuration
```typescript
// Persist user preferences
const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'vi',
      dashboardLayout: 'grid',
      notificationSettings: {
        email: true,
        push: true,
        sms: false
      },

      updatePreference: (key, value) => set((state) => ({
        [key]: value
      }))
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

### 5.2 Server State Management

#### 5.2.1 React Query Configuration
```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000
});

// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

// Custom hooks for data fetching
const useDocuments = (filters: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsApi.getDocuments(filters),
    enabled: !!filters,
    staleTime: 2 * 60 * 1000 // 2 minutes for fresh data
  });
};

const useDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.updateDocument,
    onSuccess: (updatedDocument) => {
      // Update cache
      queryClient.setQueryData(
        ['document', updatedDocument.id],
        updatedDocument
      );

      // Invalidate related queries
      queryClient.invalidateQueries(['documents']);

      // Show success message
      toast.success('Cập nhật hồ sơ thành công');
    },
    onError: (error) => {
      toast.error('Lỗi cập nhật hồ sơ: ' + error.message);
    }
  });
};
```

#### 5.2.2 Optimistic Updates
```typescript
const useOptimisticDocumentUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.updateDocument,
    onMutate: async (updatedDocument) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['document', updatedDocument.id]);

      // Snapshot previous value
      const previousDocument = queryClient.getQueryData(['document', updatedDocument.id]);

      // Optimistically update
      queryClient.setQueryData(['document', updatedDocument.id], updatedDocument);

      return { previousDocument };
    },
    onError: (err, updatedDocument, context) => {
      // Rollback on error
      if (context?.previousDocument) {
        queryClient.setQueryData(
          ['document', updatedDocument.id],
          context.previousDocument
        );
      }
    },
    onSettled: (updatedDocument) => {
      // Refresh to ensure consistency
      queryClient.invalidateQueries(['document', updatedDocument?.id]);
    }
  });
};
```

### 5.3 Form State Management

#### 5.3.1 Form Validation with Zod
```typescript
// Validation schemas
const documentSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200),
  procedureId: z.string().min(1, 'Vui lòng chọn thủ tục'),
  submitterInfo: z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    idNumber: z.string().regex(/^[0-9]{9,12}$/, 'Số CMND/CCCD không hợp lệ')
  }),
  attachments: z.array(z.object({
    file: z.instanceof(File),
    type: z.enum(['main', 'supporting', 'id_document'])
  })).min(1, 'Vui lòng tải lên ít nhất 1 tệp đính kèm')
});

type DocumentFormData = z.infer<typeof documentSchema>;
```

#### 5.3.2 React Hook Form Integration
```typescript
const DocumentForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      procedureId: '',
      submitterInfo: {
        fullName: '',
        email: '',
        phone: '',
        idNumber: ''
      },
      attachments: []
    }
  });

  // Auto-save functionality
  const watchedValues = watch();
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('draft-document', JSON.stringify(watchedValues));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, isDirty]);

  const onSubmit = async (data: DocumentFormData) => {
    try {
      await submitDocument(data);
      localStorage.removeItem('draft-document');
      router.push('/dashboard/documents');
    } catch (error) {
      toast.error('Lỗi nộp hồ sơ: ' + error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </Form>
  );
};
```

---

## 6. UI/UX Requirements

### 6.1 Design System

#### 6.1.1 Color Palette
```css
:root {
  /* Primary colors - Government blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Secondary colors - Success green */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;

  /* Warning colors */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;

  /* Error colors */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  /* Neutral colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

#### 6.1.2 Typography Scale
```css
.font-display {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
```

#### 6.1.3 Component Library
```typescript
// Base Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    xs: 'h-6 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### 6.2 Responsive Design

#### 6.2.1 Breakpoint Strategy
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

#### 6.2.2 Mobile Optimizations
**Touch-friendly Interface:**
```css
/* Minimum touch target size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Larger buttons on mobile */
@media (max-width: 767px) {
  .btn {
    min-height: 48px;
    padding: 12px 16px;
  }
}
```

**Mobile Navigation:**
```tsx
const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="touch-target"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>

      <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
        <MobileMenu onClose={() => setIsOpen(false)} />
      </Drawer>
    </>
  );
};
```

### 6.3 Accessibility (WCAG 2.1 AA)

#### 6.3.1 Keyboard Navigation
```typescript
// Focus management
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => element.removeEventListener('keydown', handleTabKey);
  }, [ref]);
};
```

#### 6.3.2 Screen Reader Support
```tsx
const AccessibleDataTable = ({ data, columns }) => {
  return (
    <table role="table" aria-label="Danh sách hồ sơ">
      <thead>
        <tr role="row">
          {columns.map(column => (
            <th
              key={column.key}
              role="columnheader"
              scope="col"
              aria-sort={getSortDirection(column.key)}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id}
            role="row"
            aria-rowindex={index + 1}
          >
            {columns.map(column => (
              <td
                key={column.key}
                role="gridcell"
                aria-describedby={`cell-${row.id}-${column.key}`}
              >
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

#### 6.3.3 Color Contrast & Visual Design
```css
/* Ensure sufficient color contrast */
.text-primary { color: #1d4ed8; } /* 4.5:1 contrast ratio */
.text-error { color: #dc2626; } /* 4.5:1 contrast ratio */

/* Focus indicators */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Performance Requirements

### 7.1 Web Vitals Targets

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **First Contentful Paint (FCP)** | <1.2s | TBD | Google PageSpeed Insights |
| **Largest Contentful Paint (LCP)** | <2.5s | TBD | Core Web Vitals |
| **First Input Delay (FID)** | <100ms | TBD | Real user monitoring |
| **Cumulative Layout Shift (CLS)** | <0.1 | TBD | Layout stability |
| **Time to Interactive (TTI)** | <3.5s | TBD | Performance monitoring |

### 7.2 Optimization Strategies

#### 7.2.1 Code Splitting & Lazy Loading
```typescript
// Route-based code splitting
const AdminDashboard = lazy(() => import('../components/Dashboard/AdminDashboard'));
const WorkflowDesigner = lazy(() => import('../components/Workflow/Designer'));
const ReportsView = lazy(() => import('../components/Reports/ReportsView'));

// Component-based lazy loading
const LazyModal = lazy(() => import('../components/ui/Modal'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/workflows" element={<WorkflowDesigner />} />
        <Route path="/reports" element={<ReportsView />} />
      </Routes>
    </Suspense>
  );
};
```

#### 7.2.2 Image Optimization
```tsx
// Next.js optimized images
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      quality={85}
      loading="lazy"
      {...props}
    />
  );
};

// Progressive loading for large document lists
const DocumentThumbnail = ({ document }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative">
      {!imageLoaded && <Skeleton className="w-full h-32" />}
      <img
        src={document.thumbnailUrl}
        alt={document.title}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};
```

#### 7.2.3 Bundle Optimization
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }

    return config;
  }
};
```

### 7.3 Caching Strategy

#### 7.3.1 Browser Caching
```typescript
// Service Worker for offline functionality
const cacheName = 'dvc-v2-cache-v1';
const staticAssets = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(staticAssets))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

#### 7.3.2 API Response Caching
```typescript
// React Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Static data (procedures, categories)
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days

      // Dynamic data (documents, notifications)
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  }
});

// Selective cache invalidation
const useDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDocument,
    onSuccess: (data) => {
      // Invalidate specific document
      queryClient.invalidateQueries(['document', data.id]);

      // Update document list cache
      queryClient.setQueryData(['documents'], (oldData) => {
        return oldData?.map(doc =>
          doc.id === data.id ? data : doc
        );
      });
    }
  });
};
```

---

## 8. Browser Compatibility

### 8.1 Supported Browsers

| Browser | Minimum Version | Market Share | Notes |
|---------|----------------|--------------|-------|
| **Chrome** | 90+ | 65% | Primary development target |
| **Firefox** | 88+ | 15% | Full feature support |
| **Safari** | 14+ | 12% | WebKit specific optimizations |
| **Edge** | 90+ | 8% | Chromium-based support |

### 8.2 Progressive Enhancement

#### 8.2.1 Feature Detection
```typescript
// Check for modern browser features
const hasModernFeatures = () => {
  return (
    'fetch' in window &&
    'Promise' in window &&
    'IntersectionObserver' in window &&
    'localStorage' in window &&
    CSS.supports('display', 'grid')
  );
};

// Graceful degradation for older browsers
const ProgressiveImage = ({ src, fallback, alt }) => {
  const supportsWebP = useWebPSupport();

  return (
    <picture>
      {supportsWebP && <source srcSet={`${src}.webp`} type="image/webp" />}
      <img src={fallback || src} alt={alt} />
    </picture>
  );
};
```

#### 8.2.2 Polyfills Strategy
```javascript
// polyfills.js
const loadPolyfills = async () => {
  const polyfills = [];

  if (!window.IntersectionObserver) {
    polyfills.push(import('intersection-observer'));
  }

  if (!window.ResizeObserver) {
    polyfills.push(import('@juggle/resize-observer'));
  }

  if (!CSS.supports('display', 'grid')) {
    polyfills.push(import('css-grid-polyfill'));
  }

  await Promise.all(polyfills);
};

// Load polyfills before app initialization
loadPolyfills().then(() => {
  // Initialize React app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
});
```

---

## 9. Security Requirements

### 9.1 Client-Side Security

#### 9.1.1 Content Security Policy
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' wss:",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

#### 9.1.2 Input Sanitization
```typescript
// XSS prevention
import DOMPurify from 'dompurify';

const SanitizedContent = ({ html }: { html: string }) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

// File upload validation
const validateFile = (file: File): FileValidationResult => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Loại tệp không được phép' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước tệp quá lớn' };
  }

  return { valid: true };
};
```

### 9.2 Authentication Security

#### 9.2.1 JWT Token Management
```typescript
// Secure token storage
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string) {
    // Store access token in memory only
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

    // Store refresh token in httpOnly cookie (handled by server)
    // Never store refresh token in localStorage
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static clearTokens() {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    // Clear httpOnly cookie via API call
    api.post('/auth/logout');
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

#### 9.2.2 Route Protection
```typescript
// Higher-order component for route protection
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: string[]
) => {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      if (requiredPermissions && !hasPermissions(user, requiredPermissions)) {
        router.push('/unauthorized');
        return;
      }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) {
      return <LoadingSpinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Usage
const AdminDashboard = withAuth(
  DashboardComponent,
  ['admin:read', 'documents:write']
);
```

---

## 10. Success Metrics

### 10.1 Performance KPIs

| Metric | Target | Current | Measurement Tool |
|--------|--------|---------|------------------|
| **Page Load Time** | <2s | TBD | Google PageSpeed Insights |
| **Time to Interactive** | <3s | TBD | Lighthouse CI |
| **Bundle Size** | <500KB (gzipped) | TBD | Webpack Bundle Analyzer |
| **API Response Time** | <200ms (95th percentile) | TBD | Browser DevTools |

### 10.2 User Experience KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **User Satisfaction** | >90% | Post-interaction surveys |
| **Task Completion Rate** | >95% | User analytics |
| **Error Rate** | <1% | Error tracking (Sentry) |
| **Accessibility Score** | >95% (Lighthouse) | Automated testing |

### 10.3 Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Digital Adoption** | >80% | Usage analytics vs traditional channels |
| **Support Tickets** | <5% of transactions | Help desk metrics |
| **User Retention** | >85% monthly | Google Analytics cohorts |

---

## 11. Testing Strategy

### 11.1 Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentForm } from '../DocumentForm';

describe('DocumentForm', () => {
  test('validates required fields', async () => {
    render(<DocumentForm />);

    const submitButton = screen.getByRole('button', { name: /nộp hồ sơ/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/tiêu đề là bắt buộc/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng chọn thủ tục/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<DocumentForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/tiêu đề/i), {
      target: { value: 'Test Document' }
    });

    fireEvent.click(screen.getByRole('button', { name: /nộp hồ sơ/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Document',
        // ... other form data
      });
    });
  });
});
```

### 11.2 Integration Testing
```typescript
// API integration tests
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/documents', (req, res, ctx) => {
    return res(
      ctx.json({
        documents: [
          { id: '1', title: 'Test Document 1' },
          { id: '2', title: 'Test Document 2' }
        ]
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays documents', async () => {
  render(<DocumentList />);

  await waitFor(() => {
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });
});
```

### 11.3 E2E Testing
```typescript
// Playwright E2E tests
import { test, expect } from '@playwright/test';

test.describe('Document Submission Flow', () => {
  test('citizen can submit new document', async ({ page }) => {
    await page.goto('/auth/login');

    // Login
    await page.fill('[data-testid=email]', 'citizen@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');

    // Navigate to submission
    await page.click('[data-testid=submit-document]');

    // Fill form
    await page.fill('[data-testid=document-title]', 'Test Submission');
    await page.selectOption('[data-testid=procedure-select]', '1');

    // Upload file
    await page.setInputFiles('[data-testid=file-upload]', 'test-document.pdf');

    // Submit
    await page.click('[data-testid=submit-button]');

    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });
});
```

---

## 12. Deployment & DevOps

### 12.1 CI/CD Pipeline
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  deploy:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          npm run build
          # Deploy to CDN/hosting platform
```

### 12.2 Environment Configuration
```typescript
// config/environments.ts
interface Environment {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableAnalytics: boolean;
    enableDebugTools: boolean;
    enableMockData: boolean;
  };
}

const environments: Record<string, Environment> = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    wsUrl: 'ws://localhost:5000/hubs',
    environment: 'development',
    features: {
      enableAnalytics: false,
      enableDebugTools: true,
      enableMockData: true
    }
  },
  production: {
    apiUrl: 'https://api.dvc.gov.vn/api',
    wsUrl: 'wss://api.dvc.gov.vn/hubs',
    environment: 'production',
    features: {
      enableAnalytics: true,
      enableDebugTools: false,
      enableMockData: false
    }
  }
};

export const config = environments[process.env.NODE_ENV || 'development'];
```

---

## 13. References

- **Parent Document:** [Main PRD](../PRD.MD) - Sections 2.4, 2.5, 2.6
- **Design System:** Government UI/UX Guidelines
- **Accessibility:** WCAG 2.1 AA Standards
- **Performance:** Google Web Vitals Guidelines
- **Security:** OWASP Frontend Security Guidelines

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** 20/12/2024
- **Next Review:** 27/12/2024
- **Approval Required:** Frontend Lead, UX Designer, Security Officer