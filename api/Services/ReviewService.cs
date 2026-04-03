using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db) => _db = db;

    public async Task<ReviewDto> CreateReviewAsync(Guid studentId, CreateReviewRequest request)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId)
            ?? throw new InvalidOperationException("Booking not found.");

        if (booking.StudentId != studentId)
            throw new UnauthorizedAccessException("This booking does not belong to you.");

        if (booking.Status != "Completed")
            throw new InvalidOperationException("Only completed bookings can be reviewed.");

        if (await _db.Reviews.AnyAsync(r => r.BookingId == request.BookingId))
            throw new InvalidOperationException("Booking has already been reviewed.");

        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var review = new Review
        {
            BookingId = request.BookingId,
            StudentId = studentId,
            TutorId = booking.TutorId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        var avg = await _db.Reviews
            .Where(r => r.TutorId == booking.TutorId)
            .AverageAsync(r => (decimal)r.Rating);

        var tutor = booking.BookingTutor;
        tutor.Rating = Math.Round(avg, 2);
        tutor.ReviewCount = await _db.Reviews.CountAsync(r => r.TutorId == booking.TutorId);

        await _db.SaveChangesAsync();

        return new ReviewDto(
            review.Id, review.BookingId, review.StudentId,
            booking.BookingStudent.FullName, booking.BookingStudent.AvatarUrl,
            review.TutorId, review.Rating, review.Comment, review.CreatedAt);
    }

    public async Task<ReviewDto?> GetReviewByBookingAsync(Guid bookingId)
    {
        var review = await _db.Reviews
            .Include(r => r.ReviewBooking).ThenInclude(b => b.BookingStudent)
            .Include(r => r.ReviewBooking).ThenInclude(b => b.BookingTutor)
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);

        if (review is null) return null;

        return new ReviewDto(
            review.Id, review.BookingId, review.StudentId,
            review.ReviewBooking.BookingStudent.FullName,
            review.ReviewBooking.BookingStudent.AvatarUrl,
            review.TutorId, review.Rating, review.Comment, review.CreatedAt);
    }

    public async Task<List<ReviewDto>> GetTutorReviewsAsync(Guid tutorId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.ReviewBooking).ThenInclude(b => b.BookingStudent)
            .Where(r => r.TutorId == tutorId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto(
            r.Id, r.BookingId, r.StudentId,
            r.ReviewBooking.BookingStudent.FullName,
            r.ReviewBooking.BookingStudent.AvatarUrl,
            r.TutorId, r.Rating, r.Comment, r.CreatedAt)).ToList();
    }

    public async Task<List<ReviewDto>> GetStudentReviewsAsync(Guid studentId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.ReviewBooking).ThenInclude(b => b.BookingStudent)
            .Include(r => r.ReviewBooking).ThenInclude(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto(
            r.Id, r.BookingId, r.StudentId,
            r.ReviewBooking.BookingStudent.FullName,
            r.ReviewBooking.BookingStudent.AvatarUrl,
            r.TutorId, r.Rating, r.Comment, r.CreatedAt)).ToList();
    }
}
