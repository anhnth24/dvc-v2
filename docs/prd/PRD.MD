# Product Requirements Document (PRD)
## Hệ Thống Quản Lý Thủ Tục Hành Chính Quốc Gia

**Version:** 1.0  
**Ngày tạo:** 20/12/2024  
**Người tạo:** System Architecture Team  
**Trạng thái:** Draft

---

## 1. Tổng Quan Dự Án

### 1.1 Tóm Tắt Executive

Xây dựng hệ thống quản lý thủ tục hành chính nội bộ cấp quốc gia, số hóa toàn bộ quy trình xử lý, phê duyệt và trả kết quả hồ sơ hành chính cho cán bộ công chức. Hệ thống phục vụ 63 tỉnh/thành phố với khả năng xử lý 800.000 hồ sơ/tháng và hỗ trợ 25.000-30.000 cán bộ công chức với 18.000-21.000 người dùng đồng thời.

### 1.2 Mục Tiêu Dự Án

| Mục tiêu | Mô tả | KPI |
|----------|-------|-----|
| **Số hóa quy trình** | Chuyển đổi 100% thủ tục hành chính sang xử lý điện tử nội bộ | 2000 thủ tục được số hóa |
| **Tăng hiệu quả** | Giảm thời gian xử lý và tăng tính minh bạch trong nội bộ | Giảm 50% thời gian xử lý |
| **Cải thiện năng suất** | Cán bộ công chức xử lý hồ sơ hiệu quả hơn | 90% cán bộ hài lòng |
| **Tích hợp liên thông** | Kết nối các cấp chính quyền và LGSP | 100% đơn vị kết nối |

### 1.3 Phạm Vi Dự Án

**Trong phạm vi:**
- Quản lý 2000 thủ tục hành chính với 200-300 quy trình workflow khác nhau
- Hệ thống phân quyền đa cấp (Tỉnh → Sở/Ban/Ngành → Phường/Xã → Phòng ban)
- Tích hợp chữ ký số Ban Cơ yếu Chính phủ
- **Tích hợp Bưu chính công ích:** API gửi/nhận, tracking vận đơn, quản lý địa chỉ
- Workflow engine hỗ trợ cấu hình động
- Notification real-time và tracking hồ sơ
- Báo cáo thống kê đa chiều

**Ngoài phạm vi:**
- Portal nộp hồ sơ trực tuyến cho công dân (hệ thống riêng)
- Mobile application (Phase 2)
- Tích hợp thanh toán trực tuyến (Phase 2)
- AI/ML cho dự đoán và tự động hóa (Phase 3)

**Lưu ý quan trọng:**
- Đây là hệ thống nội bộ cho cán bộ công chức xử lý hồ sơ
- Công dân nộp hồ sơ qua: nộp trực tiếp, **Bưu chính công ích**, hoặc portal riêng biệt
- Kết quả trả cho công dân qua: nhận trực tiếp, **Bưu chính công ích**, hoặc portal tra cứu riêng
- **Tích hợp Bưu chính công ích:** Quản lý gửi/nhận qua chuyển phát, tracking vận đơn

### 1.4 Stakeholders

| Stakeholder | Vai trò | Mối quan tâm chính |
|------------|---------|-------------------|
| **Chính phủ** | Sponsor | ROI, hiệu quả quản lý nhà nước |
| **Cán bộ công chức** | Primary User | Dễ sử dụng, giảm khối lượng công việc, xử lý nhanh |
| **Lãnh đạo các cấp** | Decision Maker | Báo cáo, giám sát, ra quyết định |
| **Bộ phận IT** | Maintainer | Dễ vận hành, bảo trì |
| **Công dân** | Beneficiary | Nhận được dịch vụ nhanh hơn (gián tiếp) |

---

## 2. Yêu Cầu Chức Năng

### 2.1 Quản Lý Người Dùng và Phân Quyền

#### 2.1.1 Quản Lý Người Dùng

**Mô tả:** Quản lý thông tin người dùng đa cấp, đa đơn vị

**Acceptance Criteria:**
- [ ] Tạo/sửa/xóa người dùng với thông tin: họ tên, email, số điện thoại, chức vụ, đơn vị
- [ ] Một người dùng có thể thuộc nhiều đơn vị, phòng ban
- [ ] Import/export danh sách người dùng từ Excel
- [ ] Đồng bộ với LDAP/Active Directory nếu có

**User Stories:**
```
As an Admin
I want to manage user accounts across multiple departments
So that I can control system access efficiently
```

#### 2.1.2 Hệ Thống Phân Quyền (RBAC)

