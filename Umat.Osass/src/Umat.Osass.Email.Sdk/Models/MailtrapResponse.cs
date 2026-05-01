namespace Umat.Osass.Email.Sdk.Models;

public class MailtrapResponse<T>
{
    public string Message { get; set; }
    public T? Data { get; set; }
    public bool IsSuccessful { get; set; }
}