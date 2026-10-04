using System.Linq.Expressions;
using System.Reflection;
using Microsoft.Extensions.Logging.Abstractions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Common;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Services.Providers;

namespace Umat.Osass.Tests;

public class ApiMutationBoundaryTests
{
    [Fact]
    public async Task SubmittedApplicantUpdateDoesNotWriteOrReadCategoryRecords()
    {
        var application = new AcademicPromotionApplication { Id = "application", ApplicantId = "applicant", IsActive = true,
            ApplicationStatus = ApplicationStatusTypes.Submitted };
        var applications = RepositoryDouble.Create<IAcademicPromotionPgRepository<AcademicPromotionApplication>>(application);
        var categories = RepositoryDouble.Create<IAcademicPromotionPgRepository<TeachingRecord>>();
        var service = new TeachingCategoryService(NullLogger<TeachingCategoryService>.Instance, null!, applications, categories,
            null!, null!, null!, null!, null!, null!);
        var response = await service.UpdateTeachingCategoryState(new() { Id = "applicant" }, new() { LectureLoad = new() { Score = 5 } });
        Assert.Equal(409, response.Code);
        Assert.Equal(0, ((RepositoryDouble)(object)applications).Writes);
        Assert.Equal(0, ((RepositoryDouble)(object)categories).Calls);
    }

    [Fact]
    public async Task InvalidPublicationInScoreBatchPreventsTeachingMutationAndEveryWrite()
    {
        var application = new AcademicPromotionApplication { Id = "application", ApplicantId = "applicant",
            ApplicantDepartmentId = "department", ApplicationStatus = ApplicationStatusTypes.Submitted,
            ReviewStatus = AcademicPromotionState.DepartmentReview };
        var teaching = new TeachingRecord { PromotionApplicationId = "application", ApplicantId = "applicant", LectureLoad = new() { ApplicantScore = 8 } };
        var committee = new AcademicPromotionCommittee { StaffId = "chair", CommitteeType = "DAPC", IsChairperson = true, DepartmentId = "department" };
        var applications = RepositoryDouble.Create<IAcademicPromotionPgRepository<AcademicPromotionApplication>>(application);
        var committees = RepositoryDouble.Create<IAcademicPromotionPgRepository<AcademicPromotionCommittee>>(committee);
        var activities = RepositoryDouble.Create<IAcademicPromotionPgRepository<AssessmentActivity>>();
        var publications = RepositoryDouble.Create<IAcademicPromotionPgRepository<Publication>>();
        var services = RepositoryDouble.Create<IAcademicPromotionPgRepository<ServiceRecord>>();
        var teachings = RepositoryDouble.Create<IAcademicPromotionPgRepository<TeachingRecord>>(teaching);
        var staffs = RepositoryDouble.Create<IIdentityPgRepository<Staff>>();
        var service = new AssessmentService(NullLogger<AssessmentService>.Instance, applications, committees, activities,
            publications, services, teachings, staffs, null!, null!, null!, null!);
        var response = await service.SubmitAssessmentScores(new() { Id = "chair" }, new()
        {
            ApplicationId = "application", TeachingScores = new() { LectureLoad = new() { Score = 10 } },
            PublicationScores = new() { new() { RecordId = "foreign", Score = 1 } }
        });
        Assert.Equal(400, response.Code);
        Assert.Null(teaching.LectureLoad.DapcScore);
        Assert.All(new object[] { applications, committees, activities, publications, services, teachings, staffs },
            repository => Assert.Equal(0, ((RepositoryDouble)repository).Writes));
    }

    [Theory]
    [InlineData("scores")]
    [InlineData("advance")]
    [InlineData("return")]
    public async Task ChairpersonCannotMutateAnotherDepartment(string action)
    {
        var application = new AcademicPromotionApplication { Id = "application", ApplicantDepartmentId = "other",
            ApplicationStatus = ApplicationStatusTypes.Submitted, ReviewStatus = AcademicPromotionState.DepartmentReview };
        var applications = RepositoryDouble.Create<IAcademicPromotionPgRepository<AcademicPromotionApplication>>(application);
        var committees = RepositoryDouble.Create<IAcademicPromotionPgRepository<AcademicPromotionCommittee>>(
            new AcademicPromotionCommittee { StaffId = "chair", CommitteeType = "DAPC", IsChairperson = true, DepartmentId = "department" });
        var service = new AssessmentService(NullLogger<AssessmentService>.Instance, applications, committees, null!, null!, null!, null!, null!, null!, null!, null!, null!);
        IApiResponse<bool> response = action switch
        {
            "scores" => await service.SubmitAssessmentScores(new() { Id = "chair" }, new() { ApplicationId = "application" }),
            "advance" => await service.AdvanceApplication(new() { Id = "chair" }, new() { ApplicationId = "application" }),
            _ => await service.ReturnApplication(new() { Id = "chair" }, new() { ApplicationId = "application", ReturnReason = "return" })
        };
        Assert.InRange(response.Code, 400, 499);
        Assert.Equal(0, ((RepositoryDouble)(object)applications).Writes);
        Assert.Equal(ApplicationStatusTypes.Submitted, application.ApplicationStatus);
        Assert.Equal(AcademicPromotionState.DepartmentReview, application.ReviewStatus);
    }

    public class RepositoryDouble : DispatchProxy
    {
        private object[] _records = Array.Empty<object>();
        public int Writes { get; private set; }
        public int Calls { get; private set; }

        public static TInterface Create<TInterface>(params object[] records) where TInterface : class
        {
            var proxy = DispatchProxy.Create<TInterface, RepositoryDouble>();
            ((RepositoryDouble)(object)proxy)._records = records;
            return proxy;
        }

        protected override object? Invoke(MethodInfo? method, object?[]? arguments)
        {
            Calls++;
            if (method!.Name is "AddAsync" or "UpdateAsync" or "Remove" or "AddRangeAsync" or "UpdateRangeAsync")
            {
                Writes++;
                throw new InvalidOperationException("Mutation was forbidden in this boundary test");
            }
            var records = _records.AsEnumerable();
            if (arguments?.FirstOrDefault() is LambdaExpression predicate)
            {
                var compiled = predicate.Compile();
                records = records.Where(record => (bool)compiled.DynamicInvoke(record)!);
            }
            var resultType = method.ReturnType.GetGenericArguments()[0];
            object? result;
            if (method.Name == "GetAllAsync")
            {
                var items = records.ToArray();
                var array = Array.CreateInstance(resultType.GetGenericArguments()[0], items.Length);
                for (var index = 0; index < items.Length; index++) array.SetValue(items[index], index);
                result = array;
            }
            else result = records.FirstOrDefault();
            return typeof(Task).GetMethod(nameof(Task.FromResult))!.MakeGenericMethod(resultType).Invoke(null, new[] { result });
        }
    }
}
