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
public class BookingsController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public BookingsController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? status,
        [FromQuery] Guid? employeeId,
        [FromQuery] Guid? customerId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var q = _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Employee)
            .Include(b => b.Service)
            .Include(b => b.Room)
            .Where(b => b.ClinicId == ClinicId)
            .AsQueryable();

        if (date.HasValue)
            q = q.Where(b => b.StartsAt.Date == date.Value.Date);
        if (from.HasValue)
            q = q.Where(b => b.StartsAt >= from.Value);
        if (to.HasValue)
            q = q.Where(b => b.StartsAt <= to.Value);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<BookingStatus>(status, true, out var st))
            q = q.Where(b => b.Status == st);
        if (employeeId.HasValue)
            q = q.Where(b => b.EmployeeId == employeeId);
        if (customerId.HasValue)
            q = q.Where(b => b.CustomerId == customerId);
        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            q = q.Where(b =>
                b.Ref.ToLower().Contains(term) ||
                b.Customer.NameEn.ToLower().Contains(term) ||
                b.Customer.NameAr.Contains(search) ||
                b.Customer.Phone.Contains(search) ||
                b.Service.NameEn.ToLower().Contains(term) ||
                b.Service.NameAr.Contains(search));
        }

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(b => b.StartsAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BookingDto(
                b.Id, b.Ref, b.CustomerId, b.EmployeeId, b.RoomId,
                b.ServiceId, b.EntitlementId, b.StartsAt, b.EndsAt,
                b.Status, b.Channel, b.Price, b.Notes,
                b.SessionNumber, b.SessionTotal, b.CreatedAt))
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetById(Guid id)
    {
        var b = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Employee)
            .Include(b => b.Service)
            .Include(b => b.Room)
            .FirstOrDefaultAsync(b => b.Id == id && b.ClinicId == ClinicId);
        if (b == null) return NotFound();
        return Ok(new BookingDto(
            b.Id, b.Ref, b.CustomerId, b.EmployeeId, b.RoomId,
            b.ServiceId, b.EntitlementId, b.StartsAt, b.EndsAt,
            b.Status, b.Channel, b.Price, b.Notes,
            b.SessionNumber, b.SessionTotal, b.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create([FromBody] CreateBookingDto dto)
    {
        var service = await _db.Services.FindAsync(dto.ServiceId);
        if (service == null || service.ClinicId != ClinicId)
            return BadRequest(new { error = "Invalid service" });

        var employee = await _db.Employees.FindAsync(dto.EmployeeId);
        if (employee == null || employee.ClinicId != ClinicId)
            return BadRequest(new { error = "Invalid employee" });

        var room = await _db.Rooms.FindAsync(dto.RoomId);
        if (room == null || room.ClinicId != ClinicId)
            return BadRequest(new { error = "Invalid room" });

        var customer = await _db.Customers.FindAsync(dto.CustomerId);
        if (customer == null || customer.ClinicId != ClinicId)
            return BadRequest(new { error = "Invalid customer" });

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            Ref = $"NA-{DateTime.UtcNow:yyMMddHHmmss}",
            ClinicId = ClinicId,
            CustomerId = dto.CustomerId,
            EmployeeId = dto.EmployeeId,
            RoomId = dto.RoomId,
            ServiceId = dto.ServiceId,
            StartsAt = dto.StartsAt,
            EndsAt = dto.StartsAt.AddMinutes(service.DurationMin),
            Status = BookingStatus.Pending,
            Channel = dto.Channel,
            Price = dto.UseEntitlement ? 0 : service.Price,
            Notes = dto.Notes,
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, new BookingDto(
            booking.Id, booking.Ref, booking.CustomerId, booking.EmployeeId,
            booking.RoomId, booking.ServiceId, booking.EntitlementId,
            booking.StartsAt, booking.EndsAt, booking.Status, booking.Channel,
            booking.Price, booking.Notes, booking.SessionNumber, booking.SessionTotal,
            booking.CreatedAt));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ClinicId == ClinicId);
        if (booking == null) return NotFound();

        if (!Enum.TryParse<BookingStatus>(dto.Status, true, out var status))
            return BadRequest(new { error = "Invalid status" });

        booking.Status = status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ClinicId == ClinicId);
        if (booking == null) return NotFound();
        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
