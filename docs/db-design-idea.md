##Thông tin hồ sơ
HOSO : Lưu thông tin chi tiết hồ sơ online và offline
-key HoSoID
-các cột chính
isOffline,
mã hồ sơ, 
thủ tục hành chính id(DM_QG_THUTUCHANHCHINH), 
lĩnh vực id(DM), 
tình trạng id(DM_QG_TINHTRANG),
đơn vị nhận(DM_DONVI), 
đơn vị xử lý(DM_DONVI), 
đơn vị trả kết quả(DM_DONVI), 
tỉnh thành ID người nộp(DM_TCTK_DONVIHANHCHINH),
phường xã ID người nộp(DM_TCTK_DONVIHANHCHINH),
Ngày nhận, 
ngày hẹn trả, 
Ngày hoàn tất, 
ngày thực trả, 
người nhận id (USER),
người trả kết quả id(USER),
Đã hoàn tất,
Kenh(DM_KENH),
NguonHoSo(DM_NGUONHOSO),
Phi,
LePhi,
DaThanhToan(theo trạng thái PHILEPHI_GIAODICH),
UyQuyen(bit),
createdAt,
createdBy,
lastupdateAt,
lastupdateBy,
workflowid,
DongBoDVCQG,
DongBo4T,
...

NGUOIDUNGTENHOSO : Lưu thông tin chi tiết người đứng tên hồ sơ(hồ sơ xử lý cho người này)
-key NguoiDungTenHoSoID link HoSoID
các cột chính:
loại đối tượng (DM_QG_DOITUONG)
MaDoiTuong(THONGTINCONGDAN),
Ten,
GioiTinh(DM_QG_GIOITINH),
LoaiGiayTo(DM_QG_LOAIGIAYTOKEMTHEO),
SoGiayTo,
NgayCap,
NoiCap,
DanToc(DM_TCTK_DANTOC),
NoiSinhQuocGiaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhTinhThanhID(DM_TCTK_DONVIHANHCHINH),
NoiSinhPhuongXaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhChiTiet,
ThuongTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
ThuongTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruChiTiet,
TamTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
TamTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
TamTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
TamTruChiTiet,
SoDienThoai,
Email,
MaSoThue,
DiaChiDoanhNghiep,
...

NGUOINOPHOSO : Lưu thông tin chi tiết người nộp hồ sơ(trong trường hợp nộp hộ, ủy quyền)
-key NguoiNopHoSoID link HoSoID
các cột chính:
loại đối tượng (DM_QG_DOITUONG)
MaDoiTuong(THONGTINCONGDAN),
Ten,
GioiTinh(DM_QG_GIOITINH),
LoaiGiayTo(DM_QG_LOAIGIAYTOKEMTHEO),
SoGiayTo,
NgayCap,
NoiCap,
DanToc(DM_TCTK_DANTOC),
NoiSinhQuocGiaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhTinhThanhID(DM_TCTK_DONVIHANHCHINH),
NoiSinhPhuongXaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhChiTiet,
ThuongTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
ThuongTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruChiTiet,
TamTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
TamTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
TamTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
TamTruChiTiet,
SoDienThoai,
Email,
MaSoThue,
DiaChiDoanhNghiep,
...



QUATRINHXULY : Lưu quá trình xử lý hồ sơ + người xử lý hồ sơ
-key QuaTrinhXuLyID link HoSoID

FILEKEMTHEOHOSO : Lưu thông tin file đính kèm theo hồ sơ khi công dân nộp hoặc công chức nhập
-key FileDinhKemHoSoID link HoSoID
các cột chính:
MaHoSoKemTheo(DM_QG_HOSOKEMTHEO),
FileID(dùng tải file từ minio),
FileName,
DungLuongMB,
extentions,
isDeleted,
createdAt,
createdBy,
lastupdateAt,
lastupdateBy
...

FILEXULYHOSO : Lưu các file trong quá trình xử lý cán bộ đính kèm 
-key FileXuLyHoSoID link HoSoID
các cột chính:
FileID(dùng tải file từ minio),
FileName,
DungLuongMB,
extentions,
workflowid(WORKFLOWS DESIGN),
stepid(WORKFLOWS DESIGN),
isDeleted,
createdAt,
createdBy,
lastupdateAt,
lastupdateBy

