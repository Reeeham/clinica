using Clinica.Domain.Enums;
using System.Text.Json;

namespace Clinica.Domain.Entities;

public class Customer
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string? Email { get; set; }
    public string Gender { get; set; } = "female";
    public DateTime? BirthDate { get; set; }
    public string? SkinType { get; set; }
    public string[] Allergies { get; set; } = [];
    public string[] Conditions { get; set; } = [];
    public string? Notes { get; set; }
    public string[] Tags { get; set; } = [];
    public CustomerSource Source { get; set; } = CustomerSource.WalkIn;
    public bool MarketingOptIn { get; set; }
    public bool Active { get; set; } = true;
    public DateTime? DeactivatedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Color { get; set; } = default!;
    public string Initials { get; set; } = default!;

    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<Entitlement> Entitlements { get; set; } = [];
    public ICollection<SessionRecord> SessionRecords { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}

public class Entitlement
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public Guid PackageId { get; set; }
    public Package Package { get; set; } = default!;
    public DateTime PurchasedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public EntitlementStatus Status { get; set; } = EntitlementStatus.Active;
    public string BalanceJson { get; set; } = "[]";

    public ICollection<Booking> Bookings { get; set; } = [];
}

public class Booking
{
    public Guid Id { get; set; }
    public string Ref { get; set; } = default!;
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = default!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = default!;
    public Guid? EntitlementId { get; set; }
    public Entitlement? Entitlement { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public BookingChannel Channel { get; set; } = BookingChannel.WalkIn;
    public long Price { get; set; }
    public string? Notes { get; set; }
    public int? SessionNumber { get; set; }
    public int? SessionTotal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public SessionRecord? SessionRecord { get; set; }
    public Order? Order { get; set; }
}

public class SessionRecord
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = default!;
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;
    public DateTime PerformedAt { get; set; }
    public string[] Areas { get; set; } = [];
    public string ParametersJson { get; set; } = "{}";
    public string OutcomeEn { get; set; } = default!;
    public string OutcomeAr { get; set; } = default!;
    public string Reaction { get; set; } = "none";
    public int? Satisfaction { get; set; }
    public DateTime? NextDueAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
