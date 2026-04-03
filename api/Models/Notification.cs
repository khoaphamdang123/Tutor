using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("notifications")]
public class Notification
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("user_id")]
    public Guid UserId { get; set; }

    [Required, MaxLength(200), Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required, Column("message")]
    public string Message { get; set; } = string.Empty;

    [Required, MaxLength(20), Column("type")]
    public string Type { get; set; } = "System";

    [Column("is_read")]
    public bool IsRead { get; set; }

    [Column("data", TypeName = "jsonb")]
    public string? Data { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public User NotifyUser { get; set; } = null!;
}