**Mô tả:** Phân quyền linh hoạt theo vai trò

**Vai trò chính:**
- **Tiếp nhận:** Nhận hồ sơ, kiểm tra tính hợp lệ
- **Thụ lý:** Xử lý chuyên môn hồ sơ
- **Lãnh đạo:** Phê duyệt, từ chối, yêu cầu bổ sung
- **Trả kết quả:** Hoàn tất hồ sơ và chuẩn bị trả kết quả

**Acceptance Criteria:**
- [ ] Gán nhiều vai trò cho một người dùng
- [ ] Phân quyền theo lĩnh vực (optional theo từng thủ tục)
- [ ] Ủy quyền có thời hạn với approval workflow
- [ ] Audit trail cho mọi thay đổi quyền

#### 2.1.3 Ủy Quyền Xử Lý

**Mô tả:** Cho phép ủy quyền xử lý hồ sơ trong khoảng thời gian nhất định

**Acceptance Criteria:**
- [ ] Tạo ủy quyền với thời gian bắt đầu/kết thúc
- [ ] Yêu cầu phê duyệt từ cấp trên
- [ ] Cả người ủy quyền và được ủy quyền đều có thể xử lý
- [ ] Tự động thu hồi quyền khi hết hạn

### 2.2 Workflow Engine

#### 2.2.1 Thiết Kế Workflow

**Mô tả:** Công cụ thiết kế quy trình xử lý hồ sơ

**Features:**
- **Visual Designer:** Giao diện kéo thả để thiết kế workflow
- **Excel Import:** Import workflow từ template Excel
- **Version Control:** Quản lý phiên bản workflow

**Acceptance Criteria:**
- [ ] Drag-drop interface cho non-technical users
- [ ] Định nghĩa các bước: tên, thời gian xử lý (giờ), vai trò, điều kiện
- [ ] Hỗ trợ sequential, parallel, conditional flows
- [ ] Sub-workflow và nested workflow
- [ ] Preview và validate workflow trước khi publish

#### 2.2.2 Cấu Hình Workflow Động

**Mô tả:** Thay đổi workflow cho hồ sơ đang xử lý

**Acceptance Criteria:**
- [ ] Option để apply workflow mới cho hồ sơ existing
- [ ] Migrate state an toàn khi chuyển workflow version
- [ ] Rollback capability nếu có lỗi
- [ ] Notification cho users affected

#### 2.2.3 Xử Lý Liên Thông

**Mô tả:** Workflow xử lý giữa các đơn vị, cấp

**Acceptance Criteria:**
- [ ] Chuyển hồ sơ lên cấp trên/xuống cấp dưới
- [ ] Xin ý kiến song song từ nhiều phòng ban
- [ ] Consolidate ý kiến trước khi quyết định
- [ ] Track status của từng luồng xử lý

### 2.3 Quản Lý Hồ Sơ

#### 2.3.1 Tiếp Nhận Hồ Sơ

**Mô tả:** Module tiếp nhận và số hóa hồ sơ (từ nộp trực tiếp, **Bưu chính công ích**, hoặc hệ thống khác)

**Acceptance Criteria:**
- [ ] Tạo mã hồ sơ: `[MaDonVi]-[yyyyMMdd]-[5 số sequence]`
- [ ] Scan và upload multiple files (PDF, Word, Excel, Image)
- [ ] **Nhận hồ sơ từ Bưu chính công ích với mã vận đơn**
- [ ] **Xác nhận nhận hàng và cập nhật trạng thái**
- [ ] Giới hạn 50-100MB/file
- [ ] Nhập thông tin cơ bản từ hồ sơ giấy
- [ ] Validate hồ sơ theo yêu cầu thủ tục
- [ ] Gán hồ sơ vào workflow xử lý

#### 2.3.2 Xử Lý Hồ Sơ

**Mô tả:** Luân chuyển và xử lý hồ sơ theo workflow

**Acceptance Criteria:**
- [ ] Xử lý theo workflow đã định nghĩa
- [ ] Attach file bổ sung ở mọi bước
- [ ] Nhập ý kiến xử lý/lý do từ chối
- [ ] Tính deadline theo ngày làm việc hoặc calendar
- [ ] Cảnh báo khi gần hết hạn (1 giờ trước)

#### 2.3.3 Ký Số Văn Bản

**Mô tả:** Tích hợp chữ ký số USB Token Ban Cơ yếu

**Acceptance Criteria:**
- [ ] Convert non-PDF files sang PDF
- [ ] Ký số với USB Token
- [ ] Visible signature với timestamp
- [ ] Lưu file gốc và file đã ký riêng biệt
- [ ] Verify chữ ký số

