using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.DTOs;
using TutorApp.Api.Models;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class TutorService : ITutorService
{
    private readonly AppDbContext _db;
    private static readonly string[] DayNames = { "", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN" };

    public TutorService(AppDbContext db) => _db = db;

    public async Task<TutorDto?> GetTutorByUserIdAsync(Guid userId)
    {
        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.TutorClasses).ThenInclude(tc => tc.Class)
            .FirstOrDefaultAsync(t => t.UserId == userId);
        return tutor is null ? null : MapToDto(tutor);
    }

    public async Task<TutorDto?> GetTutorByIdAsync(Guid tutorId)
    {
        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.TutorClasses).ThenInclude(tc => tc.Class)
            .FirstOrDefaultAsync(t => t.Id == tutorId);
        return tutor is null ? null : MapToDto(tutor);
    }

    public async Task<TutorDto> CreateTutorProfileAsync(Guid userId, CreateTutorProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (user.Role != "Tutor")
            throw new InvalidOperationException("User is not a Tutor.");

        if (await _db.Tutors.AnyAsync(t => t.UserId == userId))
            throw new InvalidOperationException("Tutor profile already exists.");

        var tutor = new Tutor
        {
            UserId = userId,
            Bio = request.Bio,
            HourlyRate = request.HourlyRate,
            Education = request.Education,
            YearsOfExperience = request.YearsOfExperience,
            Rating = 0,
            ReviewCount = 0,
            IsVerified = false,
            IsAvailable = true
        };

        _db.Tutors.Add(tutor);
        await _db.SaveChangesAsync();

        // Add subjects
        if (request.SubjectIds?.Length > 0)
        {
            var tutorSubjects = request.SubjectIds.Select(id => new TutorSubject
            {
                TutorId = tutor.Id,
                SubjectId = id,
                PriceOverride = null
            });
            _db.TutorSubjects.AddRange(tutorSubjects);
        }

        // Add classes
        if (request.ClassIds?.Length > 0)
        {
            var tutorClasses = request.ClassIds.Select(id => new TutorClass
            {
                TutorId = tutor.Id,
                ClassId = id
            });
            _db.TutorClasses.AddRange(tutorClasses);
        }

        await _db.SaveChangesAsync();

        // Reload with navigations
        return (await GetTutorByIdAsync(tutor.Id))!;
    }

    public async Task<TutorDto?> UpdateTutorProfileAsync(Guid tutorId, CreateTutorProfileRequest request)
    {
        var tutor = await _db.Tutors
            .FirstOrDefaultAsync(t => t.Id == tutorId);
        if (tutor is null) return null;

        tutor.Bio = request.Bio;
        tutor.HourlyRate = request.HourlyRate;
        tutor.Education = request.Education;
        tutor.YearsOfExperience = request.YearsOfExperience;
        tutor.UpdatedAt = DateTime.UtcNow;

        // Replace subjects
        var existingSubjects = await _db.TutorSubjects.Where(ts => ts.TutorId == tutorId).ToListAsync();
        _db.TutorSubjects.RemoveRange(existingSubjects);

        if (request.SubjectIds.Length > 0)
        {
            var newSubjects = request.SubjectIds.Select(id => new TutorSubject
            {
                TutorId = tutorId,
                SubjectId = id,
                PriceOverride = null
            });
            _db.TutorSubjects.AddRange(newSubjects);
        }

        // Replace classes
        var existingClasses = await _db.TutorClasses.Where(tc => tc.TutorId == tutorId).ToListAsync();
        _db.TutorClasses.RemoveRange(existingClasses);

        if (request.ClassIds.Length > 0)
        {
            var newClasses = request.ClassIds.Select(id => new TutorClass
            {
                TutorId = tutorId,
                ClassId = id
            });
            _db.TutorClasses.AddRange(newClasses);
        }

        await _db.SaveChangesAsync();
        return await GetTutorByIdAsync(tutorId);
    }

    public async Task<TutorSearchResult> SearchTutorsAsync(TutorSearchQuery query)
    {
        var q = _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.TutorClasses).ThenInclude(tc => tc.Class)
            .Where(t => t.IsAvailable);

        if (query.SubjectId.HasValue)
            q = q.Where(t => t.TutorSubjects.Any(ts => ts.SubjectId == query.SubjectId.Value));

        if (query.ClassId.HasValue)
            q = q.Where(t => t.TutorClasses.Any(tc => tc.ClassId == query.ClassId.Value));

        if (query.MinRate.HasValue)
            q = q.Where(t => t.HourlyRate >= query.MinRate.Value);

        if (query.MaxRate.HasValue)
            q = q.Where(t => t.HourlyRate <= query.MaxRate.Value);

        if (query.MinRating.HasValue)
            q = q.Where(t => t.Rating >= query.MinRating.Value);

        if (query.VerifiedOnly == true)
            q = q.Where(t => t.IsVerified);

        var total = await q.CountAsync();

        var tutors = await q
            .OrderByDescending(t => t.Rating)
            .ThenBy(t => t.HourlyRate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new TutorSearchResult(
            tutors.Select(MapToDto).ToList(),
            total,
            query.Page,
            query.PageSize);
    }

    // ─── Subject management ───────────────────────────────────────────────────

    public async Task<TutorSubjectDto> AddSubjectAsync(Guid tutorId, AddTutorSubjectRequest request)
    {
        var tutor = await _db.Tutors.FindAsync(tutorId)
            ?? throw new InvalidOperationException("Tutor not found.");

        if (!await _db.Subjects.AnyAsync(s => s.Id == request.SubjectId))
            throw new InvalidOperationException("Subject not found.");

        if (await _db.TutorSubjects.AnyAsync(ts => ts.TutorId == tutorId && ts.SubjectId == request.SubjectId))
            throw new InvalidOperationException("Subject already added to tutor profile.");

        var tutorSubject = new TutorSubject
        {
            TutorId = tutorId,
            SubjectId = request.SubjectId,
            PriceOverride = request.PriceOverride
        };

        _db.TutorSubjects.Add(tutorSubject);
        await _db.SaveChangesAsync();

        var subject = await _db.Subjects.FindAsync(request.SubjectId);
        return new TutorSubjectDto(tutorId, request.SubjectId, subject!.Name, request.PriceOverride, tutor.HourlyRate);
    }

    public async Task<bool> RemoveSubjectAsync(Guid tutorId, Guid subjectId)
    {
        var ts = await _db.TutorSubjects
            .FirstOrDefaultAsync(ts => ts.TutorId == tutorId && ts.SubjectId == subjectId);
        if (ts is null) return false;
        _db.TutorSubjects.Remove(ts);
        await _db.SaveChangesAsync();
        return true;
    }

    // ─── Class management ───────────────────────────────────────────────────

    public async Task<TutorClassDto> AddClassAsync(Guid tutorId, AddTutorClassRequest request)
    {
        var tutor = await _db.Tutors.FindAsync(tutorId)
            ?? throw new InvalidOperationException("Tutor not found.");

        if (!await _db.Classes.AnyAsync(c => c.Id == request.ClassId))
            throw new InvalidOperationException("Class not found.");

        if (await _db.TutorClasses.AnyAsync(tc => tc.TutorId == tutorId && tc.ClassId == request.ClassId))
            throw new InvalidOperationException("Class already added to tutor profile.");

        var tutorClass = new TutorClass
        {
            TutorId = tutorId,
            ClassId = request.ClassId
        };

        _db.TutorClasses.Add(tutorClass);
        await _db.SaveChangesAsync();

        var cls = await _db.Classes.FindAsync(request.ClassId);
        return new TutorClassDto(tutorId, request.ClassId, cls!.Name, cls.Level);
    }

    public async Task<bool> RemoveClassAsync(Guid tutorId, Guid classId)
    {
        var tc = await _db.TutorClasses
            .FirstOrDefaultAsync(tc => tc.TutorId == tutorId && tc.ClassId == classId);
        if (tc is null) return false;
        _db.TutorClasses.Remove(tc);
        await _db.SaveChangesAsync();
        return true;
    }

    // ─── Schedule management ────────────────────────────────────────────────

    public async Task<List<TutorScheduleDto>> GetTutorSchedulesAsync(Guid tutorId)
    {
        var schedules = await _db.TutorSchedules
            .Where(s => s.TutorId == tutorId)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .ToListAsync();

        return schedules.Select(s => new TutorScheduleDto(
            s.Id, s.TutorId, s.DayOfWeek,
            DayNames[s.DayOfWeek], s.StartTime, s.EndTime, s.IsAvailable)).ToList();
    }

    public async Task<TutorScheduleDto> AddScheduleAsync(Guid tutorId, CreateScheduleRequest request)
    {
        if (!await _db.Tutors.AnyAsync(t => t.Id == tutorId))
            throw new InvalidOperationException("Tutor not found.");

        if (await _db.TutorSchedules.AnyAsync(s =>
            s.TutorId == tutorId && s.DayOfWeek == request.DayOfWeek &&
            s.StartTime == request.StartTime && s.EndTime == request.EndTime))
            throw new InvalidOperationException("Schedule slot already exists.");

        var schedule = new TutorSchedule
        {
            TutorId = tutorId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsAvailable = true
        };

        _db.TutorSchedules.Add(schedule);
        await _db.SaveChangesAsync();

        return new TutorScheduleDto(
            schedule.Id, schedule.TutorId, schedule.DayOfWeek,
            DayNames[schedule.DayOfWeek], schedule.StartTime, schedule.EndTime, schedule.IsAvailable);
    }

    public async Task<bool> DeleteScheduleAsync(Guid scheduleId, Guid tutorId)
    {
        var schedule = await _db.TutorSchedules
            .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TutorId == tutorId);
        if (schedule is null) return false;
        _db.TutorSchedules.Remove(schedule);
        await _db.SaveChangesAsync();
        return true;
    }

    // ─── Admin management ─────────────────────────────────────────────────────

    public async Task<AdminTutorSearchResult> SearchTutorsAdminAsync(string? search, int page, int pageSize)
    {
        IQueryable<Tutor> q = _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.TutorClasses).ThenInclude(tc => tc.Class);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            q = q.Where(t =>
                t.OwnerUser.FullName.ToLower().Contains(term) ||
                t.OwnerUser.Email.ToLower().Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new AdminTutorSearchResult(
            items.Select(MapToAdminDto).ToList(),
            total, page, pageSize);
    }

    public async Task<AdminTutorDto?> GetTutorByIdAdminAsync(Guid tutorId)
    {
        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.TutorClasses).ThenInclude(tc => tc.Class)
            .FirstOrDefaultAsync(t => t.Id == tutorId);
        return tutor is null ? null : MapToAdminDto(tutor);
    }

    public async Task<TutorDto> CreateTutorAsync(CreateTutorRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            throw new InvalidOperationException("Email already exists.");

        var user = new User
        {
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Phone = request.Phone,
            Role = "Tutor",
            IsActive = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var tutor = new Tutor
        {
            UserId = user.Id,
            Bio = request.Bio,
            HourlyRate = request.HourlyRate,
            Education = request.Education,
            YearsOfExperience = request.YearsOfExperience,
            Rating = 0,
            ReviewCount = 0,
            IsVerified = false,
            IsAvailable = true
        };
        _db.Tutors.Add(tutor);
        await _db.SaveChangesAsync();

        if (request.SubjectIds?.Length > 0)
        {
            _db.TutorSubjects.AddRange(request.SubjectIds.Select(id => new TutorSubject
            {
                TutorId = tutor.Id,
                SubjectId = id,
                PriceOverride = null
            }));
        }

        if (request.ClassIds?.Length > 0)
        {
            _db.TutorClasses.AddRange(request.ClassIds.Select(id => new TutorClass
            {
                TutorId = tutor.Id,
                ClassId = id
            }));
        }

        await _db.SaveChangesAsync();
        return (await GetTutorByIdAsync(tutor.Id))!;
    }

    public async Task<AdminTutorDto?> UpdateTutorAsync(Guid tutorId, UpdateTutorProfileRequest request)
    {
        var tutor = await _db.Tutors
            .Include(t => t.OwnerUser)
            .Include(t => t.TutorSubjects)
            .Include(t => t.TutorClasses)
            .FirstOrDefaultAsync(t => t.Id == tutorId);
        if (tutor is null) return null;

        if (request.Bio is not null) tutor.Bio = request.Bio;
        if (request.HourlyRate.HasValue) tutor.HourlyRate = request.HourlyRate.Value;
        if (request.Education is not null) tutor.Education = request.Education;
        if (request.YearsOfExperience.HasValue) tutor.YearsOfExperience = request.YearsOfExperience.Value;
        if (request.IsVerified.HasValue) tutor.IsVerified = request.IsVerified.Value;
        if (request.IsAvailable.HasValue) tutor.IsAvailable = request.IsAvailable.Value;
        tutor.UpdatedAt = DateTime.UtcNow;

        if (request.SubjectIds is not null)
        {
            _db.TutorSubjects.RemoveRange(tutor.TutorSubjects);
            if (request.SubjectIds.Length > 0)
            {
                _db.TutorSubjects.AddRange(request.SubjectIds.Select(id => new TutorSubject
                {
                    TutorId = tutorId,
                    SubjectId = id,
                    PriceOverride = null
                }));
            }
        }

        if (request.ClassIds is not null)
        {
            _db.TutorClasses.RemoveRange(tutor.TutorClasses);
            if (request.ClassIds.Length > 0)
            {
                _db.TutorClasses.AddRange(request.ClassIds.Select(id => new TutorClass
                {
                    TutorId = tutorId,
                    ClassId = id
                }));
            }
        }

        await _db.SaveChangesAsync();
        return await GetTutorByIdAdminAsync(tutorId);
    }

    public async Task<bool> DeleteTutorAsync(Guid tutorId)
    {
        var tutor = await _db.Tutors.FindAsync(tutorId);
        if (tutor is null) return false;

        _db.Tutors.Remove(tutor);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<TutorStatsDto> GetTutorStatsAsync()
    {
        var tutors = _db.Tutors;
        return new TutorStatsDto(
            await tutors.CountAsync(),
            await tutors.CountAsync(t => t.IsVerified),
            await tutors.CountAsync(t => !t.IsVerified),
            await tutors.CountAsync(t => t.IsAvailable),
            await tutors.CountAsync(t => !t.IsAvailable)
        );
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private TutorDto MapToDto(Tutor tutor) => new(
        tutor.Id,
        tutor.UserId,
        tutor.OwnerUser.FullName,
        tutor.OwnerUser.Email,
        tutor.OwnerUser.Phone,
        tutor.OwnerUser.AvatarUrl,
        tutor.TutorSubjects.Select(ts => new TutorSubjectDto(
            ts.TutorId,
            ts.SubjectId,
            ts.Subject.Name,
            ts.PriceOverride,
            tutor.HourlyRate)).ToList(),
        tutor.TutorClasses.Select(tc => new TutorClassDto(
            tc.TutorId,
            tc.ClassId,
            tc.Class.Name,
            tc.Class.Level)).ToList(),
        tutor.Bio,
        tutor.HourlyRate,
        tutor.Rating,
        tutor.ReviewCount,
        tutor.IsVerified,
        tutor.IsAvailable,
        tutor.Education,
        tutor.YearsOfExperience);

    private AdminTutorDto MapToAdminDto(Tutor tutor) => new(
        tutor.Id,
        tutor.UserId,
        tutor.OwnerUser.FullName,
        tutor.OwnerUser.Email,
        tutor.OwnerUser.Phone,
        tutor.OwnerUser.AvatarUrl,
        tutor.TutorSubjects.Select(ts => new TutorSubjectDto(
            ts.TutorId,
            ts.SubjectId,
            ts.Subject.Name,
            ts.PriceOverride,
            tutor.HourlyRate)).ToList(),
        tutor.TutorClasses.Select(tc => new TutorClassDto(
            tc.TutorId,
            tc.ClassId,
            tc.Class.Name,
            tc.Class.Level)).ToList(),
        tutor.Bio,
        tutor.HourlyRate,
        tutor.Rating,
        tutor.ReviewCount,
        tutor.IsVerified,
        tutor.IsAvailable,
        tutor.Education,
        tutor.YearsOfExperience,
        tutor.OwnerUser.IsActive,
        tutor.CreatedAt);
}
