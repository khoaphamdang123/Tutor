using TutorApp.Api.DTOs;

namespace TutorApp.Api.Services.Interfaces;

public interface IOpenClassService
{
    // ─── OpenClass (Admin) ──────────────────────────────────────
    Task<OpenClassDto> CreateAsync(Guid adminId, CreateOpenClassRequest request);
    Task<OpenClassDto?> GetByIdAsync(Guid classId, Guid userId);
    Task<OpenClassSearchResult> SearchPublishedAsync(OpenClassSearchQuery query);
    Task<List<OpenClassDto>> GetAdminClassesAsync(Guid adminId);
    Task<OpenClassDto?> UpdateAsync(Guid classId, Guid adminId, UpdateOpenClassRequest request);
    Task<bool> PublishAsync(Guid classId, Guid adminId);
    Task<bool> UnpublishAsync(Guid classId, Guid adminId);
    Task<bool> CancelAsync(Guid classId, Guid adminId);
    Task<bool> CompleteAsync(Guid classId, Guid adminId);

    // ─── Sessions (Tutor) ───────────────────────────────────────
    Task<ClassSessionDto> CreateSessionAsync(Guid classId, Guid tutorId, CreateSessionRequest request);
    Task<ClassSessionDto?> UpdateSessionAsync(Guid sessionId, Guid tutorId, UpdateSessionRequest request);
    Task<bool> DeleteSessionAsync(Guid sessionId, Guid tutorId);
    Task<ClassSessionDto?> GetSessionByIdAsync(Guid sessionId);
    Task<List<ClassSessionDto>> GetSessionsByClassAsync(Guid classId, Guid userId);

    // ─── Attendance (Tutor) ─────────────────────────────────────
    Task<bool> MarkAttendanceAsync(Guid sessionId, Guid tutorId, List<MarkAttendanceRequest> marks);
    Task<AttendanceDto?> GetAttendanceAsync(Guid sessionId, Guid enrollmentId);
    Task<List<AttendanceDto>> GetSessionAttendanceAsync(Guid sessionId, Guid tutorId);

    // ─── Enrollments (Tutor + Student) ────────────────────────
    Task<EnrollmentDto> EnrollAsync(Guid studentId, EnrollRequest request);
    Task<List<EnrollmentDto>> GetEnrollmentsAsync(Guid classId, Guid userId);
    Task<List<EnrollmentDto>> GetStudentEnrollmentsAsync(Guid studentId);
    Task<EnrollmentDto?> ApproveEnrollmentAsync(Guid classId, Guid enrollmentId, Guid tutorId);
    Task<EnrollmentDto?> RejectEnrollmentAsync(Guid classId, Guid enrollmentId, Guid tutorId);

    // ─── Refunds (Student + Admin) ──────────────────────────────
    Task<RefundRequestDto> CreateRefundRequestAsync(Guid studentId, Guid enrollmentId, CreateRefundRequest request);
    Task<List<RefundRequestDto>> GetPendingRefundRequestsAsync();
    Task<RefundRequestDto?> ProcessRefundAsync(Guid requestId, Guid adminId, ProcessRefundRequest request);
}
