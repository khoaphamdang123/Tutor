using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    private int RefreshTokenExpiryDays =>
        int.TryParse(_config["Jwt:RefreshExpiryDays"], out var d) ? d : 30;

    public AuthService(AppDbContext db, IConfiguration config, IEmailService emailService)
    {
        _db = db;
        _config = config;
        _emailService = emailService;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();

        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            throw new InvalidOperationException("Email already registered.");

        var validRoles = new[] { "Student", "Tutor", "Admin" };
        if (!validRoles.Contains(request.Role))
            throw new ArgumentException("Role must be Student, Tutor, or Admin.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        // Generate email verification token
        var verificationTokenBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(verificationTokenBytes);
        var verificationToken = Convert.ToBase64String(verificationTokenBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim(),
            Role = request.Role,
            IsActive = true,
            IsEmailVerified = false,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Send verification email
        try
        {
            await _emailService.SendEmailVerificationAsync(user.Email, user.FullName, verificationToken);
        }
        catch (Exception ex)
        {
            // Log error but don't fail registration
            Console.WriteLine($"Failed to send verification email: {ex.Message}");
        }

        return new RegisterResponse(true, "Registration successful. Please check your email to verify your account.", user.Email);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        // Check if email is verified
        if (!user.IsEmailVerified)
            throw new UnauthorizedAccessException("Please verify your email before logging in. Check your inbox for the verification link.");

        var (token, refreshToken, expiresAt) = GenerateTokens(user);
        await SaveRefreshTokenAsync(user, refreshToken);
        return new AuthResponse(token, refreshToken, expiresAt, MapToDto(user));
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        var candidate = await _db.Users
            .Where(u => u.RefreshTokenHash != null)
            .Where(u => u.RefreshTokenExpiry != null && u.RefreshTokenExpiry > DateTime.UtcNow)
            .ToListAsync();

        var user = candidate.FirstOrDefault(u => BCrypt.Net.BCrypt.Verify(refreshToken, u.RefreshTokenHash));

        if (user is null) return null;

        var (newToken, newRefreshToken, expiresAt) = GenerateTokens(user);
        await SaveRefreshTokenAsync(user, newRefreshToken);
        return new AuthResponse(newToken, newRefreshToken, expiresAt, MapToDto(user));
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user is null ? null : MapToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return null;

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName.Trim();
        if (request.Phone is not null)
            user.Phone = request.Phone.Trim();
        if (request.AvatarUrl is not null)
            user.AvatarUrl = request.AvatarUrl.Trim();

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task UpdateAvatarUrlAsync(Guid userId, string avatarUrl)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return;

        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        // Always return success to prevent email enumeration attacks
        if (user is null) return;

        // Invalidate any existing unused tokens for this user
        var existingTokens = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        _db.PasswordResetTokens.RemoveRange(existingTokens);

        // Generate a secure random token
        var tokenBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };

        _db.PasswordResetTokens.Add(resetToken);
        await _db.SaveChangesAsync();

        // TODO: Send email with reset link containing the token
        // In production, integrate with an email service (SendGrid, SES, etc.)
        // e.g.: await _emailService.SendAsync(user.Email, "Reset Password",
        //       $"Click here to reset your password: {baseUrl}/auth/reset-password?token={token}&email={user.Email}");
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();

        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.User.Email == normalizedEmail &&
                t.Token == request.Token &&
                t.UsedAt == null &&
                t.ExpiresAt > DateTime.UtcNow);

        if (resetToken is null)
            throw new UnauthorizedAccessException("Invalid or expired reset token.");

        // Update password
        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);
        resetToken.User.UpdatedAt = DateTime.UtcNow;

        // Mark token as used
        resetToken.UsedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    private (string Token, string RefreshToken, DateTime ExpiresAt) GenerateTokens(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var accessExpiry = DateTime.UtcNow.AddDays(
            int.TryParse(_config["Jwt:ExpiryDays"], out var days) ? days : 7);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: accessExpiry,
            signingCredentials: creds);

        var refreshExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);

        // Plain-text refresh token (hashed before DB storage)
        var refreshTokenBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(refreshTokenBytes);
        var refreshToken = Convert.ToBase64String(refreshTokenBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        return (new JwtSecurityTokenHandler().WriteToken(token), refreshToken, accessExpiry);
    }

    private async Task SaveRefreshTokenAsync(User user, string plainRefreshToken)
    {
        user.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(plainRefreshToken, workFactor: 11);
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        await _db.SaveChangesAsync();
    }

    private static UserDto MapToDto(User user) => new(
        user.Id,
        user.Email,
        user.FullName,
        user.Phone,
        user.AvatarUrl,
        user.Role,
        user.IsEmailVerified,
        user.CreatedAt);

    public async Task VerifyEmailAsync(string token)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.EmailVerificationToken == token &&
                u.EmailVerificationTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid or expired verification token.");

        if (user.IsEmailVerified)
            throw new InvalidOperationException("Email is already verified.");

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task ResendVerificationEmailAsync(string email)
    {
        var normalizedEmail = email.ToLowerInvariant().Trim();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null)
            throw new InvalidOperationException("No account found with this email address.");

        if (user.IsEmailVerified)
            throw new InvalidOperationException("This email has already been verified.");

        // Generate new verification token
        var verificationTokenBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(verificationTokenBytes);
        var verificationToken = Convert.ToBase64String(verificationTokenBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        user.EmailVerificationToken = verificationToken;
        user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Send verification email
        try
        {
            await _emailService.SendEmailVerificationAsync(user.Email, user.FullName, verificationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send verification email: {ex.Message}");
            throw new InvalidOperationException("Failed to send verification email. Please try again later.");
        }
    }
}
