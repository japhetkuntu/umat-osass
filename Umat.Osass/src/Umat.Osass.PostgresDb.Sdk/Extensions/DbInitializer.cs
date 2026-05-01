using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;

namespace Umat.Osass.PostgresDb.Sdk.Extensions;

public static class DbInitializer
{
    public static async Task SeedAdminUsers(IdentityDbContext context)
    {
        if (!await context.Admins.AnyAsync())
        {
         

            var issuers = new List<Admin>
            {
                new()
                {
                    CreatedBy = "system",
                    FirstName = "Japhet",
                    LastName = "Kuntu Blankson",
                    Email = "admin@reservease.com",
                    Role = "SuperAdmin",
                    Password = BCrypt.Net.BCrypt.HashPassword("defaultP@ssw0rd@123")
                }
              
            };

            await context.Admins.AddRangeAsync(issuers);
            await context.SaveChangesAsync();
        }
    }
    
    
}

