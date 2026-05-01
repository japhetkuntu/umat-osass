using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;

namespace Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

public interface IAssessmentService
{
    /// <summary>
    /// Get committee member info and permissions
    /// </summary>
    Task<IApiResponse<CommitteeMemberInfoResponse>> GetCommitteeMemberInfo(AuthData auth);
    
    /// <summary>
    /// Get dashboard statistics for committee member
    /// </summary>
    Task<IApiResponse<AssessmentDashboardResponse>> GetDashboard(AuthData auth);
    
    /// <summary>
    /// Get pending applications for committee review (paged, searchable)
    /// </summary>
    Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetPendingApplications(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null);
    
    /// <summary>
    /// Get reviewed/completed applications history for a committee (paged, searchable)
    /// </summary>
    Task<IApiResponse<PgPagedResult<PendingApplicationResponse>>> GetApplicationHistory(AuthData auth, string committeeType, int page = 1, int pageSize = 20, string? search = null);
    
    /// <summary>
    /// Get full application details for assessment
    /// </summary>
    Task<IApiResponse<ApplicationForAssessmentResponse>> GetApplicationForAssessment(AuthData auth, string applicationId);
    
    /// <summary>
    /// Submit assessment scores (chairperson only)
    /// </summary>
    Task<IApiResponse<bool>> SubmitAssessmentScores(AuthData auth, SubmitAssessmentScoresRequest request);
    
    /// <summary>
    /// Add a comment to an application (any committee member)
    /// </summary>
    Task<IApiResponse<bool>> AddAssessmentComment(AuthData auth, AddAssessmentCommentRequest request);
    
    /// <summary>
    /// Return application to applicant for modifications
    /// </summary>
    Task<IApiResponse<bool>> ReturnApplication(AuthData auth, ReturnApplicationRequest request);
    
    /// <summary>
    /// Advance application to the next committee level
    /// </summary>
    Task<IApiResponse<bool>> AdvanceApplication(AuthData auth, AdvanceApplicationRequest request);
    
    /// <summary>
    /// Get activity history for an application
    /// </summary>
    Task<IApiResponse<List<ActivityHistoryItem>>> GetActivityHistory(AuthData auth, string applicationId);
    
    /// <summary>
    /// Final approval (UAPC only)
    /// </summary>
    Task<IApiResponse<bool>> ApproveApplication(AuthData auth, string applicationId, string? recommendation);
    
    /// <summary>
    /// Final rejection (UAPC only)
    /// </summary>
    Task<IApiResponse<bool>> RejectApplication(AuthData auth, string applicationId, string reason);
    
    /// <summary>
    /// Validate application against promotion requirements and provide recommendation (UAPC only)
    /// </summary>
    Task<IApiResponse<PromotionValidationResponse>> ValidateForPromotion(AuthData auth, string applicationId);
}
