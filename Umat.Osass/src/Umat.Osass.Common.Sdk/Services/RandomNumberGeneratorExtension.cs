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
}