using Umat.Osass.Email.Sdk.Models;

namespace Umat.Osass.Admin.Api.Actors.Messages;

public struct SendEmailMessage
{
    public SendEmailRequest Data { get; set; }

    public SendEmailMessage(SendEmailRequest data)
    {
        Data = data;
    }
    
}
