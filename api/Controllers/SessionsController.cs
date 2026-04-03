using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api")]
public class SessionsController : ControllerBase
{
    private readonly IOpenClassService _svc;

    public SessionsController(IOpenClassService svc) => _svc = svc;

    // ─── TUTOR: Manage sessions ─────────────────────────────────
    [Authorize(Roles = "Tutor")]
    [HttpPost("tutor/classes/{classId:guid}/sessions")]
    public async Task<IActionResult> CreateSession(Guid classId, [FromBody] CreateSessionRequest request)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var dto = await _svc.CreateSessionAsync(classId, tutorId.Value, request);
            return CreatedAtAction(nameof(GetSessionById), new { id = dto.Id },
                new ApiResponse<ClassSessionDto>(true, "Session created.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [Authorize(Roles = "Tutor")]
    [HttpPut("tutor/sessions/{sessionId:guid}")]
    public async Task<IActionResult> UpdateSession(Guid sessionId, [FromBody] UpdateSessionRequest request)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var dto = await _svc.UpdateSessionAsync(sessionId, tutorId.Value, request);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Session not found.", null));
            return Ok(new ApiResponse<ClassSessionDto>(true, "Session updated.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [Authorize(Roles = "Tutor")]
    [HttpDelete("tutor/sessions/{sessionId:guid}")]
    public async Task<IActionResult> DeleteSession(Guid sessionId)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var ok = await _svc.DeleteSessionAsync(sessionId, tutorId.Value);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Session not found.", null));
            return Ok(new ApiResponse<object>(true, "Session deleted.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [HttpGet("sessions/{sessionId:guid}")]
    public async Task<IActionResult> GetSessionById(Guid sessionId)
    {
        var userId = GetUserId();
        var dto = await _svc.GetSessionByIdAsync(sessionId);
        if (dto is null) return NotFound(new ApiResponse<object>(false, "Session not found.", null));
        return Ok(new ApiResponse<ClassSessionDto>(true, null, dto));
    }

    // ─── TUTOR + STUDENT: List sessions for a class ────────────
    [HttpGet("classes/{classId:guid}/sessions")]
    public async Task<IActionResult> GetSessionsByClass(Guid classId)
    {
        var userId = GetUserId();
        var sessions = await _svc.GetSessionsByClassAsync(classId, userId ?? Guid.Empty);
        return Ok(new ApiResponse<List<ClassSessionDto>>(true, null, sessions));
    }

    // ─── TUTOR: Attendance ───────────────────────────────────────
    [Authorize(Roles = "Tutor")]
    [HttpPatch("tutor/sessions/{sessionId:guid}/attendance")]
    public async Task<IActionResult> MarkAttendance(Guid sessionId, [FromBody] List<MarkAttendanceRequest> marks)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var ok = await _svc.MarkAttendanceAsync(sessionId, tutorId.Value, marks);
            if (!ok) return NotFound(new ApiResponse<object>(false, "Session not found.", null));
            return Ok(new ApiResponse<object>(true, "Attendance marked.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [Authorize(Roles = "Tutor")]
    [HttpGet("tutor/sessions/{sessionId:guid}/attendance")]
    public async Task<IActionResult> GetSessionAttendance(Guid sessionId)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var attendance = await _svc.GetSessionAttendanceAsync(sessionId, tutorId.Value);
            return Ok(new ApiResponse<List<AttendanceDto>>(true, null, attendance));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
