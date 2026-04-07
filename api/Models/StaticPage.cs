using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("static_pages")]
public class StaticPage
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100), Column("slug")]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(255), Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required, Column("content")]
    public string Content { get; set; } = string.Empty;

    [MaxLength(100), Column("category")]
    public string Category { get; set; } = "General";

    [MaxLength(500), Column("meta_description")]
    public string? MetaDescription { get; set; }

    [MaxLength(255), Column("cover_image_url")]
    public string? CoverImageUrl { get; set; }

    [Column("is_published")]
    public bool IsPublished { get; set; } = true;

    [Column("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Required, Column("author_id")]
    public Guid AuthorId { get; set; }

    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;
}
