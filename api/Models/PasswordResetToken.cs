using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("password_reset_tokens")]
public class PasswordResetToken
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("user_id")]
    public Guid UserId { get; set; }

    [Required, MaxLength(255), Column("token")]
    public string Token { get; set; } = string.Empty;

    [Required, Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("used_at")]
    public DateTime? UsedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
