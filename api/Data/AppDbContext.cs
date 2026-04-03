using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Models;

namespace TutorApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tutor> Tutors => Set<Tutor>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<TutorSubject> TutorSubjects => Set<TutorSubject>();
    public DbSet<TutorClass> TutorClasses => Set<TutorClass>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TutorSchedule> TutorSchedules => Set<TutorSchedule>();
    public DbSet<OpenClass> OpenClasses => Set<OpenClass>();
    public DbSet<ClassEnrollment> ClassEnrollments => Set<ClassEnrollment>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<SessionAttendance> SessionAttendances => Set<SessionAttendance>();
    public DbSet<RefundRequest> RefundRequests => Set<RefundRequest>();
    public DbSet<PublicPricingCard> PublicPricingCards => Set<PublicPricingCard>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── User ────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasDefaultValue("Student");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // ─── Subject ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // ─── Class ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Level);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // ─── Tutor ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Tutor>(entity =>
        {
            entity.HasOne(e => e.OwnerUser).WithOne().HasForeignKey<Tutor>(e => e.UserId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.Rating).IsDescending();
            entity.Property(e => e.Rating).HasDefaultValue(0m);
            entity.Property(e => e.ReviewCount).HasDefaultValue(0);
            entity.Property(e => e.IsVerified).HasDefaultValue(false);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
        });

        // ─── TutorSubject (many-to-many junction) ─────────────────────────────
        modelBuilder.Entity<TutorSubject>(entity =>
        {
            entity.HasKey(e => new { e.TutorId, e.SubjectId });

            entity.HasOne(e => e.Tutor)
                  .WithMany(t => t.TutorSubjects)
                  .HasForeignKey(e => e.TutorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Subject)
                  .WithMany()
                  .HasForeignKey(e => e.SubjectId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── TutorClass (many-to-many junction) ──────────────────────────────
        modelBuilder.Entity<TutorClass>(entity =>
        {
            entity.HasKey(e => new { e.TutorId, e.ClassId });

            entity.HasOne(e => e.Tutor)
                  .WithMany(t => t.TutorClasses)
                  .HasForeignKey(e => e.TutorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Class)
                  .WithMany()
                  .HasForeignKey(e => e.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Booking ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(e => e.BookingStudent).WithMany().HasForeignKey(e => e.StudentId);
            entity.HasOne(e => e.BookingTutor).WithMany().HasForeignKey(e => e.TutorId);
            entity.HasOne(e => e.BookingSubject).WithMany().HasForeignKey(e => e.SubjectId);
            entity.HasOne(e => e.BookingClass).WithMany().HasForeignKey(e => e.ClassId);
            entity.Property(e => e.Status).HasDefaultValue("Pending");
        });

        // ─── Payment ───────────────────────────────────────────────────────
        modelBuilder.Entity<Payment>(entity =>
        {
            // Optional FK to Booking (can be null when payment is for a class enrollment)
            entity.HasOne(e => e.PaymentBooking)
                  .WithMany()
                  .HasForeignKey(e => e.BookingId)
                  .IsRequired(false);

            // Optional FK to ClassEnrollment (can be null when payment is for a booking)
            entity.HasOne(e => e.EnrollmentPayment)
                  .WithMany()
                  .HasForeignKey(e => e.ClassEnrollmentId)
                  .IsRequired(false);

            // Partial unique index: only one payment per booking when booking_id is set
            entity.HasIndex(e => e.BookingId)
                  .IsUnique()
                  .HasFilter("booking_id IS NOT NULL");

            entity.Property(e => e.Status).HasDefaultValue("Pending");
        });

        // ─── Review ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(e => e.ReviewBooking).WithMany().HasForeignKey(e => e.BookingId);
            entity.HasIndex(e => e.BookingId).IsUnique();
        });

        // ─── Message ────────────────────────────────────────────────────────
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(e => e.MsgSender).WithMany().HasForeignKey(e => e.SenderId);
            entity.HasOne(e => e.MsgReceiver).WithMany().HasForeignKey(e => e.ReceiverId);
        });

        // ─── Notification ───────────────────────────────────────────────────
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(e => e.NotifyUser).WithMany().HasForeignKey(e => e.UserId);
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Type).HasDefaultValue("System");
        });

        // ─── TutorSchedule ──────────────────────────────────────────────────
        modelBuilder.Entity<TutorSchedule>(entity =>
        {
            entity.HasOne(e => e.ScheduleTutor).WithMany().HasForeignKey(e => e.TutorId);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
        });

        // ─── OpenClass ─────────────────────────────────────────────────────
        modelBuilder.Entity<OpenClass>(entity =>
        {
            entity.HasOne(e => e.ClassAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.AdminId);

            entity.HasOne(e => e.ClassTutor)
                  .WithMany()
                  .HasForeignKey(e => e.TutorId);

            entity.HasOne(e => e.ClassSubject)
                  .WithMany()
                  .HasForeignKey(e => e.SubjectId);

            entity.HasOne(e => e.ClassLevel)
                  .WithMany()
                  .HasForeignKey(e => e.ClassId);

            entity.Property(e => e.Status).HasDefaultValue("Draft");
            entity.Property(e => e.IsPublished).HasDefaultValue(false);
            entity.Property(e => e.CurrentStudents).HasDefaultValue(0);
            entity.Property(e => e.TotalRevenue).HasDefaultValue(0m);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsPublished);
            entity.HasIndex(e => e.TutorId);
            entity.HasIndex(e => e.SubjectId);
        });

        // ─── ClassEnrollment ────────────────────────────────────────────────
        modelBuilder.Entity<ClassEnrollment>(entity =>
        {
            entity.HasOne(e => e.OpenClass)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.OpenClassId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.EnrolledStudent)
                  .WithMany()
                  .HasForeignKey(e => e.StudentId);

            entity.HasIndex(e => new { e.OpenClassId, e.StudentId }).IsUnique();
            entity.HasIndex(e => e.StudentId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Status).HasDefaultValue("Pending");
            entity.Property(e => e.PaymentStatus).HasDefaultValue("Unpaid");
        });

        // ─── ClassSession ───────────────────────────────────────────────────
        modelBuilder.Entity<ClassSession>(entity =>
        {
            entity.HasOne(e => e.OpenClass)
                  .WithMany(c => c.Sessions)
                  .HasForeignKey(e => e.OpenClassId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.OpenClassId);
            entity.HasIndex(e => e.SessionDate);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
        });

        // ─── SessionAttendance ─────────────────────────────────────────────
        modelBuilder.Entity<SessionAttendance>(entity =>
        {
            entity.HasOne(e => e.Session)
                  .WithMany(s => s.Attendances)
                  .HasForeignKey(e => e.SessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Enrollment)
                  .WithMany(en => en.Attendances)
                  .HasForeignKey(e => e.EnrollmentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.SessionId, e.EnrollmentId }).IsUnique();
            entity.Property(e => e.Status).HasDefaultValue("Absent");
        });

        // ─── RefundRequest ─────────────────────────────────────────────────
        modelBuilder.Entity<RefundRequest>(entity =>
        {
            entity.HasOne(e => e.Enrollment)
                  .WithMany(en => en.RefundRequests)
                  .HasForeignKey(e => e.EnrollmentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.RequestingStudent)
                  .WithMany()
                  .HasForeignKey(e => e.StudentId);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StudentId);
            entity.Property(e => e.Status).HasDefaultValue("Pending");
        });

        // ─── PublicPricingCard ───────────────────────────────────────────────
        modelBuilder.Entity<PublicPricingCard>(entity =>
        {
            entity.HasIndex(e => e.SortOrder);
            entity.HasIndex(e => e.IsActive);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsPopular).HasDefaultValue(false);
            entity.Property(e => e.SortOrder).HasDefaultValue((short)0);
        });

        // ─── PasswordResetToken ──────────────────────────────────────────────
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token);
            entity.HasIndex(e => e.UserId);
        });
    }
}
