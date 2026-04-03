using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db) => _db = db;

    public async Task<NotificationDto> CreateNotificationAsync(
        Guid userId, string title, string message, string type, object? data = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            Data = data is null ? null : JsonSerializer.Serialize(data),
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return MapToDto(notification);
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly)
    {
        var q = _db.Notifications.Where(n => n.UserId == userId);

        if (unreadOnly)
            q = q.Where(n => !n.IsRead);

        var notifications = await q
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return notifications.Select(MapToDto).ToList();
    }

    public async Task<int> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.Id == notificationId && n.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<int> MarkAllAsReadAsync(Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    private static NotificationDto MapToDto(Notification n) => new(
        n.Id,
        n.Title,
        n.Message,
        n.Type,
        n.IsRead,
        n.Data,
        n.CreatedAt);
}
