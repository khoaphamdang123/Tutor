using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("bookings")]
public class Booking
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("student_id")]
    public Guid StudentId { get; set; }

    [Required, Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Required, Column("subject_id")]
    public Guid SubjectId { get; set; }

    [Column("class_id")]
    public Guid? ClassId { get; set; }

    [Required, Column("start_time")]
    public DateTime StartTime { get; set; }

    [Required, Column("end_time")]
    public DateTime EndTime { get; set; }

    [Required, MaxLength(20), Column("status")]
    public string Status { get; set; } = "Pending";

    [Required, Column("price", TypeName = "numeric(10,2)")]
    public decimal Price { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("meeting_link")]
    public string? MeetingLink { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // ─── Navigation ────────────────────────────────────────────────────────────
    [ForeignKey("StudentId")]
    public User BookingStudent { get; set; } = null!;

    [ForeignKey("TutorId")]
    public Tutor BookingTutor { get; set; } = null!;

    [ForeignKey("SubjectId")]
    public Subject BookingSubject { get; set; } = null!;

    [ForeignKey("ClassId")]
    public Class? BookingClass { get; set; }
}
