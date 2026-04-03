using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messages;

    public MessagesController(IMessageService messages) => _messages = messages;

    // POST /api/messages
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var message = await _messages.SendMessageAsync(userId.Value, request);
            return Created($"/api/messages/{message.Id}", new ApiResponse<MessageDto>(true, "Message sent.", message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // GET /api/messages/conversations
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var conversations = await _messages.GetConversationsAsync(userId.Value);
        return Ok(new ApiResponse<List<ConversationDto>>(true, null, conversations));
    }

    // GET /api/messages/with/{userId}
    [HttpGet("with/{userId:guid}")]
    public async Task<IActionResult> GetMessages(Guid userId)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null) return Unauthorized();

        var messages = await _messages.GetMessagesAsync(currentUserId.Value, userId);

        // Mark as read
        await _messages.MarkConversationAsReadAsync(currentUserId.Value, userId);

        return Ok(new ApiResponse<List<MessageDto>>(true, null, messages));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
