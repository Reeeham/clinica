using Clinica.Domain.Enums;

namespace Clinica.Domain.Entities;

public class Employee
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string NameAr { get; set; } = default!;
    public EmployeeRole Role { get; set; }
    public string TitleEn { get; set; } = default!;
    public string TitleAr { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Email { get; set; } = default!;
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public DateTime HiredAt { get; set; }
    public long Salary { get; set; }
    public double CommissionRate { get; set; }
    public string[] Specialties { get; set; } = [];
    public string Color { get; set; } = default!;
    public string Initials { get; set; } = default!;
    public float Rating { get; set; }
    public bool CanLogin { get; set; }
    public string? PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Shift> Shifts { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<SessionRecord> SessionRecords { get; set; } = [];
}

public class Shift
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;
    public int Day { get; set; }
    public string From { get; set; } = default!;
    public string To { get; set; } = default!;
}