FILEKETQUA : Lưu file kết quả cuối cùng xử lý của hồ sơ
-key FileKetQuaID link HoSoID
các cột chính:
FileID(dùng tải file từ minio),
FileName,
DungLuongMB,
extentions,
workflowid(WORKFLOWS DESIGN),
stepid(WORKFLOWS DESIGN),
isDeleted,
createdAt,
createdBy,
lastupdateAt,
lastupdateBy

PHILEPHI_GIAODICH : Lưu thông tin giao dịch thanh toán phát sinh của hồ sơ(1 hs có thể thanh toán nhiều lần)
-key PhiLePhiGiaoDichID link HoSoID
hồ sơ id,
mã hồ sơ,
Phí,
Lệ Phí,
Nội dung,
workflowid(bước thanh toán lệ phí),
Hình thức thanh toán(DM_HINHTHUCTHANHTOAN),
TrangThaiThanhToan(1-0),
Mã giao dịch,
createdAt,
createdBy,
lastupdateAt,
lastupdateBy
,..



CONGDANDOANHNGHIEP : Lưu thông tin công dân khi đăng nhập vào hệ thông (tra từ CSDL dân cư quốc gia)
-key ThongTinCongDanID 
techid(uuid lấy từ VNEID khi đăng nhập thành công),
LoaiDangKy(1 công dân,2 doanh nghiệp)
TenDayDu,
DoB,
DanTocID,
QuoctichID,
GioiTInhID,
LoaiGiayTo,
SoGiayTo,
NgayCap,
NoiCap,
SoDienThoai,
Email,
NoiSinhQuocGiaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhTinhThanhID(DM_TCTK_DONVIHANHCHINH),
NoiSinhPhuongXaID(DM_TCTK_DONVIHANHCHINH),
NoiSinhChiTiet,
ThuongTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
ThuongTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
ThuongTruChiTiet,
TamTruQuocGiaID(DM_TCTK_DONVIHANHCHINH),
TamTruTinhThanhID(DM_TCTK_DONVIHANHCHINH),
TamTruPhuongXaID(DM_TCTK_DONVIHANHCHINH),
TamTruChiTiet,
HoTenCha,
SoGiayToCha,
HoTenMe,
SoGiayToMe,
createdAt,
lastupdateAt


HOSOBOSUNG : Lưu thông tin hồ sơ khi được yêu cầu bổ sung(lưu theo số lần bổ sung, thông tin chi tiết yêu cầu bổ sung, cán bộ yêu cầu, nội dung yêu cầu)
-key HoSoBoSungID link HoSoID
DonViID,
workflowid(yêu cầu bổ sung tại bước nào),
Ngày yêu cầu bổ sung,
Nội dung yêu cầu bổ sung,
Ngày Hẹn Trả cũ,
Ngày nhận bổ sung hồ sơ,
Ngày hẹn trả mới,
DaBoSung(bit),
createdAt,
createdBy,
lastupdateAt,
lastupdateBy


HOSOKHONGGIAIQUYET 
-key HoSoKhongGiaiQuyetID link HoSoID
DonViID,
workflowid(giải quyết tại bước nào),
NoiDungXuLy
createdAt,
createdBy,
lastupdateAt,
lastupdateBy

HOSOKHONGPHEDUYET 
-key HoSoKhongPheDuyetID link HoSoID
DonViID,
workflowid(không phê duyệt tại bước nào),
NoiDungXuLy
createdAt,
createdBy,
lastupdateAt,
lastupdateBy


HOSOHUY 
-key HoSoHuyID link HoSoID
-key HoSoKhongPheDuyetID link HoSoID
DonViID,
workflowid(hủy tại bước nào),
NoiDungXuLy
createdAt,
createdBy,
lastupdateAt,
lastupdateBy

HOSOTAMDUNG
-key HoSoTamDungID link HoSoID
DonViID,
workflowid(Tạm dừng tại bước nào),
NoiDungXuLy
createdAt,
createdBy,
lastupdateAt,
lastupdateBy

