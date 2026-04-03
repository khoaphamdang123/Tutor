using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/pricing-cards")]
public class PricingCardsController : ControllerBase
{
    private readonly IPublicPricingService _svc;

    public PricingCardsController(IPublicPricingService svc) => _svc = svc;

    // GET /api/pricing-cards  — public, anyone can view active cards
    [HttpGet]
    public async Task<IActionResult> GetActiveCards()
    {
        var cards = await _svc.GetActiveCardsAsync();
        return Ok(new ApiResponse<List<PublicPricingCardDto>>(true, null, cards));
    }

    // GET /api/pricing-cards/admin/all  — admin only, view all cards (active + inactive)
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllCards()
    {
        var adminId = GetUserId();
        if (adminId is null) return Unauthorized();
        var cards = await _svc.GetAllCardsAsync(adminId.Value);
        return Ok(new ApiResponse<List<PublicPricingCardDto>>(true, null, cards));
    }

    // POST /api/pricing-cards/admin  — admin only, create a new card
    [Authorize(Roles = "Admin")]
    [HttpPost("admin")]
    public async Task<IActionResult> Create([FromBody] CreatePublicPricingCardRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var dto = await _svc.CreateAsync(adminId.Value, request);
            return CreatedAtAction(nameof(GetActiveCards),
                new ApiResponse<PublicPricingCardDto>(true, "Card created.", dto));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    // PUT /api/pricing-cards/admin/{id}  — admin only, update an existing card
    [Authorize(Roles = "Admin")]
    [HttpPut("admin/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePublicPricingCardRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var dto = await _svc.UpdateAsync(id, adminId.Value, request);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Card not found.", null));
            return Ok(new ApiResponse<PublicPricingCardDto>(true, "Card updated.", dto));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(new ApiResponse<object>(false, ex.Message, null)); }
        catch (ArgumentException ex) { return BadRequest(new ApiResponse<object>(false, ex.Message, null)); }
    }

    // DELETE /api/pricing-cards/admin/{id}  — admin only, hard delete a card
    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();
            var deleted = await _svc.DeleteAsync(id, adminId.Value);
            if (!deleted) return NotFound(new ApiResponse<object>(false, "Card not found.", null));
            return Ok(new ApiResponse<object>(true, "Card deleted.", null));
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
