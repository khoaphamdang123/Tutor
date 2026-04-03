using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class OpenClassService : IOpenClassService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;

    public OpenClassService(AppDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    // ════════════════════════════════════════════════════════════
    // OPEN CLASS — ADMIN
    // ════════════════════════════════════════════════════════════

    public async Task<OpenClassDto> CreateAsync(Guid adminId, CreateOpenClassRequest request)
    {
        var admin = await _db.Users.FindAsync(adminId)
            ?? throw new InvalidOperationException("Admin not found.");

        if (admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can create open classes.");

        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .FirstOrDefaultAsync(t => t.Id == request.TutorId)
            ?? throw new InvalidOperationException("Tutor not found.");

        var subject = await _db.Subjects.FindAsync(request.SubjectId)
            ?? throw new InvalidOperationException("Subject not found.");

        string? className = null;
        if (request.ClassId.HasValue)
        {
            var cls = await _db.Classes.FindAsync(request.ClassId.Value);
            if (cls is null)
                throw new InvalidOperationException("Class not found.");
            className = cls.Name;
        }

        if (request.StartDate > request.EndDate)
            throw new ArgumentException("Start date must be before end date.");

        if (request.MaxStudents < 1)
            throw new ArgumentException("Max students must be at least 1.");

        if (request.TotalSessions < 1)
            throw new ArgumentException("Total sessions must be at least 1.");

        var openClass = new OpenClass
        {
            AdminId = adminId,
            TutorId = request.TutorId,
            SubjectId = request.SubjectId,
            ClassId = request.ClassId,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            MaxStudents = request.MaxStudents,
            CurrentStudents = 0,
            PricePerStudent = request.PricePerStudent,
            TotalRevenue = 0,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ScheduleDesc = request.ScheduleDesc,
            TotalSessions = request.TotalSessions,
            Status = "Draft",
            IsPublished = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.OpenClasses.Add(openClass);
        await _db.SaveChangesAsync();

        return MapToDto(openClass, admin.FullName, tutor.OwnerUser.FullName, subject.Name, className);
    }

    public async Task<OpenClassDto?> GetByIdAsync(Guid classId, Guid userId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassAdmin)
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.ClassSubject)
            .Include(c => c.ClassLevel)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return null;

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return null;

        bool canView = user.Role == "Admin" ||
                       oc.TutorId == GetTutorIdByUserId(userId) ||
                       oc.Enrollments.Any(e => e.StudentId == userId && e.Status == "Approved");

        if (!canView) return null;

        return MapToDto(oc, oc.ClassAdmin.FullName, oc.ClassTutor.OwnerUser.FullName,
            oc.ClassSubject.Name, oc.ClassLevel?.Name);
    }

    public async Task<OpenClassSearchResult> SearchPublishedAsync(OpenClassSearchQuery query)
    {
        var q = _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.ClassSubject)
            .Include(c => c.ClassLevel)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublished && c.Status != "Cancelled")
            .Where(c => c.CurrentStudents < c.MaxStudents);

        if (query.SubjectId.HasValue)
            q = q.Where(c => c.SubjectId == query.SubjectId.Value);

        if (query.ClassId.HasValue)
            q = q.Where(c => c.ClassId == query.ClassId.Value);

        if (query.MaxPrice.HasValue)
            q = q.Where(c => c.PricePerStudent <= query.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(query.Status) && query.Status != "All")
            q = q.Where(c => c.Status == query.Status);

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(c => c.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new OpenClassSearchResult(
            items.Select(c => new OpenClassListDto(
                c.Id, c.Title, c.Description, c.CoverImageUrl,
                c.ClassTutor.OwnerUser.FullName,
                c.ClassSubject.Name,
                c.ClassLevel?.Name,
                c.MaxStudents, c.CurrentStudents,
                c.PricePerStudent,
                c.StartDate, c.EndDate,
                c.ScheduleDesc, c.TotalSessions,
                c.Status, c.IsPublished, c.CreatedAt
            )).ToList(),
            total, query.Page, query.PageSize
        );
    }

    public async Task<List<OpenClassDto>> GetAdminClassesAsync(Guid adminId)
    {
        var classes = await _db.OpenClasses
            .Include(c => c.ClassAdmin)
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.ClassSubject)
            .Include(c => c.ClassLevel)
            .Include(c => c.Enrollments)
            .Where(c => c.AdminId == adminId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return classes.Select(c => MapToDto(c, c.ClassAdmin.FullName,
            c.ClassTutor.OwnerUser.FullName, c.ClassSubject.Name, c.ClassLevel?.Name)).ToList();
    }

    public async Task<OpenClassDto?> UpdateAsync(Guid classId, Guid adminId, UpdateOpenClassRequest request)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassAdmin)
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.ClassSubject)
            .Include(c => c.ClassLevel)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return null;
        if (oc.AdminId != adminId) throw new UnauthorizedAccessException("Not authorized.");

        if (request.TutorId.HasValue)
        {
            var tutor = await _db.Tutors.Include(t => t.OwnerUser)
                .FirstOrDefaultAsync(t => t.Id == request.TutorId.Value);
            if (tutor is null) throw new InvalidOperationException("Tutor not found.");
            oc.TutorId = request.TutorId.Value;
        }

        if (request.SubjectId.HasValue)
        {
            var subject = await _db.Subjects.FindAsync(request.SubjectId.Value);
            if (subject is null) throw new InvalidOperationException("Subject not found.");
            oc.SubjectId = request.SubjectId.Value;
            oc.ClassSubject = subject;
        }

        if (request.ClassId.HasValue)
        {
            var cls = await _db.Classes.FindAsync(request.ClassId.Value);
            if (cls is null) throw new InvalidOperationException("Class not found.");
            oc.ClassId = request.ClassId.Value;
            oc.ClassLevel = cls;
        }

        if (request.Title is not null) oc.Title = request.Title;
        if (request.Description is not null) oc.Description = request.Description;
        if (request.CoverImageUrl is not null) oc.CoverImageUrl = request.CoverImageUrl;
        if (request.MaxStudents.HasValue) oc.MaxStudents = request.MaxStudents.Value;
        if (request.PricePerStudent.HasValue) oc.PricePerStudent = request.PricePerStudent.Value;
        if (request.StartDate.HasValue) oc.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue) oc.EndDate = request.EndDate.Value;
        if (request.ScheduleDesc is not null) oc.ScheduleDesc = request.ScheduleDesc;
        if (request.TotalSessions.HasValue) oc.TotalSessions = request.TotalSessions.Value;
        if (request.Status is not null) oc.Status = request.Status;

        oc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(oc, oc.ClassAdmin.FullName, oc.ClassTutor.OwnerUser.FullName,
            oc.ClassSubject.Name, oc.ClassLevel?.Name);
    }

    public async Task<bool> PublishAsync(Guid classId, Guid adminId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .FirstOrDefaultAsync(c => c.Id == classId);
        if (oc is null) return false;
        if (oc.AdminId != adminId) throw new UnauthorizedAccessException("Not authorized.");

        oc.IsPublished = true;
        
        oc.Status = "Active";
        
        oc.UpdatedAt = DateTime.UtcNow;
        
        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            oc.ClassTutor.OwnerUser.Id,
            "Lớp học mới được giao",
            $"Lớp \"{oc.Title}\" đã được phát hành và sẵn sàng nhận học sinh.",
            "OpenClass",
            new { oc.Id });

        return true;
    }

    public async Task<bool> UnpublishAsync(Guid classId, Guid adminId)
    {
        var oc = await _db.OpenClasses.FindAsync(classId);
        if (oc is null) return false;
        if (oc.AdminId != adminId) throw new UnauthorizedAccessException("Not authorized.");

        oc.IsPublished = false;
        oc.Status = "Draft";
        oc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelAsync(Guid classId, Guid adminId)
    {
        var oc = await _db.OpenClasses.FindAsync(classId);
        if (oc is null) return false;
        if (oc.AdminId != adminId) throw new UnauthorizedAccessException("Not authorized.");
        oc.IsPublished = false;
        oc.Status = "Cancelled";
        oc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var approvedEnrollments = await _db.ClassEnrollments
            .Where(e => e.OpenClassId == classId && e.Status == "Approved")
            .ToListAsync();

        foreach (var enrollment in approvedEnrollments)
        {
            await _notifications.CreateNotificationAsync(
                enrollment.StudentId,
                "Lớp học bị hủy",
                $"Lớp \"{oc.Title}\" đã bị hủy bởi quản trị viên.",
                "OpenClass",
                new { oc.Id });
        }

        return true;
    }

    public async Task<bool> CompleteAsync(Guid classId, Guid adminId)
    {
        var oc = await _db.OpenClasses.FindAsync(classId);
        if (oc is null) return false;
        if (oc.AdminId != adminId) throw new UnauthorizedAccessException("Not authorized.");

        oc.Status = "Completed";
        oc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var approvedEnrollments = await _db.ClassEnrollments
            .Where(e => e.OpenClassId == classId && e.Status == "Approved")
            .ToListAsync();

        foreach (var enrollment in approvedEnrollments)
        {
            await _notifications.CreateNotificationAsync(
                enrollment.StudentId,
                "Lớp học đã hoàn thành",
                $"Lớp \"{oc.Title}\" đã hoàn thành. Cảm ơn bạn đã tham gia!",
                "OpenClass",
                new { oc.Id });
        }

        return true;
    }

    // ════════════════════════════════════════════════════════════
    // ENROLLMENTS — STUDENT + TUTOR
    // ════════════════════════════════════════════════════════════

    public async Task<EnrollmentDto> EnrollAsync(Guid studentId, EnrollRequest request)
    {
        var user = await _db.Users.FindAsync(studentId)
            ?? throw new InvalidOperationException("User not found.");
        if (user.Role != "Student")
            throw new UnauthorizedAccessException("Only students can enroll.");

        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.ClassSubject)
            .FirstOrDefaultAsync(c => c.Id == request.OpenClassId)
            ?? throw new InvalidOperationException("Class not found.");

        if (!oc.IsPublished)
            throw new InvalidOperationException("Class is not open for enrollment.");

        if (oc.Status == "Cancelled" || oc.Status == "Completed")
            throw new InvalidOperationException("Class enrollment is closed.");

        if (oc.CurrentStudents >= oc.MaxStudents)
            throw new InvalidOperationException("Class is full.");

        var existing = await _db.ClassEnrollments
            .FirstOrDefaultAsync(e => e.OpenClassId == request.OpenClassId && e.StudentId == studentId);

        if (existing is not null)
        {
            if (existing.Status == "Approved" || existing.Status == "Pending")
                throw new InvalidOperationException("You have already enrolled in this class.");
            if (existing.Status == "Rejected")
                throw new InvalidOperationException("Your enrollment was rejected.");
        }

        var enrollment = new ClassEnrollment
        {
            OpenClassId = request.OpenClassId,
            StudentId = studentId,
            Status = "Pending",
            PaymentStatus = "Unpaid",
            EnrolledAt = DateTime.UtcNow
        };

        _db.ClassEnrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            oc.ClassTutor.OwnerUser.Id,
            "Đơn đăng ký mới",
            $"Học sinh {user.FullName} muốn tham gia lớp \"{oc.Title}\".",
            "Enrollment",
            new { enrollment.Id, classId = oc.Id });

        return MapToEnrollmentDto(enrollment, oc, user);
    }

    public async Task<List<EnrollmentDto>> GetEnrollmentsAsync(Guid classId, Guid userId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.Enrollments).ThenInclude(e => e.EnrolledStudent)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return new List<EnrollmentDto>();

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return new List<EnrollmentDto>();

        bool isTutor = oc.ClassTutor.OwnerUser.Id == userId;
        bool isAdmin = user.Role == "Admin";

        var q = oc.Enrollments.AsQueryable();

        if (!isTutor && !isAdmin)
        {
            q = q.Where(e => e.StudentId == userId);
        }

        var enrollments = await q.OrderByDescending(e => e.EnrolledAt).ToListAsync();
        return enrollments.Select(e => MapToEnrollmentDto(e, oc, e.EnrolledStudent)).ToList();
    }

    public async Task<List<EnrollmentDto>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var enrollments = await _db.ClassEnrollments
            .Include(e => e.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(e => e.OpenClass).ThenInclude(c => c.ClassSubject)
            .Include(e => e.EnrolledStudent)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        return enrollments.Select(e => MapToEnrollmentDto(e, e.OpenClass, e.EnrolledStudent)).ToList();
    }

    public async Task<EnrollmentDto?> ApproveEnrollmentAsync(Guid classId, Guid enrollmentId, Guid tutorId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.Enrollments).ThenInclude(e => e.EnrolledStudent)
            .Include(c => c.ClassSubject)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return null;
        if (oc.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can approve enrollments.");

        if (oc.CurrentStudents >= oc.MaxStudents)
            throw new InvalidOperationException("Class is full.");

        var enrollment = oc.Enrollments.FirstOrDefault(e => e.Id == enrollmentId);
        if (enrollment is null) return null;
        if (enrollment.Status != "Pending")
            throw new InvalidOperationException("Enrollment is not pending.");

        enrollment.Status = "Approved";
        enrollment.ApprovedAt = DateTime.UtcNow;
        enrollment.ApprovedBy = GetTutorIdByUserId(tutorId);

        oc.CurrentStudents += 1;
        oc.TotalRevenue += oc.PricePerStudent;

        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            enrollment.StudentId,
            "Đơn đăng ký được chấp nhận",
            $"Bạn đã được nhận vào lớp \"{oc.Title}\". Vui lòng thanh toán để tham gia.",
            "Enrollment",
            new { enrollment.Id, classId = oc.Id });

        return MapToEnrollmentDto(enrollment, oc, enrollment.EnrolledStudent);
    }

    public async Task<EnrollmentDto?> RejectEnrollmentAsync(Guid classId, Guid enrollmentId, Guid tutorId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.Enrollments).ThenInclude(e => e.EnrolledStudent)
            .Include(c => c.ClassSubject)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return null;
        if (oc.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can reject enrollments.");

        var enrollment = oc.Enrollments.FirstOrDefault(e => e.Id == enrollmentId);
        if (enrollment is null) return null;
        if (enrollment.Status != "Pending")
            throw new InvalidOperationException("Enrollment is not pending.");

        enrollment.Status = "Rejected";
        enrollment.ApprovedAt = DateTime.UtcNow;
        enrollment.ApprovedBy = GetTutorIdByUserId(tutorId);

        await _db.SaveChangesAsync();

        await _notifications.CreateNotificationAsync(
            enrollment.StudentId,
            "Đơn đăng ký bị từ chối",
            $"Đơn đăng ký lớp \"{oc.Title}\" đã bị từ chối.",
            "Enrollment",
            new { enrollment.Id, classId = oc.Id });

        return MapToEnrollmentDto(enrollment, oc, enrollment.EnrolledStudent);
    }

    // ════════════════════════════════════════════════════════════
    // SESSIONS — TUTOR
    // ════════════════════════════════════════════════════════════

    public async Task<ClassSessionDto> CreateSessionAsync(Guid classId, Guid tutorId, CreateSessionRequest request)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.Sessions)
            .FirstOrDefaultAsync(c => c.Id == classId)
            ?? throw new InvalidOperationException("Class not found.");

        if (oc.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can create sessions.");

        var sessionExists = oc.Sessions.Any(s => s.SessionNumber == request.SessionNumber);
        if (sessionExists)
            throw new InvalidOperationException($"Session {request.SessionNumber} already exists.");

        if (request.SessionNumber < 1 || request.SessionNumber > oc.TotalSessions)
            throw new ArgumentException($"Session number must be between 1 and {oc.TotalSessions}.");

        var session = new ClassSession
        {
            OpenClassId = classId,
            SessionNumber = request.SessionNumber,
            Title = request.Title ?? $"Buổi {request.SessionNumber}",
            SessionDate = request.SessionDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Notes = request.Notes,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.ClassSessions.Add(session);
        await _db.SaveChangesAsync();

        return MapToSessionDto(session, oc);
    }

    public async Task<ClassSessionDto?> UpdateSessionAsync(Guid sessionId, Guid tutorId, UpdateSessionRequest request)
    {
        var session = await _db.ClassSessions
            .Include(s => s.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(s => s.OpenClass).ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session is null) return null;
        if (session.OpenClass.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can update sessions.");

        if (request.Title is not null) session.Title = request.Title;
        if (request.SessionDate.HasValue) session.SessionDate = request.SessionDate.Value;
        if (request.StartTime.HasValue) session.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue) session.EndTime = request.EndTime.Value;
        if (request.MeetingLink is not null) session.MeetingLink = request.MeetingLink;
        if (request.Notes is not null) session.Notes = request.Notes;

        await _db.SaveChangesAsync();

        return MapToSessionDto(session, session.OpenClass);
    }

    public async Task<bool> DeleteSessionAsync(Guid sessionId, Guid tutorId)
    {
        var session = await _db.ClassSessions
            .Include(s => s.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session is null) return false;
        if (session.OpenClass.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can delete sessions.");

        if (session.IsCompleted)
            throw new InvalidOperationException("Cannot delete a completed session.");

        _db.ClassSessions.Remove(session);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ClassSessionDto?> GetSessionByIdAsync(Guid sessionId)
    {
        var session = await _db.ClassSessions
            .Include(s => s.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(s => s.OpenClass).ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        return session is null ? null : MapToSessionDto(session, session.OpenClass);
    }

    public async Task<List<ClassSessionDto>> GetSessionsByClassAsync(Guid classId, Guid userId)
    {
        var oc = await _db.OpenClasses
            .Include(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(c => c.Enrollments)
            .Include(c => c.Sessions)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (oc is null) return new List<ClassSessionDto>();

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return new List<ClassSessionDto>();

        bool canView = user.Role == "Admin" ||
                       oc.ClassTutor.OwnerUser.Id == userId ||
                       oc.Enrollments.Any(e => e.StudentId == userId && e.Status == "Approved");

        if (!canView) return new List<ClassSessionDto>();

        return oc.Sessions
            .OrderBy(s => s.SessionNumber)
            .Select(s => MapToSessionDto(s, oc))
            .ToList();
    }

    // ════════════════════════════════════════════════════════════
    // ATTENDANCE — TUTOR
    // ════════════════════════════════════════════════════════════

    public async Task<bool> MarkAttendanceAsync(Guid sessionId, Guid tutorId, List<MarkAttendanceRequest> marks)
    {
        var session = await _db.ClassSessions
            .Include(s => s.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(s => s.Attendances)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session is null) return false;
        if (session.OpenClass.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can mark attendance.");

        if (session.IsCompleted)
            throw new InvalidOperationException("Session is already completed.");

        var tutorEntity = await _db.Tutors.FirstOrDefaultAsync(t => t.OwnerUser.Id == tutorId);

        foreach (var mark in marks)
        {
            var validStatuses = new[] { "Present", "Absent", "Late", "Excused" };
            if (!validStatuses.Contains(mark.Status))
                throw new ArgumentException($"Invalid attendance status: {mark.Status}");

            var existing = session.Attendances.FirstOrDefault(a => a.EnrollmentId == mark.EnrollmentId);

            if (existing is not null)
            {
                existing.Status = mark.Status;
                existing.MarkedAt = DateTime.UtcNow;
                existing.MarkedBy = tutorEntity?.Id;
            }
            else
            {
                session.Attendances.Add(new SessionAttendance
                {
                    SessionId = sessionId,
                    EnrollmentId = mark.EnrollmentId,
                    Status = mark.Status,
                    MarkedAt = DateTime.UtcNow,
                    MarkedBy = tutorEntity?.Id
                });
            }
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<AttendanceDto?> GetAttendanceAsync(Guid sessionId, Guid enrollmentId)
    {
        var att = await _db.SessionAttendances
            .Include(a => a.Enrollment).ThenInclude(e => e.EnrolledStudent)
            .FirstOrDefaultAsync(a => a.SessionId == sessionId && a.EnrollmentId == enrollmentId);

        return att is null ? null : MapToAttendanceDto(att);
    }

    public async Task<List<AttendanceDto>> GetSessionAttendanceAsync(Guid sessionId, Guid tutorId)
    {
        var session = await _db.ClassSessions
            .Include(s => s.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(s => s.Attendances).ThenInclude(a => a.Enrollment).ThenInclude(e => e.EnrolledStudent)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session is null) return new List<AttendanceDto>();
        if (session.OpenClass.ClassTutor.OwnerUser.Id != tutorId)
            throw new UnauthorizedAccessException("Only the assigned tutor can view attendance.");

        return session.Attendances.Select(MapToAttendanceDto).ToList();
    }

    // ════════════════════════════════════════════════════════════
    // REFUNDS — STUDENT + ADMIN
    // ════════════════════════════════════════════════════════════

    public async Task<RefundRequestDto> CreateRefundRequestAsync(Guid studentId, Guid enrollmentId, CreateRefundRequest request)
    {
        var enrollment = await _db.ClassEnrollments
            .Include(e => e.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(e => e.EnrolledStudent)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId)
            ?? throw new InvalidOperationException("Enrollment not found.");

        if (enrollment.StudentId != studentId)
            throw new UnauthorizedAccessException("This enrollment does not belong to you.");

        if (enrollment.PaymentStatus != "Paid")
            throw new InvalidOperationException("Only paid enrollments can request a refund.");

        var existingRequest = await _db.RefundRequests
            .AnyAsync(r => r.EnrollmentId == enrollmentId && r.Status == "Pending");

        if (existingRequest)
            throw new InvalidOperationException("A refund request is already pending for this enrollment.");

        var refund = new RefundRequest
        {
            EnrollmentId = enrollmentId,
            StudentId = studentId,
            Amount = enrollment.AmountPaid ?? enrollment.OpenClass.PricePerStudent,
            Reason = request.Reason,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.RefundRequests.Add(refund);
        await _db.SaveChangesAsync();

        // Notify admins — in a real app you'd look up all Admin users
        var admins = await _db.Users.Where(u => u.Role == "Admin").ToListAsync();
        foreach (var admin in admins)
        {
            await _notifications.CreateNotificationAsync(
                admin.Id,
                "Yêu cầu hoàn tiền mới",
                $"Học sinh {enrollment.EnrolledStudent.FullName} yêu cầu hoàn {refund.Amount:N0}₫ cho lớp \"{enrollment.OpenClass.Title}\".",
                "Refund",
                new { refund.Id });
        }

        return MapToRefundDto(refund, enrollment);
    }

    public async Task<List<RefundRequestDto>> GetPendingRefundRequestsAsync()
    {
        var requests = await _db.RefundRequests
            .Include(r => r.Enrollment).ThenInclude(e => e.OpenClass)
            .Include(r => r.Enrollment).ThenInclude(e => e.EnrolledStudent)
            .Where(r => r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(r => MapToRefundDto(r, r.Enrollment)).ToList();
    }

    public async Task<RefundRequestDto?> ProcessRefundAsync(Guid requestId, Guid adminId, ProcessRefundRequest request)
    {
        var admin = await _db.Users.FindAsync(adminId);
        if (admin is null || admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can process refunds.");

        var refund = await _db.RefundRequests
            .Include(r => r.Enrollment).ThenInclude(e => e.OpenClass).ThenInclude(c => c.ClassTutor).ThenInclude(t => t.OwnerUser)
            .Include(r => r.Enrollment).ThenInclude(e => e.EnrolledStudent)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (refund is null) return null;
        if (refund.Status != "Pending")
            throw new InvalidOperationException("Refund request is not pending.");

        var validStatuses = new[] { "Approved", "Rejected" };
        if (!validStatuses.Contains(request.Status))
            throw new ArgumentException("Status must be 'Approved' or 'Rejected'.");

        refund.Status = request.Status;
        refund.ProcessedAt = DateTime.UtcNow;
        refund.ProcessedBy = adminId;
        refund.AdminNotes = request.AdminNotes;

        if (request.Status == "Approved")
        {
            var enrollment = refund.Enrollment;
            enrollment.PaymentStatus = "Refunded";
            enrollment.Status = "Withdrawn";
            enrollment.OpenClass.CurrentStudents -= 1;
            enrollment.OpenClass.TotalRevenue -= refund.Amount;

            await _notifications.CreateNotificationAsync(
                refund.StudentId,
                "Yêu cầu hoàn tiền được chấp nhận",
                $"Yêu cầu hoàn {refund.Amount:N0}₫ cho lớp \"{enrollment.OpenClass.Title}\" đã được chấp nhận.",
                "Refund",
                new { refund.Id });
        }
        else
        {
            await _notifications.CreateNotificationAsync(
                refund.StudentId,
                "Yêu cầu hoàn tiền bị từ chối",
                $"Yêu cầu hoàn tiền cho lớp \"{refund.Enrollment.OpenClass.Title}\" đã bị từ chối.",
                "Refund",
                new { refund.Id });
        }

        await _db.SaveChangesAsync();

        return MapToRefundDto(refund, refund.Enrollment);
    }

    // ════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════

    private Guid? GetTutorIdByUserId(Guid userId)
    {
        return _db.Tutors.FirstOrDefault(t => t.UserId == userId)?.Id;
    }

    private static OpenClassDto MapToDto(OpenClass oc, string adminName, string tutorName,
        string subjectName, string? className) => new(
        oc.Id, oc.AdminId, adminName,
        oc.TutorId, tutorName,
        oc.SubjectId, subjectName,
        oc.ClassId, className,
        oc.Title, oc.Description, oc.CoverImageUrl,
        oc.MaxStudents, oc.CurrentStudents,
        oc.PricePerStudent, oc.TotalRevenue,
        oc.StartDate, oc.EndDate,
        oc.ScheduleDesc, oc.TotalSessions,
        oc.Status, oc.IsPublished,
        oc.Enrollments.Count(e => e.Status == "Pending"),
        oc.Enrollments.Count(e => e.Status == "Approved"),
        oc.CreatedAt
    );

    private static EnrollmentDto MapToEnrollmentDto(ClassEnrollment e, OpenClass oc, User student) => new(
        e.Id, e.OpenClassId, oc.Title,
        e.StudentId, student.FullName, student.AvatarUrl,
        e.Status, e.PaymentStatus, e.PaymentId,
        e.AmountPaid, e.EnrolledAt,
        e.ApprovedAt, e.ApprovedBy
    );

    private static ClassSessionDto MapToSessionDto(ClassSession s, OpenClass oc) => new(
        s.Id, s.OpenClassId, oc.Title,
        s.SessionNumber, s.Title,
        s.SessionDate, s.StartTime, s.EndTime,
        s.MeetingLink, s.Notes, s.IsCompleted,
        oc.Enrollments.Count(en => en.Status == "Approved"),
        s.Attendances.Count(a => a.Status == "Present"),
        s.CreatedAt
    );

    private static AttendanceDto MapToAttendanceDto(SessionAttendance a) => new(
        a.Id, a.SessionId, a.EnrollmentId,
        a.Enrollment.EnrolledStudent.FullName,
        a.Enrollment.EnrolledStudent.AvatarUrl,
        a.Status, a.MarkedAt
    );

    private static RefundRequestDto MapToRefundDto(RefundRequest r, ClassEnrollment e) => new(
        r.Id, r.EnrollmentId, e.OpenClass.Title,
        r.StudentId, e.EnrolledStudent.FullName,
        r.Amount, r.Reason, r.Status,
        r.AdminNotes, r.ProcessedAt, r.CreatedAt
    );
}