##Thông tin người dùng
USER
UserID,
HoTen,
DoB,
SoGiayTo,
DonViID,
PhongBanID,
LaDonViChinh,
Used,
createdAt,
createdBy,
lastupdateAt,
updatedBy

DM_DONVI
DonViID,
DonViChaID(đơn vị cha, dùng đệ quy để giảm bớt bảng phòng ban),
MaDonVi,
TenDonVi,
CapDonVi,
TinhID,
PhuongXaID,
DiaChiChiTiet,
Email,
SoDienThoai,
MoTa,
Used,
createdAt,
createdBy,
lastupdateAt,
lastupdateBy


##RBAC - Role Based Access Control
ROLE : Định nghĩa các vai trò trong hệ thống
-key RoleID
-các cột chính:
RoleCode(unique),
RoleName,
RoleDescription,
RoleType(System/Workflow/Functional/Department),
IsActive,
IsSystemRole,
Level(1=Admin,2=Manager,3=Officer,4=Staff),
createdAt,
createdBy,
updatedAt,
updatedBy
...

PERMISSION : Định nghĩa quyền chức năng chi tiết
-key PermissionID
-các cột chính:
PermissionCode(unique),
PermissionName,
PermissionDescription,
Module(User/Document/Workflow/Report/Admin),
Action(Create/Read/Update/Delete/Execute/Approve),
Resource(specific resource or wildcard),
IsActive,
createdAt,
createdBy,
updatedAt,
updatedBy
...

ROLE_PERMISSION : Gán quyền cho vai trò
-key RolePermissionID
-các cột chính:
RoleID(ROLE),
PermissionID(PERMISSION),
IsGranted(bit),
GrantedBy(USER),
GrantedAt,
createdAt,
createdBy,
updatedAt,
updatedBy
...

USER_ROLE : Gán vai trò cho người dùng (có thể có thời hạn)
-key UserRoleID link UserID
-các cột chính:
UserID(USER),
RoleID(ROLE),
DonViID(DM_DONVI),
PhongBanID(DM_PHONGBAN),
IsActive,
EffectiveFrom,
EffectiveTo,
AssignedBy(USER),
AssignedAt,
Reason,
IsTemporary,
createdAt,
createdBy,
updatedAt,
updatedBy
...

ROLE_HIERARCHY : Phân cấp thừa kế vai trò
-key RoleHierarchyID
-các cột chính:
ParentRoleID(ROLE),
ChildRoleID(ROLE),
InheritanceType(Full/Partial/Override),
Priority,
IsActive,
createdAt,
createdBy,
updatedAt,
updatedBy
...

WORKFLOW_ROLE : Vai trò đặc biệt trong workflow
-key WorkflowRoleID
-các cột chính:
WorkflowDefinitionId(Elsa),
RoleID(ROLE),
StepName,
StepType(TiepNhan/XuLy/PheDuyet/TraKetQua),
RequiredLevel,
CanDelegate,
CanEscalate,
SLAHours,
IsOptional,
createdAt,
createdBy,
updatedAt,
updatedBy
...

STEP_ROLE_ASSIGNMENT : Gán vai trò cho từng bước workflow cụ thể
-key StepRoleAssignmentID
-các cột chính:
CauHinhBuocID(CAUHINH_BUOCXULY),
RoleID(ROLE),
UserID(USER),
AssignmentType(Auto/Manual/Conditional),
Condition(JSON rules),
Priority,
IsBackup,
createdAt,
createdBy,
updatedAt,
updatedBy
...

DYNAMIC_ROLE_MAPPING : Mapping động role theo điều kiện
-key DynamicRoleMappingID
-các cột chính:
SourceRoleID(ROLE),
TargetRoleID(ROLE),
ConditionType(Amount/Department/Document/Time),
ConditionValue(JSON),
ConditionOperator(>,<,=,IN,BETWEEN),
IsActive,
createdAt,
createdBy,
updatedAt,
updatedBy
...

DELEGATION_HISTORY : Lịch sử ủy quyền vai trò
-key DelegationID
-các cột chính:
DelegatorID(USER),
DelegateID(USER),
RoleID(ROLE),
DelegationType(Temporary/Permanent/Conditional),
StartDate,
EndDate,
Reason,
ApprovalRequired,
ApprovedBy(USER),
ApprovedAt,
Status(Pending/Approved/Active/Expired/Revoked),
DelegationScope(All/Specific),
ScopeDetails(JSON),
createdAt,
createdBy,
updatedAt,
updatedBy
...

