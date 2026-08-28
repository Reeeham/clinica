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
public class CatalogController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    public CatalogController(ClinicaDbContext db) => _db = db;

    private Guid ClinicId => Guid.Parse(User.FindFirst("clinicId")!.Value);

    [HttpGet("services")]
    public async Task<ActionResult<object>> ListServices([FromQuery] string? category)
    {
        var q = _db.Services.Where(s => s.ClinicId == ClinicId);

        if (!string.IsNullOrEmpty(category) && Enum.TryParse<ServiceCategory>(category, true, out var cat))
            q = q.Where(s => s.Category == cat);

        var items = await q
            .OrderByDescending(s => s.Demand30d)
            .Select(s => new ServiceDto(
                s.Id, s.NameEn, s.NameAr, s.Category,
                s.DescriptionEn, s.DescriptionAr, s.DurationMin,
                s.Price, s.RecommendedSessions, s.Device,
                s.RequiresDoctor, s.Published, s.Demand30d))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpPost("services")]
    public async Task<ActionResult<ServiceDto>> CreateService([FromBody] CreateServiceDto dto)
    {
        var svc = new Service
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            Category = dto.Category,
            DescriptionEn = dto.DescriptionEn,
            DescriptionAr = dto.DescriptionAr,
            DurationMin = dto.DurationMin,
            Price = dto.Price,
            RecommendedSessions = dto.RecommendedSessions,
            Device = dto.Device,
            RequiresDoctor = dto.RequiresDoctor,
            AftercareEn = dto.AftercareEn ?? "",
            AftercareAr = dto.AftercareAr ?? "",
            Published = true,
            Demand30d = 0,
        };

        _db.Services.Add(svc);
        await _db.SaveChangesAsync();

        return Ok(new ServiceDto(
            svc.Id, svc.NameEn, svc.NameAr, svc.Category,
            svc.DescriptionEn, svc.DescriptionAr, svc.DurationMin,
            svc.Price, svc.RecommendedSessions, svc.Device,
            svc.RequiresDoctor, svc.Published, svc.Demand30d));
    }

    [HttpPut("services/{id}")]
    public async Task<ActionResult<ServiceDto>> UpdateService(Guid id, [FromBody] UpdateServiceDto dto)
    {
        var s = await _db.Services.FirstOrDefaultAsync(s => s.Id == id && s.ClinicId == ClinicId);
        if (s == null) return NotFound();

        if (dto.NameEn != null) s.NameEn = dto.NameEn;
        if (dto.NameAr != null) s.NameAr = dto.NameAr;
        if (dto.Price.HasValue) s.Price = dto.Price.Value;
        if (dto.DurationMin.HasValue) s.DurationMin = dto.DurationMin.Value;
        if (dto.Published.HasValue) s.Published = dto.Published.Value;

        await _db.SaveChangesAsync();

        return Ok(new ServiceDto(
            s.Id, s.NameEn, s.NameAr, s.Category,
            s.DescriptionEn, s.DescriptionAr, s.DurationMin,
            s.Price, s.RecommendedSessions, s.Device,
            s.RequiresDoctor, s.Published, s.Demand30d));
    }

    [HttpDelete("services/{id}")]
    public async Task<ActionResult> DeleteService(Guid id)
    {
        var s = await _db.Services.FirstOrDefaultAsync(s => s.Id == id && s.ClinicId == ClinicId);
        if (s == null) return NotFound();
        _db.Services.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("packages")]
    public async Task<ActionResult<object>> ListPackages()
    {
        var items = await _db.Packages
            .Include(p => p.Items)
            .Where(p => p.ClinicId == ClinicId)
            .OrderByDescending(p => p.SoldCount)
            .Select(p => new PackageDto(
                p.Id, p.NameEn, p.NameAr, p.DescriptionEn,
                p.DescriptionAr, p.Price, p.ListPrice, p.ValidityDays,
                p.Published, p.Featured, p.SoldCount,
                p.Items.Select(i => new PackageItemDto(i.ServiceId, i.Sessions)).ToList()))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("offers")]
    public async Task<ActionResult<object>> ListOffers()
    {
        var items = await _db.Offers
            .Where(o => o.ClinicId == ClinicId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OfferDto(
                o.Id, o.TitleEn, o.TitleAr, o.DescriptionEn,
                o.DescriptionAr, o.Kind, o.Value, o.Code,
                o.ScopeKind, o.ScopeIds, o.StartsAt,
                o.EndsAt, o.UsageLimit, o.UsedCount, o.Published))
            .ToListAsync();

        return Ok(new { items });
    }

    // ── Packages CRUD ──

    [HttpPost("packages")]
    public async Task<ActionResult<PackageDto>> CreatePackage([FromBody] CreatePackageDto dto)
    {
        var pkg = new Package
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            DescriptionEn = dto.DescriptionEn,
            DescriptionAr = dto.DescriptionAr,
            Price = dto.Price,
            ListPrice = dto.ListPrice,
            ValidityDays = dto.ValidityDays,
            Published = dto.Published,
            Featured = dto.Featured,
            SoldCount = 0,
        };

        foreach (var item in dto.Items)
        {
            pkg.Items.Add(new PackageItem
            {
                Id = Guid.NewGuid(),
                PackageId = pkg.Id,
                ServiceId = item.ServiceId,
                Sessions = item.Sessions,
            });
        }

        _db.Packages.Add(pkg);
        await _db.SaveChangesAsync();

        return Ok(new PackageDto(
            pkg.Id, pkg.NameEn, pkg.NameAr, pkg.DescriptionEn,
            pkg.DescriptionAr, pkg.Price, pkg.ListPrice, pkg.ValidityDays,
            pkg.Published, pkg.Featured, pkg.SoldCount,
            pkg.Items.Select(i => new PackageItemDto(i.ServiceId, i.Sessions)).ToList()));
    }

    [HttpPut("packages/{id}")]
    public async Task<ActionResult<PackageDto>> UpdatePackage(Guid id, [FromBody] UpdatePackageDto dto)
    {
        var pkg = await _db.Packages
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicId == ClinicId);
        if (pkg == null) return NotFound();

        if (dto.NameEn != null) pkg.NameEn = dto.NameEn;
        if (dto.NameAr != null) pkg.NameAr = dto.NameAr;
        if (dto.DescriptionEn != null) pkg.DescriptionEn = dto.DescriptionEn;
        if (dto.DescriptionAr != null) pkg.DescriptionAr = dto.DescriptionAr;
        if (dto.Price.HasValue) pkg.Price = dto.Price.Value;
        if (dto.ListPrice.HasValue) pkg.ListPrice = dto.ListPrice.Value;
        if (dto.ValidityDays.HasValue) pkg.ValidityDays = dto.ValidityDays.Value;
        if (dto.Published.HasValue) pkg.Published = dto.Published.Value;
        if (dto.Featured.HasValue) pkg.Featured = dto.Featured.Value;

        if (dto.Items != null)
        {
            _db.PackageItems.RemoveRange(pkg.Items);
            foreach (var item in dto.Items)
            {
                pkg.Items.Add(new PackageItem
                {
                    Id = Guid.NewGuid(),
                    PackageId = pkg.Id,
                    ServiceId = item.ServiceId,
                    Sessions = item.Sessions,
                });
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new PackageDto(
            pkg.Id, pkg.NameEn, pkg.NameAr, pkg.DescriptionEn,
            pkg.DescriptionAr, pkg.Price, pkg.ListPrice, pkg.ValidityDays,
            pkg.Published, pkg.Featured, pkg.SoldCount,
            pkg.Items.Select(i => new PackageItemDto(i.ServiceId, i.Sessions)).ToList()));
    }

    [HttpDelete("packages/{id}")]
    public async Task<ActionResult> DeletePackage(Guid id)
    {
        var pkg = await _db.Packages
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicId == ClinicId);
        if (pkg == null) return NotFound();

        _db.PackageItems.RemoveRange(pkg.Items);
        _db.Packages.Remove(pkg);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Offers CRUD ──

    [HttpPost("offers")]
    public async Task<ActionResult<OfferDto>> CreateOffer([FromBody] CreateOfferDto dto)
    {
        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            ClinicId = ClinicId,
            TitleEn = dto.TitleEn,
            TitleAr = dto.TitleAr,
            DescriptionEn = dto.DescriptionEn,
            DescriptionAr = dto.DescriptionAr,
            Kind = dto.Kind,
            Value = dto.Value,
            Code = dto.Code,
            ScopeKind = dto.ScopeKind,
            ScopeIds = dto.ScopeIds ?? [],
            StartsAt = dto.StartsAt,
            EndsAt = dto.EndsAt,
            UsageLimit = dto.UsageLimit,
            UsedCount = 0,
            Published = dto.Published,
        };

        _db.Offers.Add(offer);
        await _db.SaveChangesAsync();

        return Ok(new OfferDto(
            offer.Id, offer.TitleEn, offer.TitleAr, offer.DescriptionEn,
            offer.DescriptionAr, offer.Kind, offer.Value, offer.Code,
            offer.ScopeKind, offer.ScopeIds, offer.StartsAt,
            offer.EndsAt, offer.UsageLimit, offer.UsedCount, offer.Published));
    }

    [HttpPut("offers/{id}")]
    public async Task<ActionResult<OfferDto>> UpdateOffer(Guid id, [FromBody] UpdateOfferDto dto)
    {
        var offer = await _db.Offers.FirstOrDefaultAsync(o => o.Id == id && o.ClinicId == ClinicId);
        if (offer == null) return NotFound();

        if (dto.TitleEn != null) offer.TitleEn = dto.TitleEn;
        if (dto.TitleAr != null) offer.TitleAr = dto.TitleAr;
        if (dto.DescriptionEn != null) offer.DescriptionEn = dto.DescriptionEn;
        if (dto.DescriptionAr != null) offer.DescriptionAr = dto.DescriptionAr;
        if (dto.Kind.HasValue) offer.Kind = dto.Kind.Value;
        if (dto.Value.HasValue) offer.Value = dto.Value.Value;
        if (dto.Code != null) offer.Code = dto.Code;
        if (dto.StartsAt.HasValue) offer.StartsAt = dto.StartsAt.Value;
        if (dto.EndsAt.HasValue) offer.EndsAt = dto.EndsAt.Value;
        if (dto.UsageLimit.HasValue) offer.UsageLimit = dto.UsageLimit.Value;
        if (dto.Published.HasValue) offer.Published = dto.Published.Value;

        await _db.SaveChangesAsync();

        return Ok(new OfferDto(
            offer.Id, offer.TitleEn, offer.TitleAr, offer.DescriptionEn,
            offer.DescriptionAr, offer.Kind, offer.Value, offer.Code,
            offer.ScopeKind, offer.ScopeIds, offer.StartsAt,
            offer.EndsAt, offer.UsageLimit, offer.UsedCount, offer.Published));
    }

    [HttpDelete("offers/{id}")]
    public async Task<ActionResult> DeleteOffer(Guid id)
    {
        var offer = await _db.Offers.FirstOrDefaultAsync(o => o.Id == id && o.ClinicId == ClinicId);
        if (offer == null) return NotFound();

        _db.Offers.Remove(offer);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