#### 2.3.4 Trả Kết Quả

**Mô tả:** Hoàn tất và trả kết quả cho công dân

**Acceptance Criteria:**
- [ ] Generate kết quả từ template
- [ ] Đính kèm các văn bản đã ký
- [ ] **Tạo vận đơn gửi qua Bưu chính công ích**
- [ ] **In địa chỉ và tem bưu điện**
- [ ] Gửi notification (SMS/Email) kèm mã tracking
- [ ] Cập nhật trạng thái "Đã hoàn thành"
- [ ] **Theo dõi trạng thái giao hàng**

### 2.4 Theo Dõi và Quản Lý Hồ Sơ

#### 2.4.1 Dashboard Cán Bộ

**Mô tả:** Màn hình làm việc cho cán bộ

**Views:**
- **Hồ sơ chờ xử lý:** Danh sách hồ sơ được giao
- **Hồ sơ đang xử lý:** Hồ sơ đang trong quá trình
- **Hồ sơ quá hạn:** Cảnh báo hồ sơ trễ deadline
- **Hồ sơ hoàn thành:** Lịch sử xử lý

**Acceptance Criteria:**
- [ ] Filter theo: ngày nộp, mã hồ sơ, trạng thái
- [ ] Sort theo độ ưu tiên, deadline
- [ ] Bulk actions cho multiple hồ sơ
- [ ] Export danh sách Excel

### 2.5 Notification System

#### 2.5.1 Real-time Notifications

**Mô tả:** Thông báo tức thời trên web

**Trigger Events:**
- Hồ sơ mới được chuyển đến
- Hồ sơ sắp hết hạn (1 giờ)
- Hồ sơ bị trả lại
- Yêu cầu ủy quyền được duyệt

**Acceptance Criteria:**
- [ ] Push notification trên browser
- [ ] Badge counter cho unread notifications
- [ ] Notification center với history
- [ ] Mark as read/unread

#### 2.5.2 External Notifications

**Mô tả:** Thông báo qua SMS/Email

**Acceptance Criteria:**
- [ ] Template-based messages
- [ ] Merge data vào template
- [ ] Queue để tránh overload
- [ ] Retry mechanism cho failed messages
- [ ] Delivery tracking

### 2.6 Báo Cáo và Thống Kê

#### 2.6.1 Báo Cáo Định Kỳ

**Mô tả:** Các báo cáo theo lịch

**Loại báo cáo:**
- Tiến độ xử lý theo đơn vị
- Thống kê theo thủ tục
- Báo cáo hiệu suất cán bộ
- Tỷ lệ đúng/trễ hạn

**Acceptance Criteria:**
- [ ] Báo cáo theo: ngày, tuần, tháng, quý, năm
- [ ] Filter theo đơn vị, phòng ban
- [ ] Export Word/Excel
- [ ] Schedule auto-generate và gửi email

#### 2.6.2 Real-time Analytics

**Mô tả:** Dashboard phân tích real-time

**Metrics:**
- Số hồ sơ theo trạng thái
- Thời gian xử lý trung bình
- Bottlenecks trong workflow
- Trending thủ tục

**Acceptance Criteria:**
- [ ] Update mỗi 1-2 phút
- [ ] Drill-down capability
- [ ] Visual charts và graphs
- [ ] Responsive cho mọi devices

### 2.7 Tích Hợp Hệ Thống

#### 2.7.1 LGSP Integration

**Mô tả:** Kết nối với Local Government Service Platform

**Acceptance Criteria:**
- [ ] REST API integration
- [ ] Authentication với OAuth2/JWT
- [ ] Sync master data
- [ ] Submit hồ sơ liên thông

#### 2.7.2 SMS Gateway

**Mô tả:** Tích hợp gửi SMS

**Acceptance Criteria:**
- [ ] REST API với providers trong nước
- [ ] Bulk SMS capability
- [ ] Delivery report tracking
- [ ] Fallback to secondary provider

#### 2.7.3 Bưu chính công ích Integration

**Mô tả:** Tích hợp với hệ thống Bưu chính công ích để gửi/nhận hồ sơ và kết quả

**Acceptance Criteria:**
- [ ] API tích hợp với VietnamPost/EMS
- [ ] Tạo vận đơn chuyển phát tự động
- [ ] Tracking trạng thái gửi/nhận real-time
- [ ] Quản lý địa chỉ người nhận
- [ ] Tính cước phí tự động
- [ ] In tem và nhãn vận đơn
- [ ] Xác nhận giao hàng thành công
- [ ] Báo cáo thống kê chi phí vận chuyển

