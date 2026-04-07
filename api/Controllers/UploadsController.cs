using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorApp.Api.DTOs;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IAuthService _auth;

    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSizeBytes = 2 * 1024 * 1024; // 2 MB

    public UploadsController(IConfiguration config, IAuthService auth)
    {
        _config = config;
        _auth = auth;
    }

    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile file)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        if (file is null || file.Length == 0)
            return BadRequest(new ApiResponse<object>(false, "No file provided.", null));

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new ApiResponse<object>(false, "File size must be under 2 MB.", null));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new ApiResponse<object>(false, "Only JPG, PNG, GIF, and WebP images are allowed.", null));

        // Determine upload base path
        var uploadRoot = _config["App:UploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        var avatarsDir = Path.Combine(uploadRoot, "avatars");

        if (!Directory.Exists(avatarsDir))
            Directory.CreateDirectory(avatarsDir);

        // Generate unique filename
        var fileName = $"{userId}_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(avatarsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Build public URL
        var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:5200";
        var avatarUrl = $"{baseUrl}/uploads/avatars/{fileName}";

        // Update user avatar in DB
        await _auth.UpdateAvatarUrlAsync(userId.Value, avatarUrl);

        return Ok(new ApiResponse<object>(true, "Avatar uploaded.", new { url = avatarUrl }));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
