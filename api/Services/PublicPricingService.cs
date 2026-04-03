using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class PublicPricingService : IPublicPricingService
{
    private readonly AppDbContext _db;

    public PublicPricingService(AppDbContext db) => _db = db;

    // ─── Public ───────────────────────────────────────────────────────────────

    public async Task<List<PublicPricingCardDto>> GetActiveCardsAsync()
    {
        var cards = await _db.PublicPricingCards
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return cards.Select(MapToDto).ToList();
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    public async Task<PublicPricingCardDto> CreateAsync(Guid adminId, CreatePublicPricingCardRequest request)
    {
        var admin = await _db.Users.FindAsync(adminId)
            ?? throw new InvalidOperationException("Admin not found.");

        if (admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can manage pricing cards.");

        var card = new PublicPricingCard
        {
            SortOrder = request.SortOrder,
            Title = request.Title,
            Subtitle = request.Subtitle,
            PriceLabel = request.PriceLabel,
            PriceUnit = request.PriceUnit,
            Features = request.Features ?? new List<string>(),
            IsPopular = request.IsPopular,
            ThemeKey = request.ThemeKey,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.PublicPricingCards.Add(card);
        await _db.SaveChangesAsync();

        return MapToDto(card);
    }

    public async Task<List<PublicPricingCardDto>> GetAllCardsAsync(Guid adminId)
    {
        var admin = await _db.Users.FindAsync(adminId)
            ?? throw new InvalidOperationException("Admin not found.");

        if (admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can view all pricing cards.");

        var cards = await _db.PublicPricingCards
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return cards.Select(MapToDto).ToList();
    }

    public async Task<PublicPricingCardDto?> UpdateAsync(Guid cardId, Guid adminId, UpdatePublicPricingCardRequest request)
    {
        var admin = await _db.Users.FindAsync(adminId)
            ?? throw new InvalidOperationException("Admin not found.");

        if (admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can update pricing cards.");

        var card = await _db.PublicPricingCards.FindAsync(cardId);
        if (card is null) return null;

        if (request.SortOrder.HasValue) card.SortOrder = request.SortOrder.Value;
        if (request.Title is not null) card.Title = request.Title;
        if (request.Subtitle is not null) card.Subtitle = request.Subtitle;
        if (request.PriceLabel is not null) card.PriceLabel = request.PriceLabel;
        if (request.PriceUnit is not null) card.PriceUnit = request.PriceUnit;
        if (request.Features is not null) card.Features = request.Features;
        if (request.IsPopular.HasValue) card.IsPopular = request.IsPopular.Value;
        if (request.ThemeKey is not null) card.ThemeKey = request.ThemeKey;
        if (request.IsActive.HasValue) card.IsActive = request.IsActive.Value;

        card.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(card);
    }

    public async Task<bool> DeleteAsync(Guid cardId, Guid adminId)
    {
        var admin = await _db.Users.FindAsync(adminId)
            ?? throw new InvalidOperationException("Admin not found.");

        if (admin.Role != "Admin")
            throw new UnauthorizedAccessException("Only admins can delete pricing cards.");

        var card = await _db.PublicPricingCards.FindAsync(cardId);
        if (card is null) return false;

        _db.PublicPricingCards.Remove(card);
        await _db.SaveChangesAsync();
        return true;
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private static PublicPricingCardDto MapToDto(PublicPricingCard c) => new(
        c.Id,
        c.SortOrder,
        c.Title,
        c.Subtitle,
        c.PriceLabel,
        c.PriceUnit,
        c.Features,
        c.IsPopular,
        c.ThemeKey,
        c.IsActive,
        c.CreatedAt,
        c.UpdatedAt
    );
}
