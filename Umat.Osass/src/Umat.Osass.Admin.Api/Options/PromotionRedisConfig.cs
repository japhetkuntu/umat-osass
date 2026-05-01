using Umat.Osass.Redis.Sdk.Models;

namespace Umat.Osass.Admin.Api.Options;

public class PromotionRedisConfig:IRedisDatabaseConfig
{
    public string Alias { get; set; }
    public int DbNumber { get; set; }
    public string ConnectionString { get; set; }
    public TimeSpan? DefaultExpiry => TimeSpan.FromMinutes(5);
}