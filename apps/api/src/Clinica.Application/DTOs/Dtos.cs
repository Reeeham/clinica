using Clinica.Domain.Enums;

namespace Clinica.Application.DTOs;

public record ClinicDto(
    Guid Id, string Slug, string NameEn, string NameAr,
    string TaglineEn, string TaglineAr, string CityEn, string CityAr,
    string AreaEn, string AreaAr, string Phone, string Whatsapp,
    float Rating, int ReviewCount, bool Verified,
    string[] Palette, string[] Specialties, ClinicPlan Plan
);

public record EmployeeDto(
    Guid Id, string NameEn, string NameAr, EmployeeRole Role,
    string TitleEn, string TitleAr, string Phone, string Email,
    EmployeeStatus Status, long Salary, double CommissionRate,
    string[] Specialties, string Color, string Initials, float Rating,
    bool CanLogin, DateTime HiredAt
);

public record CustomerDto(
    Guid Id, string NameEn, string NameAr, string Phone, string? Email,
    string Gender, DateTime? BirthDate, string? SkinType,
    string[] Allergies, string[] Conditions, string? Notes,
    string[] Tags, CustomerSource Source, bool MarketingOptIn,
    bool Active, DateTime CreatedAt, string Color, string Initials
);

public record BookingDto(
    Guid Id, string Ref, Guid CustomerId, Guid EmployeeId,
    Guid RoomId, Guid ServiceId, Guid? EntitlementId,
    DateTime StartsAt, DateTime EndsAt, BookingStatus Status,
    BookingChannel Channel, long Price, string? Notes,
    int? SessionNumber, int? SessionTotal, DateTime CreatedAt
);

public record ServiceDto(
    Guid Id, string NameEn, string NameAr, ServiceCategory Category,
    string DescriptionEn, string DescriptionAr, int DurationMin,
    long Price, int RecommendedSessions, string? Device,
    bool RequiresDoctor, bool Published, int Demand30d
);

public record PackageDto(
    Guid Id, string NameEn, string NameAr, string DescriptionEn,
    string DescriptionAr, long Price, long ListPrice, int ValidityDays,
    bool Published, bool Featured, int SoldCount,
    List<PackageItemDto> Items
);

public record PackageItemDto(Guid ServiceId, int Sessions);

public record OfferDto(
    Guid Id, string TitleEn, string TitleAr, string DescriptionEn,
    string DescriptionAr, OfferKind Kind, int Value, string Code,
    string ScopeKind, string[] ScopeIds, DateTime StartsAt,
    DateTime EndsAt, int? UsageLimit, int UsedCount, bool Published
);

public record PaymentDto(
    Guid Id, string Ref, Guid OrderId, Guid CustomerId,
    long Amount, PaymentMethod Method, PaymentStatus Status,
    long PlatformFee, long NetToClinic, DateTime PaidAt,
    string? GatewayRef, Guid? PayoutId
);

public record OrderDto(
    Guid Id, string Ref, Guid CustomerId, Guid? BookingId,
    string LinesJson, long Discount, string? OfferCode,
    OrderStatus Status, DateTime CreatedAt
);

public record PayoutDto(
    Guid Id, DateTime PeriodStart, DateTime PeriodEnd,
    long Gross, long Fees, long Net, PayoutStatus Status,
    DateTime ExpectedAt
);

public record AuthResponseDto(string Token, string Email, string Name, string Role, Guid ClinicId);
public record LoginDto(string Email, string Password);
