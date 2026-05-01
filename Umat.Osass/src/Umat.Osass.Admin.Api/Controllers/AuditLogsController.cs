using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.Admin.Api.Models.Filter;
using Umat.Osass.Admin.Api.Models.Responses;
using Umat.Osass.Common.Sdk.Extensions;
using Umat.Osass.Common.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Entities.Identity;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.Admin.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ApiResponse<object>))]
[Authorize(AuthenticationSchemes = $"{CommonConstants.AuthScheme.Bearer}")]
public class AuditLogsController : DefaultController
{
    private readonly ILogger<AuditLogsController> _logger;
    private readonly IIdentityPgRepository<AuditLog> _auditLogRepository;

    public AuditLogsController(
        ILogger<AuditLogsController> logger,
        IIdentityPgRepository<AuditLog> auditLogRepository)
    {
        _logger = logger;
        _auditLogRepository = auditLogRepository;
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PagedResult<AuditLogResponse>>))]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogFilter filter)
    {
        try
        {
            var auth = User.GetAccount();
            _logger.LogInformation("[GetAuditLogs] Request by {Actor}", auth.Id);

            var query = _auditLogRepository.GetQueryableAsync();

            if (!string.IsNullOrWhiteSpace(filter.Platform))
                query = query.Where(x => x.Platform == filter.Platform);

            if (!string.IsNullOrWhiteSpace(filter.PerformedByUserId))
                query = query.Where(x => x.PerformedByUserId == filter.PerformedByUserId);

            if (!string.IsNullOrWhiteSpace(filter.EntityType))
                query = query.Where(x => x.Action.ToLower().Contains(filter.EntityType.ToLower()));

            if (!string.IsNullOrWhiteSpace(filter.Search))
                query = query.Where(x =>
                    x.Action.ToLower().Contains(filter.Search.ToLower()) ||
                    x.PerformedByUserId.ToLower().Contains(filter.Search.ToLower()));

            if (filter.From.HasValue)
                query = query.Where(x => x.CreatedAt >= filter.From.Value);

            if (filter.To.HasValue)
                query = query.Where(x => x.CreatedAt <= filter.To.Value);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var responseList = logs.Select(log =>
            {
                var meta = TryParseMetadata(log.Metadata);
                return new AuditLogResponse
                {
                    Id = log.Id,
                    Platform = log.Platform,
                    Action = log.Action,
                    PerformedByUserId = log.PerformedByUserId,
                    CreatedAt = log.CreatedAt,
                    HttpMethod = meta?.httpMethod,
                    RequestPath = meta?.requestPath,
                    EntityType = meta?.entityType,
                    EntityId = meta?.entityId,
                    PerformedByName = meta?.performedByName,
                    PerformedByEmail = meta?.performedByEmail,
                    PerformedByRole = meta?.performedByRole,
                    IpAddress = meta?.ipAddress,
                    UserAgent = meta?.userAgent,
                    StatusCode = meta?.statusCode,
                };
            }).ToList();

            var pagedResult = new PagedResult<AuditLogResponse>(responseList, filter.Page, filter.PageSize, responseList.Count, totalCount);
            var response = pagedResult.ToOkApiResponse("Audit logs retrieved");
            return StatusCode(response.Code, response);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[GetAuditLogs] Failed to retrieve audit logs");
            return StatusCode(500, new ApiResponse<object>("Failed to retrieve audit logs", 500));
        }
    }

    private static AuditMetadataDto? TryParseMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<AuditMetadataDto>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch { return null; }
    }

    // Internal DTO matching the JSON written by AuditLogMiddleware
    private sealed class AuditMetadataDto
    {
        public string? httpMethod { get; set; }
        public string? requestPath { get; set; }
        public string? entityType { get; set; }
        public string? entityId { get; set; }
        public string? performedByName { get; set; }
        public string? performedByEmail { get; set; }
        public string? performedByRole { get; set; }
        public string? ipAddress { get; set; }
        public string? userAgent { get; set; }
        public int? statusCode { get; set; }
    }
}
