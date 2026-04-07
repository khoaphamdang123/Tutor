using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api")]
public class RefundsController : ControllerBase
{
    private readonly IOpenClassService _svc;

    public RefundsController(IOpenClassService svc) => _svc = svc;

    // ─── STUDENT: Request refund ────────────────────────────────
    [Authorize(Roles = "Student")]
    [HttpPost("enrollments/{enrollmentId:guid}/refund")]
    public async Task<IActionResult> RequestRefund(Guid enrollmentId, [FromBody] CreateRefundRequest request)
    {
        try
        {
            var studentId = GetUserId();
            if (studentId is null) return Unauthorized();
            var dto = await _svc.CreateRefundRequestAsync(studentId.Value, enrollmentId, request);
            return Ok(new ApiResponse<RefundRequestDto>(true, "Refund request submitted.", dto));        
        }
        
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
    }

    // ─── ADMIN: Process refund requests ────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/refunds")]
    public async Task<IActionResult> GetPendingRefunds()
    {
        var refunds = await _svc.GetPendingRefundRequestsAsync();
        return Ok(new ApiResponse<List<RefundRequestDto>>(true, null, refunds));
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("admin/refunds/{requestId:guid}")]
    public async Task<IActionResult> ProcessRefund(Guid requestId, [FromBody] ProcessRefundRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var dto = await _svc.ProcessRefundAsync(requestId, adminId.Value, request);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Refund request not found.", null));
            return Ok(new ApiResponse<RefundRequestDto>(true, $"Refund {request.Status.ToLower()}.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
