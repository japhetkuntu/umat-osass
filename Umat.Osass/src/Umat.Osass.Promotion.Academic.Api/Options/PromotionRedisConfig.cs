using Umat.Osass.Redis.Sdk.Models;

namespace Umat.Osass.Promotion.Academic.Api.Options;

public class PromotionRedisConfig : IRedisDatabaseConfig
{
    public string Alias { get; set; } = string.Empty;
    public int DbNumber { get; set; }
    public string ConnectionString { get; set; } = string.Empty;
    public TimeSpan? DefaultExpiry => TimeSpan.FromMinutes(5);
}