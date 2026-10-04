using System.IO.Compression;
using System.Text;
using Umat.Osass.Storage.Sdk.Services.Implementations;

namespace Umat.Osass.Tests;

public class UploadValidationTests
{
    [Theory]
    [InlineData("page.html")]
    [InlineData("page.pdf")]
    [InlineData("page.png")]
    [InlineData("page.jpg")]
    [InlineData("page.jpeg")]
    [InlineData("page.docx")]
    [InlineData("page.xlsx")]
    public void RejectsHtmlIncludingDisguisedAttachments(string fileName)
    {
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate(Encoding.UTF8.GetBytes("<html><script>alert(1)</script></html>"), fileName));
    }

    [Fact]
    public void RejectsEmptyAndOversizeAttachments()
    {
        Assert.Throws<InvalidDataException>(() => UploadValidation.Validate([], "empty.pdf"));
        var oversized = new byte[UploadValidation.MaximumBytes + 1];
        "%PDF-"u8.CopyTo(oversized);
        Assert.Throws<InvalidDataException>(() => UploadValidation.Validate(oversized, "large.pdf"));
    }

    [Fact]
    public void AcceptsPdfAtSizeLimit()
    {
        var contents = new byte[UploadValidation.MaximumBytes];
        "%PDF-1.7\n"u8.CopyTo(contents);
        UploadValidation.Validate(contents, "document.PDF");
    }

    [Fact]
    public void AcceptsPdfAndSupportedImageSignatures()
    {
        UploadValidation.Validate("%PDF-1.7\n%%EOF"u8.ToArray(), "document.pdf");
        UploadValidation.Validate([137, 80, 78, 71, 13, 10, 26, 10], "image.png");
        UploadValidation.Validate([255, 216, 255, 224], "image.jpg");
        UploadValidation.Validate([255, 216, 255, 224], "image.jpeg");
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate("%PDF-1.7"u8.ToArray(), "document.exe"));
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate("%PDF-1.7"u8.ToArray(), "document.png"));
    }

    [Theory]
    [InlineData("broken.docx")]
    [InlineData("broken.xlsx")]
    public void RejectsMalformedZip(string fileName)
    {
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate([80, 75, 3, 4, 0, 0, 0], fileName));
        Assert.Throws<InvalidDataException>(() => UploadValidation.Validate(Archive(), fileName));
    }

    [Theory]
    [InlineData("document.docx", "word/document.xml")]
    [InlineData("document.xlsx", "xl/workbook.xml")]
    public void RequiresOfficeEntriesAndRejectsMacros(string fileName, string entry)
    {
        UploadValidation.Validate(Archive("[Content_Types].xml", entry), fileName);
        Assert.Throws<InvalidDataException>(() => UploadValidation.Validate(Archive(entry), fileName));
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate(Archive("[Content_Types].xml"), fileName));
        Assert.Throws<InvalidDataException>(() =>
            UploadValidation.Validate(Archive("[Content_Types].xml", entry, "word/VBAPROJECT.BIN"), fileName));
    }

    [Fact]
    public async Task ReadReturnsRewoundValidatedStream()
    {
        var bytes = "%PDF-1.7\n%%EOF"u8.ToArray();
        using var source = new MemoryStream(bytes);
        using var result = await UploadValidation.ReadAsync(source, "document.pdf");
        Assert.Equal(0, result.Position);
        Assert.Equal(bytes, result.ToArray());
    }

    private static byte[] Archive(params string[] entries)
    {
        using var stream = new MemoryStream();
        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
        {
            foreach (var entry in entries)
            {
                using var writer = new StreamWriter(archive.CreateEntry(entry).Open());
                writer.Write("<document />");
            }
        }
        return stream.ToArray();
    }
}