TEMPORAL_ROLE_ASSIGNMENT : Gán vai trò có thời hạn cho các trường hợp đặc biệt
-key TemporalRoleID
-các cột chính:
UserID(USER),
RoleID(ROLE),
AssignmentType(Vacation/Training/Project/Emergency),
OriginalUserID(USER),
StartDate,
EndDate,
AutoRevert,
NotificationDays,
Status(Scheduled/Active/Expired/Cancelled),
Reason,
ApprovedBy(USER),
createdAt,
createdBy,
updatedAt,
updatedBy
...

##Thông tin danh mục(Quốc Gia & Tổng cục thống kê)
DM_TCTK_DONVIHANHCHINH
IdDanhMuc [nvarchar](20) NULL,
TrangThaiHieuLuc [nvarchar](20) NULL,
TrangThaiDuLieu [nvarchar](20) NULL,
MaLoaiDonViHanhChinh [nvarchar](20) NULL,
MaDonViHanhChinh [nvarchar](20) NULL,
TenDonViHanhChinh [nvarchar](255) NULL,
TenDayDuDonViHanhChinh [nvarchar](500) NULL,
MaDonViHanhChinhCha [int] NULL,
MaTinhThanh [int] NULL,
TenTinhThanh [nvarchar](255) NULL


DM_QG_DOITUONG
DoiTuongID,
MaDoiTuong,
TenDoiTuong


DM_QG_LINHVUC
LinhVucID,
MaLinhVuc,
TenLinhVuc,
MaNganh


DM_QG_TINHTRANG
TinhTrangID,
MaTinhTrang,
TenTinhTrang

DM_QG_GIOITINH
GioiTinhID,
MaGioiTinh,
TenGioiTinh

DM_TINHTRANGKETHON
TinhTrangKetHonID,
MaTinhTrangKetHon,
TenTinhTrangKetHon

DM_HINHTHUCTHANHTOAN
HinhThucThanhToanID,
MaHinhThucThanhToan,
TenHinhThucThanhToan

DM_BUUCHINH
BuuChinhID,
MaBuuChinh,
TenBuuChinh,
DiaChi

DM_BIENLAI
BienLaiID,
MaBienLai,
TenBienLai

DM_NGUONHOSO
NguonHoSoID,
MaNguon,
TenNguon

DM_CAPTHUCHIEN
CapThucHienID,
MaCap,
TenCap


DM_KENH
KenhID,
MaKenh,
TenKenh

DM_TCTK_DANTOC
DanTocID,
MaDanToc,
TenDanToc

DM_TCTK_QUOCTICH
QuocTichID,
MaQuocTich,
TenQuocTich

DM_TCTK_QUOCGIA
QuocGiaID,
MaQuocGia,
TenQuocGia


##DATABASE DESIGN FOR TTHC MANAGEMENT SYSTEM

###1. MASTER TTHC TABLE (DM_QG_THUTUCHANHCHINH)
CREATE TABLE DM_QG_THUTUCHANHCHINH (
    ID BIGINT PRIMARY KEY,
    MaTTHC NVARCHAR(50) UNIQUE NOT NULL,
    TenTTHC NVARCHAR(500) NOT NULL,
    MaCoQuanCongBo NVARCHAR(20),
    LoaiTTHC TINYINT,
    MoTaDoiTuongThucHien NVARCHAR(MAX),
    DiaChiTiepNhan NVARCHAR(MAX),
    YeuCau NVARCHAR(MAX),
    TuKhoa NVARCHAR(500),
    IDQuyetDinhCongBo BIGINT,
    TrangThai TINYINT DEFAULT 1,
    MoTaCoQuanThucHien NVARCHAR(MAX),
    MoTaCoQuanThamQuyen NVARCHAR(MAX),
    MoTa NVARCHAR(MAX),
    IsNganhDoc BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy BIGINT,
    UpdatedBy BIGINT,
    INDEX IX_MaTTHC (MaTTHC),
    INDEX IX_TrangThai (TrangThai)
)

