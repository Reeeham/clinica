using Clinica.Application.DTOs;
using Clinica.Infrastructure.Auth;
using Clinica.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ClinicaDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthController(ClinicaDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { error = "Email and password are required" });

        var employee = await _db.Employees
            .FirstOrDefaultAsync(e => e.Email == dto.Email.ToLower().Trim()
                && e.CanLogin
                && e.Status == Domain.Enums.EmployeeStatus.Active);

        if (employee == null || employee.PasswordHash == null)
            return Unauthorized(new { error = "Invalid credentials" });

        if (!_passwordHasher.VerifyPassword(dto.Password, employee.PasswordHash))
            return Unauthorized(new { error = "Invalid credentials" });

        var token = _tokenService.GenerateToken(
            employee.Id, employee.Email, employee.NameEn,
            employee.Role.ToString().ToLower(), employee.ClinicId);

        return Ok(new AuthResponseDto(
            token, employee.Email, employee.NameEn,
            employee.Role.ToString().ToLower(), employee.ClinicId));
    }
}
