using StackExchange.Redis;
using Umat.Osass.Redis.Sdk.Models;

namespace Umat.Osass.Redis.Sdk.Services
{
// IRedisService.cs
public interface IRedisService<TConfig> where TConfig : IRedisDatabaseConfig
{
    IDatabase Database { get; }
    Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task<T?> GetAsync<T>(string key);
    Task<bool> RemoveAsync(string key);
    Task<bool> KeyExistsAsync(string key);
}
}