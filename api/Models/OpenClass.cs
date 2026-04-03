using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("open_classes")]
public class OpenClass
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("admin_id")]
    public Guid AdminId { get; set; }

    [Required, Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Required, Column("subject_id")]
    public Guid SubjectId { get; set; }

    [Column("class_id")]
    public Guid? ClassId { get; set; }

    [Required, MaxLength(255), Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(500), Column("cover_image_url")]
    public string? CoverImageUrl { get; set; }

    [Required, Column("max_students")]
    public int MaxStudents { get; set; } = 20;

    [Required, Column("current_students")]
    public int CurrentStudents { get; set; } = 0;

    [Required, Column("price_per_student", TypeName = "numeric(10,2)")]
    public decimal PricePerStudent { get; set; }

    [Required, Column("total_revenue", TypeName = "numeric(12,2)")]
    public decimal TotalRevenue { get; set; } = 0;

    [Required, Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Required, Column("end_date")]
    public DateOnly EndDate { get; set; }

    [MaxLength(255), Column("schedule_desc")]
    public string? ScheduleDesc { get; set; }

    [Required, Column("total_sessions")]
    public int TotalSessions { get; set; } = 1;

    [Required, MaxLength(50), Column("status")]
    public string Status { get; set; } = "Draft";

    [Required, Column("is_published")]
    public bool IsPublished { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // ─── Navigation ────────────────────────────────────────────
    [ForeignKey("AdminId")]
    public User ClassAdmin { get; set; } = null!;

    [ForeignKey("TutorId")]
    public Tutor ClassTutor { get; set; } = null!;

    [ForeignKey("SubjectId")]
    public Subject ClassSubject { get; set; } = null!;

    [ForeignKey("ClassId")]
    public Class? ClassLevel { get; set; }

    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
    public ICollection<ClassSession> Sessions { get; set; } = new List<ClassSession>();
}
