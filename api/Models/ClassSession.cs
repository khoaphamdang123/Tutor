using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("class_sessions")]
public class ClassSession
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("open_class_id")]
    public Guid OpenClassId { get; set; }

    [Required, Column("session_number")]
    public int SessionNumber { get; set; }

    [MaxLength(255), Column("title")]
    public string? Title { get; set; }

    [Required, Column("session_date")]
    public DateOnly SessionDate { get; set; }

    [Required, Column("start_time")]
    public TimeOnly StartTime { get; set; }

    [Required, Column("end_time")]
    public TimeOnly EndTime { get; set; }

    [MaxLength(500), Column("meeting_link")]
    public string? MeetingLink { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Required, Column("is_completed")]
    public bool IsCompleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ─── Navigation ────────────────────────────────────────────
    [ForeignKey("OpenClassId")]
    public OpenClass OpenClass { get; set; } = null!;

    public ICollection<SessionAttendance> Attendances { get; set; } = new List<SessionAttendance>();
}
