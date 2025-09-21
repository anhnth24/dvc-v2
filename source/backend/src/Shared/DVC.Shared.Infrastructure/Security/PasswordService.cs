using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace DVC.Shared.Infrastructure.Security;

public class PasswordService : IPasswordService
{
    private const int SaltSize = 32;
    private const int HashSize = 32;
    private const int Iterations = 10000;

    public string HashPassword(string password, out string salt)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        // Generate salt
        var saltBytes = new byte[SaltSize];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        salt = Convert.ToBase64String(saltBytes);

        // Hash password
        using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, Iterations, HashAlgorithmName.SHA256);
        var hashBytes = pbkdf2.GetBytes(HashSize);

        return Convert.ToBase64String(hashBytes);
    }

    public bool VerifyPassword(string password, string hash, string salt)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash) || string.IsNullOrEmpty(salt))
            return false;

        try
        {
            var saltBytes = Convert.FromBase64String(salt);
            var hashBytes = Convert.FromBase64String(hash);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, Iterations, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(HashSize);

            return computedHash.SequenceEqual(hashBytes);
        }
        catch
        {
            return false;
        }
    }

    public string GenerateRandomPassword(int length = 12)
    {
        if (length < 8)
            throw new ArgumentException("Password length must be at least 8 characters", nameof(length));

        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string specialChars = "!@#$%^&*";

        var random = new Random();
        var password = new StringBuilder();

        // Ensure at least one character from each category
        password.Append(lowercase[random.Next(lowercase.Length)]);
        password.Append(uppercase[random.Next(uppercase.Length)]);
        password.Append(digits[random.Next(digits.Length)]);
        password.Append(specialChars[random.Next(specialChars.Length)]);

        // Fill the rest with random characters
        var allChars = lowercase + uppercase + digits + specialChars;
        for (int i = 4; i < length; i++)
        {
            password.Append(allChars[random.Next(allChars.Length)]);
        }

        // Shuffle the password
        var passwordArray = password.ToString().ToCharArray();
        for (int i = passwordArray.Length - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (passwordArray[i], passwordArray[j]) = (passwordArray[j], passwordArray[i]);
        }

        return new string(passwordArray);
    }

    public bool IsPasswordStrong(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            return false;

        // Check for at least one lowercase letter
        if (!Regex.IsMatch(password, @"[a-z]"))
            return false;

        // Check for at least one uppercase letter
        if (!Regex.IsMatch(password, @"[A-Z]"))
            return false;

        // Check for at least one digit
        if (!Regex.IsMatch(password, @"\d"))
            return false;

        // Check for at least one special character
        if (!Regex.IsMatch(password, @"[!@#$%^&*(),.?"":{}\|<>]"))
            return false;

        // Check for common weak patterns
        var weakPatterns = new[]
        {
            @"123456",
            @"password",
            @"admin",
            @"qwerty",
            @"abc123"
        };

        return !weakPatterns.Any(pattern => password.ToLower().Contains(pattern));
    }
}

public interface IPasswordService
{
    string HashPassword(string password, out string salt);
    bool VerifyPassword(string password, string hash, string salt);
    string GenerateRandomPassword(int length = 12);
    bool IsPasswordStrong(string password);
}