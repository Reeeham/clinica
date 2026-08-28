using Microsoft.AspNetCore.Identity;

namespace Clinica.Infrastructure.Auth;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<string> _hasher = new();

    public string HashPassword(string password) => _hasher.HashPassword("", password);

    public bool VerifyPassword(string password, string hash)
    {
        var result = _hasher.VerifyHashedPassword("", hash, password);
        return result == PasswordVerificationResult.Success;
    }
}
