using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Routing;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using AcademicAssessment = Umat.Osass.Promotion.Academic.Api.Services.Providers.AssessmentService;
using NonAcademicAssessment = Umat.Osass.Promotion.NonAcademic.Api.Services.Providers.AssessmentService;

namespace Umat.Osass.Tests;

public class ApiAuthorizationIntegrityTests
{
    private static object Invoke(Type service, string method, params object?[] arguments) =>
        service.GetMethod(method, BindingFlags.NonPublic | BindingFlags.Static)!.Invoke(null, arguments)!;

    [Theory]
    [InlineData("DAPC", "department", "faculty", "school", true)]
    [InlineData("DAPC", "other", "faculty", "school", false)]
    [InlineData("DAPC", null, "faculty", "school", false)]
    [InlineData("DAPC", "department", "faculty", "other", false)]
    [InlineData("FAPSC", "department", "faculty", "school", true)]
    [InlineData("FAPSC", "department", "other", "school", false)]
    [InlineData("FAPSC", "department", null, "school", false)]
    [InlineData("FAPSC", "department", "faculty", "other", false)]
    [InlineData("UAPC", null, null, null, true)]
    [InlineData("unknown", "department", "faculty", "school", false)]
    public void AcademicScopeRequiresMatchingAssignment(string type, string? department, string? faculty, string? school, bool expected)
    {
        Assert.Equal(expected, Invoke(typeof(AcademicAssessment), "IsInScope",
            new AcademicPromotionApplication { ApplicantDepartmentId = "department", ApplicantFacultyId = "faculty", ApplicantSchoolId = "school" },
            new AcademicPromotionCommittee { CommitteeType = type, DepartmentId = department, FacultyId = faculty, SchoolId = school }));
    }

    [Theory]
    [InlineData("HOU", "unit", true)]
    [InlineData("HOU", "other", false)]
    [InlineData("HOU", null, false)]
    [InlineData("AAPSC", null, true)]
    [InlineData("UAPC", null, true)]
    [InlineData("unknown", "unit", false)]
    public void NonAcademicScopeFailsClosedForUnassignedHeads(string type, string? unit, bool expected)
    {
        Assert.Equal(expected, Invoke(typeof(NonAcademicAssessment), "IsInScope",
            new NonAcademicPromotionApplication { ApplicantUnitId = "unit" },
            new NonAcademicPromotionCommittee { CommitteeType = type, UnitId = unit }));
    }

    [Theory]
    [InlineData(0, "record", true)]
    [InlineData(10, "record", true)]
    [InlineData(-1, "record", false)]
    [InlineData(11, "record", false)]
    [InlineData(double.NaN, "record", false)]
    [InlineData(double.PositiveInfinity, "record", false)]
    [InlineData(5, "foreign", false)]
    public void ScoresRejectOutOfBoundsAndForeignRecords(double score, string id, bool expected)
    {
        Assert.Equal(expected, Invoke(typeof(NonAcademicAssessment), "AreValidRecordScores",
            new List<RecordScore> { new() { RecordId = id, Score = score } },
            new Dictionary<string, double> { ["record"] = 10 }));
    }

    [Fact]
    public void DuplicateScoresAreRejected()
    {
        var scores = new List<RecordScore> { new() { RecordId = "record", Score = 1 }, new() { RecordId = "record", Score = 2 } };
        Assert.Equal(false, Invoke(typeof(NonAcademicAssessment), "AreValidRecordScores", scores,
            new Dictionary<string, double> { ["record"] = 10 }));
    }

    [Fact]
    public void KnowledgeTotalsUseTopTenScoresForSelectedCommittee()
    {
        var record = new KnowledgeProfessionRecord
        {
            Materials = Enumerable.Range(1, 12).Select(index => new KnowledgeProfessionItem
            {
                HouScore = index, AapscScore = 1, UapcScore = 2, ApplicantScore = 100
            }).ToList()
        };
        Assert.Equal(75d, Invoke(typeof(NonAcademicAssessment), "CalculateCommitteeKnowledgeTotal", record, "HOU"));
        Assert.Equal(10d, Invoke(typeof(NonAcademicAssessment), "CalculateCommitteeKnowledgeTotal", record, "AAPSC"));
        Assert.Equal(20d, Invoke(typeof(NonAcademicAssessment), "CalculateCommitteeKnowledgeTotal", record, "UAPC"));
    }

    [Fact]
    public void AdminReadAndWriteRolesAreEnforcedOnEveryEndpoint()
    {
        var controllers = typeof(Umat.Osass.Admin.Api.Controllers.Shared.StaffsController).Assembly.GetTypes()
            .Where(type => type.IsSubclassOf(typeof(Umat.Osass.Admin.Api.Controllers.DefaultController)));
        foreach (var controller in controllers)
        {
            Assert.Contains(controller.GetCustomAttributes<AuthorizeAttribute>(), attribute => attribute.Roles == "SuperAdmin,Admin,Moderator");
            foreach (var method in controller.GetMethods().Where(method => method.GetCustomAttributes<HttpMethodAttribute>()
                .Any(attribute => attribute.HttpMethods.Any(verb => verb != "GET"))))
                Assert.Contains(method.GetCustomAttributes<AuthorizeAttribute>(), attribute => attribute.Roles == "SuperAdmin,Admin");
        }
    }
}
