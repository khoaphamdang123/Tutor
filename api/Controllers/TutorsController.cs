using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TutorsController : ControllerBase
{
    private readonly ITutorService _tutors;

    public TutorsController(ITutorService tutors) => _tutors = tutors;

    // ─── Admin endpoints (must be before {id:guid}) ─────────────────────────

    // GET /api/tutors/admin?search=&page=1&pageSize=10
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SearchAdmin(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _tutors.SearchTutorsAdminAsync(search, page, pageSize);
        return Ok(new ApiResponse<AdminTutorSearchResult>(true, null, result));
    }

    // GET /api/tutors/admin/stats
    [HttpGet("admin/stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _tutors.GetTutorStatsAsync();
        return Ok(new ApiResponse<TutorStatsDto>(true, null, stats));
    }

    // GET /api/tutors/admin/{id}
    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByIdAdmin(Guid id)
    {
        var tutor = await _tutors.GetTutorByIdAdminAsync(id);
        if (tutor is null) return NotFound(new ApiResponse<object>(false, "Tutor not found.", null));
        return Ok(new ApiResponse<AdminTutorDto>(true, null, tutor));
    }

    // POST /api/tutors/admin — create a new Tutor account
    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTutor([FromBody] CreateTutorRequest request)
    {
        try
        {
            var tutor = await _tutors.CreateTutorAsync(request);
            return Created($"/api/tutors/admin/{tutor.Id}",
                new ApiResponse<TutorDto>(true, "Tutor created successfully.", tutor));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // PUT /api/tutors/admin/{id}
    [HttpPut("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTutor(Guid id, [FromBody] UpdateTutorProfileRequest request)
    {
        var tutor = await _tutors.UpdateTutorAsync(id, request);
        if (tutor is null) return NotFound(new ApiResponse<object>(false, "Tutor not found.", null));
        return Ok(new ApiResponse<AdminTutorDto>(true, "Tutor updated.", tutor));
    }

    // DELETE /api/tutors/admin/{id}
    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTutor(Guid id)
    {
        var deleted = await _tutors.DeleteTutorAsync(id);
        if (!deleted) return NotFound(new ApiResponse<object>(false, "Tutor not found.", null));
        return Ok(new ApiResponse<object>(true, "Tutor deleted.", null));
    }

    // GET /api/tutors/search?subjectId=...&classId=...&minRate=...&maxRate=...&minRating=...&verifiedOnly=true&page=1&pageSize=10
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] TutorSearchQuery query)
    {
        var result = await _tutors.SearchTutorsAsync(query);
        return Ok(new ApiResponse<TutorSearchResult>(true, null, result));
    }

    // GET /api/tutors/{id} (public — must be after admin routes)
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        return Ok(new ApiResponse<TutorDto>(true, null, tutor));
    }

    // GET /api/tutors/me
    [Authorize(Roles = "Tutor")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByUserIdAsync(userId.Value);
        return Ok(new ApiResponse<TutorDto?>(true, null, tutor));
    }

    // POST /api/tutors/me
    [Authorize(Roles = "Tutor")]
    [HttpPost("me")]
    public async Task<IActionResult> CreateProfile([FromBody] CreateTutorProfileRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var tutor = await _tutors.CreateTutorProfileAsync(userId.Value, request);
            return Created($"/api/tutors/{tutor.Id}", new ApiResponse<TutorDto>(true, "Tutor profile created.", tutor));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // PUT /api/tutors/{id}
    [Authorize(Roles = "Tutor")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] CreateTutorProfileRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _tutors.GetTutorByIdAsync(id);
        if (existing is null) return NotFound();
        if (existing.UserId != userId.Value)
            return Forbid();

        var tutor = await _tutors.UpdateTutorProfileAsync(id, request);
        return Ok(new ApiResponse<TutorDto>(true, "Profile updated.", tutor));
    }

    // ─── Subjects ──────────────────────────────────────────────────────────

    // POST /api/tutors/{id}/subjects
    [Authorize(Roles = "Tutor")]
    [HttpPost("{id:guid}/subjects")]
    public async Task<IActionResult> AddSubject(Guid id, [FromBody] AddTutorSubjectRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        try
        {
            var result = await _tutors.AddSubjectAsync(id, request);
            return Created("", new ApiResponse<TutorSubjectDto>(true, "Subject added.", result));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // DELETE /api/tutors/{id}/subjects/{subjectId}
    [Authorize(Roles = "Tutor")]
    [HttpDelete("{id:guid}/subjects/{subjectId:guid}")]
    public async Task<IActionResult> RemoveSubject(Guid id, Guid subjectId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        var removed = await _tutors.RemoveSubjectAsync(id, subjectId);
        if (!removed) return NotFound();

        return Ok(new ApiResponse<object>(true, "Subject removed.", null));
    }

    // ─── Classes ────────────────────────────────────────────────────────────

    // POST /api/tutors/{id}/classes
    [Authorize(Roles = "Tutor")]
    [HttpPost("{id:guid}/classes")]
    public async Task<IActionResult> AddClass(Guid id, [FromBody] AddTutorClassRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        try
        {
            var result = await _tutors.AddClassAsync(id, request);
            return Created("", new ApiResponse<TutorClassDto>(true, "Class added.", result));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // DELETE /api/tutors/{id}/classes/{classId}
    [Authorize(Roles = "Tutor")]
    [HttpDelete("{id:guid}/classes/{classId:guid}")]
    public async Task<IActionResult> RemoveClass(Guid id, Guid classId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        var removed = await _tutors.RemoveClassAsync(id, classId);
        if (!removed) return NotFound();

        return Ok(new ApiResponse<object>(true, "Class removed.", null));
    }

    // ─── Schedules ────────────────────────────────────────────────────────

    // GET /api/tutors/{id}/schedules
    [HttpGet("{id:guid}/schedules")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSchedules(Guid id)
    {
        var schedules = await _tutors.GetTutorSchedulesAsync(id);
        return Ok(new ApiResponse<List<TutorScheduleDto>>(true, null, schedules));
    }

    // POST /api/tutors/{id}/schedules
    [Authorize(Roles = "Tutor")]
    [HttpPost("{id:guid}/schedules")]
    public async Task<IActionResult> AddSchedule(Guid id, [FromBody] CreateScheduleRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(id);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        try
        {
            var schedule = await _tutors.AddScheduleAsync(id, request);
            return Created("", new ApiResponse<TutorScheduleDto>(true, "Schedule added.", schedule));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // DELETE /api/tutors/{tutorId}/schedules/{scheduleId}
    [Authorize(Roles = "Tutor")]
    [HttpDelete("{tutorId:guid}/schedules/{scheduleId:guid}")]
    public async Task<IActionResult> DeleteSchedule(Guid tutorId, Guid scheduleId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByIdAsync(tutorId);
        if (tutor is null) return NotFound();
        if (tutor.UserId != userId.Value) return Forbid();

        var deleted = await _tutors.DeleteScheduleAsync(scheduleId, tutorId);
        if (!deleted) return NotFound();

        return Ok(new ApiResponse<object>(true, "Schedule deleted.", null));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
