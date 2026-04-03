using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClassesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClassesController(AppDbContext db) => _db = db;

    // GET /api/classes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var classes = await _db.Classes
            .Where(c => c.IsActive)
            .OrderBy(c => c.Level)
            .Select(c => new ClassDto(c.Id, c.Name, c.Level, c.Description, c.IsActive))
            .ToListAsync();

        return Ok(new ApiResponse<List<ClassDto>>(true, null, classes));
    }

    // GET /api/classes/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls is null) return NotFound();

        return Ok(new ApiResponse<ClassDto>(true, null, new ClassDto(
            cls.Id, cls.Name, cls.Level, cls.Description, cls.IsActive)));
    }

    // POST /api/classes (Admin only)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClassRequest request)
    {
        if (await _db.Classes.AnyAsync(c => c.Name == request.Name))
            return Conflict(new ApiResponse<object>(false, "Class already exists.", null));

        var cls = new Class
        {
            Name = request.Name.Trim(),
            Level = request.Level,
            Description = request.Description,
            IsActive = true
        };

        _db.Classes.Add(cls);
        await _db.SaveChangesAsync();

        return Created($"/api/classes/{cls.Id}", new ApiResponse<ClassDto>(true, "Class created.", new ClassDto(
            cls.Id, cls.Name, cls.Level, cls.Description, cls.IsActive)));
    }

    // PUT /api/classes/{id} (Admin only)
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateClassRequest request)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls is null) return NotFound();

        if (await _db.Classes.AnyAsync(c => c.Name == request.Name && c.Id != id))
            return Conflict(new ApiResponse<object>(false, "Class name already exists.", null));

        cls.Name = request.Name.Trim();
        cls.Level = request.Level;
        cls.Description = request.Description;

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<ClassDto>(true, "Class updated.", new ClassDto(
            cls.Id, cls.Name, cls.Level, cls.Description, cls.IsActive)));
    }

    // DELETE /api/classes/{id} (soft-delete)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls is null) return NotFound();

        cls.IsActive = false;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, "Class deactivated.", null));
    }
}

public record CreateClassRequest(
    string Name,
    int Level,
    string? Description
);
