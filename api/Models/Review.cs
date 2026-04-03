using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("reviews")]
public class Review
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("booking_id")]
    public Guid BookingId { get; set; }

    [Required, Column("student_id")]
    public Guid StudentId { get; set; }

    [Required, Column("tutor_id")]
    public Guid TutorId { get; set; }

    [Required, Range(1, 5), Column("rating")]
    public int Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("BookingId")]
    public Booking ReviewBooking { get; set; } = null!;
}
