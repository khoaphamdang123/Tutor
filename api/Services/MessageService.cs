using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _db;

    public MessageService(AppDbContext db) => _db = db;

    public async Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageRequest request)
    {
        if (senderId == request.ReceiverId)
            throw new ArgumentException("Cannot send message to yourself.");

        var sender = await _db.Users.FindAsync(senderId)
            ?? throw new InvalidOperationException("Sender not found.");

        var receiver = await _db.Users.FindAsync(request.ReceiverId)
            ?? throw new InvalidOperationException("Receiver not found.");

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            Content = request.Content.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return MapToDto(message, sender.FullName, receiver.FullName);
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(Guid userId)
    {
        // Step 1: Get raw message groups from DB (no Include to avoid GroupBy translation issue)
        var messageGroups = await _db.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => new
            {
                OtherUserId = g.Key,
                LastMessageId = g.OrderByDescending(m => m.CreatedAt).Select(m => m.Id).First(),
                UnreadCount = g.Count(m => !m.IsRead && m.ReceiverId == userId)
            })
            .OrderByDescending(x => x.LastMessageId)
            .ToListAsync();

        if (messageGroups.Count == 0)
            return new List<ConversationDto>();

        // Step 2: Load last messages and other users in parallel
        var lastMsgIds = messageGroups.Select(m => m.LastMessageId).ToList();
        var otherUserIds = messageGroups.Select(m => m.OtherUserId).ToList();

        var lastMessages = await _db.Messages
            .Include(m => m.MsgSender)
            .Include(m => m.MsgReceiver)
            .Where(m => lastMsgIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id);

        var otherUsers = await _db.Users
            .Where(u => otherUserIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);

        // Step 3: Build result
        return messageGroups.Select(mg =>
        {
            var lastMsg = lastMessages[mg.LastMessageId];
            var otherUser = otherUsers[mg.OtherUserId];
            var senderName = lastMsg.SenderId == userId ? lastMsg.MsgSender.FullName : lastMsg.MsgSender.FullName;
            var receiverName = lastMsg.ReceiverId == userId ? lastMsg.MsgReceiver.FullName : lastMsg.MsgReceiver.FullName;
            return new ConversationDto(
                otherUser.Id, otherUser.FullName, otherUser.AvatarUrl,
                MapToDto(lastMsg, senderName, receiverName),
                mg.UnreadCount);
        }).ToList();
    }

    public async Task<List<MessageDto>> GetMessagesAsync(Guid userId, Guid otherUserId)
    {
        var messages = await _db.Messages
            .Include(m => m.MsgSender)
            .Include(m => m.MsgReceiver)
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        return messages.Select(m => MapToDto(m, m.MsgSender.FullName, m.MsgReceiver.FullName)).ToList();
    }

    public async Task<int> MarkConversationAsReadAsync(Guid userId, Guid otherUserId)
    {
        return await _db.Messages
            .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));
    }

    private static MessageDto MapToDto(Message m, string senderName, string receiverName) => new(
        m.Id, m.SenderId, senderName,
        m.ReceiverId, receiverName,
        m.Content, m.IsRead, m.CreatedAt);
}
