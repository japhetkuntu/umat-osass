using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;

namespace Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

public class IdentityDbContext : DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }
    public DbSet<Staff> Staffs => Set<Staff>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<School> Schools => Set<School>();
    public DbSet<ServicePosition>  ServicePositions => Set<ServicePosition>();
    public DbSet<PublicationIndicator> PublicationIndicators => Set<PublicationIndicator>();
    public DbSet<KnowledgeMaterialIndicator> KnowledgeMaterialIndicators => Set<KnowledgeMaterialIndicator>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<StaffUpdate> StaffUpdates => Set<StaffUpdate>();


}