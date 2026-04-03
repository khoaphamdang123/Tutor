using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly ITutorService _tutors;

    public PaymentsController(IPaymentService payments, ITutorService tutors)
    {
        _payments = payments;
        _tutors = tutors;
    }

    // POST /api/payments
    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest request)
    {
        var userId = GetUserId();

        if (userId is null) return Unauthorized();

        try
        {
            var payment = await _payments.CreatePaymentAsync(userId.Value, request);
            return Created($"/api/payments/{payment.Id}", new ApiResponse<PaymentDto>(true, "Payment successful.", payment));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET /api/payments/booking/{bookingId}
    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var payment = await _payments.GetPaymentByBookingAsync(bookingId);
        if (payment is null) return NotFound();

        return Ok(new ApiResponse<PaymentDto?>(true, null, payment));
    }

    // GET /api/payments/enrollment/{enrollmentId}
    [HttpGet("enrollment/{enrollmentId:guid}")]
    public async Task<IActionResult> GetByEnrollment(Guid enrollmentId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var payment = await _payments.GetPaymentByEnrollmentAsync(enrollmentId);
        if (payment is null) return NotFound();

        return Ok(new ApiResponse<PaymentDto?>(true, null, payment));
    }

    // POST /api/payments/class
    [Authorize(Roles = "Student")]
    [HttpPost("class")]
    public async Task<IActionResult> CreateClassPayment([FromBody] CreateClassPaymentRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var payment = await _payments.CreateClassPaymentAsync(userId.Value, request);
            return Created($"/api/payments/{payment.Id}", new ApiResponse<PaymentDto>(true, "Payment successful.", payment));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET /api/payments/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var payment = await _payments.GetPaymentByIdAsync(id, userId.Value);
        if (payment is null) return NotFound();

        return Ok(new ApiResponse<PaymentDto>(true, null, payment));
    }

    // GET /api/payments/payouts?month=...&year=...
    [Authorize(Roles = "Tutor")]
    [HttpGet("payouts")]
    public async Task<IActionResult> GetPayouts([FromQuery] int? month, [FromQuery] int? year)
    {
        var userId = GetUserId();

        if (userId is null) return Unauthorized();

        var tutor = await _tutors.GetTutorByUserIdAsync(userId.Value);

        if (tutor is null) return NotFound();

        var payouts = await _payments.GetTutorPayoutsAsync(tutor.Id, month, year);

        return Ok(new ApiResponse<List<PaymentDto>>(true, null, payouts));
    }

    // GET /api/payments/admin/all — Admin views all payments
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllPayments()
    {
        var payments = await _payments.GetAllPaymentsAsync();
        return Ok(new ApiResponse<List<PaymentDto>>(true, null, payments));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
