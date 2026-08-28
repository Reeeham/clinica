using Clinica.Domain.Entities;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Route("api/public/bookings")]
public class PublicBookingsController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public PublicBookingsController(ClinicaDbContext db) => _db = db;

    private Guid UserId => Guid.Parse(User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!.Value);
    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    [Authorize(Policy = "Customer")]
    public async Task<ActionResult<object>> MyBookings([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = _db.Bookings
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Where(b => b.CustomerId == UserId);

        var total = await q.CountAsync();
        var rawItems = await q
            .OrderByDescending(b => b.StartsAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .ToListAsync();

        var items = rawItems.Select(b => new
        {
            b.Id, b.Ref, b.StartsAt, b.EndsAt,
            Status = b.Status.ToString(),
            Channel = b.Channel.ToString(),
            b.Price,
            b.SessionNumber, b.SessionTotal,
            service = new { b.Service.Id, b.Service.NameEn, b.Service.NameAr, b.Service.DurationMin },
            employee = new { b.Employee.Id, b.Employee.NameEn, b.Employee.NameAr, b.Employee.Color, b.Employee.Initials },
        }).ToList();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost]
    [Authorize(Policy = "Customer")]
    public async Task<ActionResult<object>> CreateBooking([FromBody] CustomerBookingDto dto)
    {
        var service = await _db.Services.FindAsync(dto.ServiceId);
        if (service == null || service.ClinicId != ClinicId || !service.Published)
            return BadRequest(new { error = "Invalid service" });

        Guid employeeId = dto.EmployeeId;
        if (employeeId == Guid.Empty)
        {
            var category = service.Category.ToString().ToLower();
            var autoEmployee = await _db.Employees
                .Where(e => e.ClinicId == ClinicId && e.Status == EmployeeStatus.Active
                    && e.Specialties.Contains(category))
                .OrderByDescending(e => e.Rating)
                .FirstOrDefaultAsync();

            if (autoEmployee == null)
                autoEmployee = await _db.Employees
                    .Where(e => e.ClinicId == ClinicId && e.Status == EmployeeStatus.Active)
                    .OrderByDescending(e => e.Rating)
                    .FirstOrDefaultAsync();

            if (autoEmployee == null)
                return BadRequest(new { error = "No available employees" });

            employeeId = autoEmployee.Id;
        }

        var employee = await _db.Employees.FindAsync(employeeId);
        if (employee == null || employee.ClinicId != ClinicId || employee.Status != EmployeeStatus.Active)
            return BadRequest(new { error = "Invalid employee" });

        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.ClinicId == ClinicId
            && r.Supports.Contains(service.Category.ToString().ToLower()));
        if (room == null)
            room = await _db.Rooms.FirstOrDefaultAsync(r => r.ClinicId == ClinicId);
        if (room == null)
            return BadRequest(new { error = "No available rooms" });

        var conflict = await _db.Bookings
            .AnyAsync(b => b.EmployeeId == employeeId
                && b.StartsAt < dto.StartsAt.AddMinutes(service.DurationMin)
                && dto.StartsAt < b.EndsAt
                && b.Status != BookingStatus.Cancelled);
        if (conflict)
            return Conflict(new { error = "Employee is not available at this time" });

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            Ref = $"APP-{DateTime.UtcNow:yyMMddHHmmss}",
            ClinicId = ClinicId,
            CustomerId = UserId,
            EmployeeId = employeeId,
            RoomId = room.Id,
            ServiceId = dto.ServiceId,
            StartsAt = dto.StartsAt,
            EndsAt = dto.StartsAt.AddMinutes(service.DurationMin),
            Status = BookingStatus.Pending,
            Channel = BookingChannel.App,
            Price = service.Price,
            Notes = dto.Notes,
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            booking.Id, booking.Ref,
            booking.StartsAt, booking.EndsAt,
            Status = booking.Status.ToString(),
            booking.Price,
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Customer")]
    public async Task<ActionResult> CancelBooking(Guid id)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == id && b.CustomerId == UserId);
        if (booking == null) return NotFound();

        if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.InProgress)
            return BadRequest(new { error = "Cannot cancel a completed or in-progress booking" });

        booking.Status = BookingStatus.Cancelled;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record CustomerBookingDto(Guid ServiceId, Guid EmployeeId, DateTime StartsAt, string? Notes);
