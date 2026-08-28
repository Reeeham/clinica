using System.Globalization;

namespace Clinica.Application.Services;

public static class MoneyService
{
    public const double PlatformFeeRate = 0.02;

    public static long Egp(decimal amount) => (long)Math.Round(amount * 100);

    public static decimal ToEgp(long piastres) => piastres / 100m;

    public static long PlatformFee(long amountPiastres) => (long)Math.Round(amountPiastres * PlatformFeeRate);

    public static string Format(long piastres, string locale = "en", bool compact = false)
    {
        var amount = ToEgp(piastres);
        var culture = locale == "ar" ? new CultureInfo("ar-EG") : new CultureInfo("en-EG");
        var formatted = compact && Math.Abs(amount) >= 10_000
            ? amount.ToString("N0", culture) + "K"
            : amount.ToString("N0", culture);
        return locale == "ar" ? $"{formatted} ج.م" : $"EGP {formatted}";
    }
}

public static class TimeService
{
    public static string FormatPhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 11 && digits.StartsWith("01"))
            return $"{digits[..3]} {digits[3..7]} {digits[7..]}";
        return phone;
    }

    public static int Age(DateTime? birthDate)
    {
        if (!birthDate.HasValue) return 0;
        var today = DateTime.Today;
        var age = today.Year - birthDate.Value.Year;
        if (birthDate.Value.Date > today.AddYears(-age)) age--;
        return age;
    }
}
