using FluentValidation;
using DVC.UserService.Core.DTOs;
using DVC.Shared.Infrastructure.Security;

namespace DVC.UserService.Core.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
            .Length(3, 50).WithMessage("Tên đăng nhập phải từ 3-50 ký tự")
            .Matches(@"^[a-zA-Z0-9._-]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ, số và ký tự .-_");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự");

        When(x => !string.IsNullOrEmpty(x.MfaCode), () =>
        {
            RuleFor(x => x.MfaCode)
                .Length(6).WithMessage("Mã xác thực phải có 6 ký tự")
                .Matches(@"^\d{6}$").WithMessage("Mã xác thực chỉ được chứa số");
        });
    }
}

public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
{
    private readonly IPasswordService _passwordService;

    public CreateUserDtoValidator(IPasswordService passwordService)
    {
        _passwordService = passwordService;

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
            .Length(3, 50).WithMessage("Tên đăng nhập phải từ 3-50 ký tự")
            .Matches(@"^[a-zA-Z0-9._-]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ, số và ký tự .-_");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống")
            .EmailAddress().WithMessage("Email không đúng định dạng")
            .MaximumLength(200).WithMessage("Email không được vượt quá 200 ký tự");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống")
            .Length(2, 100).WithMessage("Họ tên phải từ 2-100 ký tự")
            .Matches(@"^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$")
            .WithMessage("Họ tên chỉ được chứa chữ cái và khoảng trắng");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống")
            .MinimumLength(8).WithMessage("Mật khẩu phải có ít nhất 8 ký tự")
            .Must(BeStrongPassword).WithMessage("Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^[0-9]{10,11}$").WithMessage("Số điện thoại phải có 10-11 chữ số");
        });

        When(x => !string.IsNullOrEmpty(x.Department), () =>
        {
            RuleFor(x => x.Department)
                .MaximumLength(100).WithMessage("Phòng ban không được vượt quá 100 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Unit), () =>
        {
            RuleFor(x => x.Unit)
                .MaximumLength(100).WithMessage("Đơn vị không được vượt quá 100 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Position), () =>
        {
            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Chức vụ không được vượt quá 100 ký tự");
        });

        RuleFor(x => x.RoleNames)
            .Must(roles => roles == null || roles.Count <= 10)
            .WithMessage("Không được gán quá 10 vai trò");
    }

    private bool BeStrongPassword(string password)
    {
        return _passwordService.IsPasswordStrong(password);
    }
}

public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống")
            .EmailAddress().WithMessage("Email không đúng định dạng")
            .MaximumLength(200).WithMessage("Email không được vượt quá 200 ký tự");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống")
            .Length(2, 100).WithMessage("Họ tên phải từ 2-100 ký tự")
            .Matches(@"^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$")
            .WithMessage("Họ tên chỉ được chứa chữ cái và khoảng trắng");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^[0-9]{10,11}$").WithMessage("Số điện thoại phải có 10-11 chữ số");
        });

        When(x => !string.IsNullOrEmpty(x.Department), () =>
        {
            RuleFor(x => x.Department)
                .MaximumLength(100).WithMessage("Phòng ban không được vượt quá 100 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Unit), () =>
        {
            RuleFor(x => x.Unit)
                .MaximumLength(100).WithMessage("Đơn vị không được vượt quá 100 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Position), () =>
        {
            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Chức vụ không được vượt quá 100 ký tự");
        });
    }
}

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    private readonly IPasswordService _passwordService;

    public ChangePasswordDtoValidator(IPasswordService passwordService)
    {
        _passwordService = passwordService;

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Mật khẩu hiện tại không được để trống");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Mật khẩu mới không được để trống")
            .MinimumLength(8).WithMessage("Mật khẩu mới phải có ít nhất 8 ký tự")
            .Must(BeStrongPassword).WithMessage("Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt")
            .NotEqual(x => x.CurrentPassword).WithMessage("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    private bool BeStrongPassword(string password)
    {
        return _passwordService.IsPasswordStrong(password);
    }
}

public class CreateRoleDtoValidator : AbstractValidator<CreateRoleDto>
{
    public CreateRoleDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên vai trò không được để trống")
            .Length(2, 50).WithMessage("Tên vai trò phải từ 2-50 ký tự")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Tên vai trò chỉ được chứa chữ, số và ký tự _-");

        When(x => !string.IsNullOrEmpty(x.Description), () =>
        {
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.DisplayName), () =>
        {
            RuleFor(x => x.DisplayName)
                .Length(2, 100).WithMessage("Tên hiển thị phải từ 2-100 ký tự");
        });

        RuleFor(x => x.PermissionCodes)
            .Must(permissions => permissions == null || permissions.Count <= 100)
            .WithMessage("Không được gán quá 100 quyền");
    }
}

public class CreatePermissionDtoValidator : AbstractValidator<CreatePermissionDto>
{
    public CreatePermissionDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã quyền không được để trống")
            .Length(2, 100).WithMessage("Mã quyền phải từ 2-100 ký tự")
            .Matches(@"^[A-Z0-9_.-]+$").WithMessage("Mã quyền chỉ được chứa chữ hoa, số và ký tự _.-");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên quyền không được để trống")
            .Length(2, 100).WithMessage("Tên quyền phải từ 2-100 ký tự");

        When(x => !string.IsNullOrEmpty(x.Description), () =>
        {
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Module), () =>
        {
            RuleFor(x => x.Module)
                .MaximumLength(50).WithMessage("Module không được vượt quá 50 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Resource), () =>
        {
            RuleFor(x => x.Resource)
                .MaximumLength(50).WithMessage("Resource không được vượt quá 50 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Action), () =>
        {
            RuleFor(x => x.Action)
                .MaximumLength(50).WithMessage("Action không được vượt quá 50 ký tự");
        });
    }
}

public class UserSearchDtoValidator : AbstractValidator<UserSearchDto>
{
    public UserSearchDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Số trang phải lớn hơn 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Kích thước trang phải từ 1-100");

        When(x => !string.IsNullOrEmpty(x.Username), () =>
        {
            RuleFor(x => x.Username)
                .MinimumLength(2).WithMessage("Tên đăng nhập tìm kiếm phải có ít nhất 2 ký tự");
        });

        When(x => !string.IsNullOrEmpty(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Email tìm kiếm không đúng định dạng");
        });
    }
}

public class RefreshTokenDtoValidator : AbstractValidator<RefreshTokenDto>
{
    public RefreshTokenDtoValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token không được để trống");
    }
}