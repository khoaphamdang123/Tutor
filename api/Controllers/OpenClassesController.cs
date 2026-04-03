using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/open-classes")]
public class OpenClassesController : ControllerBase
{
    private readonly IOpenClassService _svc;

    public OpenClassesController(IOpenClassService svc) => _svc = svc;

    // ─── PUBLIC: Student browses published classes ──────────────
    [HttpGet]
    public async Task<IActionResult> SearchPublished([FromQuery] OpenClassSearchQuery query)
    {
        var result = await _svc.SearchPublishedAsync(query);
        return Ok(new ApiResponse<OpenClassSearchResult>(true, null, result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var dto = await _svc.GetByIdAsync(id, userId ?? Guid.Empty);
        if (dto is null) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
        return Ok(new ApiResponse<OpenClassDto>(true, null, dto));
    }

    // ─── ADMIN: My classes ──────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/me")]
    public async Task<IActionResult> GetAdminClasses()
    {
        var adminId = GetUserId();
        if (adminId is null) return Unauthorized();
        var classes = await _svc.GetAdminClassesAsync(adminId.Value);
        return Ok(new ApiResponse<List<OpenClassDto>>(true, null, classes));
    }

    // ─── ADMIN: Create ──────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOpenClassRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var dto = await _svc.CreateAsync(adminId.Value, request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id },
                new ApiResponse<OpenClassDto>(true, "Class created successfully.", dto));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
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

    // ─── ADMIN: Update ──────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOpenClassRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var dto = await _svc.UpdateAsync(id, adminId.Value, request);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
            return Ok(new ApiResponse<OpenClassDto>(true, "Class updated.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    // ─── ADMIN: Publish ─────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var ok = await _svc.PublishAsync(id, adminId.Value);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
            return Ok(new ApiResponse<object>(true, "Class published.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    // ─── ADMIN: Unpublish ────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/unpublish")]
    public async Task<IActionResult> Unpublish(Guid id)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var ok = await _svc.UnpublishAsync(id, adminId.Value);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
            return Ok(new ApiResponse<object>(true, "Class unpublished.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    // ─── ADMIN: Cancel ──────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var ok = await _svc.CancelAsync(id, adminId.Value);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
            return Ok(new ApiResponse<object>(true, "Class cancelled.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    // ─── ADMIN: Complete ────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var ok = await _svc.CompleteAsync(id, adminId.Value);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Class not found.", null));
            return Ok(new ApiResponse<object>(true, "Class marked as completed.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
