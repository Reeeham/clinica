using Clinica.Application.DTOs;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public BillingController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet("payments")]
    public async Task<ActionResult<object>> ListPayments(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? method,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var q = _db.Payments
            .Include(p => p.Customer)
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded);

        if (from.HasValue) q = q.Where(p => p.PaidAt >= from.Value);
        if (to.HasValue) q = q.Where(p => p.PaidAt <= to.Value);
        if (!string.IsNullOrEmpty(method) && Enum.TryParse<PaymentMethod>(method, true, out var m))
            q = q.Where(p => p.Method == m);
        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            q = q.Where(p =>
                p.Ref.ToLower().Contains(term) ||
                (p.GatewayRef != null && p.GatewayRef.ToLower().Contains(term)) ||
                p.Customer.NameEn.ToLower().Contains(term) ||
                p.Customer.Phone.Contains(search));
        }

        var total = await q.CountAsync();
        var totalAmount = await q.SumAsync(p => p.Amount);
        var totalFees = await q.SumAsync(p => p.PlatformFee);

        var items = await q
            .OrderByDescending(p => p.PaidAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PaymentDto(
                p.Id, p.Ref, p.OrderId, p.CustomerId,
                p.Amount, p.Method, p.Status,
                p.PlatformFee, p.NetToClinic, p.PaidAt,
                p.GatewayRef, p.PayoutId))
            .ToListAsync();

        return Ok(new { items, total, totalAmount, totalFees, page, pageSize });
    }

    [HttpGet("outstanding")]
    public async Task<ActionResult<object>> ListOutstanding()
    {
        var orders = await _db.Orders
            .Include(o => o.Customer)
            .Where(o => o.ClinicId == ClinicId && o.Status != OrderStatus.Paid && o.Status != OrderStatus.Void)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id, o.Ref, o.CustomerId,
                CustomerName = o.Customer.NameEn,
                o.LinesJson, o.Discount, o.Status, o.CreatedAt,
                Payments = o.Payments
                    .Where(p => p.Status == PaymentStatus.Succeeded)
                    .Sum(p => p.Amount),
            })
            .ToListAsync();

        return Ok(new { items = orders });
    }

    [HttpGet("payouts")]
    public async Task<ActionResult<object>> ListPayouts()
    {
        var items = await _db.Payouts
            .Where(p => p.ClinicId == ClinicId)
            .OrderByDescending(p => p.PeriodStart)
            .Select(p => new PayoutDto(
                p.Id, p.PeriodStart, p.PeriodEnd,
                p.Gross, p.Fees, p.Net, p.Status, p.ExpectedAt))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("method-mix")]
    public async Task<ActionResult<object>> MethodMix([FromQuery] int days = 30)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var mix = await _db.Payments
            .Where(p => p.ClinicId == ClinicId && p.Status == PaymentStatus.Succeeded && p.PaidAt >= from)
            .GroupBy(p => p.Method)
            .Select(g => new { method = g.Key.ToString(), amount = g.Sum(p => p.Amount) })
            .OrderByDescending(x => x.amount)
            .ToListAsync();

        return Ok(new { items = mix });
    }
}
