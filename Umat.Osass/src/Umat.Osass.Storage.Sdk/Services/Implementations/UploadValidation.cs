using System.IO.Compression;

namespace Umat.Osass.Storage.Sdk.Services.Implementations;

public static class UploadValidation
{
    public const int MaximumBytes = 20 * 1024 * 1024;

    public static async Task<MemoryStream> ReadAsync(Stream source, string fileName)
    {
        var buffer = new byte[81920];
        var result = new MemoryStream();
        try
        {
            int read;
            while ((read = await source.ReadAsync(buffer)) > 0)
            {
                if (result.Length + read > MaximumBytes)
                    throw new InvalidDataException("Files must be no larger than 20 MB.");
                await result.WriteAsync(buffer.AsMemory(0, read));
            }
            Validate(result.ToArray(), fileName);
            result.Position = 0;
            return result;
        }
        catch
        {
            result.Dispose();
            throw;
        }
    }

    public static void Validate(byte[] contents, string fileName)
    {
        if (contents.Length == 0 || contents.Length > MaximumBytes)
            throw new InvalidDataException("An attachment must contain between 1 byte and 20 MB.");
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var valid = extension switch
        {
            ".pdf" => contents.AsSpan().StartsWith("%PDF-"u8),
            ".png" => contents.AsSpan().StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => contents.AsSpan().StartsWith(new byte[] { 255, 216, 255 }),
            ".docx" => IsOfficeArchive(contents, "word/document.xml"),
            ".xlsx" => IsOfficeArchive(contents, "xl/workbook.xml"),
            _ => false
        };
        if (!valid)
            throw new InvalidDataException("Upload a valid PDF, PNG, JPEG, DOCX or XLSX attachment.");
    }

    private static bool IsOfficeArchive(byte[] contents, string documentEntry)
    {
        try
        {
            using var archive = new ZipArchive(new MemoryStream(contents), ZipArchiveMode.Read);
            return archive.Entries.Count <= 1000 &&
                archive.Entries.Sum(entry => entry.Length) <= 100L * 1024 * 1024 &&
                archive.GetEntry("[Content_Types].xml") != null &&
                archive.GetEntry(documentEntry) != null &&
                !archive.Entries.Any(entry => entry.FullName.EndsWith("vbaProject.bin", StringComparison.OrdinalIgnoreCase));
        }
        catch (InvalidDataException)
        {
            return false;
        }
    }
}
