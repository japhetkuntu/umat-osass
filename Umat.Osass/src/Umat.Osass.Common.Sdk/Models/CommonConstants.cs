using System.Security.Cryptography;
using System.Text;

namespace Umat.Osass.Common.Sdk.Models;

public static class CommonConstants
{
    private const string AlphanumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#()@";

    public static string GenerateAlphanumericPassword(int length = 8)
    {
        var password = new StringBuilder();
        using var rng = RandomNumberGenerator.Create();
        var buffer = new byte[1];

        while (password.Length < length)
        {
            rng.GetBytes(buffer);
            var index = buffer[0] % AlphanumericChars.Length;
            password.Append(AlphanumericChars[index]);
        }

        return password.ToString();
    }
    public static class AuthScheme
    {
        public const string Basic = "Basic";
        public const string PrivateKey = "PrivateKey";
        public const string Bearer = "Bearer";
    }

    public static string GenerateVerificationCode(int length = 6)
    {
        var verificationCode = new StringBuilder();
        using var rng = RandomNumberGenerator.Create();
        var buffer = new byte[1];

        while (verificationCode.Length < length)
        {
            rng.GetBytes(buffer);
            var digit = (buffer[0] % 10).ToString(); // Get a digit from 0 to 9
            verificationCode.Append(digit);
        }

        return verificationCode.ToString();
    }

    public static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
    
}