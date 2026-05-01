using System;
using System.IO;
using System.Reflection;
using System.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using MimeKit;
using Umat.Osass.Email.Sdk.Models;
using Umat.Osass.Email.Sdk.Options;
using Umat.Osass.Email.Sdk.Services.Interfaces;

namespace Umat.Osass.Email.Sdk.Services.Implementations;

public class EmailService(EmailConfig config, ILogger<EmailService> logger) : IEmailService
{
    public async Task<MailtrapResponse<MailtrapSendMessageResponse>> SendEmail(
        SendEmailRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var message = new MimeMessage();
            var senderName = string.IsNullOrWhiteSpace(request.From?.Name)
                ? config.DefaultSenderName
                : request.From.Name;
            var senderEmail = string.IsNullOrWhiteSpace(request.From?.Email)
                ? config.DefaultSenderEmail
                : request.From.Email;

            message.From.Add(new MailboxAddress(senderName, senderEmail));

            if (request.ReplyTo != null && !string.IsNullOrWhiteSpace(request.ReplyTo.Email))
            {
                message.ReplyTo.Add(new MailboxAddress(
                    string.IsNullOrWhiteSpace(request.ReplyTo.Name) ? request.ReplyTo.Email : request.ReplyTo.Name,
                    request.ReplyTo.Email));
            }

            foreach (var to in request.To)
            {
                message.To.Add(new MailboxAddress(
                    string.IsNullOrWhiteSpace(to.Name) ? to.Email : to.Name,
                    to.Email));
            }

            foreach (var cc in request.Cc)
            {
                message.Cc.Add(new MailboxAddress(
                    string.IsNullOrWhiteSpace(cc.Name) ? cc.Email : cc.Name,
                    cc.Email));
            }

            foreach (var bcc in request.Bcc)
            {
                message.Bcc.Add(new MailboxAddress(
                    string.IsNullOrWhiteSpace(bcc.Name) ? bcc.Email : bcc.Name,
                    bcc.Email));
            }

            message.Subject = string.IsNullOrWhiteSpace(request.Subject)
                ? FormatTemplateId(request.TemplateId)
                : request.Subject;

            var htmlBody = await RenderHtmlAsync(request.TemplateId, request.TemplateVariables);
            var htmlPart = new TextPart("html") { Text = htmlBody };
            MimeEntity body = htmlPart;

            if (!string.IsNullOrWhiteSpace(request.Text))
            {
                body = new Multipart("alternative")
                {
                    new TextPart("plain") { Text = request.Text },
                    htmlPart
                };
            }

            if (request.Attachments?.Count > 0)
            {
                var mixed = new Multipart("mixed") { body };
                foreach (var attachment in request.Attachments)
                {
                    var content = Convert.FromBase64String(attachment.Content);
                    var mimePart = new MimePart(!string.IsNullOrWhiteSpace(attachment.Type)
                        ? ContentType.Parse(attachment.Type)
                        : new ContentType("application", "octet-stream"))
                    {
                        Content = new MimeContent(new MemoryStream(content)),
                        ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                        ContentTransferEncoding = ContentEncoding.Base64,
                        FileName = attachment.Filename
                    };
                    mixed.Add(mimePart);
                }

                body = mixed;
            }

            message.Body = body;

            if (request.Headers is { Count: > 0 })
            {
                foreach (var header in request.Headers)
                {
                    message.Headers.Add(header.Key, header.Value);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.TemplateId))
            {
                message.Headers.Add("X-Mailhog-Template", request.TemplateId);
            }

            using var client = new SmtpClient();
            var socketOptions = GetSecureSocketOptions();

            await client.ConnectAsync(config.SmtpHost, config.SmtpPort, socketOptions, cancellationToken);

            if (!string.IsNullOrWhiteSpace(config.SmtpUsername) && !string.IsNullOrWhiteSpace(config.SmtpPassword))
            {
                client.AuthenticationMechanisms.Remove("XOAUTH2");
                await client.AuthenticateAsync(config.SmtpUsername, config.SmtpPassword, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation(
                "Email sent via SMTP to {Recipients} (template: {Template})",
                string.Join(", ", request.To.Select(t => t.Email)),
                request.TemplateId);

            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = true,
                Data = new MailtrapSendMessageResponse {  },
            };
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send email via SMTP to {Recipients}",
                string.Join(", ", request.To.Select(t => t.Email)));

            return new MailtrapResponse<MailtrapSendMessageResponse>
            {
                IsSuccessful = false,
                Message = e.Message,
            };
        }
    }
    
    private static string FormatTemplateId(string? templateId)
    {
        if (string.IsNullOrWhiteSpace(templateId))
            return "Email Notification";

        return string.Join(' ', templateId
            .Replace('-', ' ')
            .Replace('_', ' ')
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(w => char.ToUpper(w[0]) + w[1..]));
    }

    private async Task<string> RenderHtmlAsync(string? templateId, object templateVariables)
    {
        var variables = ExtractVariables(templateVariables);
        var templatePath = GetTemplatePath(templateId ?? string.Empty);

        if (templatePath is not null && File.Exists(templatePath))
        {
            var templateText = await File.ReadAllTextAsync(templatePath);
            return ReplaceTemplateVariables(templateText, variables);
        }

        return BuildFallbackHtml(templateId ?? string.Empty, variables);
    }

    private SecureSocketOptions GetSecureSocketOptions()
    {
        if (config.UseSsl)
            return SecureSocketOptions.SslOnConnect;

        if (config.UseStartTls)
            return SecureSocketOptions.StartTls;

        if (config.SmtpPort == 465)
            return SecureSocketOptions.SslOnConnect;

        if (config.SmtpPort == 587)
            return SecureSocketOptions.StartTls;

        return SecureSocketOptions.Auto;
    }

    private string? GetTemplatePath(string templateId)
    {
        var candidate = Path.Combine(config.TemplateDirectory, $"{templateId}.html");
        if (File.Exists(candidate))
            return candidate;

        var baseCandidate = Path.Combine(AppContext.BaseDirectory, config.TemplateDirectory, $"{templateId}.html");
        if (File.Exists(baseCandidate))
            return baseCandidate;

        return null;
    }

    private string ReplaceTemplateVariables(string templateText, Dictionary<string, string> variables)
    {
        foreach (var (key, value) in variables)
        {
            templateText = templateText.Replace($"{{{{{key}}}}}", Sanitize(value), StringComparison.OrdinalIgnoreCase);
        }

        return templateText;
    }

    private static string BuildFallbackHtml(string templateId, Dictionary<string, string> variables)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html><head><meta charset=\"utf-8\"/>");
        sb.AppendLine("<style>");
        sb.AppendLine("body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f7;color:#333}");
        sb.AppendLine(".wrapper{max-width:600px;margin:0 auto;padding:24px}");
        sb.AppendLine(".card{background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)}");
        sb.AppendLine(".header{text-align:center;padding-bottom:24px;border-bottom:1px solid #eee;margin-bottom:24px}");
        sb.AppendLine(".header h1{margin:0;font-size:22px;color:#065f46}");
        sb.AppendLine(".header .badge{display:inline-block;background:#065f46;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;letter-spacing:1px;margin-bottom:8px}");
        sb.AppendLine(".content{font-size:15px;line-height:1.6}");
        sb.AppendLine(".var-block{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:16px 0;font-size:14px}");
        sb.AppendLine(".var-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #dcfce7}");
        sb.AppendLine(".var-row:last-child{border-bottom:none}");
        sb.AppendLine(".var-label{font-weight:600;color:#065f46;text-transform:capitalize}");
        sb.AppendLine(".var-value{color:#333}");
        sb.AppendLine(".otp{text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;color:#065f46;padding:16px 0}");
        sb.AppendLine(".footer{text-align:center;font-size:12px;color:#999;padding-top:20px;margin-top:24px;border-top:1px solid #eee}");
        sb.AppendLine(".btn{display:inline-block;background:#065f46;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:12px 0}");
        sb.AppendLine("</style></head><body>");
        sb.AppendLine("<div class=\"wrapper\"><div class=\"card\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<div class=\"badge\">UMAT ALUMNI</div>");
        sb.AppendLine($"<h1>{FormatTemplateId(templateId)}</h1>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");

        if (variables.TryGetValue("first_name", out var firstName))
            sb.AppendLine($"<p>Hi <strong>{Sanitize(firstName)}</strong>,</p>");
        else if (variables.TryGetValue("name", out var name))
            sb.AppendLine($"<p>Hi <strong>{Sanitize(name)}</strong>,</p>");

        if (variables.TryGetValue("otp_code", out var otp))
        {
            sb.AppendLine("<p>Your verification code is:</p>");
            sb.AppendLine($"<div class=\"otp\">{Sanitize(otp)}</div>");
            sb.AppendLine("<p>This code expires in 15 minutes. Do not share it with anyone.</p>");
        }

        if (variables.TryGetValue("register_url", out var registerUrl))
            sb.AppendLine($"<p><a class=\"btn\" href=\"{Sanitize(registerUrl)}\">Join UMaT Alumni</a></p>");
        else if (variables.TryGetValue("reset_url", out var resetUrl))
            sb.AppendLine($"<p><a class=\"btn\" href=\"{Sanitize(resetUrl)}\">Reset Password</a></p>");
        else if (variables.TryGetValue("action_url", out var actionUrl))
            sb.AppendLine($"<p><a class=\"btn\" href=\"{Sanitize(actionUrl)}\">Go to Portal</a></p>");

        var rendered = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "first_name", "name", "otp_code", "register_url", "reset_url", "action_url" };

        var remaining = variables.Where(kv => !rendered.Contains(kv.Key)).ToList();
        if (remaining.Count > 0)
        {
            sb.AppendLine("<div class=\"var-block\">");
            foreach (var (key, value) in remaining)
            {
                var label = string.Join(' ', key.Replace('_', ' ').Split(' ')
                    .Select(w => char.ToUpper(w[0]) + w[1..]));
                sb.AppendLine($"<div class=\"var-row\"><span class=\"var-label\">{Sanitize(label)}</span><span class=\"var-value\">{Sanitize(value)}</span></div>");
            }
            sb.AppendLine("</div>");
        }

        sb.AppendLine("</div>");
        sb.AppendLine("<div class=\"footer\">");
        sb.AppendLine("<p>&copy; UMaT Alumni Portal &bull; This email was sent from a local development server via Mailhog.</p>");
        sb.AppendLine("</div>");
        sb.AppendLine("</div></div></body></html>");

        return sb.ToString();
    }

    private static Dictionary<string, string> ExtractVariables(object templateVariables)
    {
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (templateVariables is null) return dict;

        foreach (var prop in templateVariables.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            var value = prop.GetValue(templateVariables);
            if (value is not null)
                dict[prop.Name] = value.ToString() ?? string.Empty;
        }

        return dict;
    }

    private static string Sanitize(string input)
    {
        return input
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;");
    }
}
