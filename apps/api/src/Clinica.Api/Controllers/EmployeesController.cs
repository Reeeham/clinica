using Clinica.Application.DTOs;
using Clinica.Domain.Entities;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Auth;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    public EmployeesController(ClinicaDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    public async Task<ActionResult<object>> List([FromQuery] string? role)
    {
        var q = _db.Employees
            .Include(e => e.Shifts)
            .Where(e => e.ClinicId == ClinicId);

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<EmployeeRole>(role, true, out var r))
            q = q.Where(e => e.Role == r);

        var items = await q
            .OrderBy(e => e.NameEn)
            .Select(e => new EmployeeDto(
                e.Id, e.NameEn, e.NameAr, e.Role,
                e.TitleEn, e.TitleAr, e.Phone, e.Email,
                e.Status, e.Salary, e.CommissionRate,
                e.Specialties, e.Color, e.Initials, e.Rating,
                e.CanLogin, e.HiredAt))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(Guid id)
    {
        var e = await _db.Employees
            .Include(e => e.Shifts)
            .Include(e => e.Bookings)
            .FirstOrDefaultAsync(e => e.Id == id && e.ClinicId == ClinicId);
        if (e == null) return NotFound();

        var from30 = DateTime.UtcNow.AddDays(-30);
        var completed = e.Bookings.Where(b => b.Status == BookingStatus.Completed && b.StartsAt >= from30);
        var revenue30d = completed.Sum(b => b.Price);
        var upcoming = e.Bookings.Count(b =>
            (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending) &&
            b.StartsAt >= DateTime.UtcNow);

        return Ok(new
        {
            employee = new EmployeeDto(
                e.Id, e.NameEn, e.NameAr, e.Role,
                e.TitleEn, e.TitleAr, e.Phone, e.Email,
                e.Status, e.Salary, e.CommissionRate,
                e.Specialties, e.Color, e.Initials, e.Rating,
                e.CanLogin, e.HiredAt),
            shifts = e.Shifts.Select(s => new { s.Day, s.From, s.To }),
            stats = new
            {
                sessions30d = completed.Count(),
                revenue30d,
                commission30d = (long)(revenue30d * e.CommissionRate),
                upcoming,
            },
        });
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeDto dto)
    {
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            Role = dto.Role,
            TitleEn = dto.TitleEn,
            TitleAr = dto.TitleAr,
            Phone = dto.Phone,
            Email = dto.Email,
            Status = EmployeeStatus.Active,
            HiredAt = DateTime.UtcNow,
            Salary = dto.Salary,
            CommissionRate = dto.CommissionRate,
            Specialties = dto.Specialties ?? [],
            Color = dto.Color ?? "#7A2F5F",
            Initials = dto.Initials ?? dto.NameEn[..2].ToUpper(),
            Rating = 0,
            CanLogin = dto.CanLogin,
            PasswordHash = dto.CanLogin && !string.IsNullOrEmpty(dto.Password)
                ? _passwordHasher.HashPassword(dto.Password)
                : null,
        };

        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = emp.Id }, new EmployeeDto(
            emp.Id, emp.NameEn, emp.NameAr, emp.Role,
            emp.TitleEn, emp.TitleAr, emp.Phone, emp.Email,
            emp.Status, emp.Salary, emp.CommissionRate,
            emp.Specialties, emp.Color, emp.Initials, emp.Rating,
            emp.CanLogin, emp.HiredAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, [FromBody] UpdateEmployeeDto dto)
    {
        var e = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id && e.ClinicId == ClinicId);
        if (e == null) return NotFound();

        if (dto.NameEn != null) e.NameEn = dto.NameEn;
        if (dto.NameAr != null) e.NameAr = dto.NameAr;
        if (dto.Phone != null) e.Phone = dto.Phone;
        if (dto.Email != null) e.Email = dto.Email;
        if (dto.CommissionRate.HasValue) e.CommissionRate = dto.CommissionRate.Value;
        if (dto.Salary.HasValue) e.Salary = dto.Salary.Value;
        if (dto.CanLogin.HasValue) e.CanLogin = dto.CanLogin.Value;
        if (!string.IsNullOrEmpty(dto.Password) && e.CanLogin)
            e.PasswordHash = _passwordHasher.HashPassword(dto.Password);

        await _db.SaveChangesAsync();

        return Ok(new EmployeeDto(
            e.Id, e.NameEn, e.NameAr, e.Role,
            e.TitleEn, e.TitleAr, e.Phone, e.Email,
            e.Status, e.Salary, e.CommissionRate,
            e.Specialties, e.Color, e.Initials, e.Rating,
            e.CanLogin, e.HiredAt));
    }

    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult> Deactivate(Guid id)
    {
        var e = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id && e.ClinicId == ClinicId);
        if (e == null) return NotFound();
        e.Status = EmployeeStatus.Inactive;
        e.CanLogin = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var e = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id && e.ClinicId == ClinicId);
        if (e == null) return NotFound();

        var hasBookings = await _db.Bookings.AnyAsync(b => b.EmployeeId == id);
        if (hasBookings)
            return BadRequest(new { error = "Cannot delete employee with existing bookings. Deactivate instead." });

        _db.Employees.Remove(e);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
