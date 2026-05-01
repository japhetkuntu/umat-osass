namespace Umat.Osass.Redis.Sdk.Models
{

  // IRedisDatabaseConfig.cs
public interface IRedisDatabaseConfig
{
    string Alias { get; }
    int DbNumber { get; }
    string ConnectionString { get; }
    TimeSpan? DefaultExpiry { get; }
}
}