---

## 3. Yêu Cầu Phi Chức Năng

### 3.1 Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Response Time** | <100ms cho write operations | 95th percentile |
| **Read Latency** | <50ms cho cached queries | Average |
| **Search Time** | <200ms full-text search | 95th percentile |
| **Concurrent Users** | 18,000-21,000 | Peak load |
| **Throughput** | 270 hồ sơ/giây peak | Load testing |
| **Page Load** | <2 giây | Google PageSpeed |

### 3.2 Availability & Reliability

| Requirement | Target | Notes |
|------------|--------|-------|
| **Uptime** | 99.9% | 43.8 phút downtime/tháng |
| **MTBF** | >720 giờ | Mean Time Between Failures |
| **MTTR** | <1 giờ | Mean Time To Repair |
| **Data Durability** | 99.999999999% | 11 nines với erasure coding |
| **Backup** | Daily full, hourly incremental | 30 days retention |

### 3.3 Security Requirements

| Category | Requirements |
|----------|-------------|
| **Authentication** | Multi-factor authentication, PKI certificate support |
| **Authorization** | RBAC với temporal permissions |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Audit** | Comprehensive logging của mọi actions |
| **Compliance** | ISO 27001, Vietnam cybersecurity law |
| **Session** | Timeout sau 30 phút inactive |

### 3.4 Scalability Requirements

| Dimension | Current | Future (3 years) |
|-----------|---------|-----------------|
| **Users** | 25,000 | 50,000 |
| **Concurrent** | 21,000 | 40,000 |
| **Documents/month** | 800,000 | 2,000,000 |
| **Storage** | 200TB | 500TB |
| **Provinces** | 63 | 63 |

### 3.5 Usability Requirements

- **Responsive Design:** Hoạt động trên mọi thiết bị (desktop, tablet, mobile)
- **Browser Support:** Chrome, Firefox, Safari, Edge (2 versions gần nhất)
- **Page Navigation:** Không quá 3 clicks để đến chức năng chính
- **Error Messages:** Clear, actionable error messages tiếng Việt
- **Help System:** Context-sensitive help và user manual

### 3.6 Compatibility Requirements

- **Database:** SQL Server 2019+
- **OS:** Windows Server 2019+, Ubuntu 20.04+
- **Framework:** .NET 8+
- **Browser:** Modern browsers với JavaScript enabled
- **File Formats:** PDF, DOCX, XLSX, JPG, PNG

---

## 4. Kiến Trúc Hệ Thống

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (HAProxy)               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│  Web Frontend  │                    │   API Gateway   │
│   (NextJS)     │                    │     (YARP)      │
└────────────────┘                    └────────┬────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
         ┌──────────▼─────────┐    ┌──────────▼─────────┐    ┌──────────▼─────────┐
         │   User Service     │    │  Workflow Service   │    │  Document Service  │
         │   (.NET 8)         │    │   (Elsa + .NET 8)  │    │    (.NET 8)       │
         └──────────┬─────────┘    └──────────┬─────────┘    └──────────┬─────────┘
                    │                          │                          │
         ┌──────────▼──────────────────────────▼──────────────────────────▼─────────┐
         │                         Message Queue (RabbitMQ)                         │
         └───────────────────────────────────────────────────────────────────────────┘
                    │                          │                          │
         ┌──────────▼─────────┐    ┌──────────▼─────────┐    ┌──────────▼─────────┐
         │   SQL Server       │    │     Redis Cache     │    │   MinIO Storage    │
         │    (CQRS)          │    │                     │    │    (S3)            │
         └────────────────────┘    └─────────────────────┘    └────────────────────┘
```

### 4.2 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | NextJS 14, TypeScript | SSR, SEO, performance |
| **API Gateway** | YARP | Native .NET integration |
| **Backend** | .NET 8, EF Core 8 | Performance, ecosystem |
| **Workflow** | Elsa Workflows 3.0 | .NET native, visual designer |
| **Message Queue** | RabbitMQ | Reliability, .NET support |
| **Database** | SQL Server 2022 | Enterprise features, CQRS |
| **Cache** | Redis Enterprise | Performance, clustering |
| **Storage** | MinIO | S3-compatible, on-premise |
| **Search** | Elasticsearch 8 | Full-text search, analytics |

### 4.3 Deployment Architecture

```yaml
National Deployment:
  Central Services:
    - Location: Hanoi DC
    - Services: Auth, Master Data, Monitoring
    
  Regional Clusters (3):
    North Region:
      - Location: Hanoi
      - Coverage: 25 provinces
      - Capacity: 7k concurrent users
      
    Central Region:
      - Location: Da Nang
      - Coverage: 18 provinces
      - Capacity: 5k concurrent users
      
    South Region:
      - Location: Ho Chi Minh
      - Coverage: 20 provinces
      - Capacity: 9k concurrent users
      
  Database Strategy:
    - Primary: Read/Write cluster per region
    - Replicas: 2-3 read replicas per region
    - Sharding: By province_id
