using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("tutors")]
public class Tutor
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("user_id")]
    public Guid UserId { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Required, Column("hourly_rate", TypeName = "numeric(10,2)")]
    public decimal HourlyRate { get; set; }

    [Column("rating", TypeName = "numeric(3,2)")]
    public decimal Rating { get; set; }

    [Column("review_count")]
    public int ReviewCount { get; set; }

    [Column("is_verified")]
    public bool IsVerified { get; set; }

    [Column("is_available")]
    public bool IsAvailable { get; set; } = true;

    [MaxLength(500), Column("education")]
    public string? Education { get; set; }

    [Column("years_of_experience")]
    public int? YearsOfExperience { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // ─── Navigation ────────────────────────────────────────────────────────────
    [ForeignKey("UserId")]
    public User OwnerUser { get; set; } = null!;

    public ICollection<TutorSubject> TutorSubjects { get; set; } = new List<TutorSubject>();
    public ICollection<TutorClass> TutorClasses { get; set; } = new List<TutorClass>();
}
