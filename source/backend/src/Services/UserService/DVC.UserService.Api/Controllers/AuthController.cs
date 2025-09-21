using AutoMapper;
using DVC.Shared.Core.Common;
using DVC.UserService.Core.DTOs;
using DVC.UserService.Core.Interfaces;
using DVC.UserService.Core.Mapping;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.UserService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly IValidator<LoginDto> _loginValidator;
    private readonly IValidator<RefreshTokenDto> _refreshTokenValidator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IUserService userService,
        IMapper mapper,
        IValidator<LoginDto> loginValidator,
        IValidator<RefreshTokenDto> refreshTokenValidator,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _userService = userService;
        _mapper = mapper;
        _loginValidator = loginValidator;
        _refreshTokenValidator = refreshTokenValidator;
        _logger = logger;
    }

    /// <summary>
    /// Đăng nhập người dùng
    /// </summary>
    /// <param name="loginDto">Thông tin đăng nhập</param>
    /// <returns>Thông tin xác thực</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> LoginAsync([FromBody] LoginDto loginDto)
    {
        try
        {
            // Validate input
            var validationResult = await _loginValidator.ValidateAsync(loginDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<LoginResponseDto>.ErrorResult("Dữ liệu không hợp lệ", errors));
            }

            // Convert to service request
            var loginRequest = _mapper.Map<LoginRequest>(loginDto);

            // Authenticate
            var authResult = await _authService.LoginAsync(loginRequest);

            if (!authResult.Success)
            {
                _logger.LogWarning("Login failed for username: {Username}", loginDto.Username);
                return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResult(authResult.ErrorMessage ?? "Đăng nhập thất bại"));
            }

            // Get user information if login successful
            UserDto? userDto = null;
            if (authResult.Success && !string.IsNullOrEmpty(authResult.AccessToken))
            {
                var userId = _authService.GetUserIdFromToken(authResult.AccessToken);
                if (userId.HasValue)
                {
                    var user = await _userService.GetUserByIdAsync(userId.Value);
                    if (user != null)
                    {
                        userDto = user.ToDto(_mapper);
                    }
                }
            }

            var responseDto = authResult.ToDto(_mapper, userDto);

            return Ok(ApiResponse<LoginResponseDto>.SuccessResult(responseDto, "Đăng nhập thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username: {Username}", loginDto.Username);
            return StatusCode(500, ApiResponse<LoginResponseDto>.ErrorResult("Lỗi hệ thống"));
        }
    }

    /// <summary>
    /// Làm mới token
    /// </summary>
    /// <param name="refreshTokenDto">Refresh token</param>
    /// <returns>Token mới</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> RefreshTokenAsync([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            // Validate input
            var validationResult = await _refreshTokenValidator.ValidateAsync(refreshTokenDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<LoginResponseDto>.ErrorResult("Dữ liệu không hợp lệ", errors));
            }

            // Refresh token
            var authResult = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);

            if (!authResult.Success)
            {
                _logger.LogWarning("Token refresh failed");
                return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResult(authResult.ErrorMessage ?? "Làm mới token thất bại"));
            }

            var responseDto = authResult.ToDto(_mapper);

            return Ok(ApiResponse<LoginResponseDto>.SuccessResult(responseDto, "Làm mới token thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, ApiResponse<LoginResponseDto>.ErrorResult("Lỗi hệ thống"));
        }
    }

    /// <summary>
    /// Đăng xuất người dùng
    /// </summary>
    /// <returns>Kết quả đăng xuất</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<ActionResult<ApiResponse>> LogoutAsync()
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest(ApiResponse.ErrorResult("Không tìm thấy thông tin người dùng"));
            }

            var result = await _authService.LogoutAsync(userId);

            if (result)
            {
                return Ok(ApiResponse.SuccessResult("Đăng xuất thành công"));
            }

            return StatusCode(500, ApiResponse.ErrorResult("Đăng xuất thất bại"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, ApiResponse.ErrorResult("Lỗi hệ thống"));
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái đăng nhập
    /// </summary>
    /// <returns>Thông tin người dùng hiện tại</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUserAsync()
    {
        try
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(ApiResponse<UserDto>.ErrorResult("Không tìm thấy thông tin người dùng"));
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<UserDto>.ErrorResult("Không tìm thấy người dùng"));
            }

            var userDto = user.ToDto(_mapper);

            return Ok(ApiResponse<UserDto>.SuccessResult(userDto, "Lấy thông tin người dùng thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user info");
            return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Lỗi hệ thống"));
        }
    }
}
