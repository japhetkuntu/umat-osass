using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Identity.Api.Actors.Messages;

public struct SendEmailMessage
{
    public SendEmailRequest Data { get; set; }

    public SendEmailMessage(SendEmailRequest data)
    {
        Data = data;
    }
    
}
