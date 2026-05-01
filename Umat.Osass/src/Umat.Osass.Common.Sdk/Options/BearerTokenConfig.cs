namespace Umat.Osass.Common.Sdk.Options
{


    public class BearerTokenConfig
    {
        public string Audience { get; set; } = null!;
        public string Issuer { get; set; } = null!;
        public string SigningKey { get; set; } = null!;
        public string ApplicantSigningKey { get; set; } = null!;
        public string AdminSigningKey { get; set; } = null!;
        public int AccessTokenLifetime { get; set; } = 8;
        public int RefreshTokenLifetime { get; set; } = 30;
    }
}