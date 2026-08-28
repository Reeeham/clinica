using Clinica.Application.DTOs;
using Clinica.Domain.Entities;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public SettingsController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet]
    public async Task<ActionResult<object>> Get()
    {
        var clinic = await _db.Clinics
            .Include(c => c.Hours)
            .Include(c => c.Rooms)
            .FirstOrDefaultAsync(c => c.Id == ClinicId);
        if (clinic == null) return NotFound();

        return Ok(new
        {
            clinic.Id,
            clinic.Slug,
            clinic.NameEn, clinic.NameAr,
            clinic.TaglineEn, clinic.TaglineAr,
            clinic.AboutEn, clinic.AboutAr,
            clinic.CityEn, clinic.CityAr,
            clinic.AreaEn, clinic.AreaAr,
            clinic.AddressEn, clinic.AddressAr,
            clinic.Phone, clinic.Whatsapp,
            clinic.Palette,
            clinic.Specialties,
            clinic.Plan,
            hours = clinic.Hours.OrderBy(h => h.Day).Select(h => new { h.Day, h.Open, h.Close }),
            rooms = clinic.Rooms.Select(r => new { r.Id, r.NameEn, r.NameAr, r.Supports }),
        });
    }

    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Id == ClinicId);
        if (clinic == null) return NotFound();

        if (dto.NameEn != null) clinic.NameEn = dto.NameEn;
        if (dto.NameAr != null) clinic.NameAr = dto.NameAr;
        if (dto.TaglineEn != null) clinic.TaglineEn = dto.TaglineEn;
        if (dto.TaglineAr != null) clinic.TaglineAr = dto.TaglineAr;
        if (dto.AboutEn != null) clinic.AboutEn = dto.AboutEn;
        if (dto.AboutAr != null) clinic.AboutAr = dto.AboutAr;
        if (dto.Phone != null) clinic.Phone = dto.Phone;
        if (dto.Whatsapp != null) clinic.Whatsapp = dto.Whatsapp;
        if (dto.AddressEn != null) clinic.AddressEn = dto.AddressEn;
        if (dto.AddressAr != null) clinic.AddressAr = dto.AddressAr;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("hours")]
    public async Task<ActionResult> UpdateHours([FromBody] List<HoursDto> hours)
    {
        var existing = await _db.OpeningHours.Where(h => h.ClinicId == ClinicId).ToListAsync();
        _db.OpeningHours.RemoveRange(existing);

        foreach (var h in hours)
        {
            _db.OpeningHours.Add(new OpeningHours
            {
                Id = Guid.NewGuid(),
                ClinicId = ClinicId,
                Day = h.Day,
                Open = h.Open,
                Close = h.Close,
            });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("rooms")]
    public async Task<ActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var room = new Room
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            Supports = dto.Supports ?? [],
        };
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();
        return Ok(new { room.Id, room.NameEn, room.NameAr, room.Supports });
    }

    [HttpDelete("rooms/{id}")]
    public async Task<ActionResult> DeleteRoom(Guid id)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == id && r.ClinicId == ClinicId);
        if (room == null) return NotFound();
        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
