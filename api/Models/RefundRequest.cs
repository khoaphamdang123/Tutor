using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("refund_requests")]
public class RefundRequest
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("enrollment_id")]
    public Guid EnrollmentId { get; set; }

    [Required, Column("student_id")]
    public Guid StudentId { get; set; }

    [Required, Column("amount", TypeName = "numeric(10,2)")]
    public decimal Amount { get; set; }

    [Column("reason")]
    public string? Reason { get; set; }

    [Required, MaxLength(50), Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("processed_at")]
    public DateTime? ProcessedAt { get; set; }

    [Column("processed_by")]
    public Guid? ProcessedBy { get; set; }

    [Column("admin_notes")]
    public string? AdminNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ─── Navigation ────────────────────────────────────────────
    [ForeignKey("EnrollmentId")]
    public ClassEnrollment Enrollment { get; set; } = null!;

    [ForeignKey("StudentId")]
    public User RequestingStudent { get; set; } = null!;
}
