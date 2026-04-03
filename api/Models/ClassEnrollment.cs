using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("class_enrollments")]
public class ClassEnrollment
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("open_class_id")]
    public Guid OpenClassId { get; set; }

    [Required, Column("student_id")]
    public Guid StudentId { get; set; }

    [Required, MaxLength(50), Column("status")]
    public string Status { get; set; } = "Pending";

    [Required, MaxLength(50), Column("payment_status")]
    public string PaymentStatus { get; set; } = "Unpaid";

    [Column("payment_id")]
    public Guid? PaymentId { get; set; }

    [Column("amount_paid", TypeName = "numeric(10,2)")]
    public decimal? AmountPaid { get; set; }

    [Column("enrolled_at")]
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("approved_by")]
    public Guid? ApprovedBy { get; set; }

    // ─── Navigation ────────────────────────────────────────────
    [ForeignKey("OpenClassId")]
    public OpenClass OpenClass { get; set; } = null!;

    [ForeignKey("StudentId")]
    public User EnrolledStudent { get; set; } = null!;

    [ForeignKey("PaymentId")]
    public Payment? EnrollmentPayment { get; set; }

    public ICollection<SessionAttendance> Attendances { get; set; } = new List<SessionAttendance>();
    public ICollection<RefundRequest> RefundRequests { get; set; } = new List<RefundRequest>();
}
