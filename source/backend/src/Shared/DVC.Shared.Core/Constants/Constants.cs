namespace DVC.Shared.Core.Constants;

public static class AppConstants
{
    public const string DefaultCulture = "vi-VN";
    public const string DefaultTimeZone = "SE Asia Standard Time";
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public static class ClaimTypes
    {
        public const string UserId = "user_id";
        public const string Username = "username";
        public const string Email = "email";
        public const string Role = "role";
        public const string Department = "department";
        public const string Unit = "unit";
        public const string Permissions = "permissions";
    }

    public static class HeaderNames
    {
        public const string CorrelationId = "X-Correlation-ID";
        public const string RequestId = "X-Request-ID";
        public const string UserId = "X-User-ID";
        public const string TenantId = "X-Tenant-ID";
    }
}

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string TiepNhan = "TiepNhan";
    public const string ThuLy = "ThuLy";
    public const string LanhDao = "LanhDao";
    public const string TraKetQua = "TraKetQua";
    public const string Viewer = "Viewer";

    public static readonly string[] AllRoles = {
        Admin, Manager, TiepNhan, ThuLy, LanhDao, TraKetQua, Viewer
    };

    public static readonly string[] WorkflowRoles = {
        TiepNhan, ThuLy, LanhDao, TraKetQua
    };
}

public static class ErrorMessages
{
    public const string ValidationFailed = "Dữ liệu không hợp lệ";
    public const string NotFound = "Không tìm thấy dữ liệu";
    public const string Unauthorized = "Không có quyền truy cập";
    public const string Forbidden = "Bị từ chối truy cập";
    public const string InternalError = "Lỗi hệ thống";
    public const string BadRequest = "Yêu cầu không hợp lệ";
    public const string Conflict = "Dữ liệu đã tồn tại";

    public static class Authentication
    {
        public const string InvalidCredentials = "Tên đăng nhập hoặc mật khẩu không đúng";
        public const string TokenExpired = "Phiên đăng nhập đã hết hạn";
        public const string InvalidToken = "Token không hợp lệ";
        public const string AccountLocked = "Tài khoản đã bị khóa";
        public const string AccountDisabled = "Tài khoản đã bị vô hiệu hóa";
        public const string MfaRequired = "Yêu cầu xác thực hai yếu tố";
        public const string InvalidMfaCode = "Mã xác thực không đúng";
    }

    public static class Document
    {
        public const string FileNotFound = "Không tìm thấy tệp tin";
        public const string InvalidFileType = "Loại tệp tin không được hỗ trợ";
        public const string FileSizeExceeded = "Kích thước tệp tin vượt quá giới hạn";
        public const string ProcessingFailed = "Xử lý tài liệu thất bại";
        public const string VirusDetected = "Phát hiện virus trong tệp tin";
        public const string DigitalSignatureFailed = "Ký số thất bại";
    }

    public static class Workflow
    {
        public const string InvalidTransition = "Chuyển trạng thái không hợp lệ";
        public const string WorkflowNotFound = "Không tìm thấy quy trình";
        public const string StepNotFound = "Không tìm thấy bước xử lý";
        public const string AssignmentFailed = "Phân công thất bại";
        public const string ApprovalFailed = "Phê duyệt thất bại";
        public const string SlaViolation = "Vi phạm thời gian xử lý";
    }
}
