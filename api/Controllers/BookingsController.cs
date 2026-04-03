using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookings;
    private readonly ITutorService _tutors;

    public BookingsController(IBookingService bookings, ITutorService tutors)
    {
        _bookings = bookings;
        _tutors = tutors;
    }

    // POST /api/bookings
    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var booking = await _bookings.CreateBookingAsync(userId.Value, request);
            return Created($"/api/bookings/{booking.Id}", new ApiResponse<BookingDto>(true, "Booking created.", booking));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // GET /api/bookings/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var booking = await _bookings.GetBookingByIdAsync(id, userId.Value);
        if (booking is null) return NotFound();

        return Ok(new ApiResponse<BookingDto>(true, null, booking));
    }

    // GET /api/bookings/my?status=...
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings([FromQuery] string? status)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var user = await _bookings.GetBookingByIdAsync(userId.Value, userId.Value);

        if (role == "Student")
        {
            var bookings = await _bookings.GetStudentBookingsAsync(userId.Value, status);
            return Ok(new ApiResponse<List<BookingDto>>(true, null, bookings));
        }
        else if (role == "Tutor")
        {
            var tutor = await _tutors.GetTutorByUserIdAsync(userId.Value);
            if (tutor is null) return NotFound();
            var bookings = await _bookings.GetTutorBookingsAsync(tutor.Id, status);
            return Ok(new ApiResponse<List<BookingDto>>(true, null, bookings));
        }
        else
        {
            return Forbid();
        }
    }

    // GET /api/bookings/admin/all — Admin views all bookings
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllBookings()
    {
        var allBookings = await _bookings.GetAllBookingsAsync();
        return Ok(new ApiResponse<List<BookingDto>>(true, null, allBookings));
    }

    // PATCH /api/bookings/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateBookingStatusRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var booking = await _bookings.UpdateBookingStatusAsync(id, request.Status, userId.Value);
            if (booking is null) return NotFound();
            return Ok(new ApiResponse<BookingDto>(true, "Booking updated.", booking));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
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