###2. TTHC RELATED TABLES (PREFIX: DM_QG_TTHC_)

--DM_QG_TTHC_COQUANTHUCHIEN
CREATE TABLE DM_QG_TTHC_COQUANTHUCHIEN (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    MaDonVi NVARCHAR(50) NOT NULL,
    TenDonVi NVARCHAR(255) NOT NULL,
    LoaiCoQuan TINYINT DEFAULT 1,
    ThuTu INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_MaDonVi (TTHCID, MaDonVi)
)

--DM_QG_TTHC_CAPTHUCHIEN (Link với DM_DONVI.CapDonVi để phân quyền)
CREATE TABLE DM_QG_TTHC_CAPTHUCHIEN (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    CapThucHien TINYINT NOT NULL,
    TenCap NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    UNIQUE (TTHCID, CapThucHien)
)

--DM_QG_TTHC_LINHVUC
CREATE TABLE DM_QG_TTHC_LINHVUC (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    MaLinhVuc NVARCHAR(50) NOT NULL,
    TenLinhVuc NVARCHAR(255),
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_LinhVuc (TTHCID, MaLinhVuc)
)

--DM_QG_TTHC_DOITUONG
CREATE TABLE DM_QG_TTHC_DOITUONG (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    MaDoiTuong NVARCHAR(50) NOT NULL,
    TenDoiTuong NVARCHAR(255),
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_DoiTuong (TTHCID, MaDoiTuong)
)

--DM_QG_TTHC_CACHTHUC
CREATE TABLE DM_QG_TTHC_CACHTHUC (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    Kenh TINYINT NOT NULL,
    TenKenh NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    UNIQUE (TTHCID, Kenh)
)

--DM_QG_TTHC_THOIGIAN_PHILEPHI (Combined time and fees - có cả phí và lệ phí)
CREATE TABLE DM_QG_TTHC_THOIGIAN_PHILEPHI (
    ID BIGINT PRIMARY KEY IDENTITY,
    CachThucID BIGINT NOT NULL,
    ThoiGianGiaiQuyet DECIMAL(10,2),
    DonViTinh NVARCHAR(20),
    MoTaThoiGian NVARCHAR(MAX),
    MaPhiLePhi NVARCHAR(50),
    DonViTien NVARCHAR(10) DEFAULT N'Đồng',
    SoTienPhi DECIMAL(18,2) DEFAULT 0,
    SoTienLePhi DECIMAL(18,2) DEFAULT 0,
    MoTaPhiLePhi NVARCHAR(MAX),
    URLVanBan NVARCHAR(500),
    ApDungTuNgay DATE,
    ApDungDenNgay DATE,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CachThucID) REFERENCES DM_QG_TTHC_CACHTHUC(ID),
    INDEX IX_CachThuc_Active (CachThucID, IsActive)
)

--DM_QG_TTHC_THANHPHANHOSO
CREATE TABLE DM_QG_TTHC_THANHPHANHOSO (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    TruongHop NVARCHAR(500),
    LoaiTruongHop TINYINT,
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_TruongHop (TTHCID, ThuTu)
)

--DM_QG_TTHC_GIAYTO
CREATE TABLE DM_QG_TTHC_GIAYTO (
    ID BIGINT PRIMARY KEY IDENTITY,
    ThanhPhanHoSoID BIGINT NOT NULL,
    MaGiayTo NVARCHAR(100),
    TenGiayTo NVARCHAR(MAX),
    SoBanChinh INT DEFAULT 1,
    SoBanSao INT DEFAULT 0,
    TenMauDon NVARCHAR(255),
    URLMauDon NVARCHAR(500),
    MaKetQuaThayThe NVARCHAR(100),
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ThanhPhanHoSoID) REFERENCES DM_QG_TTHC_THANHPHANHOSO(ID),
    INDEX IX_ThanhPhan_ThuTu (ThanhPhanHoSoID, ThuTu)
)

--DM_QG_TTHC_KETQUA
CREATE TABLE DM_QG_TTHC_KETQUA (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    MaKetQua NVARCHAR(100),
    TenKetQua NVARCHAR(500),
    TenTep NVARCHAR(255),
    URLTep NVARCHAR(500),
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_KetQua (TTHCID, ThuTu)
)

