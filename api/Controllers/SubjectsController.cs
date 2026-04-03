using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;

namespace TutorApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubjectsController(AppDbContext db) => _db = db;

    // GET /api/subjects
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _db.Subjects
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(s.Id, s.Name, s.Description, s.IconUrl, s.IsActive))
            .ToListAsync();

        return Ok(new ApiResponse<List<SubjectDto>>(true, null, subjects));
    }

    // GET /api/subjects/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject is null) return NotFound();

        return Ok(new ApiResponse<SubjectDto>(true, null, new SubjectDto(
            subject.Id, subject.Name, subject.Description, subject.IconUrl, subject.IsActive)));
    }

    // POST /api/subjects (Admin only)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSubjectRequest request)
    {
        if (await _db.Subjects.AnyAsync(s => s.Name == request.Name))
            return Conflict(new ApiResponse<object>(false, "Subject already exists.", null));

        var subject = new Subject
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            IconUrl = request.IconUrl,
            IsActive = true
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();

        return Created($"/api/subjects/{subject.Id}", new ApiResponse<SubjectDto>(true, "Subject created.", new SubjectDto(
            subject.Id, subject.Name, subject.Description, subject.IconUrl, subject.IsActive)));
    }

    // PUT /api/subjects/{id} (Admin only)
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateSubjectRequest request)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject is null) return NotFound();

        if (await _db.Subjects.AnyAsync(s => s.Name == request.Name && s.Id != id))
            return Conflict(new ApiResponse<object>(false, "Subject name already exists.", null));

        subject.Name = request.Name.Trim();
        subject.Description = request.Description;
        subject.IconUrl = request.IconUrl;

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<SubjectDto>(true, "Subject updated.", new SubjectDto(
            subject.Id, subject.Name, subject.Description, subject.IconUrl, subject.IsActive)));
    }

    // DELETE /api/subjects/{id} (soft-delete)
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject is null) return NotFound();

        subject.IsActive = false;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, "Subject deactivated.", null));
    }

    // PUT /api/subjects/{id}/reactivate (Admin only)
    [HttpPut("{id:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject is null) return NotFound();

        subject.IsActive = true;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, "Subject reactivated.", null));
    }
}

public record CreateSubjectRequest(
    string Name,
    string? Description,
    string? IconUrl
);
