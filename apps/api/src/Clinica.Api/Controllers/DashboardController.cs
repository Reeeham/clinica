using Clinica.Domain.Enums;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public DashboardController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet("overview")]
    public async Task<ActionResult<object>> Overview([FromQuery] int days = 30)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var prevFrom = DateTime.UtcNow.AddDays(-days * 2);

        var revenue = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded && p.PaidAt >= from)
            .SumAsync(p => p.Amount);

        var prevRevenue = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded && p.PaidAt >= prevFrom && p.PaidAt < from)
            .SumAsync(p => p.Amount);

        var sessions = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && b.Status == BookingStatus.Completed && b.StartsAt >= from);

        var prevSessions = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && b.Status == BookingStatus.Completed && b.StartsAt >= prevFrom && b.StartsAt < from);

        var newCustomers = await _db.Customers
            .CountAsync(c => c.ClinicId == ClinicId && c.CreatedAt >= from);

        var platformFees = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.PaidAt >= from)
            .SumAsync(p => p.PlatformFee);

        var appBookings = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && b.Channel == BookingChannel.App && b.StartsAt >= from);

        var totalBookings = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && b.StartsAt >= from);

        var noShows = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && b.Status == BookingStatus.NoShow && b.StartsAt >= from);

        var completed = await _db.Bookings
            .CountAsync(b => b.ClinicId == ClinicId && (b.Status == BookingStatus.Completed || b.Status == BookingStatus.NoShow) && b.StartsAt >= from);

        return Ok(new
        {
            revenue = new { value = revenue, previous = prevRevenue, delta = prevRevenue == 0 ? 0 : (revenue - prevRevenue) / (double)prevRevenue },
            sessions = new { value = sessions, previous = prevSessions, delta = prevSessions == 0 ? 0 : (sessions - prevSessions) / (double)prevSessions },
            newCustomers = new { value = newCustomers },
            appShare = new { value = totalBookings == 0 ? 0 : appBookings / (double)totalBookings },
            platformFees,
            noShowRate = new { value = completed == 0 ? 0 : noShows / (double)completed },
            averageTicket = new { value = sessions == 0 ? 0 : revenue / sessions },
        });
    }

    [HttpGet("today")]
    public async Task<ActionResult<object>> Today()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var list = await _db.Bookings
            .Include(b => b.Service)
            .Where(b => b.ClinicId == ClinicId && b.StartsAt >= today && b.StartsAt < tomorrow)
            .ToListAsync();

        var completed = list.Count(b => b.Status == BookingStatus.Completed);
        var active = list.Count(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.CheckedIn || b.Status == BookingStatus.Pending || b.Status == BookingStatus.InProgress);
        var inProgress = list.Count(b => b.Status == BookingStatus.InProgress);
        var pending = list.Count(b => b.Status == BookingStatus.Pending);

        var expectedRevenue = list.Where(b => b.Status != BookingStatus.Cancelled).Sum(b => b.Price);
        var collected = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded && p.PaidAt >= today && p.PaidAt < tomorrow)
            .SumAsync(p => p.Amount);

        return Ok(new
        {
            total = list.Count,
            completed,
            remaining = active,
            inProgress,
            awaitingConfirmation = pending,
            expectedRevenue,
            collected,
        });
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<object>> Upcoming([FromQuery] int limit = 6)
    {
        var now = DateTime.UtcNow;
        var items = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Where(b => b.ClinicId == ClinicId
                && b.StartsAt >= now
                && (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending || b.Status == BookingStatus.CheckedIn))
            .OrderBy(b => b.StartsAt)
            .Take(limit)
            .Select(b => new
            {
                b.Id, b.Ref, b.StartsAt, b.EndsAt,
                b.Status, b.Channel,
                Customer = new { b.Customer.Id, b.Customer.NameEn, b.Customer.NameAr, b.Customer.Phone, b.Customer.Color, b.Customer.Initials },
                Service = new { b.Service.Id, b.Service.NameEn, b.Service.NameAr, b.Service.DurationMin },
                Employee = new { b.Employee.Id, b.Employee.NameEn, b.Employee.Initials, b.Employee.Color },
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("revenue-series")]
    public async Task<ActionResult<object>> RevenueSeries([FromQuery] int days = 30)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var payments = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded && p.PaidAt >= from)
            .ToListAsync();

        var points = new List<object>();
        for (int i = days - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddDays(-i).Date;
            var dayPayments = payments.Where(p => p.PaidAt.Date == date);
            points.Add(new
            {
                date = date.ToString("yyyy-MM-dd"),
                value = dayPayments.Sum(p => p.Amount),
                secondary = dayPayments.Where(p => p.Method == PaymentMethod.AppOnline).Sum(p => p.Amount),
            });
        }

        return Ok(new { items = points });
    }

    [HttpGet("top-services")]
    public async Task<ActionResult<object>> TopServices([FromQuery] int days = 30, [FromQuery] int limit = 5)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var items = await _db.Bookings
            .Include(b => b.Service)
            .Where(b => b.ClinicId == ClinicId && b.Status == BookingStatus.Completed && b.StartsAt >= from)
            .GroupBy(b => new { b.Service.Id, b.Service.NameEn, b.Service.NameAr })
            .Select(g => new
            {
                serviceId = g.Key.Id,
                nameEn = g.Key.NameEn,
                nameAr = g.Key.NameAr,
                sessions = g.Count(),
                revenue = g.Sum(b => b.Price),
            })
            .OrderByDescending(x => x.revenue)
            .Take(limit)
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("channel-mix")]
    public async Task<ActionResult<object>> ChannelMix([FromQuery] int days = 30)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var mix = await _db.Bookings
            .Where(b => b.ClinicId == ClinicId && b.StartsAt >= from)
            .GroupBy(b => b.Channel)
            .Select(g => new { channel = g.Key.ToString(), count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(new { items = mix });
    }
}
