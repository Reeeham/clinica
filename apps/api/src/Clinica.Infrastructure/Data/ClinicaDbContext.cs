using Clinica.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Infrastructure.Data;

public class ClinicaDbContext : DbContext
{
    public ClinicaDbContext(DbContextOptions<ClinicaDbContext> options) : base(options) { }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<OpeningHours> OpeningHours => Set<OpeningHours>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<PackageItem> PackageItems => Set<PackageItem>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Entitlement> Entitlements => Set<Entitlement>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<SessionRecord> SessionRecords => Set<SessionRecord>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Payout> Payouts => Set<Payout>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        mb.Entity<Clinic>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.Palette).HasColumnType("text[]");
            e.Property(c => c.AmenitiesEn).HasColumnType("text[]");
            e.Property(c => c.AmenitiesAr).HasColumnType("text[]");
            e.Property(c => c.Specialties).HasColumnType("text[]");
        });

        mb.Entity<Room>(e =>
        {
            e.HasIndex(r => new { r.ClinicId, r.NameEn });
            e.Property(r => r.Supports).HasColumnType("text[]");
        });

        mb.Entity<Employee>(e =>
        {
            e.HasIndex(em => em.Email).IsUnique();
            e.Property(em => em.Specialties).HasColumnType("text[]");
            e.Property(em => em.Salary).HasColumnType("bigint");
        });

        mb.Entity<Service>(e =>
        {
            e.HasIndex(s => new { s.ClinicId, s.Category });
            e.Property(s => s.Price).HasColumnType("bigint");
        });

        mb.Entity<Package>(e =>
        {
            e.HasIndex(p => p.ClinicId);
            e.Property(p => p.Price).HasColumnType("bigint");
            e.Property(p => p.ListPrice).HasColumnType("bigint");
        });

        mb.Entity<Offer>(e =>
        {
            e.HasIndex(o => o.Code).IsUnique();
            e.Property(o => o.ScopeIds).HasColumnType("text[]");
        });

        mb.Entity<Customer>(e =>
        {
            e.HasIndex(c => new { c.ClinicId, c.Phone }).IsUnique();
            e.Property(c => c.Allergies).HasColumnType("text[]");
            e.Property(c => c.Conditions).HasColumnType("text[]");
            e.Property(c => c.Tags).HasColumnType("text[]");
        });

        mb.Entity<Entitlement>(e =>
        {
            e.HasIndex(en => new { en.CustomerId, en.PackageId });
            e.Property(en => en.BalanceJson).HasColumnType("jsonb");
        });

        mb.Entity<Booking>(e =>
        {
            e.HasIndex(b => b.Ref).IsUnique();
            e.HasIndex(b => new { b.ClinicId, b.StartsAt });
            e.HasIndex(b => b.CustomerId);
            e.HasIndex(b => b.EmployeeId);
            e.HasIndex(b => b.Status);
            e.Property(b => b.Price).HasColumnType("bigint");
        });

        mb.Entity<SessionRecord>(e =>
        {
            e.HasIndex(sr => sr.BookingId).IsUnique();
            e.HasIndex(sr => sr.CustomerId);
            e.Property(sr => sr.Areas).HasColumnType("text[]");
            e.Property(sr => sr.ParametersJson).HasColumnType("jsonb");
        });

        mb.Entity<Order>(e =>
        {
            e.HasIndex(o => o.Ref).IsUnique();
            e.HasIndex(o => new { o.ClinicId, o.Status });
            e.Property(o => o.LinesJson).HasColumnType("jsonb");
            e.Property(o => o.Discount).HasColumnType("bigint");
        });

        mb.Entity<Payment>(e =>
        {
            e.HasIndex(p => p.Ref).IsUnique();
            e.HasIndex(p => new { p.ClinicId, p.PaidAt });
            e.HasIndex(p => p.OrderId);
            e.Property(p => p.Amount).HasColumnType("bigint");
            e.Property(p => p.PlatformFee).HasColumnType("bigint");
            e.Property(p => p.NetToClinic).HasColumnType("bigint");
        });

        mb.Entity<Payout>(e =>
        {
            e.HasIndex(po => po.ClinicId);
            e.Property(po => po.Gross).HasColumnType("bigint");
            e.Property(po => po.Fees).HasColumnType("bigint");
            e.Property(po => po.Net).HasColumnType("bigint");
        });

        mb.Entity<Review>(e =>
        {
            e.HasIndex(r => r.ClinicId);
        });
    }
}
