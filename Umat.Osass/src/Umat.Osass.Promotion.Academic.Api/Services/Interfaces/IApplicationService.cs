using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;
using Umat.Osass.Promotion.Academic.Api.Models.Requests;
using Umat.Osass.Promotion.Academic.Api.Models.Responses;

namespace Umat.Osass.Promotion.Academic.Api.Services.Interfaces;

public interface IApplicationService
{
    public Task<IApiResponse<EligibilityResponse>> GetPromotionPositionEligibilityStatus(AuthData auth);
    public Task<IApiResponse<EligibilityForecastResponse>> GetEligibilityForecast(AuthData auth);
    public Task<IApiResponse<ApplicationCategoryStateResponse>> ApplicationCategoryState(AuthData auth, string? id=null);
    public Task<IApiResponse<ApplicationCategoryStateResponse>> StartAcademicPromotionApplication(AuthData auth);
    public Task<AcademicPromotionApplication> CreateAcademicPromotionApplication(string applicantId);

    //application review
    public Task<IApiResponse<OverallOverview>> ActiveApplicationOverallReview(AuthData auth, string? id=null);

    //submitted application
    public Task<IApiResponse<SubmittedApplicationResponse>> SubmittedApplicationPreview(AuthData auth, string? id=null);

    public Task<IApiResponse<bool>> SubmitApplication(AuthData auth);
    public Task<IApiResponse<List<PromotionHistoryResponse>>> GetPromotionHistory(AuthData auth);
    public Task<IApiResponse<PromotionLetterResponse>> GetPromotionLetter(AuthData auth, string? applicationId = null);

    // Required documents (CV & Application Letter)
    public Task<IApiResponse<ApplicationDocumentsResponse>> UploadApplicationDocuments(AuthData auth, UploadApplicationDocumentsRequest request);
    public Task<IApiResponse<ApplicationDocumentsResponse>> GetApplicationDocuments(AuthData auth);
}