using Clinica.Domain.Enums;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Route("api/public/[controller]")]
public class ClinicsController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public ClinicsController(ClinicaDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] string? city,
        [FromQuery] string? area,
        [FromQuery] string? specialty,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = _db.Clinics.AsQueryable();

        if (!string.IsNullOrEmpty(city))
            q = q.Where(c => c.CityEn.ToLower() == city.ToLower());
        if (!string.IsNullOrEmpty(area))
            q = q.Where(c => c.AreaEn.ToLower() == area.ToLower());
        if (!string.IsNullOrEmpty(specialty))
            q = q.Where(c => c.Specialties.Contains(specialty));

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(c => c.Verified)
            .ThenByDescending(c => c.Rating)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id, c.Slug, c.NameEn, c.NameAr,
                c.TaglineEn, c.TaglineAr,
                c.CityEn, c.CityAr, c.AreaEn, c.AreaAr,
                c.Rating, c.ReviewCount, c.Verified,
                c.Palette, c.Specialties,
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<object>> GetBySlug(string slug)
    {
        var clinic = await _db.Clinics
            .Include(c => c.Hours)
            .Include(c => c.Rooms)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (clinic == null) return NotFound();

        var services = await _db.Services
            .Where(s => s.ClinicId == clinic.Id && s.Published)
            .Select(s => new
            {
                s.Id, s.NameEn, s.NameAr, s.Category,
                s.DescriptionEn, s.DescriptionAr,
                s.DurationMin, s.Price, s.RecommendedSessions,
                s.Device, s.RequiresDoctor,
            })
            .ToListAsync();

        var packages = await _db.Packages
            .Where(p => p.ClinicId == clinic.Id && p.Published)
            .Select(p => new
            {
                p.Id, p.NameEn, p.NameAr,
                p.DescriptionEn, p.DescriptionAr,
                p.Price, p.ListPrice, p.ValidityDays,
                p.Featured, p.SoldCount,
            })
            .ToListAsync();

        var offers = await _db.Offers
            .Where(o => o.ClinicId == clinic.Id && o.Published
                && o.StartsAt <= DateTime.UtcNow && o.EndsAt >= DateTime.UtcNow)
            .Select(o => new
            {
                o.Id, o.TitleEn, o.TitleAr,
                o.DescriptionEn, o.DescriptionAr,
                o.Kind, o.Value, o.Code,
            })
            .ToListAsync();

        var reviews = await _db.Reviews
            .Where(r => r.ClinicId == clinic.Id)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
            .Select(r => new
            {
                r.Id, r.Rating, r.BodyEn, r.BodyAr,
                r.ReplyEn, r.ReplyAr, r.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            clinic = new
            {
                clinic.Id, clinic.Slug,
                clinic.NameEn, clinic.NameAr,
                clinic.TaglineEn, clinic.TaglineAr,
                clinic.AboutEn, clinic.AboutAr,
                clinic.CityEn, clinic.CityAr,
                clinic.AreaEn, clinic.AreaAr,
                clinic.AddressEn, clinic.AddressAr,
                clinic.Lat, clinic.Lng,
                clinic.Phone, clinic.Whatsapp,
                clinic.Rating, clinic.ReviewCount, clinic.Verified,
                clinic.Palette, clinic.AmenitiesEn, clinic.AmenitiesAr,
                clinic.Specialties,
                hours = clinic.Hours.OrderBy(h => h.Day).Select(h => new { h.Day, h.Open, h.Close }),
            },
            services,
            packages,
            offers,
            reviews,
        });
    }

    [HttpGet("{slug}/services")]
    public async Task<ActionResult<object>> GetServices(string slug, [FromQuery] string? category)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Slug == slug);
        if (clinic == null) return NotFound();

        var q = _db.Services.Where(s => s.ClinicId == clinic.Id && s.Published);

        if (!string.IsNullOrEmpty(category) && Enum.TryParse<ServiceCategory>(category, true, out var cat))
            q = q.Where(s => s.Category == cat);

        var items = await q
            .OrderByDescending(s => s.Demand30d)
            .Select(s => new
            {
                s.Id, s.NameEn, s.NameAr, s.Category,
                s.DescriptionEn, s.DescriptionAr,
                s.DurationMin, s.Price, s.RecommendedSessions,
                s.Device, s.RequiresDoctor,
                s.AftercareEn, s.AftercareAr,
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{slug}/packages")]
    public async Task<ActionResult<object>> GetPackages(string slug)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Slug == slug);
        if (clinic == null) return NotFound();

        var items = await _db.Packages
            .Include(p => p.Items)
            .Where(p => p.ClinicId == clinic.Id && p.Published)
            .OrderByDescending(p => p.Featured)
            .ThenByDescending(p => p.SoldCount)
            .Select(p => new
            {
                p.Id, p.NameEn, p.NameAr,
                p.DescriptionEn, p.DescriptionAr,
                p.Price, p.ListPrice, p.ValidityDays,
                p.Featured, p.SoldCount,
                items = p.Items.Select(i => new { i.ServiceId, i.Sessions }),
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{slug}/offers")]
    public async Task<ActionResult<object>> GetOffers(string slug)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Slug == slug);
        if (clinic == null) return NotFound();

        var items = await _db.Offers
            .Where(o => o.ClinicId == clinic.Id && o.Published
                && o.StartsAt <= DateTime.UtcNow && o.EndsAt >= DateTime.UtcNow)
            .Select(o => new
            {
                o.Id, o.TitleEn, o.TitleAr,
                o.DescriptionEn, o.DescriptionAr,
                o.Kind, o.Value, o.Code,
                o.EndsAt,
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{slug}/employees")]
    public async Task<ActionResult<object>> GetEmployees(string slug, [FromQuery] string? category)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Slug == slug);
        if (clinic == null) return NotFound();

        var q = _db.Employees.Where(e => e.ClinicId == clinic.Id && e.Status == EmployeeStatus.Active);

        if (!string.IsNullOrEmpty(category))
            q = q.Where(e => e.Specialties.Contains(category.ToLower()));

        var items = await q
            .OrderByDescending(e => e.Rating)
            .Select(e => new
            {
                e.Id, e.NameEn, e.NameAr, e.TitleEn, e.TitleAr,
                e.Role, e.Specialties, e.Color, e.Initials, e.Rating,
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{slug}/reviews")]
    public async Task<ActionResult<object>> GetReviews(string slug, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Slug == slug);
        if (clinic == null) return NotFound();

        var q = _db.Reviews.Where(r => r.ClinicId == clinic.Id);
        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id, r.Rating, r.BodyEn, r.BodyAr,
                r.ReplyEn, r.ReplyAr, r.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }
}
