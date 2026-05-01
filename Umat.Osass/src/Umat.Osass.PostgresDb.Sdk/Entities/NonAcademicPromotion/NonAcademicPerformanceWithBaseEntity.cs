using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

public class NonAcademicPerformanceWithBaseEntity : BaseEntity
{
    public string ApplicantPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string HouPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string AapscPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string UapcPerformance { get; set; } = PerformanceTypes.InAdequate;
}
