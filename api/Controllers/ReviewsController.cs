using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    // POST /api/reviews
    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var review = await _reviews.CreateReviewAsync(userId.Value, request);
            return Created($"/api/reviews/{review.Id}", new ApiResponse<ReviewDto>(true, "Review submitted.", review));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET /api/reviews/booking/{bookingId}
    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId)
    {
        var review = await _reviews.GetReviewByBookingAsync(bookingId);
        return Ok(new ApiResponse<ReviewDto?>(true, null, review));
    }

    // GET /api/reviews/tutor/{tutorId}
    [HttpGet("tutor/{tutorId:guid}")]
    public async Task<IActionResult> GetByTutor(Guid tutorId)
    {
        var reviews = await _reviews.GetTutorReviewsAsync(tutorId);
        return Ok(new ApiResponse<List<ReviewDto>>(true, null, reviews));
    }

    // GET /api/reviews/my
    [Authorize(Roles = "Student")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var reviews = await _reviews.GetStudentReviewsAsync(userId.Value);
        return Ok(new ApiResponse<List<ReviewDto>>(true, null, reviews));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
