namespace Clinica.Domain.Enums;

public enum ServiceCategory
{
    Laser,
    Skin,
    Injectables,
    Body,
    Hair,
    Nails,
    Consultation,
}

public enum EmployeeRole
{
    Owner,
    Manager,
    Receptionist,
    Doctor,
    Therapist,
}

public enum EmployeeStatus
{
    Active,
    OnLeave,
    Inactive,
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    CheckedIn,
    InProgress,
    Completed,
    NoShow,
    Cancelled,
}

public enum BookingChannel
{
    App,
    WalkIn,
    Phone,
    Instagram,
}

public enum CustomerSource
{
    App,
    WalkIn,
    Instagram,
    Referral,
    Phone,
}

public enum EntitlementStatus
{
    Active,
    Completed,
    Expired,
    Frozen,
}

public enum OrderStatus
{
    Open,
    PartiallyPaid,
    Paid,
    Refunded,
    Void,
}

public enum OrderLineKind
{
    Service,
    Package,
    Product,
}

public enum PaymentMethod
{
    Cash,
    Card,
    Instapay,
    Wallet,
    AppOnline,
}

public enum PaymentStatus
{
    Succeeded,
    Pending,
    Failed,
    Refunded,
}

public enum PayoutStatus
{
    Scheduled,
    Processing,
    Paid,
}

public enum OfferKind
{
    Percent,
    Amount,
    FreeSession,
}

public enum SkinType
{
    I,
    II,
    III,
    IV,
    V,
    VI,
}

public enum ClinicPlan
{
    Starter,
    Growth,
    Enterprise,
}
