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
[Route("api/onboarding")]
public class OnboardingController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public OnboardingController(ClinicaDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("create-clinic")]
    public async Task<ActionResult> CreateClinic([FromBody] CreateClinicDto dto)
    {
        if (await _db.Clinics.AnyAsync(c => c.Slug == dto.Slug))
            return Conflict(new { error = "A clinic with this slug already exists" });

        if (await _db.Employees.AnyAsync(e => e.Email == dto.OwnerEmail.ToLower().Trim()))
            return Conflict(new { error = "An employee with this email already exists" });

        var clinicId = Guid.NewGuid();

        var clinic = new Clinic
        {
            Id = clinicId,
            Slug = dto.Slug,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr,
            TaglineEn = dto.TaglineEn,
            TaglineAr = dto.TaglineAr,
            AboutEn = "",
            AboutAr = "",
            CityEn = dto.CityEn,
            CityAr = dto.CityAr,
            AreaEn = dto.AreaEn,
            AreaAr = dto.AreaAr,
            AddressEn = dto.AddressEn,
            AddressAr = dto.AddressAr,
            Phone = dto.Phone,
            Whatsapp = dto.Whatsapp,
            Rating = 0,
            ReviewCount = 0,
            Verified = false,
            Palette = ["#7A2F5F", "#2B5FA8"],
            AmenitiesEn = [],
            AmenitiesAr = [],
            Specialties = [],
            Plan = ClinicPlan.Starter,
        };
        _db.Clinics.Add(clinic);

        var owner = new Employee
        {
            Id = Guid.NewGuid(),
            ClinicId = clinicId,
            NameEn = dto.OwnerNameEn,
            NameAr = dto.OwnerNameAr,
            Role = EmployeeRole.Owner,
            TitleEn = "Owner",
            TitleAr = "المالك",
            Phone = dto.OwnerPhone,
            Email = dto.OwnerEmail.ToLower().Trim(),
            Status = EmployeeStatus.Active,
            HiredAt = DateTime.UtcNow,
            Salary = 0,
            CommissionRate = 0,
            Specialties = [],
            Color = "#7A2F5F",
            Initials = dto.OwnerNameEn.Length >= 2 ? dto.OwnerNameEn[..2].ToUpper() : "OW",
            Rating = 0,
            CanLogin = true,
            PasswordHash = _passwordHasher.HashPassword(dto.OwnerPassword),
        };
        _db.Employees.Add(owner);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            clinicId,
            clinicSlug = clinic.Slug,
            clinicNameEn = clinic.NameEn,
            ownerId = owner.Id,
            ownerEmail = owner.Email,
            message = "Clinic and owner created successfully. The owner can now log in.",
        });
    }
}
