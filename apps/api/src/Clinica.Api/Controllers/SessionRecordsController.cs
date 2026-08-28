using Clinica.Application.DTOs;
using Clinica.Domain.Entities;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/sessions")]
public class SessionRecordsController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public SessionRecordsController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    public async Task<ActionResult<object>> ListSessions(
        [FromQuery] Guid? customerId,
        [FromQuery] Guid? employeeId,
        [FromQuery] Guid? serviceId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = _db.SessionRecords
            .Include(s => s.Customer)
            .Include(s => s.Employee)
            .Include(s => s.Service)
            .Where(s => s.ClinicId == ClinicId);

        if (customerId.HasValue) q = q.Where(s => s.CustomerId == customerId.Value);
        if (employeeId.HasValue) q = q.Where(s => s.EmployeeId == employeeId.Value);
        if (serviceId.HasValue) q = q.Where(s => s.ServiceId == serviceId.Value);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(s => s.PerformedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.Id, s.BookingId, s.CustomerId, s.ServiceId, s.EmployeeId,
                s.PerformedAt, s.Areas, s.ParametersJson,
                s.OutcomeEn, s.OutcomeAr, s.Reaction,
                s.Satisfaction, s.NextDueAt, s.Notes, s.CreatedAt,
                customer = new { s.Customer.Id, s.Customer.NameEn, s.Customer.NameAr, s.Customer.Color, s.Customer.Initials },
                employee = new { s.Employee.Id, s.Employee.NameEn, s.Employee.NameAr, s.Employee.Color, s.Employee.Initials },
                service = new { s.Service.Id, s.Service.NameEn, s.Service.NameAr },
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetSession(Guid id)
    {
        var s = await _db.SessionRecords
            .Include(s => s.Customer)
            .Include(s => s.Employee)
            .Include(s => s.Service)
            .FirstOrDefaultAsync(s => s.Id == id && s.ClinicId == ClinicId);
        if (s == null) return NotFound();

        return Ok(new
        {
            s.Id, s.BookingId, s.CustomerId, s.ServiceId, s.EmployeeId,
            s.PerformedAt, s.Areas, s.ParametersJson,
            s.OutcomeEn, s.OutcomeAr, s.Reaction,
            s.Satisfaction, s.NextDueAt, s.Notes, s.CreatedAt,
            customer = new { s.Customer.Id, s.Customer.NameEn, s.Customer.NameAr, s.Customer.Color, s.Customer.Initials },
            employee = new { s.Employee.Id, s.Employee.NameEn, s.Employee.NameAr, s.Employee.Color, s.Employee.Initials },
            service = new { s.Service.Id, s.Service.NameEn, s.Service.NameAr },
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateSession([FromBody] CreateSessionRecordDto dto)
    {
        var session = new SessionRecord
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            BookingId = dto.BookingId,
            CustomerId = dto.CustomerId,
            ServiceId = dto.ServiceId,
            EmployeeId = dto.EmployeeId,
            PerformedAt = dto.PerformedAt,
            Areas = dto.Areas ?? [],
            ParametersJson = dto.ParametersJson ?? "{}",
            OutcomeEn = dto.OutcomeEn,
            OutcomeAr = dto.OutcomeAr,
            Reaction = dto.Reaction,
            Satisfaction = dto.Satisfaction,
            NextDueAt = dto.NextDueAt,
            Notes = dto.Notes,
        };

        _db.SessionRecords.Add(session);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            session.Id, session.BookingId, session.CustomerId, session.ServiceId, session.EmployeeId,
            session.PerformedAt, session.Areas, session.ParametersJson,
            session.OutcomeEn, session.OutcomeAr, session.Reaction,
            session.Satisfaction, session.NextDueAt, session.Notes, session.CreatedAt,
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<object>> UpdateSession(Guid id, [FromBody] UpdateSessionRecordDto dto)
    {
        var s = await _db.SessionRecords.FirstOrDefaultAsync(s => s.Id == id && s.ClinicId == ClinicId);
        if (s == null) return NotFound();

        if (dto.Areas != null) s.Areas = dto.Areas;
        if (dto.ParametersJson != null) s.ParametersJson = dto.ParametersJson;
        if (dto.OutcomeEn != null) s.OutcomeEn = dto.OutcomeEn;
        if (dto.OutcomeAr != null) s.OutcomeAr = dto.OutcomeAr;
        if (dto.Reaction != null) s.Reaction = dto.Reaction;
        if (dto.Satisfaction.HasValue) s.Satisfaction = dto.Satisfaction.Value;
        if (dto.NextDueAt.HasValue) s.NextDueAt = dto.NextDueAt.Value;
        if (dto.Notes != null) s.Notes = dto.Notes;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            s.Id, s.BookingId, s.CustomerId, s.ServiceId, s.EmployeeId,
            s.PerformedAt, s.Areas, s.ParametersJson,
            s.OutcomeEn, s.OutcomeAr, s.Reaction,
            s.Satisfaction, s.NextDueAt, s.Notes, s.CreatedAt,
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSession(Guid id)
    {
        var s = await _db.SessionRecords.FirstOrDefaultAsync(s => s.Id == id && s.ClinicId == ClinicId);
        if (s == null) return NotFound();

        _db.SessionRecords.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
