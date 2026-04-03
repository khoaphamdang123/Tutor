using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications) => _notifications = notifications;

    // GET /api/notifications?unreadOnly=true
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var notifications = await _notifications.GetUserNotificationsAsync(userId.Value, unreadOnly);
        return Ok(new ApiResponse<List<NotificationDto>>(true, null, notifications));
    }

    // PATCH /api/notifications/{id}/read
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var count = await _notifications.MarkAsReadAsync(id, userId.Value);
        return Ok(new ApiResponse<object>(true, $"{count} notification(s) marked as read.", null));
    }

    // PATCH /api/notifications/read-all
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var count = await _notifications.MarkAllAsReadAsync(userId.Value);
        return Ok(new ApiResponse<object>(true, $"{count} notification(s) marked as read.", null));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
