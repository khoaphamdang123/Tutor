using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("payments")]
public class Payment
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("booking_id")]
    public Guid? BookingId { get; set; }

    [Column("class_enrollment_id")]
    public Guid? ClassEnrollmentId { get; set; }

    [Required, Column("student_id")]
    public Guid StudentId { get; set; }

    [Required, Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Required, Column("amount", TypeName = "numeric(10,2)")]
    public decimal Amount { get; set; }

    [Required, Column("platform_fee", TypeName = "numeric(10,2)")]
    public decimal PlatformFee { get; set; }

    [Required, Column("tutor_payout", TypeName = "numeric(10,2)")]
    public decimal TutorPayout { get; set; }

    [Required, MaxLength(20), Column("status")]
    public string Status { get; set; } = "Pending";

    [Required, MaxLength(50), Column("payment_method")]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(255), Column("transaction_id")]
    public string? TransactionId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("BookingId")]
    public Booking? PaymentBooking { get; set; }

    [ForeignKey("ClassEnrollmentId")]
    public ClassEnrollment? EnrollmentPayment { get; set; }
}
