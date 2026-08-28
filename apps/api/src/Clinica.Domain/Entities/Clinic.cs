using Clinica.Domain.Enums;

namespace Clinica.Domain.Entities;

public class Clinic
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public string TaglineEn { get; set; } = default!;
    public string TaglineAr { get; set; } = default!;
    public string AboutEn { get; set; } = default!;
    public string AboutAr { get; set; } = default!;
    public string CityEn { get; set; } = default!;
    public string CityAr { get; set; } = default!;
    public string AreaEn { get; set; } = default!;
    public string AreaAr { get; set; } = default!;
    public string AddressEn { get; set; } = default!;
    public string AddressAr { get; set; } = default!;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Phone { get; set; } = default!;
    public string Whatsapp { get; set; } = default!;
    public float Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool Verified { get; set; }
    public string[] Palette { get; set; } = [];
    public string[] AmenitiesEn { get; set; } = [];
    public string[] AmenitiesAr { get; set; } = [];
    public string[] Specialties { get; set; } = [];
    public ClinicPlan Plan { get; set; } = ClinicPlan.Starter;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OpeningHours> Hours { get; set; } = [];
    public ICollection<Room> Rooms { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<Service> Services { get; set; } = [];
    public ICollection<Package> Packages { get; set; } = [];
    public ICollection<Offer> Offers { get; set; } = [];
    public ICollection<Customer> Customers { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<Payout> Payouts { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}

public class OpeningHours
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public int Day { get; set; }
    public string? Open { get; set; }
    public string? Close { get; set; }
}

public class Room
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public string[] Supports { get; set; } = [];

    public ICollection<Booking> Bookings { get; set; } = [];
}
