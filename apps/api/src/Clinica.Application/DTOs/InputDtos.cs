using Clinica.Domain.Enums;

namespace Clinica.Application.DTOs;

public record CreateBookingDto(
    Guid CustomerId, Guid EmployeeId, Guid RoomId, Guid ServiceId,
    DateTime StartsAt, BookingChannel Channel, string? Notes, bool UseEntitlement);

public record UpdateStatusDto(string Status);

public record CreateCustomerDto(
    string NameEn, string NameAr, string Phone, string? Email,
    string? Gender, DateTime? BirthDate, string? SkinType,
    string[]? Allergies, string[]? Conditions, string? Notes,
    string[]? Tags, CustomerSource Source, bool MarketingOptIn,
    string? Color, string? Initials);

public record UpdateCustomerDto(
    string? NameEn, string? NameAr, string? Phone, string? Email,
    string? Notes, string[]? Tags, bool? MarketingOptIn);

public record CreateEmployeeDto(
    string NameEn, string NameAr, EmployeeRole Role,
    string TitleEn, string TitleAr, string Phone, string Email,
    long Salary, double CommissionRate, string[]? Specialties,
    string? Color, string? Initials, bool CanLogin);

public record UpdateEmployeeDto(
    string? NameEn, string? NameAr, string? Phone, string? Email,
    double? CommissionRate, long? Salary, bool? CanLogin);

public record CreateServiceDto(
    string NameEn, string NameAr, ServiceCategory Category,
    string DescriptionEn, string DescriptionAr,
    int DurationMin, long Price, int RecommendedSessions,
    string? Device, bool RequiresDoctor, string? AftercareEn, string? AftercareAr);

public record UpdateServiceDto(
    string? NameEn, string? NameAr, long? Price,
    int? DurationMin, bool? Published);

public record UpdateProfileDto(
    string? NameEn, string? NameAr,
    string? TaglineEn, string? TaglineAr,
    string? AboutEn, string? AboutAr,
    string? Phone, string? Whatsapp,
    string? AddressEn, string? AddressAr);

public record HoursDto(int Day, string? Open, string? Close);

public record CreateRoomDto(string NameEn, string NameAr, string[]? Supports);

public record CreatePackageDto(
    string NameEn, string NameAr, string DescriptionEn, string DescriptionAr,
    long Price, long ListPrice, int ValidityDays, bool Published, bool Featured,
    List<PackageItemDto> Items);

public record UpdatePackageDto(
    string? NameEn, string? NameAr, string? DescriptionEn, string? DescriptionAr,
    long? Price, long? ListPrice, int? ValidityDays, bool? Published, bool? Featured,
    List<PackageItemDto>? Items);

public record CreateOfferDto(
    string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr,
    OfferKind Kind, int Value, string Code, string ScopeKind, string[]? ScopeIds,
    DateTime StartsAt, DateTime EndsAt, int? UsageLimit, bool Published);

public record UpdateOfferDto(
    string? TitleEn, string? TitleAr, string? DescriptionEn, string? DescriptionAr,
    OfferKind? Kind, int? Value, string? Code,
    DateTime? StartsAt, DateTime? EndsAt, int? UsageLimit, bool? Published);

public record CreateSessionRecordDto(
    Guid BookingId, Guid CustomerId, Guid ServiceId, Guid EmployeeId,
    DateTime PerformedAt, string[]? Areas, string? ParametersJson,
    string OutcomeEn, string OutcomeAr, string Reaction,
    int? Satisfaction, DateTime? NextDueAt, string? Notes);

public record UpdateSessionRecordDto(
    string[]? Areas, string? ParametersJson,
    string? OutcomeEn, string? OutcomeAr, string? Reaction,
    int? Satisfaction, DateTime? NextDueAt, string? Notes);
