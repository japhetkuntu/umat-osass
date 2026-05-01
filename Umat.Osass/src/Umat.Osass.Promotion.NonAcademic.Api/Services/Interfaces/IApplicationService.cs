using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Requests;
using Umat.Osass.Promotion.NonAcademic.Api.Models.Responses;

namespace Umat.Osass.Promotion.NonAcademic.Api.Services.Interfaces;

public interface IApplicationService
{
    Task<IApiResponse<EligibilityResponse>> GetPromotionPositionEligibilityStatus(AuthData auth);
    Task<IApiResponse<EligibilityForecastResponse>> GetEligibilityForecast(AuthData auth);
    Task<IApiResponse<ApplicationCategoryStateResponse>> ApplicationCategoryState(AuthData auth, string? id = null);
    Task<NonAcademicPromotionApplication> CreateNonAcademicPromotionApplication(string applicantId);
    Task<IApiResponse<OverallOverview>> ActiveApplicationOverallReview(AuthData auth, string? id = null);
    Task<IApiResponse<SubmittedApplicationResponse>> SubmittedApplicationPreview(AuthData auth, string? id = null);
    Task<IApiResponse<bool>> SubmitApplication(AuthData auth);
    Task<IApiResponse<List<PromotionHistoryResponse>>> GetPromotionHistory(AuthData auth);
    Task<IApiResponse<PromotionLetterResponse>> GetPromotionLetter(AuthData auth, string? applicationId = null);

    // Required documents (CV & Application Letter)
    Task<IApiResponse<ApplicationDocumentsResponse>> UploadApplicationDocuments(AuthData auth, UploadApplicationDocumentsRequest request);
    Task<IApiResponse<ApplicationDocumentsResponse>> GetApplicationDocuments(AuthData auth);
}
