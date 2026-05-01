using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umat.Osass.WhatsApp.Sdk.Models;
using Umat.Osass.WhatsApp.Sdk.Models.Requests;
using Umat.Osass.WhatsApp.Sdk.Options;
using Umat.Osass.WhatsApp.Sdk.Services.Interfaces;

namespace Umat.Osass.WhatsApp.Sdk.Services.Implementations;

public class WhatsAppService:IWhatsAppService
{
    private readonly ILogger<WhatsAppService> _logger;
    private readonly HttpClient _httpClient;

    public WhatsAppService(IOptions<WhatsAppConfig> config, ILogger<WhatsAppService> logger)
    {
        var config1 = config.Value;
        _logger = logger;
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(config1.BaseUrl)
        };
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", config1.ApiKey);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<InternalApiResponse<SendMessageResponse>> SendTextMessage(SendTextMessageRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[.SendTextMessage] Received request to send text message with request: {request}", JsonSerializer.Serialize(request));
            var jsonData = JsonSerializer.Serialize(request);
        
            var content  = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/send-message", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[.SendTextMessage] Sending message failed with : {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send message",
                    IsSuccessful = false
                };
            }
            
            var sendMessageRes = JsonSerializer.Deserialize<WhatsAppApiResponse<SendMessageResponse>>(responseContent);
            if (sendMessageRes == null)
            {
                _logger.LogDebug("[.SendTextMessage] Failed to deserialize response with status code: {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send email",
                    IsSuccessful = false
                }; 
            }
            if (true.Equals(sendMessageRes.Success))
            {
                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = sendMessageRes.Data,
                    Message = "Message sent successfully",
                    IsSuccessful = true
                }; 
            }
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 

        }
        catch (Exception e)
        {
            _logger.LogError(e,"[.SendTextMessage] Exception occured while sending text message with request : {request}", request);
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 
        }
    }
    
       public async Task<InternalApiResponse<SendMessageResponse>> SendImageMessage(SendImageMessage request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[.SendImageMessage] Received request to send message with request: {request}", JsonSerializer.Serialize(request));
            var jsonData = JsonSerializer.Serialize(request);
        
            var content  = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/send-message", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[.SendImageMessage] Sending text message failed with : {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send message",
                    IsSuccessful = false
                };
            }
            
            var sendMessageRes = JsonSerializer.Deserialize<WhatsAppApiResponse<SendMessageResponse>>(responseContent);
            if (sendMessageRes == null)
            {
                _logger.LogDebug("[.SendImageMessage] Failed to deserialize response with status code: {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send message",
                    IsSuccessful = false
                }; 
            }
            if (true.Equals(sendMessageRes.Success))
            {
                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = sendMessageRes.Data,
                    Message = "Message sent successfully",
                    IsSuccessful = true
                }; 
            }
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 

        }
        catch (Exception e)
        {
            _logger.LogError(e,"[.SendImageMessage] Exception occured while sending message with request : {request}", request);
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 
        }
    }
       
              public async Task<InternalApiResponse<SendMessageResponse>> SendDocumentMessage(SendDocumentMessage request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[.SendDocumentMessage] Received request to send message with request: {request}", JsonSerializer.Serialize(request));
            var jsonData = JsonSerializer.Serialize(request);
        
            var content  = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/send-message", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[.SendDocumentMessage] Sending text message failed with : {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send message",
                    IsSuccessful = false
                };
            }
            
            var sendMessageRes = JsonSerializer.Deserialize<WhatsAppApiResponse<SendMessageResponse>>(responseContent);
            if (sendMessageRes == null)
            {
                _logger.LogDebug("[.SendDocumentMessage] Failed to deserialize response with status code: {StatusCode} and response: {Response}", response.StatusCode, responseContent);

                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = null,
                    Message = "Failed to send message",
                    IsSuccessful = false
                }; 
            }
            if (true.Equals(sendMessageRes.Success))
            {
                return new InternalApiResponse<SendMessageResponse>
                {
                    Data = sendMessageRes.Data,
                    Message = "Message sent successfully",
                    IsSuccessful = true
                }; 
            }
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 

        }
        catch (Exception e)
        {
            _logger.LogError(e,"[.SendDocumentMessage] Exception occured while sending message with request : {request}", request);
            return new InternalApiResponse<SendMessageResponse>
            {
                Data = null,
                Message = "Failed to send message",
                IsSuccessful = false
            }; 
        }
    }
}