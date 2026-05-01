using Umat.Osass.WhatsApp.Sdk.Models;
using Umat.Osass.WhatsApp.Sdk.Models.Requests;

namespace Umat.Osass.WhatsApp.Sdk.Services.Interfaces;

public interface IWhatsAppService
{
    public Task<InternalApiResponse<SendMessageResponse>> SendTextMessage(SendTextMessageRequest request,CancellationToken cancellationToken = default);
    public Task<InternalApiResponse<SendMessageResponse>> SendImageMessage(SendImageMessage request,CancellationToken cancellationToken = default);
    public Task<InternalApiResponse<SendMessageResponse>> SendDocumentMessage(SendDocumentMessage request,CancellationToken cancellationToken = default);
}