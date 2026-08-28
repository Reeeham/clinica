using Clinica.Domain.Entities;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Auth;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Route("api/public/[controller]")]
public class CustomerAuthController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public CustomerAuthController(ClinicaDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] CustomerRegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Phone) || string.IsNullOrWhiteSpace(dto.NameEn))
            return BadRequest(new { error = "Name and phone are required" });

        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Id == dto.ClinicId);
        if (clinic == null) return BadRequest(new { error = "Invalid clinic" });

        var existing = await _db.Customers
            .FirstOrDefaultAsync(c => c.ClinicId == dto.ClinicId && c.Phone == dto.Phone);
        if (existing != null)
            return Conflict(new { error = "A customer with this phone number already exists" });

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            ClinicId = dto.ClinicId,
            NameEn = dto.NameEn,
            NameAr = dto.NameAr ?? dto.NameEn,
            Phone = dto.Phone,
            Email = dto.Email,
            Gender = dto.Gender ?? "female",
            BirthDate = dto.BirthDate,
            SkinType = dto.SkinType,
            Source = CustomerSource.App,
            MarketingOptIn = dto.MarketingOptIn,
            Active = true,
            Color = "#7A2F5F",
            Initials = dto.NameEn.Length >= 2 ? dto.NameEn[..2].ToUpper() : dto.NameEn.ToUpper(),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(
            customer.Id, dto.Phone, customer.NameEn, "customer", customer.ClinicId);

        return Ok(new
        {
            token,
            customer = new
            {
                customer.Id, customer.NameEn, customer.NameAr,
                customer.Phone, customer.Email, customer.Gender,
            },
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] CustomerLoginDto dto)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.ClinicId == dto.ClinicId
                && c.Phone == dto.Phone
                && c.Active);

        if (customer == null)
            return Unauthorized(new { error = "Customer not found" });

        var token = _tokenService.GenerateToken(
            customer.Id, customer.Phone, customer.NameEn, "customer", customer.ClinicId);

        return Ok(new
        {
            token,
            customer = new
            {
                customer.Id, customer.NameEn, customer.NameAr,
                customer.Phone, customer.Email, customer.Gender,
            },
        });
    }

    [HttpGet("me")]
    [Authorize(Policy = "Customer")]
    public async Task<ActionResult<object>> Me()
    {
        var userId = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (userId == null) return Unauthorized();

        var customer = await _db.Customers
            .Include(c => c.Bookings)
            .Include(c => c.Entitlements)
            .FirstOrDefaultAsync(c => c.Id == Guid.Parse(userId));

        if (customer == null) return NotFound();

        return Ok(new
        {
            customer = new
            {
                customer.Id, customer.NameEn, customer.NameAr,
                customer.Phone, customer.Email, customer.Gender,
                customer.BirthDate, customer.SkinType,
                customer.Allergies, customer.Conditions,
                customer.Tags, customer.MarketingOptIn,
            },
            bookings = customer.Bookings
                .OrderByDescending(b => b.StartsAt)
                .Select(b => new
                {
                    b.Id, b.Ref, b.StartsAt, b.EndsAt,
                    b.Status, b.Channel, b.Price,
                }),
            entitlements = customer.Entitlements.Select(e => new
            {
                e.Id, e.PackageId, e.Status,
                e.PurchasedAt, e.ExpiresAt, e.BalanceJson,
            }),
        });
    }
}

public record CustomerRegisterDto(
    Guid ClinicId, string NameEn, string? NameAr,
    string Phone, string? Email, string? Gender,
    DateTime? BirthDate, string? SkinType, bool MarketingOptIn);

public record CustomerLoginDto(Guid ClinicId, string Phone);
