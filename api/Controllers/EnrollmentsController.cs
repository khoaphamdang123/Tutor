using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

// Shared enrollment endpoints used by both Students and Tutors
[ApiController]
[Route("api")]
public class EnrollmentsController : ControllerBase
{
    private readonly IOpenClassService _svc;

    public EnrollmentsController(IOpenClassService svc) => _svc = svc;

    // ─── STUDENT: Browse + enroll ───────────────────────────────
    [Authorize(Roles = "Student")]
    [HttpPost("classes/{classId:guid}/enroll")]
    public async Task<IActionResult> Enroll(Guid classId, [FromBody] EnrollRequest request)
    {
        try
        {
            var studentId = GetUserId();
            if (studentId is null) return Unauthorized();
            var dto = await _svc.EnrollAsync(studentId.Value, request with { OpenClassId = classId });
            return Ok(new ApiResponse<EnrollmentDto>(true, "Enrollment application submitted.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [Authorize(Roles = "Student")]
    [HttpGet("student/enrollments")]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var studentId = GetUserId();
        if (studentId is null) return Unauthorized();
        var enrollments = await _svc.GetStudentEnrollmentsAsync(studentId.Value);
        return Ok(new ApiResponse<List<EnrollmentDto>>(true, null, enrollments));
    }

    // ─── TUTOR: View + approve/reject enrollments for a class ───
    [Authorize(Roles = "Tutor")]
    [HttpGet("tutor/classes/{classId:guid}/enrollments")]
    public async Task<IActionResult> GetClassEnrollments(Guid classId)
    {
        var tutorId = GetUserId();
        if (tutorId is null) return Unauthorized();
        var enrollments = await _svc.GetEnrollmentsAsync(classId, tutorId.Value);
        return Ok(new ApiResponse<List<EnrollmentDto>>(true, null, enrollments));
    }

    [Authorize(Roles = "Tutor")]
    [HttpPatch("tutor/classes/{classId:guid}/enrollments/{enrollmentId:guid}/approve")]
    public async Task<IActionResult> ApproveEnrollment(Guid classId, Guid enrollmentId)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var dto = await _svc.ApproveEnrollmentAsync(classId, enrollmentId, tutorId.Value);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Enrollment not found.", null));
            return Ok(new ApiResponse<EnrollmentDto>(true, "Enrollment approved.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
    }

    [Authorize(Roles = "Tutor")]
    [HttpPatch("tutor/classes/{classId:guid}/enrollments/{enrollmentId:guid}/reject")]
    public async Task<IActionResult> RejectEnrollment(Guid classId, Guid enrollmentId)
    {
        try
        {
            var tutorId = GetUserId();
            if (tutorId is null) return Unauthorized();
            var dto = await _svc.RejectEnrollmentAsync(classId, enrollmentId, tutorId.Value);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Enrollment not found.", null));
            return Ok(new ApiResponse<EnrollmentDto>(true, "Enrollment rejected.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
    }

    // ─── ADMIN: View all enrollments for a class ───────────────
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/classes/{classId:guid}/enrollments")]
    public async Task<IActionResult> GetClassEnrollmentsAdmin(Guid classId)
    {
        var adminId = GetUserId();
        if (adminId is null) return Unauthorized();
        var enrollments = await _svc.GetEnrollmentsAsync(classId, adminId.Value);
        return Ok(new ApiResponse<List<EnrollmentDto>>(true, null, enrollments));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
