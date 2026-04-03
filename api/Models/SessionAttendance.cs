using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("session_attendance")]
public class SessionAttendance
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("session_id")]
    public Guid SessionId { get; set; }

    [Required, Column("enrollment_id")]
    public Guid EnrollmentId { get; set; }

    [Required, MaxLength(20), Column("status")]
    public string Status { get; set; } = "Absent";

    [Column("marked_at")]
    public DateTime? MarkedAt { get; set; }

    [Column("marked_by")]
    public Guid? MarkedBy { get; set; }

    // ─── Navigation ────────────────────────────────────────────
    [ForeignKey("SessionId")]
    public ClassSession Session { get; set; } = null!;

    [ForeignKey("EnrollmentId")]
    public ClassEnrollment Enrollment { get; set; } = null!;
}
