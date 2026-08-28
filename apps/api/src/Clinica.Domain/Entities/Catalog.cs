using Clinica.Domain.Enums;

namespace Clinica.Domain.Entities;

public class Service
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public ServiceCategory Category { get; set; }
    public string DescriptionEn { get; set; } = default!;
    public string DescriptionAr { get; set; } = default!;
    public int DurationMin { get; set; }
    public long Price { get; set; }
    public int RecommendedSessions { get; set; } = 1;
    public string? Device { get; set; }
    public bool RequiresDoctor { get; set; }
    public string AftercareEn { get; set; } = default!;
    public string AftercareAr { get; set; } = default!;
    public bool Published { get; set; } = true;
    public int Demand30d { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PackageItem> PackageItems { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<SessionRecord> SessionRecords { get; set; } = [];
}

public class Package
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public string DescriptionEn { get; set; } = default!;
    public string DescriptionAr { get; set; } = default!;
    public long Price { get; set; }
    public long ListPrice { get; set; }
    public int ValidityDays { get; set; }
    public bool Published { get; set; } = true;
    public bool Featured { get; set; }
    public int SoldCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PackageItem> Items { get; set; } = [];
    public ICollection<Entitlement> Entitlements { get; set; } = [];
}

public class PackageItem
{
    public Guid Id { get; set; }
    public Guid PackageId { get; set; }
    public Package Package { get; set; } = default!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = default!;
    public int Sessions { get; set; }
}

public class Offer
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string TitleEn { get; set; } = default!;
    public string TitleAr { get; set; } = default!;
    public string DescriptionEn { get; set; } = default!;
    public string DescriptionAr { get; set; } = default!;
    public OfferKind Kind { get; set; }
    public int Value { get; set; }
    public string Code { get; set; } = default!;
    public string ScopeKind { get; set; } = "all";
    public string[] ScopeIds { get; set; } = [];
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public bool Published { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
