using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("users")]
public class User
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(255), Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(255), Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(100), Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20), Column("phone")]
    public string? Phone { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Required, MaxLength(20), Column("role")]
    public string Role { get; set; } = "Student";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("is_email_verified")]
    public bool IsEmailVerified { get; set; } = false;

    [MaxLength(255), Column("email_verification_token")]
    public string? EmailVerificationToken { get; set; }

    [Column("email_verification_token_expiry")]
    public DateTime? EmailVerificationTokenExpiry { get; set; }

    [MaxLength(500), Column("refresh_token_hash")]
    public string? RefreshTokenHash { get; set; }

    [Column("refresh_token_expiry")]
    public DateTime? RefreshTokenExpiry { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
