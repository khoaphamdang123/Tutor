using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TutorApp.Api.Models;

[Table("messages")]
public class Message
{
    [Key, Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, Column("sender_id")]
    public Guid SenderId { get; set; }

    [Required, Column("receiver_id")]
    public Guid ReceiverId { get; set; }

    [Required, Column("content")]
    public string Content { get; set; } = string.Empty;

    [Column("is_read")]
    public bool IsRead { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("SenderId")]
    public User MsgSender { get; set; } = null!;

    [ForeignKey("ReceiverId")]
    public User MsgReceiver { get; set; } = null!;
}
