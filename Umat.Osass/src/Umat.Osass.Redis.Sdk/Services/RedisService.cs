using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using Umat.Osass.Redis.Sdk.Models;

namespace Umat.Osass.Redis.Sdk.Services
{
    // RedisService.cs
    public class RedisService<TConfig> : IRedisService<TConfig>, IDisposable
        where TConfig : class, IRedisDatabaseConfig
    {
        private readonly IConnectionMultiplexer _connection;
        private readonly TConfig _config;
        private readonly ILogger<RedisService<TConfig>> _logger;

        public IDatabase Database { get; }

        public RedisService(
           IOptions<TConfig> config,
            ILogger<RedisService<TConfig>> logger)
        {
            _config = config.Value ?? throw new ArgumentNullException(nameof(config), "Redis configuration cannot be null");
            _logger = logger;

            try
            {
                var options = ConfigurationOptions.Parse(_config.ConnectionString);
                options.DefaultDatabase = _config.DbNumber;

                _connection = ConnectionMultiplexer.Connect(options);
                Database = _connection.GetDatabase();

                _logger.LogInformation("Connected to Redis database {Alias} (DB {DbNumber})",
                    _config.Alias, _config.DbNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to Redis database {Alias}", _config.Alias);
                throw;
            }
        }

        public async Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var serialized = JsonSerializer.Serialize(value);
                return await Database.StringSetAsync(
                    key,
                    serialized,
                    expiry ?? _config.DefaultExpiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting value for key {Key}", key);
                return false;
            }
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var value = await Database.StringGetAsync(key);

                return value.HasValue ? JsonSerializer.Deserialize<T>(value!) : default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting value for key {Key}", key);
                return default;
            }
        }


        public void Dispose()
        {
            _connection?.Dispose();
        }

        public Task<bool> RemoveAsync(string key)
        {
            try
            {
                return Database.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing key {Key}", key);
                return Task.FromResult(false);
            }
        }

        public Task<bool> KeyExistsAsync(string key)
        {
            try
            {
                return Database.KeyExistsAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking existence of key {Key}", key);
                return Task.FromResult(false);
            }
        }
    }
}