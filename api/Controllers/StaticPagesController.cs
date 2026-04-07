using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/static-pages")]
public class StaticPagesController : ControllerBase
{
    private readonly IStaticPageService _svc;

    public StaticPagesController(IStaticPageService svc) => _svc = svc;

    // ─── PUBLIC: View static pages ────────────────────────────────
    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var dto = await _svc.GetBySlugAsync(slug);
        if (dto is null) return NotFound(new ApiResponse<object>(false, "Trang không tìm thấy.", null));
        return Ok(new ApiResponse<StaticPageDto>(true, null, dto));
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category)
    {
        var pages = await _svc.GetPublishedByCategoryAsync(category);
        return Ok(new ApiResponse<List<StaticPageListItemDto>>(true, null, pages));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPublished()
    {
        var pages = await _svc.GetAllPublishedAsync();
        return Ok(new ApiResponse<List<StaticPageListItemDto>>(true, null, pages));
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var pages = await _svc.GetFeaturedPagesAsync();
        return Ok(new ApiResponse<List<StaticPageListItemDto>>(true, null, pages));
    }

    // ─── ADMIN: CRUD ──────────────────────────────────────────────
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllPages()
    {
        var pages = await _svc.GetAllPagesAsync();
        return Ok(new ApiResponse<List<StaticPageListItemDto>>(true, null, pages));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var dto = await _svc.GetByIdAsync(id);
        if (dto is null) return NotFound(new ApiResponse<object>(false, "Trang không tìm thấy.", null));
        return Ok(new ApiResponse<StaticPageDto>(true, null, dto));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaticPageRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();

            var dto = await _svc.CreateAsync(adminId.Value, request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id },
                new ApiResponse<StaticPageDto>(true, "Trang đã được tạo.", dto));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaticPageRequest request)
    {
        try
        {
            var adminId = GetUserId();
            if (adminId is null) return Unauthorized();

            var dto = await _svc.UpdateAsync(id, adminId.Value, request);
            if (dto is null) return NotFound(new ApiResponse<object>(false, "Trang không tìm thấy.", null));
            return Ok(new ApiResponse<StaticPageDto>(true, "Trang đã được cập nhật.", dto));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<object>(false, ex.Message, null));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var adminId = GetUserId();
        if (adminId is null) return Unauthorized();

        var ok = await _svc.DeleteAsync(id, adminId.Value);
        if (!ok) return NotFound(new ApiResponse<object>(false, "Trang không tìm thấy.", null));
        return Ok(new ApiResponse<object>(true, "Trang đã được xóa.", null));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
