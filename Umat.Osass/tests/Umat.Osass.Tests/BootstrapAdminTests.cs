using Microsoft.Extensions.Configuration;
using Umat.Osass.PostgresDb.Sdk.Extensions;

namespace Umat.Osass.Tests;

public class BootstrapAdminTests
{
    [Theory]
    [InlineData(null, null)]
    [InlineData("admin@example.invalid", null)]
    [InlineData(null, "test-only-long-password")]
    [InlineData("invalid", "test-only-long-password")]
    [InlineData("admin@example.invalid", "short")]
    public void RejectsMissingOrInvalidBootstrapCredentials(string? email, string? password)
    {
        var configuration = Configuration(email, password);
        Assert.Throws<InvalidOperationException>(() => DbInitializer.CreateBootstrapAdmin(configuration));
    }

    [Fact]
    public void HashesExplicitPasswordAndUsesConfiguredEmail()
    {
        const string password = "test-only-long-password";
        var admin = DbInitializer.CreateBootstrapAdmin(Configuration("admin@example.invalid", password));
        Assert.Equal("admin@example.invalid", admin.Email);
        Assert.Equal("SuperAdmin", admin.Role);
        Assert.NotEqual(password, admin.Password);
        Assert.True(BCrypt.Net.BCrypt.Verify(password, admin.Password));
    }

    [Fact]
    public void RejectsPasswordBeyondBcryptByteLimit()
    {
        Assert.Throws<InvalidOperationException>(() =>
            DbInitializer.CreateBootstrapAdmin(Configuration("admin@example.invalid", new string('é', 37))));
    }

    private static IConfiguration Configuration(string? email, string? password) =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["BootstrapAdmin:Email"] = email,
            ["BootstrapAdmin:Password"] = password
        }).Build();
}
