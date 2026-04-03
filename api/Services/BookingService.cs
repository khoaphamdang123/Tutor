using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;

    public BookingService(AppDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<BookingDto> CreateBookingAsync(Guid studentId, CreateBookingRequest request)
    {
        var student = await _db.Users.FindAsync(studentId)
            ?? throw new InvalidOperationException("Student not found.");

        if (student.Role != "Student")
            throw new InvalidOperationException("Only students can create bookings.");

        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects)
            .Include(t => t.TutorClasses)
            .FirstOrDefaultAsync(t => t.Id == request.TutorId)
            ?? throw new InvalidOperationException("Tutor not found.");

        if (!tutor.IsAvailable)
            throw new InvalidOperationException("Tutor is not available.");

        var subject = await _db.Subjects.FindAsync(request.SubjectId)
            ?? throw new InvalidOperationException("Subject not found.");

        if (!tutor.TutorSubjects.Any(ts => ts.SubjectId == request.SubjectId))
            throw new InvalidOperationException("Tutor does not teach this subject.");

        string? className = null;
        if (request.ClassId.HasValue)
        {
            var cls = await _db.Classes.FindAsync(request.ClassId.Value);
            if (cls is null)
                throw new InvalidOperationException("Class not found.");
            if (!tutor.TutorClasses.Any(tc => tc.ClassId == request.ClassId.Value))
                throw new InvalidOperationException("Tutor does not teach this class.");
            className = cls.Name;
        }

        var overlap = await _db.Bookings.AnyAsync(b =>
            b.TutorId == request.TutorId &&
            b.SubjectId == request.SubjectId &&
            b.Status != "Cancelled" &&
            b.StartTime < request.EndTime &&
            b.EndTime > request.StartTime);

        if (overlap)
            throw new InvalidOperationException("Tutor has a conflicting booking at this time.");

        var hours = (decimal)(request.EndTime - request.StartTime).TotalHours;
        if (hours <= 0)
            throw new ArgumentException("End time must be after start time.");

        var tutorSubject = tutor.TutorSubjects.First(ts => ts.SubjectId == request.SubjectId);
        var rate = tutorSubject.PriceOverride ?? tutor.HourlyRate;

        var booking = new Booking
        {
            StudentId = studentId,
            TutorId = request.TutorId,
            SubjectId = request.SubjectId,
            ClassId = request.ClassId,
            StartTime = request.StartTime.ToUniversalTime(),
            EndTime = request.EndTime.ToUniversalTime(),
            Status = "Pending",
            Price = rate * hours,
            Notes = request.Notes,
            MeetingLink = null,
            CreatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            tutor.OwnerUser.Id,
            "Yêu cầu đặt lịch mới",
            $"{student.FullName} muốn đặt lịch dạy {subject.Name} vào {request.StartTime:g}.",
            "Booking",
            new { booking.Id });

        return MapToDto(booking, student, tutor.OwnerUser, subject.Name, className);
    }

    public async Task<BookingDto?> GetBookingByIdAsync(Guid bookingId, Guid userId)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Include(b => b.BookingSubject)
            .Include(b => b.BookingClass)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking is null) return null;

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return null;

        if (user.Role != "Admin" &&
            booking.StudentId != userId &&
            booking.BookingTutor.OwnerUser.Id != userId)
            return null;

        return MapToDto(booking, booking.BookingStudent, booking.BookingTutor.OwnerUser,
            booking.BookingSubject.Name, booking.BookingClass?.Name);
    }

    public async Task<List<BookingDto>> GetStudentBookingsAsync(Guid studentId, string? status)
    {
        var q = _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Include(b => b.BookingSubject)
            .Include(b => b.BookingClass)
            .Where(b => b.StudentId == studentId);

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(b => b.Status == status);

        var bookings = await q.OrderByDescending(b => b.StartTime).ToListAsync();

        var results = new List<BookingDto>();
        foreach (var b in bookings)
        {
            results.Add(MapToDto(b, b.BookingStudent, b.BookingTutor.OwnerUser,
                b.BookingSubject.Name, b.BookingClass?.Name));
        }
        return results;
    }

    public async Task<List<BookingDto>> GetTutorBookingsAsync(Guid tutorId, string? status)
    {
        var q = _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Include(b => b.BookingSubject)
            .Include(b => b.BookingClass)
            .Where(b => b.TutorId == tutorId);

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(b => b.Status == status);

        var bookings = await q.OrderByDescending(b => b.StartTime).ToListAsync();

        var results = new List<BookingDto>();
        foreach (var b in bookings)
        {
            results.Add(MapToDto(b, b.BookingStudent, b.BookingTutor.OwnerUser,
                b.BookingSubject.Name, b.BookingClass?.Name));
        }
        return results;
    }

    public async Task<List<BookingDto>> GetAllBookingsAsync()
    {
        var bookings = await _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Include(b => b.BookingSubject)
            .Include(b => b.BookingClass)
            .OrderByDescending(b => b.StartTime)
            .ToListAsync();

        var results = new List<BookingDto>();
        foreach (var b in bookings)
        {
            results.Add(MapToDto(b, b.BookingStudent, b.BookingTutor.OwnerUser,
                b.BookingSubject.Name, b.BookingClass?.Name));
        }
        return results;
    }

    public async Task<BookingDto?> UpdateBookingStatusAsync(Guid bookingId, string status, Guid userId)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingStudent)
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .Include(b => b.BookingSubject)
            .Include(b => b.BookingClass)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking is null) return null;

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return null;

        var validStatuses = new[] { "Pending", "Confirmed", "Completed", "Cancelled" };
        if (!validStatuses.Contains(status))
            throw new ArgumentException("Invalid status.");

        var isStudent = booking.StudentId == userId;
        var isTutor = booking.BookingTutor.OwnerUser.Id == userId;
        var isAdmin = user.Role == "Admin";

        if (!isStudent && !isTutor && !isAdmin)
            throw new UnauthorizedAccessException("Not authorized.");

        if (status != "Cancelled" && !isTutor && !isAdmin)
            throw new UnauthorizedAccessException("Only the tutor can confirm or complete a booking.");

        booking.Status = status;
        booking.UpdatedAt = DateTime.UtcNow;

        if (status == "Confirmed")
            booking.MeetingLink = $"https://meet.giasuplus.com/{Guid.NewGuid():N}";

        await _db.SaveChangesAsync();

        var notifyUserId = isStudent ? booking.BookingTutor.OwnerUser.Id : booking.StudentId;
        var statusText = status switch {
            "Confirmed" => "đã được xác nhận",
            "Completed" => "đã hoàn thành",
            "Cancelled" => "đã bị hủy",
            _ => $"có trạng thái: {status}"
        };
        await _notifications.CreateNotificationAsync(
            notifyUserId,
            "Cập nhật đặt lịch",
            $"Lịch dạy {booking.BookingSubject.Name} {statusText}.",
            "Booking",
            new { booking.Id });

        return MapToDto(booking, booking.BookingStudent, booking.BookingTutor.OwnerUser,
            booking.BookingSubject.Name, booking.BookingClass?.Name);
    }

    private static BookingDto MapToDto(Booking b, User student, User tutor,
        string subjectName, string? className) => new(
        b.Id, b.StudentId, student.FullName,
        b.TutorId, tutor.FullName,
        b.SubjectId, subjectName,
        b.ClassId, className,
        b.StartTime, b.EndTime,
        b.Status, b.Price, b.Notes, b.MeetingLink, b.CreatedAt);
}
