using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("tutor_subjects")]
public class TutorSubject
{
    [Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Column("subject_id")]
    public Guid SubjectId { get; set; }

    [Column("price_override", TypeName = "numeric(10,2)")]
    public decimal? PriceOverride { get; set; }

    [ForeignKey("TutorId")]
    public Tutor Tutor { get; set; } = null!;

    [ForeignKey("SubjectId")]
    public Subject Subject { get; set; } = null!;
}
