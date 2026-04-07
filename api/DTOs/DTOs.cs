using System.ComponentModel.DataAnnotations;

namespace TutorApp.Api.DTOs;

// ============ Auth ============

public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    [Required] string FullName,
    [Required] string Role,
    string? Phone
);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record ForgotPasswordRequest(
    [Required][EmailAddress] string Email
);

public record ResetPasswordRequest(
    [Required][EmailAddress] string Email,
    [Required] string Token,
    [Required][MinLength(6)] string NewPassword
);

public record ResendVerificationRequest(
    [Required][EmailAddress] string Email
);

public record RefreshTokenRequest(
    [Required] string RefreshToken
);

public record AuthResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    string Role,
    bool IsEmailVerified,
    DateTime CreatedAt
);

public record RegisterResponse(
    bool EmailVerificationRequired,
    string? Message,
    string? Email
);

public record UpdateProfileRequest(
    string? FullName,
    string? Phone,
    string? AvatarUrl
);

// ============ Subject & Class ============

public record SubjectDto(
    Guid Id,
    string Name,
    string? Description,
    string? IconUrl,
    bool IsActive
);

public record ClassDto(
    Guid Id,
    string Name,
    int Level,
    string? Description,
    bool IsActive
);

// ============ Tutor Subject / Class ============

public record TutorSubjectDto(
    Guid TutorId,
    Guid SubjectId,
    string SubjectName,
    decimal? PriceOverride,
    decimal BaseHourlyRate
);

public record TutorClassDto(
    Guid TutorId,
    Guid ClassId,
    string ClassName,
    int Level
);

public record AddTutorSubjectRequest(
    Guid SubjectId,
    decimal? PriceOverride
);

public record AddTutorClassRequest(
    Guid ClassId
);

// ============ Tutor ============

public record CreateTutorProfileRequest(
    string? Bio,
    decimal HourlyRate,
    string? Education,
    int? YearsOfExperience,
    Guid[] SubjectIds,
    Guid[] ClassIds
);

public record UpdateTutorProfileRequest(
    string? Bio,
    decimal? HourlyRate,
    string? Education,
    int? YearsOfExperience,
    Guid[]? SubjectIds,
    Guid[]? ClassIds,
    bool? IsVerified,
    bool? IsAvailable
);

public record TutorDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string? Email,
    string? Phone,
    string? AvatarUrl,
    List<TutorSubjectDto> Subjects,
    List<TutorClassDto> Classes,
    string? Bio,
    decimal HourlyRate,
    decimal Rating,
    int ReviewCount,
    bool IsVerified,
    bool IsAvailable,
    string? Education,
    int? YearsOfExperience
);

public record AdminTutorDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string? Email,
    string? Phone,
    string? AvatarUrl,
    List<TutorSubjectDto> Subjects,
    List<TutorClassDto> Classes,
    string? Bio,
    decimal HourlyRate,
    decimal Rating,
    int ReviewCount,
    bool IsVerified,
    bool IsAvailable,
    string? Education,
    int? YearsOfExperience,
    bool IsActive,
    DateTime CreatedAt
);

public record TutorSearchQuery(
    Guid? SubjectId,
    Guid? ClassId,
    decimal? MinRate,
    decimal? MaxRate,
    decimal? MinRating,
    bool? VerifiedOnly,
    int Page = 1,
    int PageSize = 10
);

public record TutorSearchResult(
    List<TutorDto> tutors,
    int totalCount,
    int page,
    int pageSize
);

public record AdminTutorSearchResult(
    List<AdminTutorDto> tutors,
    int totalCount,
    int page,
    int pageSize
);

public record CreateTutorRequest(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    string? Bio,
    decimal HourlyRate,
    string? Education,
    int? YearsOfExperience,
    Guid[]? SubjectIds,
    Guid[]? ClassIds
);

public record TutorStatsDto(
    int TotalTutors,
    int VerifiedTutors,
    int UnverifiedTutors,
    int AvailableTutors,
    int UnavailableTutors
);

// ============ Booking ============

public record CreateBookingRequest(
    Guid TutorId,
    Guid SubjectId,
    Guid? ClassId,
    DateTime StartTime,
    DateTime EndTime,
    string? Notes
);

