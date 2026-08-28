using Clinica.Application.DTOs;
using Clinica.Domain.Entities;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public CustomersController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] string? search,
        [FromQuery] string? source,
        [FromQuery] string? status,
        [FromQuery] string? filter,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var q = _db.Customers.Where(c => c.ClinicId == ClinicId);

        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            q = q.Where(c =>
                c.NameEn.ToLower().Contains(term) ||
                c.NameAr.Contains(search) ||
                c.Phone.Contains(search) ||
                (c.Email != null && c.Email.ToLower().Contains(term)));
        }

        if (!string.IsNullOrEmpty(source) && Enum.TryParse<CustomerSource>(source, true, out var src))
            q = q.Where(c => c.Source == src);

        // Status filter: "active" (default), "inactive", "all"
        if (status == "all")
            q = q.Where(c => true);
        else if (status == "inactive")
            q = q.Where(c => !c.Active);
        else
            q = q.Where(c => c.Active);

        // Additional filters
        if (filter == "new")
            q = q.Where(c => c.CreatedAt >= DateTime.UtcNow.AddDays(-30));
        else if (filter == "lapsed")
            q = q.Where(c => !c.Active);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerDto(
                c.Id, c.NameEn, c.NameAr, c.Phone, c.Email,
                c.Gender, c.BirthDate, c.SkinType,
                c.Allergies, c.Conditions, c.Notes,
                c.Tags, c.Source, c.MarketingOptIn,
                c.Active, c.CreatedAt, c.Color, c.Initials))
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(Guid id)
    {
        var c = await _db.Customers
            .Include(c => c.Bookings)
            .Include(c => c.Entitlements)
            .FirstOrDefaultAsync(c => c.Id == id && c.ClinicId == ClinicId);
        if (c == null) return NotFound();

        var completedBookings = c.Bookings.Where(b => b.Status == BookingStatus.Completed).Count();
        var lastVisit = c.Bookings
            .Where(b => b.Status == BookingStatus.Completed)
            .Max(b => (DateTime?)b.StartsAt);
        var nextVisit = c.Bookings
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending)
            .Min(b => (DateTime?)b.StartsAt);
        var noShows = c.Bookings.Count(b => b.Status == BookingStatus.NoShow);
        var activePackages = c.Entitlements.Count(e => e.Status == EntitlementStatus.Active);

        return Ok(new
        {
            customer = new CustomerDto(
                c.Id, c.NameEn, c.NameAr, c.Phone, c.Email,
                c.Gender, c.BirthDate, c.SkinType,
                c.Allergies, c.Conditions, c.Notes,
                c.Tags, c.Source, c.MarketingOptIn,
                c.Active, c.CreatedAt, c.Color, c.Initials),
            stats = new
            {
                visits = completedBookings,
                lastVisit,
                nextVisit,
                noShows,
                activePackages,
            },
            bookings = c.Bookings
                .OrderByDescending(b => b.StartsAt)
                .Select(b => new BookingDto(
                    b.Id, b.Ref, b.CustomerId, b.EmployeeId, b.RoomId,
                    b.ServiceId, b.EntitlementId, b.StartsAt, b.EndsAt,
                    b.Status, b.Channel, b.Price, b.Notes,
                    b.SessionNumber, b.SessionTotal, b.CreatedAt)),
            entitlements = c.Entitlements.Select(e => new
            {
                e.Id, e.PackageId, e.Status, e.PurchasedAt, e.ExpiresAt, e.BalanceJson,
            }),
        });
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create([FromBody] CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            Phone = dto.Phone,
            Email = dto.Email,
            Gender = dto.Gender ?? "female",
            BirthDate = dto.BirthDate,
            SkinType = dto.SkinType,
            Allergies = dto.Allergies ?? [],
            Conditions = dto.Conditions ?? [],
            Notes = dto.Notes,
            Tags = dto.Tags ?? [],
            Source = dto.Source,
            MarketingOptIn = dto.MarketingOptIn,
            Active = true,
            Color = dto.Color ?? "#7A2F5F",
            Initials = dto.Initials ?? dto.NameEn[..2].ToUpper(),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, new CustomerDto(
            customer.Id, customer.NameEn, customer.NameAr, customer.Phone, customer.Email,
            customer.Gender, customer.BirthDate, customer.SkinType,
            customer.Allergies, customer.Conditions, customer.Notes,
            customer.Tags, customer.Source, customer.MarketingOptIn,
            customer.Active, customer.CreatedAt, customer.Color, customer.Initials));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> Update(Guid id, [FromBody] UpdateCustomerDto dto)
    {
        var c = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.ClinicId == ClinicId);
        if (c == null) return NotFound();

        if (dto.NameEn != null) c.NameEn = dto.NameEn;
        if (dto.NameAr != null) c.NameAr = dto.NameAr;
        if (dto.Phone != null) c.Phone = dto.Phone;
        if (dto.Email != null) c.Email = dto.Email;
        if (dto.Notes != null) c.Notes = dto.Notes;
        if (dto.Tags != null) c.Tags = dto.Tags;
        if (dto.MarketingOptIn.HasValue) c.MarketingOptIn = dto.MarketingOptIn.Value;

        await _db.SaveChangesAsync();

        return Ok(new CustomerDto(
            c.Id, c.NameEn, c.NameAr, c.Phone, c.Email,
            c.Gender, c.BirthDate, c.SkinType,
            c.Allergies, c.Conditions, c.Notes,
            c.Tags, c.Source, c.MarketingOptIn,
            c.Active, c.CreatedAt, c.Color, c.Initials));
    }

    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult> Deactivate(Guid id)
    {
        var c = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.ClinicId == ClinicId);
        if (c == null) return NotFound();
        c.Active = false;
        c.DeactivatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/activate")]
    public async Task<ActionResult> Activate(Guid id)
    {
        var c = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.ClinicId == ClinicId);
        if (c == null) return NotFound();
        c.Active = true;
        c.DeactivatedAt = null;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