```

---

## 5. Kế Hoạch Triển Khai

### 5.1 Development Phases

| Phase | Duration | Deliverables | Success Criteria |
|-------|----------|--------------|------------------|
| **Phase 1: Foundation** | 8 weeks | Core services, basic workflow, RBAC | All unit tests pass |
| **Phase 2: Workflow Engine** | 8 weeks | Visual designer, workflow execution | 10 workflows tested |
| **Phase 3: Integration** | 6 weeks | LGSP, SMS, Digital signature | End-to-end flow works |
| **Phase 4: Portal & UI** | 6 weeks | Citizen portal, admin dashboard | Usability testing passed |
| **Phase 5: Testing** | 4 weeks | Load testing, security audit | Meet all NFRs |
| **Phase 6: Pilot** | 4 weeks | Deploy to 3 provinces | 500 real transactions |

### 5.2 Rollout Strategy

```mermaid
gantt
    title National Rollout Plan
    dateFormat  YYYY-MM-DD
    
    section Pilot
    3 Provinces       :2024-07-01, 30d
    Evaluation        :15d
    
    section Region 1
    10 Provinces      :30d
    Stabilization     :15d
    
    section Region 2  
    20 Provinces      :30d
    Stabilization     :15d
    
    section Nationwide
    Remaining 30      :45d
    Full Operation    :2024-12-01, 30d
```

### 5.3 Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Performance degradation** | High | Medium | Caching strategy, load testing |
| **Data migration issues** | High | Low | Phased migration, rollback plan |
| **User adoption** | High | Medium | Training program, change management |
| **Integration failures** | Medium | Medium | Mock services, circuit breakers |
| **Security breaches** | High | Low | Security audit, penetration testing |

---

## 6. Success Metrics

### 6.1 Business KPIs

| KPI | Current | Target (Year 1) | Target (Year 3) |
|-----|---------|-----------------|-----------------|
| **Digital Adoption Rate** | 0% | 70% | 95% |
| **Processing Time Reduction** | Baseline | -30% | -50% |
| **Citizen Satisfaction** | 60% | 80% | 90% |
| **Cost per Transaction** | 50,000 VND | 20,000 VND | 10,000 VND |
| **On-time Completion Rate** | 70% | 85% | 95% |

### 6.2 Technical KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| **System Availability** | 99.9% | Monitoring tools |
| **API Response Time** | <100ms | APM tools |
| **Concurrent User Support** | 21,000 | Load testing |
| **Data Processing Rate** | 270 docs/sec | Throughput monitoring |
| **Error Rate** | <0.1% | Error tracking |

### 6.3 Operational KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Deployment Frequency** | Weekly | CI/CD pipeline |
| **MTTR** | <1 hour | Incident tracking |
| **Change Failure Rate** | <5% | Deployment logs |
| **Backup Success Rate** | 100% | Backup monitoring |
| **Security Incident Rate** | 0 critical | SIEM |

---

## 8. Approval and Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Sponsor** | | | |
| **Technical Lead** | | | |
| **Business Owner** | | | |
| **Security Officer** | | | |
| **Finance Director** | | | |

---

## 9. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **LGSP** | Local Government Service Platform |
| **RBAC** | Role-Based Access Control |
| **CQRS** | Command Query Responsibility Segregation |
| **NFR** | Non-Functional Requirements |
| **SLA** | Service Level Agreement |
| **MTBF** | Mean Time Between Failures |
| **MTTR** | Mean Time To Repair |

### Appendix B: References

1. Vietnam E-Government Architecture Framework 2.0
2. ISO/IEC 27001:2022 Information Security Standard
3. Government Decree on Digital Transformation
4. National Public Service Portal Integration Guidelines

### Appendix C: Assumptions and Dependencies

**Assumptions:**
- Stable internet connectivity nationwide
- Users have basic computer literacy
- Government support throughout implementation
- No major legal/regulatory changes

**Dependencies:**
- LGSP APIs availability
- Digital signature infrastructure ready
- Provincial IT teams cooperation
- Budget approval on schedule

### Appendix D: Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2024-12-20 | Initial draft | System Architect |
| 1.0 | 2024-12-20 | Complete PRD | Team |

---

**END OF DOCUMENT**