public record BookingDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid TutorId,
    string TutorName,
    Guid SubjectId,
    string SubjectName,
    Guid? ClassId,
    string? ClassName,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    decimal Price,
    string? Notes,
    string? MeetingLink,
    DateTime CreatedAt
);

public record UpdateBookingStatusRequest(
    string Status
);

// ============ Payment ============

public record CreatePaymentRequest(
    Guid BookingId,
    string PaymentMethod
);

public record PaymentDto(
    Guid Id,
    Guid? BookingId,
    Guid? ClassEnrollmentId,
    Guid StudentId,
    Guid TutorId,
    decimal Amount,
    decimal PlatformFee,
    decimal TutorPayout,
    string Status,
    string PaymentMethod,
    string? TransactionId,
    DateTime CreatedAt
);

public record CreateClassPaymentRequest(
    Guid EnrollmentId,
    string PaymentMethod
);

// ============ Review ============

public record CreateReviewRequest(
    Guid BookingId,
    int Rating,
    string? Comment
);

public record ReviewDto(
    Guid Id,
    Guid BookingId,
    Guid StudentId,
    string StudentName,
    string? StudentAvatar,
    Guid TutorId,
    int Rating,
    string? Comment,
    DateTime CreatedAt
);

// ============ Message ============

public record SendMessageRequest(
    Guid ReceiverId,
    string Content
);

public record MessageDto(
    Guid Id,
    Guid SenderId,
    string SenderName,
    Guid ReceiverId,
    string ReceiverName,
    string Content,
    bool IsRead,
    DateTime CreatedAt
);

public record ConversationDto(
    Guid UserId,
    string UserName,
    string? AvatarUrl,
    MessageDto LastMessage,
    int UnreadCount
);

// ============ Notification ============

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    string Type,
    bool IsRead,
    string? Data,
    DateTime CreatedAt
);

// ============ Tutor Schedule ============

public record CreateScheduleRequest(
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime
);

public record TutorScheduleDto(
    Guid Id,
    Guid TutorId,
    int DayOfWeek,
    string DayName,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable
);

// ============ OpenClass ============

public record CreateOpenClassRequest(
    Guid TutorId,
    Guid SubjectId,
    Guid? ClassId,
    [Required][MinLength(3)][MaxLength(255)] string Title,
    string? Description,
    string? CoverImageUrl,
    int MaxStudents,
    decimal PricePerStudent,
    DateOnly StartDate,
    DateOnly EndDate,
    string? ScheduleDesc,
    int TotalSessions
);

public record UpdateOpenClassRequest(
    Guid? TutorId,
    Guid? SubjectId,
    Guid? ClassId,
    string? Title,
    string? Description,
    string? CoverImageUrl,
    int? MaxStudents,
    decimal? PricePerStudent,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string? ScheduleDesc,
    int? TotalSessions,
    string? Status
);

public record OpenClassDto(
    Guid Id,
    Guid AdminId,
    string AdminName,
    Guid TutorId,
    string TutorName,
    Guid SubjectId,
    string SubjectName,
    Guid? ClassId,
    string? ClassName,
    string Title,
    string? Description,
    string? CoverImageUrl,
    int MaxStudents,
    int CurrentStudents,
    decimal PricePerStudent,
    decimal TotalRevenue,
    DateOnly StartDate,
    DateOnly EndDate,
    string? ScheduleDesc,
    int TotalSessions,
    string Status,
    bool IsPublished,
    int PendingCount,
    int ApprovedCount,
    DateTime CreatedAt
);

public record OpenClassListDto(
    Guid Id,
    string Title,
    string? Description,
    string? CoverImageUrl,
    string TutorName,
    string SubjectName,
    string? ClassName,
    int MaxStudents,
    int CurrentStudents,
    decimal PricePerStudent,
    DateOnly StartDate,
    DateOnly EndDate,
    string? ScheduleDesc,
    int TotalSessions,
    string Status,
    bool IsPublished,
    DateTime CreatedAt
);

public record OpenClassSearchQuery(
    Guid? SubjectId,
    Guid? ClassId,
    decimal? MaxPrice,
    int Page = 1,
    int PageSize = 12,
    string? Status = null
);