--DM_QG_TTHC_CANCUPHAPLY
CREATE TABLE DM_QG_TTHC_CANCUPHAPLY (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    SoVanBan NVARCHAR(100),
    TenVanBan NVARCHAR(500),
    DiaChiTruyCap NVARCHAR(500),
    NgayBanHanh DATE,
    NgayHieuLuc DATE,
    CoQuanBanHanh NVARCHAR(100),
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_TTHC_CanCu (TTHCID, ThuTu)
)

--DM_QG_TTHC_TRINHTUTHUCHIEN
CREATE TABLE DM_QG_TTHC_TRINHTUTHUCHIEN (
    ID BIGINT PRIMARY KEY IDENTITY,
    TTHCID BIGINT NOT NULL,
    TruongHop NVARCHAR(500),
    TrinhTu NVARCHAR(MAX), -- JSON array
    ThuTu INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID)
)

###3. WORKFLOW MANAGEMENT

--DM_WORKFLOW (Mỗi đơn vị có nhiều workflow)
CREATE TABLE DM_WORKFLOW (
    WorkflowID BIGINT PRIMARY KEY IDENTITY,
    DonViID INT NOT NULL,
    MaWorkflow NVARCHAR(100) UNIQUE NOT NULL,
    TenWorkflow NVARCHAR(255),
    MoTa NVARCHAR(MAX),
    ElsaDefinitionId NVARCHAR(100),
    Version INT DEFAULT 1,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy BIGINT,
    UpdatedBy BIGINT,
    FOREIGN KEY (DonViID) REFERENCES DM_DONVI(DonViID),
    INDEX IX_DonVi_Workflow (DonViID, IsActive)
)

--DM_WORKFLOW_TTHC (N:M - Mỗi workflow có thể xử lý nhiều TTHC)
CREATE TABLE DM_WORKFLOW_TTHC (
    ID BIGINT PRIMARY KEY IDENTITY,
    WorkflowID BIGINT NOT NULL,
    TTHCID BIGINT NOT NULL,
    CustomConfig NVARCHAR(MAX), -- JSON config
    Priority INT DEFAULT 0,
    DieuKienApDung NVARCHAR(MAX), -- JSON conditions
    IsDefault BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (WorkflowID) REFERENCES DM_WORKFLOW(WorkflowID),
    FOREIGN KEY (TTHCID) REFERENCES DM_QG_THUTUCHANHCHINH(ID),
    INDEX IX_Workflow_TTHC (WorkflowID, TTHCID, IsActive),
    INDEX IX_TTHC_Workflow (TTHCID, WorkflowID, IsActive)
)

###4. ENHANCED HOSO TABLE (Tách riêng Phi và LePhi)

--Update HOSO table với các trường bổ sung
ALTER TABLE HOSO ADD
    TruongHopHoSoID BIGINT NULL,
    KenhNop TINYINT NOT NULL DEFAULT 1,
    SoTienPhi DECIMAL(18,2) DEFAULT 0,
    SoTienLePhi DECIMAL(18,2) DEFAULT 0,
    DaThanhToanPhi BIT DEFAULT 0,
    DaThanhToanLePhi BIT DEFAULT 0

-- Foreign key cho trường hợp hồ sơ đã chọn
ALTER TABLE HOSO ADD CONSTRAINT FK_HOSO_TruongHopHoSo
FOREIGN KEY (TruongHopHoSoID) REFERENCES DM_QG_TTHC_THANHPHANHOSO(ID)

###5. BUSINESS LOGIC FUNCTIONS

--Function kiểm tra quyền của đơn vị xử lý TTHC
CREATE FUNCTION dbo.fn_CheckDonViPermission
(
    @DonViID INT,
    @TTHCID BIGINT
)
RETURNS BIT
AS
BEGIN
    DECLARE @HasPermission BIT = 0

    -- Check based on CapThucHien matching với CapDonVi
    SELECT @HasPermission = 1
    FROM DM_QG_TTHC_CAPTHUCHIEN ct
    INNER JOIN DM_DONVI dv ON dv.DonViID = @DonViID
    WHERE ct.TTHCID = @TTHCID
        AND ct.CapThucHien = dv.CapDonVi
        AND ct.IsActive = 1
        AND dv.Used = 1

    RETURN @HasPermission
