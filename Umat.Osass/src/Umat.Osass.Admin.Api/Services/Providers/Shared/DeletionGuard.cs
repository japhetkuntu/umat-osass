using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

namespace Umat.Osass.Admin.Api.Services.Providers.Shared;

public class DeletionGuard
{
    private readonly IdentityDbContext _identity;
    private readonly AcademicPromotionDbContext _academic;
    private readonly NonAcademicPromotionDbContext _nonAcademic;

    public DeletionGuard(IdentityDbContext identity, AcademicPromotionDbContext academic, NonAcademicPromotionDbContext nonAcademic)
    {
        _identity = identity;
        _academic = academic;
        _nonAcademic = nonAcademic;
    }

    public async Task<bool> HasReferences(string entity, string id)
    {
        if (entity is "AcademicPosition" or "NonAcademicPosition")
        {
            var isAcademic = entity == "AcademicPosition";
            var name = isAcademic ? (await _academic.AcademicPromotionPositions.FindAsync(id))?.Name
                : (await _nonAcademic.NonAcademicPromotionPositions.FindAsync(id))?.Name;
            if (name != null)
            {
                var normalizedName = name.Trim().ToLowerInvariant();
                var staffCategory = isAcademic ? "academic" : "nonacademic";
                if (await _identity.Staffs.AnyAsync(staff => staff.StaffCategory != null &&
                    staff.StaffCategory.ToLower().Replace("-", "").Replace(" ", "") == staffCategory &&
                    ((staff.Position != null && staff.Position.Trim().ToLower() == normalizedName) ||
                     (staff.PreviousPosition != null && staff.PreviousPosition.Trim().ToLower() == normalizedName)))) return true;
                if (isAcademic)
                {
                    if (await _academic.AcademicPromotionPositions.AnyAsync(position => position.Id != id &&
                        position.PreviousPosition != null && position.PreviousPosition.Trim().ToLower() == normalizedName)) return true;
                }
                else if (await _nonAcademic.NonAcademicPromotionPositions.AnyAsync(position => position.Id != id &&
                    position.PreviousPosition != null && position.PreviousPosition.Trim().ToLower() == normalizedName)) return true;
            }
        }
        var properties = entity switch
        {
            "School" => new[] { "SchoolId", "ApplicantSchoolId" },
            "Faculty" => new[] { "FacultyId", "ApplicantFacultyId" },
            "Department" => new[] { "DepartmentId", "ApplicantDepartmentId", "UnitId", "ApplicantUnitId" },
            "Staff" => new[] { "StaffId", "ApplicantId", "PerformedByStaffId" },
            "AcademicPosition" or "NonAcademicPosition" => new[] { "PromotionPositionId" },
            "ServiceCategory" => new[] { "CategoryId" },
            _ => Array.Empty<string>()
        };
        var contexts = entity switch
        {
            "AcademicPosition" => new DbContext[] { _academic },
            "NonAcademicPosition" => new DbContext[] { _nonAcademic },
            _ => new DbContext[] { _identity, _academic, _nonAcademic }
        };
        foreach (var context in contexts)
        {
            foreach (var entityType in context.Model.GetEntityTypes())
            {
                foreach (var property in properties.Where(name => entityType.FindProperty(name)?.ClrType == typeof(string)))
                {
                    var method = typeof(DeletionGuard).GetMethod(nameof(HasScalarReference), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!;
                    var task = (Task<bool>)method.MakeGenericMethod(entityType.ClrType).Invoke(null, new object[] { context, property, id })!;
                    if (await task) return true;
                }
            }
        }
        if (entity == "PublicationIndicator")
            return (await _academic.Publications.AsNoTracking().ToListAsync()).Any(record => record.Publications.Any(item => item.PublicationTypeId == id));
        if (entity == "KnowledgeMaterialIndicator")
            return (await _nonAcademic.KnowledgeProfessionRecords.AsNoTracking().ToListAsync()).Any(record => record.Materials.Any(item => item.MaterialTypeId == id));
        if (entity is "ServicePosition" or "ServiceCategory")
        {
            if ((await _academic.ServiceRecords.AsNoTracking().ToListAsync()).Any(record => record.Services.Any(item =>
                entity == "ServicePosition" ? item.ServicePositionId == id : item.CategoryId == id))) return true;
            if (entity == "ServicePosition")
                return (await _nonAcademic.NonAcademicServiceRecords.AsNoTracking().ToListAsync()).Any(record =>
                    record.ServiceToTheUniversity.Concat(record.ServiceToNationalAndInternational).Any(item => item.ServiceTypeId == id));
        }
        return false;
    }

    private static Task<bool> HasScalarReference<TEntity>(DbContext context, string property, string id) where TEntity : class =>
        context.Set<TEntity>().AnyAsync(record => EF.Property<string>(record, property) == id);
}
