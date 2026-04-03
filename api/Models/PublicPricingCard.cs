using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("public_pricing_cards")]
public class PublicPricingCard
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("sort_order")]
    public short SortOrder { get; set; } = 0;

    [Required, Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("subtitle")]
    public string? Subtitle { get; set; }

    [Required, Column("price_label")]
    public string PriceLabel { get; set; } = string.Empty;

    [Column("price_unit")]
    public string? PriceUnit { get; set; }

    [Column("features", TypeName = "text[]")]
    public List<string> Features { get; set; } = new();

    [Required, Column("is_popular")]
    public bool IsPopular { get; set; } = false;

    [Required, MaxLength(50), Column("theme_key")]
    public string ThemeKey { get; set; } = "primary";

    [Required, Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
