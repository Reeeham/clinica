using Clinica.Application.Services;
using Clinica.Application.Validators;
using Clinica.Application.DTOs;
using Clinica.Domain.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace Clinica.Tests;

public class MoneyServiceTests
{
    [Fact]
    public void Egp_ConvertsDecimalToPiastres()
    {
        Assert.Equal(100000, MoneyService.Egp(1000m));
    }

    [Fact]
    public void ToEgp_ConvertsPiastresToDecimal()
    {
        Assert.Equal(1000m, MoneyService.ToEgp(100000));
    }

    [Fact]
    public void PlatformFee_CalculatesTwoPercent()
    {
        Assert.Equal(2000, MoneyService.PlatformFee(100000));
    }

    [Fact]
    public void Format_ReturnsEgpForEnglish()
    {
        var result = MoneyService.Format(100000, "en");
        Assert.Contains("EGP", result);
    }

    [Fact]
    public void Format_ReturnsArabicForArabicLocale()
    {
        var result = MoneyService.Format(100000, "ar");
        Assert.Contains("ج.م", result);
    }
}

public class ValidatorTests
{
    [Fact]
    public void LoginDto_ValidEmailAndPassword_Passes()
    {
        var validator = new LoginDtoValidator();
        var result = validator.TestValidate(new LoginDto("test@example.com", "password123"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void LoginDto_EmptyEmail_Fails()
    {
        var validator = new LoginDtoValidator();
        var result = validator.TestValidate(new LoginDto("", "password123"));
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void LoginDto_ShortPassword_Fails()
    {
        var validator = new LoginDtoValidator();
        var result = validator.TestValidate(new LoginDto("test@example.com", "123"));
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void CreateCustomerDto_ValidData_Passes()
    {
        var validator = new CreateCustomerDtoValidator();
        var dto = new CreateCustomerDto(
            "John Doe", "جون دو", "01001234567", "john@example.com",
            "male", null, "III", [], [], null, [], CustomerSource.App, true,
            "#7A2F5F", "JD");
        var result = validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateCustomerDto_InvalidPhone_Fails()
    {
        var validator = new CreateCustomerDtoValidator();
        var dto = new CreateCustomerDto(
            "John Doe", "جون دو", "12345", null,
            "male", null, null, [], [], null, [], CustomerSource.WalkIn, false,
            null, null);
        var result = validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Phone);
    }

    [Fact]
    public void CreateBookingDto_PastDate_Fails()
    {
        var validator = new CreateBookingDtoValidator();
        var dto = new CreateBookingDto(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            DateTime.UtcNow.AddDays(-1), BookingChannel.App, null, false);
        var result = validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.StartsAt);
    }

    [Fact]
    public void CreateEmployeeDto_ValidData_Passes()
    {
        var validator = new CreateEmployeeDtoValidator();
        var dto = new CreateEmployeeDto(
            "Dr. Sara", "د. سارة", EmployeeRole.Doctor,
            "Dermatologist", "طبيبة جلدية", "01002345678", "sara@nour-aesthetics.com",
            2500000, 0.15, ["skin", "injectables"],
            "#2B5FA8", "SM", true, "demo1234");
        var result = validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateEmployeeDto_InvalidCommissionRate_Fails()
    {
        var validator = new CreateEmployeeDtoValidator();
        var dto = new CreateEmployeeDto(
            "Dr. Sara", "د. سارة", EmployeeRole.Doctor,
            "Dermatologist", "طبيبة جلدية", "01002345678", "sara@nour-aesthetics.com",
            2500000, 1.5, [], null, null, false, null);
        var result = validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.CommissionRate);
    }

    [Fact]
    public void CreateServiceDto_ValidData_Passes()
    {
        var validator = new CreateServiceDtoValidator();
        var dto = new CreateServiceDto(
            "Underarm Laser", "ليزر تحت الإبط", ServiceCategory.Laser,
            "Diode laser hair removal.", "إزالة شعر بالليزر.",
            30, 60000, 6, "Diode", false, "Avoid sun.", "تجنب الشمس.");
        var result = validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateServiceDto_ZeroPrice_Fails()
    {
        var validator = new CreateServiceDtoValidator();
        var dto = new CreateServiceDto(
            "Free Service", "خدمة مجانية", ServiceCategory.Consultation,
            "", "", 30, 0, 1, null, false, null, null);
        var result = validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Price);
    }
}
