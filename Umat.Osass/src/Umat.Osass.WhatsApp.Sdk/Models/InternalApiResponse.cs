namespace Umat.Osass.WhatsApp.Sdk.Models;

public class InternalApiResponse<T>
{
    public T? Data { get; set; }
    public string Message { get; set; }
    public bool IsSuccessful { get; set; }
    
}