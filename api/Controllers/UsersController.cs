using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim is null ? null : Guid.TryParse(claim.Value, out var id) ? id : null;
    }

    // GET /api/users?role=Student&page=1&pageSize=10&search=&isActive=
    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        var validRoles = new[] { "Student", "Tutor", "Admin" };

        IQueryable<User> query = _db.Users;

        if (!string.IsNullOrWhiteSpace(role) && validRoles.Contains(role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserDto(
                u.Id,
                u.Email,
                u.FullName,
                u.Phone,
                u.AvatarUrl,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                GetUserExtra(u.Id, u.Role)))
            .ToListAsync();

        return Ok(new ApiResponse<UserListResponse>(
            true,
            null,
            new UserListResponse(items, totalCount, page, pageSize)));
    }

    // GET /api/users/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = new UserStatsDto(
            await _db.Users.CountAsync(),
            await _db.Users.CountAsync(u => u.Role == "Student"),
            await _db.Users.CountAsync(u => u.Role == "Tutor"),
            await _db.Users.CountAsync(u => u.Role == "Admin"),
            await _db.Users.CountAsync(u => !u.IsActive)
        );
        return Ok(new ApiResponse<UserStatsDto>(true, null, stats));
    }

    // PUT /api/users/{id}/toggle-status
    [HttpPut("{id:guid}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(new ApiResponse<object>(false, "User not found.", null));

        var adminId = GetUserId();
        if (adminId == id)
            return BadRequest(new ApiResponse<object>(false, "You cannot deactivate your own account.", null));

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, $"User {user.FullName} has been {(user.IsActive ? "activated" : "deactivated")}.", null));
    }

    // Helpers to enrich each role type with extra data
    private static object? GetUserExtra(Guid userId, string role)
    {
        return role switch
        {
            "Student" => new { userId },
            "Tutor" => new { userId },
            "Admin" => new { userId },
            _ => null
        };
    }
}

// ─── Admin DTOs ──────────────────────────────────────────────────────────────────

public record AdminUserDto(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    object? Extra);

public record UserListResponse(
    List<AdminUserDto> users,
    int totalCount,
    int page,
    int pageSize);

public record UserStatsDto(
    int totalUsers,
    int studentCount,
    int tutorCount,
    int adminCount,
    int inactiveCount);
