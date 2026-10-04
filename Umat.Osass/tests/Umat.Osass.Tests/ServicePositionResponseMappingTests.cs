using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.Promotion.NonAcademic.Api.Services.Providers;

namespace Umat.Osass.Tests;

public class ServicePositionResponseMappingTests
{
    [Theory]
    [InlineData("University Committees", "University")]
    [InlineData("Service to the University Community", "University")]
    [InlineData("National and International Communities", "National/International")]
    [InlineData("International Community", "National/International")]
    [InlineData(" NATIONAL SERVICE ", "National/International")]
    public void CategoryDeterminesLegacyBucketAndPreservesPositionData(string category, string expected)
    {
        var position = new ServicePosition { Id = "position", Name = "International university liaison", Score = 12, CategoryId = "category" };
        var result = ServicePositionResponseMapping.Map(position, new ServiceCategory { Id = "category", Name = category });
        Assert.Equal(expected, result.ServiceType);
        Assert.Equal(position.Id, result.Id);
        Assert.Equal(position.Name, result.Name);
        Assert.Equal(position.Score, result.Score);
    }

    [Theory]
    [InlineData("University", "University")]
    [InlineData("National/International", "National/International")]
    public void LegacyUnmigratedCategoryValuesRemainUsable(string categoryId, string expected)
    {
        Assert.Equal(expected, ServicePositionResponseMapping.Map(new ServicePosition { CategoryId = categoryId }, null).ServiceType);
    }
}
