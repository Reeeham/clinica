using Clinica.Domain.Entities;

namespace Clinica.Application.Interfaces;

public interface IClinicRepository
{
    Task<Clinic?> GetByIdAsync(Guid id);
    Task<Clinic?> GetBySlugAsync(string slug);
    Task<List<Clinic>> ListAsync();
}

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id);
    Task<List<Booking>> ListAsync(BookingQuery query);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
    Task DeleteAsync(Guid id);
}

public class BookingQuery
{
    public Guid? ClinicId { get; set; }
    public DateTime? Date { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public List<Domain.Enums.BookingStatus>? Statuses { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? RoomId { get; set; }
    public List<Domain.Enums.BookingChannel>? Channels { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(Guid id);
    Task<List<Customer>> ListAsync(CustomerQuery query);
    Task<Customer> CreateAsync(Customer customer);
    Task<Customer> UpdateAsync(Customer customer);
    Task DeactivateAsync(Guid id);
}

public class CustomerQuery
{
    public Guid? ClinicId { get; set; }
    public string? Search { get; set; }
    public string? Source { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id);
    Task<List<Employee>> ListAsync(Guid clinicId);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task DeactivateAsync(Guid id);
    Task DeleteAsync(Guid id);
}

public interface IServiceRepository
{
    Task<Service?> GetByIdAsync(Guid id);
    Task<List<Service>> ListAsync(Guid clinicId);
    Task<Service> CreateAsync(Service service);
    Task<Service> UpdateAsync(Service service);
    Task DeleteAsync(Guid id);
}

public interface IPackageRepository
{
    Task<Package?> GetByIdAsync(Guid id);
    Task<List<Package>> ListAsync(Guid clinicId);
    Task<Package> CreateAsync(Package package);
    Task<Package> UpdateAsync(Package package);
    Task DeleteAsync(Guid id);
}

public interface IPaymentRepository
{
    Task<List<Payment>> ListAsync(PaymentQuery query);
    Task<Payment> CreateAsync(Payment payment);
}

public class PaymentQuery
{
    public Guid? ClinicId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public List<Domain.Enums.PaymentMethod>? Methods { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<List<Order>> ListAsync(Guid clinicId);
    Task<List<Order>> ListOpenOrdersAsync(Guid clinicId);
    Task<Order> CreateAsync(Order order);
}

public interface IOfferRepository
{
    Task<List<Offer>> ListAsync(Guid clinicId);
    Task<Offer> CreateAsync(Offer offer);
    Task<Offer> UpdateAsync(Offer offer);
    Task DeleteAsync(Guid id);
}

public interface IReviewRepository
{
    Task<List<Review>> ListAsync(Guid clinicId);
}

public interface IPayoutRepository
{
    Task<List<Payout>> ListAsync(Guid clinicId);
}

public interface IEntitlementRepository
{
    Task<List<Entitlement>> ListByCustomerAsync(Guid customerId);
    Task<Entitlement?> GetByIdAsync(Guid id);
}
