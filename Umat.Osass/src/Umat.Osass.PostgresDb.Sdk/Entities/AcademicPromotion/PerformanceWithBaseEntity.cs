using Umat.Osass.PostgresDb.Sdk.Common;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

public class PerformanceWithBaseEntity:BaseEntity
{
    public string ApplicantPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string DapcPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string FapcPerformance { get; set; } = PerformanceTypes.InAdequate;
    public string UapcPerformance { get; set; } = PerformanceTypes.InAdequate;

}