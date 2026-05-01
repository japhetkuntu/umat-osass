using Umat.Osass.Identity.Api.Extensions;
using Umat.Osass.Identity.Api.Actors.Messages;
using Umat.Osass.Identity.Api.Models.Requests;
using Umat.Osass.Identity.Api.Services.Interfaces;

namespace Umat.Osass.Identity.Api.Actors;

public class AddStaffActor : BaseActor
{
    private readonly ILogger _logger;
        private readonly IServiceProvider _serviceProvider;

    public AddStaffActor(ILogger<AddStaffActor> logger,IServiceProvider serviceProvider)
    {
        ReceiveAsync<AddBulkStaffMessage>(AddBulkStaff);

     _serviceProvider = serviceProvider;
        _logger = logger;
    }

private async Task AddBulkStaff(AddBulkStaffMessage message)
{
    try
    {
        _logger.LogInformation(
            "Received request to process bulk staff upload. File: {fileName}",
            message.Data.FileName
        );

        if (message.Data.FileBytes == null || message.Data.FileBytes.Length == 0)
            throw new InvalidOperationException("Uploaded staff file is empty");

        using var scope = _serviceProvider.CreateScope();
        var staffService = scope.ServiceProvider.GetRequiredService<IStaffService>();

        using var stream = new MemoryStream(message.Data.FileBytes);
        using var workbook = new ClosedXML.Excel.XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        // assume row 1 = headers
        var rows = worksheet.RowsUsed().Skip(2);

        foreach (var row in rows)
        {
            try
            {
                 var dateString = row.Cell(10).GetString().Trim();

                 DateTime? parsedDate = null;

                 if (DateTime.TryParse(dateString, out var date))
                 {
                     parsedDate = DateTime.SpecifyKind(date, DateTimeKind.Local).ToUniversalTime();
                 }

                 if (parsedDate == null)
                 {
                     _logger.LogInformation("[AddBulkStaff] Record does not have last appointment or promotion data" +
                                            "with raw record: {Record}", row.Serialize());
                     break;
                 }
                var request = new AddStaffRequest
                {
                    Email = row.Cell(1).GetString().Trim(),
                    FirstName = row.Cell(2).GetString().Trim(),
                    LastName = row.Cell(3).GetString().Trim(),
                    Rank = row.Cell(4).GetString().Trim(),
                    Title = row.Cell(5).GetString().Trim(),
                    StaffId = row.Cell(6).GetString().Trim(),
                    DepartmentId =row.Cell(7).GetString().Trim(),
                    Position =row.Cell(8).GetString().Trim(),
                    PreviousPosition = row.Cell(9).GetString().Trim(),
                    LastAppointmentOrPromotionDate = (DateTime)parsedDate,
                    StaffCategory = row.Cell(11).GetString().Trim()
                };

                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    _logger.LogWarning(
                        "Skipping row {rowNumber} due to missing email",
                        row.RowNumber()
                    );
                    continue;
                }

                await staffService.AddStaff(request, message.Data.AuthData);
            }
            catch (Exception rowEx)
            {
                _logger.LogError(
                    rowEx,
                    "Failed to process staff row {rowNumber}",
                    row.RowNumber()
                );
                // keep going – bulk ops should be resilient
            }
        }

        _logger.LogInformation("Bulk staff processing completed successfully");
    }
    catch (Exception ex)
    {
        _logger.LogError(
            ex,
            "Failed to process bulk staff upload. File: {fileName}",
            message.Data.FileName
        );
        throw;
    }
}

}