END

--Function lấy workflow phù hợp cho TTHC tại đơn vị
CREATE FUNCTION dbo.fn_GetWorkflowForTTHC
(
    @DonViID INT,
    @TTHCID BIGINT
)
RETURNS TABLE
AS
RETURN
(
    SELECT TOP 1
        w.WorkflowID,
        w.MaWorkflow,
        w.ElsaDefinitionId,
        wt.CustomConfig
    FROM DM_WORKFLOW w
    INNER JOIN DM_WORKFLOW_TTHC wt ON w.WorkflowID = wt.WorkflowID
    WHERE wt.TTHCID = @TTHCID
        AND w.DonViID = @DonViID
        AND w.IsActive = 1
        AND wt.IsActive = 1
    ORDER BY wt.IsDefault DESC, wt.Priority DESC
)

###6. SAMPLE QUERIES

--Lấy phí/lệ phí theo kênh
SELECT
    tp.SoTienPhi,
    tp.SoTienLePhi,
    tp.ThoiGianGiaiQuyet,
    tp.DonViTinh
FROM DM_QG_TTHC_THOIGIAN_PHILEPHI tp
INNER JOIN DM_QG_TTHC_CACHTHUC ct ON tp.CachThucID = ct.ID
WHERE ct.TTHCID = @TTHCID
    AND ct.Kenh = @KenhNop
    AND tp.IsActive = 1
    AND GETDATE() BETWEEN tp.ApDungTuNgay AND ISNULL(tp.ApDungDenNgay, '9999-12-31')

--Lấy danh sách giấy tờ theo trường hợp
SELECT
    gt.TenGiayTo,
    gt.SoBanChinh,
    gt.SoBanSao,
    gt.URLMauDon
FROM DM_QG_TTHC_GIAYTO gt
INNER JOIN DM_QG_TTHC_THANHPHANHOSO tp ON gt.ThanhPhanHoSoID = tp.ID
WHERE tp.TTHCID = @TTHCID
    AND tp.TruongHop = @SelectedCase
ORDER BY gt.ThuTu

--Kiểm tra quyền xử lý TTHC
SELECT dbo.fn_CheckDonViPermission(@DonViID, @TTHCID) AS CanProcess

###7. MIGRATION NOTES

1. Đơn giản hóa logic phân quyền: CapThucHien = CapDonVi
2. Workflow linh hoạt: 1 đơn vị nhiều workflow, 1 workflow nhiều TTHC
3. SQL Server 2019 hỗ trợ đầy đủ OPENJSON và JSON functions
4. Tách riêng Phi và LePhi trong bảng HOSO
5. Prefix DM_QG_TTHC_* cho tất cả bảng phụ của TTHC



##Cấu hình
CH_FILEDAUVAODAURA
CH_LYDO
CH_NGUOIKY
CH_PHILEPHI
CH_BIEUMAU
CH_BIENLAIBIENTU

##Workflow
QUYTRINH_THUTUC : Ánh xạ quy trình xử lý với thủ tục hành chính
-key QuyTrinhThuTucID
-các cột chính:
WorkflowDefinitionId(Elsa framework ID),
MaThuTucHanhChinh(DM_QG_THUTUCHANHCHINH),
DonViID(DM_DONVI),
TinhThanhID(DM_TCTK_DONVIHANHCHINH),
NgayBatDau,
NgayKetThuc,
TrangThai,
createdAt,
createdBy,
updatedAt,
updatedBy
...

HOSO_QUYTRINH : Liên kết hồ sơ với instance quy trình đang chạy
-key HoSoQuyTrinhID link HoSoID
-các cột chính:
WorkflowInstanceId(Elsa instance ID),
HoSoID(HOSO),
NgayBatDau,
NgayKetThuc,
TrangThaiQuyTrinh(0=ChoDuyet,1=DangXuLy,2=HoanThanh,3=TamDung,4=Huy),
NguoiKhoiTao(USER),
GhiChu,
createdAt,
createdBy,
updatedAt,
updatedBy
...

