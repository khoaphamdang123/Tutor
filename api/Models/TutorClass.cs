using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("tutor_classes")]
public class TutorClass
{
    [Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Column("class_id")]
    public Guid ClassId { get; set; }

    [ForeignKey("TutorId")]
    public Tutor Tutor { get; set; } = null!;

    [ForeignKey("ClassId")]
    public Class Class { get; set; } = null!;
}
