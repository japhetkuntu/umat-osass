using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

public static class ServicePositionResponseMapping
{
    public static ServicePositionIndicatorResponse Map(ServicePosition position, ServiceCategory? category)
    {
        var categoryName = category?.Name ?? position.CategoryId;
        var nationalInternational = categoryName.Contains("national", StringComparison.OrdinalIgnoreCase);
        return new ServicePositionIndicatorResponse
        {
            Id = position.Id,
            Name = position.Name,
            Score = position.Score,
            ServiceType = nationalInternational ? "National/International" : "University"
        };
    }
}
