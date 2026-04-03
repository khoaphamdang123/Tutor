using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;

    public PaymentService(AppDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<PaymentDto> CreatePaymentAsync(Guid studentId, CreatePaymentRequest request)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingTutor).ThenInclude(t => t.OwnerUser)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId)
            ?? throw new InvalidOperationException("Booking not found.");

        if (booking.StudentId != studentId)
            throw new UnauthorizedAccessException("This booking does not belong to you.");

        if (booking.Status != "Pending")
            throw new InvalidOperationException("Booking is not in Pending status.");

        if (await _db.Payments.AnyAsync(p => p.BookingId == request.BookingId))
            throw new InvalidOperationException("Payment already exists for this booking.");

        var amount = booking.Price;
        var platformFee = Math.Round(amount * 0.15m, 2);
        var tutorPayout = amount - platformFee;

        var payment = new Payment
        {
            BookingId = request.BookingId,
            StudentId = studentId,
            TutorId = booking.TutorId,
            Amount = amount,
            PlatformFee = platformFee,
            TutorPayout = tutorPayout,
            Status = "Completed",
            PaymentMethod = request.PaymentMethod,
            TransactionId = $"TXN-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);

        booking.Status = "Confirmed";
        booking.MeetingLink = $"https://meet.giasuplus.com/{Guid.NewGuid():N}";
        booking.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            booking.BookingTutor.OwnerUser.Id,
            "Thanh toán thành công",
            $"Học sinh đã thanh toán {amount:N0}₫ cho lịch dạy {booking.BookingSubject.Name}.",
            "Payment",
            new { payment.Id });

        return MapToDto(payment);
    }

    public async Task<PaymentDto?> GetPaymentByBookingAsync(Guid bookingId)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
        return payment is null ? null : MapToDto(payment);
    }

    public async Task<PaymentDto?> GetPaymentByEnrollmentAsync(Guid enrollmentId)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.ClassEnrollmentId == enrollmentId);
        return payment is null ? null : MapToDto(payment);
    }

    public async Task<PaymentDto> CreateClassPaymentAsync(Guid studentId, CreateClassPaymentRequest request)
    {
        var enrollment = await _db.ClassEnrollments
            .Include(e => e.OpenClass)
            .ThenInclude(c => c.ClassTutor)
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId)
            ?? throw new InvalidOperationException("Enrollment not found.");

        if (enrollment.StudentId != studentId)
            throw new UnauthorizedAccessException("This enrollment does not belong to you.");

        if (enrollment.Status != "Approved")
            throw new InvalidOperationException("Enrollment must be approved before payment.");

        if (enrollment.PaymentStatus == "Paid")
            throw new InvalidOperationException("Enrollment is already paid.");

        if (await _db.Payments.AnyAsync(p => p.ClassEnrollmentId == request.EnrollmentId))
            throw new InvalidOperationException("Payment already exists for this enrollment.");

        var amount = enrollment.OpenClass.PricePerStudent;
        var platformFee = Math.Round(amount * 0.15m, 2);
        var tutorPayout = amount - platformFee;

        var payment = new Payment
        {
            ClassEnrollmentId = request.EnrollmentId,
            StudentId = studentId,
            TutorId = enrollment.OpenClass.TutorId,
            Amount = amount,
            PlatformFee = platformFee,
            TutorPayout = tutorPayout,
            Status = "Completed",
            PaymentMethod = request.PaymentMethod,
            TransactionId = $"TXN-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);

        enrollment.PaymentId = payment.Id;
        enrollment.PaymentStatus = "Paid";
        enrollment.AmountPaid = amount;

        enrollment.OpenClass.TotalRevenue += amount;

        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            enrollment.OpenClass.ClassTutor.OwnerUser.Id,
            "Thanh toán thành công",
            $"Học sinh đã thanh toán {amount:N0}₫ cho lớp \"{enrollment.OpenClass.Title}\".",
            "Payment",
            new { payment.Id });

        return MapToDto(payment);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid userId)
    {
        var payment = await _db.Payments.FindAsync(paymentId);
        if (payment is null) return null;

        // Allow access if user is the student, tutor, or an admin
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return null;
        if (user.Role != "Admin" && payment.StudentId != userId && payment.TutorId != userId)
            return null;

        return MapToDto(payment);
    }

    public async Task<List<PaymentDto>> GetTutorPayoutsAsync(Guid tutorId, int? month, int? year)
    {
        if (!await _db.Tutors.AnyAsync(t => t.Id == tutorId))
            throw new InvalidOperationException("Tutor not found.");

        var q = _db.Payments
            .Where(p => p.TutorId == tutorId && p.Status == "Completed");

        if (month.HasValue)
            q = q.Where(p => p.CreatedAt.Month == month.Value);
        if (year.HasValue)
            q = q.Where(p => p.CreatedAt.Year == year.Value);

        var payments = await q.OrderByDescending(p => p.CreatedAt).ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    public async Task<List<PaymentDto>> GetAllPaymentsAsync()
    {
        var payments = await _db.Payments
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    private static PaymentDto MapToDto(Payment p) => new(
        p.Id, p.BookingId, p.ClassEnrollmentId, p.StudentId, p.TutorId,
        p.Amount, p.PlatformFee, p.TutorPayout,
        p.Status, p.PaymentMethod, p.TransactionId, p.CreatedAt);
}
