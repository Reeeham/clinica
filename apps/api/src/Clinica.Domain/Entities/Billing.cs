using Clinica.Domain.Enums;

namespace Clinica.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public string Ref { get; set; } = default!;
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public Guid? BookingId { get; set; }
    public Booking? Booking { get; set; }
    public string LinesJson { get; set; } = "[]";
    public long Discount { get; set; }
    public string? OfferCode { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Open;
    public string CreatedBy { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Payment> Payments { get; set; } = [];
}

public class Payment
{
    public Guid Id { get; set; }
    public string Ref { get; set; } = default!;
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public long Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public long PlatformFee { get; set; }
    public long NetToClinic { get; set; }
    public DateTime PaidAt { get; set; }
    public string? GatewayRef { get; set; }
    public Guid? PayoutId { get; set; }
    public Payout? Payout { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Payout
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public long Gross { get; set; }
    public long Fees { get; set; }
    public long Net { get; set; }
    public PayoutStatus Status { get; set; } = PayoutStatus.Scheduled;
    public DateTime ExpectedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Payment> Payments { get; set; } = [];
}

public class Review
{
    public Guid Id { get; set; }
    public Guid ClinicId { get; set; }
    public Clinic Clinic { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = default!;
    public int Rating { get; set; }
    public string BodyEn { get; set; } = default!;
    public string BodyAr { get; set; } = default!;
    public string? ReplyEn { get; set; }
    public string? ReplyAr { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
