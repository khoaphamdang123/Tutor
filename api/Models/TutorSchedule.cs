using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("tutor_schedules")]
public class TutorSchedule
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Required, Range(1, 7), Column("day_of_week")]
    public int DayOfWeek { get; set; }

    [Required, Column("start_time")]
    public TimeOnly StartTime { get; set; }

    [Required, Column("end_time")]
    public TimeOnly EndTime { get; set; }

    [Column("is_available")]
    public bool IsAvailable { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("TutorId")]
    public Tutor ScheduleTutor { get; set; } = null!;
}
