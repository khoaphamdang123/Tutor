using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class StaticPageService : IStaticPageService
{
    private readonly AppDbContext _db;

    public StaticPageService(AppDbContext db) => _db = db;

    public async Task<StaticPageDto?> GetBySlugAsync(string slug)
    {
        var page = await _db.StaticPages
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

        return page is null ? null : MapToDto(page);
    }

    public async Task<List<StaticPageListItemDto>> GetPublishedByCategoryAsync(string category)
    {
        var pages = await _db.StaticPages
            .Include(p => p.Author)
            .Where(p => p.Category == category && p.IsPublished)
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return pages.Select(MapToListItemDto).ToList();
    }

    public async Task<List<StaticPageListItemDto>> GetAllPublishedAsync()
    {
        var pages = await _db.StaticPages
            .Include(p => p.Author)
            .Where(p => p.IsPublished)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.SortOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return pages.Select(MapToListItemDto).ToList();
    }

    public async Task<List<StaticPageListItemDto>> GetFeaturedPagesAsync()
    {
        var pages = await _db.StaticPages
            .Include(p => p.Author)
            .Where(p => p.IsFeatured && p.IsPublished)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return pages.Select(MapToListItemDto).ToList();
    }

    public async Task<StaticPageDto> CreateAsync(Guid adminId, CreateStaticPageRequest request)
    {
        var slugExists = await _db.StaticPages.AnyAsync(p => p.Slug == request.Slug);
        if (slugExists)
            throw new InvalidOperationException($"Trang với slug '{request.Slug}' đã tồn tại.");

        var page = new StaticPage
        {
            AuthorId = adminId,
            Slug = request.Slug.ToLowerInvariant().Trim(),
            Title = request.Title.Trim(),
            Content = request.Content,
            Category = request.Category ?? "General",
            MetaDescription = request.MetaDescription?.Trim(),
            CoverImageUrl = request.CoverImageUrl?.Trim(),
            IsPublished = request.IsPublished,
            IsFeatured = request.IsFeatured,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _db.StaticPages.Add(page);
        await _db.SaveChangesAsync();

        var author = await _db.Users.FindAsync(adminId);
        page.Author = author!;

        return MapToDto(page);
    }

    public async Task<List<StaticPageListItemDto>> GetAllPagesAsync()
    {
        var pages = await _db.StaticPages
            .Include(p => p.Author)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.SortOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return pages.Select(MapToListItemDto).ToList();
    }

    public async Task<StaticPageDto?> GetByIdAsync(Guid pageId)
    {
        var page = await _db.StaticPages
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == pageId);

        return page is null ? null : MapToDto(page);
    }

    public async Task<StaticPageDto?> UpdateAsync(Guid pageId, Guid adminId, UpdateStaticPageRequest request)
    {
        var page = await _db.StaticPages
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == pageId);

        if (page is null) return null;

        if (!string.IsNullOrWhiteSpace(request.Slug))
        {
            var newSlug = request.Slug.ToLowerInvariant().Trim();
            if (newSlug != page.Slug)
            {
                var slugExists = await _db.StaticPages.AnyAsync(p => p.Slug == newSlug && p.Id != pageId);
                if (slugExists)
                    throw new InvalidOperationException($"Trang với slug '{request.Slug}' đã tồn tại.");
                page.Slug = newSlug;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Title))
            page.Title = request.Title.Trim();

        if (request.Content is not null)
            page.Content = request.Content;

        if (!string.IsNullOrWhiteSpace(request.Category))
            page.Category = request.Category;

        if (request.MetaDescription is not null)
            page.MetaDescription = string.IsNullOrWhiteSpace(request.MetaDescription) ? null : request.MetaDescription.Trim();

        if (request.CoverImageUrl is not null)
            page.CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl) ? null : request.CoverImageUrl.Trim();

        if (request.IsPublished.HasValue)
            page.IsPublished = request.IsPublished.Value;

        if (request.IsFeatured.HasValue)
            page.IsFeatured = request.IsFeatured.Value;

        if (request.SortOrder.HasValue)
            page.SortOrder = request.SortOrder.Value;

        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(page);
    }

    public async Task<bool> DeleteAsync(Guid pageId, Guid adminId)
    {
        var page = await _db.StaticPages.FindAsync(pageId);
        if (page is null) return false;

        _db.StaticPages.Remove(page);
        await _db.SaveChangesAsync();

        return true;
    }

    private static StaticPageDto MapToDto(StaticPage page) => new(
        page.Id,
        page.Slug,
        page.Title,
        page.Content,
        page.Category,
        page.MetaDescription,
        page.CoverImageUrl,
        page.IsPublished,
        page.IsFeatured,
        page.SortOrder,
        page.CreatedAt,
        page.UpdatedAt,
        page.Author.FullName);

    private static StaticPageListItemDto MapToListItemDto(StaticPage page) => new(
        page.Id,
        page.Slug,
        page.Title,
        page.Category,
        page.MetaDescription,
        page.IsPublished,
        page.IsFeatured,
        page.SortOrder,
        page.CreatedAt,
        page.UpdatedAt,
        page.Author.FullName);
}
