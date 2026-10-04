using Umat.Osass.AcademicPromotion.Sdk.Services;

namespace Umat.Osass.Tests;

public class PromotionApplicationServiceTests
{
    [Theory]
    [InlineData("Lecturer", "Senior Lecturer")]
    [InlineData("  senior LECTURER ", "Associate Professor")]
    [InlineData("Associate Professor", "Professor")]
    [InlineData("Research Fellow", "Senior Research Fellow")]
    [InlineData("Senior Research Fellow", "Associate Professor")]
    public void GetNextPosition_ReturnsNextRank_CaseAndWhitespaceInsensitive(string current, string expected) =>
        Assert.Equal(expected, PromotionApplicationService.GetNextPosition(current));

    [Theory]
    [InlineData("Professor")]
    [InlineData("Assistant Lecturer")]
    [InlineData("Research Assistant")]
    [InlineData("Tutor")]
    [InlineData("")]
    [InlineData("   ")]
    public void GetNextPosition_ReturnsNull_ForIneligibleOrUnknownRanks(string current) =>
        Assert.Null(PromotionApplicationService.GetNextPosition(current));

    [Fact]
    public void IneligibilityMessage_HandlesNullAndTopOfLadder() =>
        Assert.Contains("highest position", PromotionApplicationService.IneligibilityMessage(null));

    [Fact]
    public void IneligibilityMessage_IsTailoredForBelowEntryRanks()
    {
        Assert.Contains("Assistant Lecturers", PromotionApplicationService.IneligibilityMessage("Assistant Lecturer"));
        Assert.Contains("Research Fellow", PromotionApplicationService.IneligibilityMessage("Research Assistant"));
    }
}

public class ImageFormatterTests
{
    [Theory]
    [InlineData("https://cdn.example.com/academic/evidence/report.pdf", "report.pdf")]
    [InlineData("http://minio:9000/osass/academic/photo.png", "photo.png")]
    [InlineData("plain-name.jpg", "plain-name.jpg")]
    [InlineData("evidence/report.pdf?signature=temporary", "report.pdf")]
    [InlineData("https://cdn.example.com/report.pdf?signature=temporary", "report.pdf")]
    public void GetFileNameFromUrl_ExtractsFileName(string url, string expected) =>
        Assert.Equal(expected, ImageFormatter.GetFileNameFromUrl(url));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void GetFileNameFromUrl_ReturnsEmpty_ForBlankInput(string url) =>
        Assert.Equal(string.Empty, ImageFormatter.GetFileNameFromUrl(url));
}
