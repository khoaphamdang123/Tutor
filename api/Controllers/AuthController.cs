using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _auth.RegisterAsync(request);
            return Ok(new ApiResponse<AuthResponse>(true, "Registration successful.", result));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _auth.LoginAsync(request);
            return Ok(new ApiResponse<AuthResponse>(true, "Login successful.", result));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<object>(false, "Invalid email or password.", null));
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _auth.RefreshTokenAsync(request.RefreshToken);
        if (result is null)
            return Unauthorized(new ApiResponse<object>(false, "Invalid or expired refresh token.", null));
        return Ok(new ApiResponse<AuthResponse>(true, null, result));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await _auth.GetUserByIdAsync(userId.Value);
        if (user is null) return NotFound();

        return Ok(new ApiResponse<UserDto>(true, null, user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await _auth.UpdateProfileAsync(userId.Value, request);
        if (user is null) return NotFound();

        return Ok(new ApiResponse<UserDto>(true, "Profile updated.", user));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await _auth.ForgotPasswordAsync(request);
            // Always return success to avoid email enumeration
            return Ok(new ApiResponse<object>(true, "If an account with that email exists, a password reset link has been sent.", null));
        }
        catch
        {
            return Ok(new ApiResponse<object>(true, "If an account with that email exists, a password reset link has been sent.", null));
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _auth.ResetPasswordAsync(request);
            return Ok(new ApiResponse<object>(true, "Password has been reset successfully. You can now log in.", null));
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