PHANCONG_XULY : Phân công xử lý hồ sơ cho cán bộ
-key PhanCongID
-các cột chính:
WorkflowInstanceId(Elsa),
ActivityId(Elsa activity ID),
HoSoID(HOSO),
LoaiPhanCong(CaNhan/PhongBan/ChucVu),
NguoiDuocPhanCongID(USER),
TenNguoiDuocPhanCong,
PhongBanID(DM_PHONGBAN),
ChucVuID,
NgayPhanCong,
HanXuLy,
NgayBatDauXuLy,
NgayHoanThanh,
TrangThai(0=ChoXuLy,1=DangXuLy,2=HoanThanh,3=QuaHan,4=TraLai),
YKienXuLy,
NguoiPhanCong(USER),
LyDoTraLai,
createdAt,
createdBy,
updatedAt,
updatedBy
...

PHEDUYET_HOSO : Lưu các quyết định phê duyệt/từ chối hồ sơ
-key PheDuyetID
-các cột chính:
WorkflowInstanceId(Elsa),
ActivityId(Elsa activity ID),
HoSoID(HOSO),
LoaiPheDuyet(PheDuyet/TuChoi/TraLaiBoSung),
NguoiPheDuyetID(USER),
TenNguoiPheDuyet,
ChucVu,
NgayPheDuyet,
NoiDungPheDuyet,
LyDoTuChoi,
FileDinhKemIDs(JSON array),
BuocTiepTheo,
ChuKySo(digital signature data),
createdAt,
createdBy,
updatedAt,
updatedBy
...

THEODOITHOIHAN : Theo dõi thời hạn xử lý và SLA
-key TheoDoiThoiHanID
-các cột chính:
WorkflowInstanceId(Elsa),
ActivityId(Elsa activity ID),
HoSoID(HOSO),
BuocXuLy,
ThoiGianQuyDinh(số giờ),
ThoiGianBatDau,
ThoiGianKetThuc,
ThoiGianThucTe(số giờ),
TrangThaiSLA(0=TrongHan,1=SapHetHan,2=QuaHan),
SoGioQuaHan,
DaGuiCanhBao,
NgayGuiCanhBao,
createdAt,
createdBy,
updatedAt,
updatedBy
...

BIENSOQUYTRINH : Lưu các biến tùy chỉnh của quy trình
-key BienSoID
-các cột chính:
WorkflowInstanceId(Elsa),
TenBien,
GiaTriBien,
LoaiBien(String/Number/Date/Boolean/Json),
MoTa,
createdAt,
createdBy,
updatedAt,
updatedBy
...

LICHSUCHUYENBUOC : Lịch sử chuyển đổi bước trong quy trình
-key LichSuID
-các cột chính:
WorkflowInstanceId(Elsa),
HoSoID(HOSO),
BuocTruoc,
BuocSau,
NguoiThucHienID(USER),
TenNguoiThucHien,
NgayChuyenBuoc,
LyDoChuyenBuoc,
GhiChu,
IPAddress,
createdAt,
createdBy,
updatedAt,
updatedBy
...

CAUHINH_BUOCXULY : Cấu hình các bước xử lý cho từng loại thủ tục
-key CauHinhBuocID
-các cột chính:
MaThuTucHanhChinh(DM_QG_THUTUCHANHCHINH),
TenBuoc,
MaBuoc,
ThuTuBuoc,
LoaiBuoc(TiepNhan/XuLy/PheDuyet/TraKetQua),
ChucVuXuLy,
PhongBanXuLy(DM_PHONGBAN),
ThoiGianXuLy(số giờ),
BatBuoc,
DieuKienChuyenBuoc(JSON conditions),
isActive,
createdAt,
createdBy,
updatedAt,
updatedBy
...

TEMPLATE_QUYTRINH : Template quy trình cho các loại thủ tục
-key TemplateID
-các cột chính:
TenTemplate,
MaTemplate,
LoaiThuTuc,
MoTa,
NoiDungJSON(Elsa workflow definition),
PhienBan,
createdAt,
createdBy,
updatedAt,
updatedBy,
isActive
...



