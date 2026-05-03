namespace Umat.Osass.Common.Sdk.Services;
using System.Security.Cryptography;

public class RandomNumberGeneratorExtension
{
    public static string GenerateOtp(int digits = 6)
    {
        if (digits < 1 || digits > 10)
            throw new ArgumentOutOfRangeException(nameof(digits), "Digits must be between 1 and 10.");

        int min = (int)Math.Pow(10, digits - 1);
        int max = (int)Math.Pow(10, digits);

        var number = RandomNumberGenerator.GetInt32(min, max);
        return number.ToString();
    }

    /// <summary>
    /// Generates a cryptographically secure temporary password that satisfies common
    /// complexity requirements: upper, lower, digit, and special character.
    /// </summary>
    public static string GenerateTemporaryPassword(int length = 12)
    {
        const string upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";   // no I/O to avoid confusion
        const string lower   = "abcdefghjkmnpqrstuvwxyz";    // no i/l/o
        const string digits  = "23456789";                   // no 0/1
        const string special = "@#$!";
        const string all     = upper + lower + digits + special;

        // Guarantee at least one of each required category
        var password = new char[length];
        password[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        password[1] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        password[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        password[3] = special[RandomNumberGenerator.GetInt32(special.Length)];

        for (int i = 4; i < length; i++)
            password[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

        // Fisher-Yates shuffle to avoid predictable prefix pattern
        for (int i = length - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}