public record OpenClassSearchResult(
    List<OpenClassListDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

// ============ ClassEnrollment ============

public record EnrollmentDto(
    Guid Id,
    Guid OpenClassId,
    string ClassTitle,
    Guid StudentId,
    string StudentName,
    string? StudentAvatar,
    string Status,
    string PaymentStatus,
    Guid? PaymentId,
    decimal? AmountPaid,
    DateTime EnrolledAt,
    DateTime? ApprovedAt,
    Guid? ApprovedBy
);

public record EnrollRequest(
    Guid OpenClassId
);

public record ApproveRejectRequest(
    string Status
);

// ============ ClassSession ============

public record CreateSessionRequest(
    int SessionNumber,
    string? Title,
    DateOnly SessionDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Notes
);

public record UpdateSessionRequest(
    string? Title,
    DateOnly? SessionDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    string? MeetingLink,
    string? Notes
);

public record ClassSessionDto(
    Guid Id,
    Guid OpenClassId,
    string ClassTitle,
    int SessionNumber,
    string? Title,
    DateOnly SessionDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? MeetingLink,
    string? Notes,
    bool IsCompleted,
    int AttendanceCount,
    int PresentCount,
    DateTime CreatedAt
);

public record MarkAttendanceRequest(
    Guid EnrollmentId,
    string Status
);

public record AttendanceDto(
    Guid Id,
    Guid SessionId,
    Guid EnrollmentId,
    string StudentName,
    string? StudentAvatar,
    string Status,
    DateTime? MarkedAt
);

// ============ RefundRequest ============

public record CreateRefundRequest(
    string? Reason
);

public record RefundRequestDto(
    Guid Id,
    Guid EnrollmentId,
    string ClassTitle,
    Guid StudentId,
    string StudentName,
    decimal Amount,
    string? Reason,
    string Status,
    string? AdminNotes,
    DateTime? ProcessedAt,
    DateTime CreatedAt
);

public record ProcessRefundRequest(
    string Status,
    string? AdminNotes
);

// ============ Common ============

public record ApiResponse<T>(
    bool Success,
    string? Message,
    T? Data
);


public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);

// ============ PublicPricingCard ============

public record PublicPricingCardDto(
    Guid Id,
    short SortOrder,
    string Title,
    string? Subtitle,
    string PriceLabel,
    string? PriceUnit,
    List<string> Features,
    bool IsPopular,
    string ThemeKey,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreatePublicPricingCardRequest(
    short SortOrder,
    [Required][MinLength(1)] string Title,
    string? Subtitle,
    [Required][MinLength(1)] string PriceLabel,
    string? PriceUnit,
    List<string>? Features,
    bool IsPopular,
    [Required] string ThemeKey
);

public record UpdatePublicPricingCardRequest(
    short? SortOrder,
    string? Title,
    string? Subtitle,
    string? PriceLabel,
    string? PriceUnit,
    List<string>? Features,
    bool? IsPopular,
    string? ThemeKey,
    bool? IsActive
);

// ============ StaticPage ============

public record StaticPageDto(
    Guid Id,
    string Slug,
    string Title,
    string Content,
    string Category,
    string? MetaDescription,
    string? CoverImageUrl,
    bool IsPublished,
    bool IsFeatured,
    int SortOrder,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string AuthorName
);

public record CreateStaticPageRequest(
    [Required][MinLength(1)][MaxLength(100)] string Slug,
    [Required][MinLength(1)][MaxLength(255)] string Title,
    [Required] string Content,
    [MaxLength(100)] string Category,
    [MaxLength(500)] string? MetaDescription,
    [MaxLength(255)] string? CoverImageUrl,
    bool IsPublished,
    bool IsFeatured,
    int SortOrder
);

public record UpdateStaticPageRequest(
    [MinLength(1)][MaxLength(100)] string? Slug,
    [MinLength(1)][MaxLength(255)] string? Title,
    string? Content,
    [MaxLength(100)] string? Category,
    [MaxLength(500)] string? MetaDescription,
    [MaxLength(255)] string? CoverImageUrl,
    bool? IsPublished,
    bool? IsFeatured,
    int? SortOrder
);

public record StaticPageListItemDto(
    Guid Id,
    string Slug,
    string Title,
    string Category,
    string? MetaDescription,
    bool IsPublished,
    bool IsFeatured,
    int SortOrder,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string AuthorName
);
