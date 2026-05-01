using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface IAssessmentService
{
    Task<IApiResponse<CommitteeMemberInfoResponse>> GetCommitteeMemberInfo(AuthData auth);
    Task<IApiResponse<AssessmentDashboardResponse>> GetDashboard(AuthData auth);
    Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetPendingApplications(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null);
    Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetApplicationHistory(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null);
    Task<IApiResponse<ApplicationForAssessmentResponse>> GetApplicationForAssessment(AuthData auth, string applicationId);
    Task<IApiResponse<bool>> SubmitAssessmentScores(AuthData auth, SubmitAssessmentScoresRequest request);
    Task<IApiResponse<bool>> AddAssessmentComment(AuthData auth, AddAssessmentCommentRequest request);
    Task<IApiResponse<bool>> ReturnApplication(AuthData auth, ReturnApplicationRequest request);
    Task<IApiResponse<bool>> AdvanceApplication(AuthData auth, AdvanceApplicationRequest request);
    Task<IApiResponse<List<ActivityHistoryItem>>> GetActivityHistory(AuthData auth, string applicationId);
    Task<IApiResponse<bool>> ApproveApplication(AuthData auth, string applicationId, string? recommendation);
    Task<IApiResponse<bool>> RejectApplication(AuthData auth, string applicationId, string reason);
    Task<IApiResponse<PromotionValidationResponse>> ValidateForPromotion(AuthData auth, string applicationId);
}
