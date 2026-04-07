using TutorApp.Api.DTOs;
using TutorApp.Api.Models;

namespace TutorApp.Api.Services.Interfaces;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task UpdateAvatarUrlAsync(Guid userId, string avatarUrl);
    Task VerifyEmailAsync(string token);
    Task ResendVerificationEmailAsync(string email);
}

public interface ITutorService
{
    Task<TutorDto?> GetTutorByUserIdAsync(Guid userId);
    Task<TutorDto?> GetTutorByIdAsync(Guid tutorId);
    Task<TutorDto> CreateTutorProfileAsync(Guid userId, CreateTutorProfileRequest request);
    Task<TutorDto?> UpdateTutorProfileAsync(Guid tutorId, CreateTutorProfileRequest request);
    Task<TutorSearchResult> SearchTutorsAsync(TutorSearchQuery query);

    // Admin-only: full list (includes inactive)
    Task<AdminTutorSearchResult> SearchTutorsAdminAsync(string? search, int page, int pageSize);
    Task<AdminTutorDto?> GetTutorByIdAdminAsync(Guid tutorId);
    Task<TutorDto> CreateTutorAsync(CreateTutorRequest request);
    Task<AdminTutorDto?> UpdateTutorAsync(Guid tutorId, UpdateTutorProfileRequest request);
    Task<bool> DeleteTutorAsync(Guid tutorId);
    Task<TutorStatsDto> GetTutorStatsAsync();

    // Subject management
    Task<TutorSubjectDto> AddSubjectAsync(Guid tutorId, AddTutorSubjectRequest request);
    Task<bool> RemoveSubjectAsync(Guid tutorId, Guid subjectId);

    // Class management
    Task<TutorClassDto> AddClassAsync(Guid tutorId, AddTutorClassRequest request);
    Task<bool> RemoveClassAsync(Guid tutorId, Guid classId);

    // Schedule management
    Task<List<TutorScheduleDto>> GetTutorSchedulesAsync(Guid tutorId);
    Task<TutorScheduleDto> AddScheduleAsync(Guid tutorId, CreateScheduleRequest request);
    Task<bool> DeleteScheduleAsync(Guid scheduleId, Guid tutorId);
}

public interface IBookingService
{
    Task<BookingDto> CreateBookingAsync(Guid studentId, CreateBookingRequest request);
    Task<BookingDto?> GetBookingByIdAsync(Guid bookingId, Guid userId);
    Task<List<BookingDto>> GetStudentBookingsAsync(Guid studentId, string? status);
    Task<List<BookingDto>> GetTutorBookingsAsync(Guid tutorId, string? status);
    Task<List<BookingDto>> GetAllBookingsAsync();
    Task<BookingDto?> UpdateBookingStatusAsync(Guid bookingId, string status, Guid userId);
}

public interface IPaymentService
{
    Task<PaymentDto> CreatePaymentAsync(Guid studentId, CreatePaymentRequest request);
    Task<PaymentDto> CreateClassPaymentAsync(Guid studentId, CreateClassPaymentRequest request);
    Task<PaymentDto?> GetPaymentByBookingAsync(Guid bookingId);
    Task<PaymentDto?> GetPaymentByEnrollmentAsync(Guid enrollmentId);
    Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid userId);
    Task<List<PaymentDto>> GetTutorPayoutsAsync(Guid tutorId, int? month, int? year);
    Task<List<PaymentDto>> GetAllPaymentsAsync();
}

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(Guid studentId, CreateReviewRequest request);
    Task<ReviewDto?> GetReviewByBookingAsync(Guid bookingId);
    Task<List<ReviewDto>> GetTutorReviewsAsync(Guid tutorId);
    Task<List<ReviewDto>> GetStudentReviewsAsync(Guid studentId);
}

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageRequest request);
    Task<List<ConversationDto>> GetConversationsAsync(Guid userId);
    Task<List<MessageDto>> GetMessagesAsync(Guid userId, Guid otherUserId);
    Task<int> MarkConversationAsReadAsync(Guid userId, Guid otherUserId);
}

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(Guid userId, string title, string message, string type, object? data = null);
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly);
    Task<int> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task<int> MarkAllAsReadAsync(Guid userId);
}

public interface IPublicPricingService
{
    // Public — anyone can view active cards ordered by sort_order
    Task<List<PublicPricingCardDto>> GetActiveCardsAsync();

    // Admin — full CRUD
    Task<PublicPricingCardDto> CreateAsync(Guid adminId, CreatePublicPricingCardRequest request);
    Task<List<PublicPricingCardDto>> GetAllCardsAsync(Guid adminId);
    Task<PublicPricingCardDto?> UpdateAsync(Guid cardId, Guid adminId, UpdatePublicPricingCardRequest request);
    Task<bool> DeleteAsync(Guid cardId, Guid adminId);
}

public interface IStaticPageService
{
    // Public — anyone can view published pages
    Task<StaticPageDto?> GetBySlugAsync(string slug);
    Task<List<StaticPageListItemDto>> GetPublishedByCategoryAsync(string category);
    Task<List<StaticPageListItemDto>> GetAllPublishedAsync();
    Task<List<StaticPageListItemDto>> GetFeaturedPagesAsync();

    // Admin — full CRUD
    Task<StaticPageDto> CreateAsync(Guid adminId, CreateStaticPageRequest request);
    Task<List<StaticPageListItemDto>> GetAllPagesAsync();
    Task<StaticPageDto?> GetByIdAsync(Guid pageId);
    Task<StaticPageDto?> UpdateAsync(Guid pageId, Guid adminId, UpdateStaticPageRequest request);
    Task<bool> DeleteAsync(Guid pageId, Guid adminId);
}

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendEmailVerificationAsync(string to, string fullName, string token);
}
