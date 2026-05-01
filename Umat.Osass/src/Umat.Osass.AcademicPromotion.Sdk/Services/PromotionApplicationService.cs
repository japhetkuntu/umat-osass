namespace Umat.Osass.AcademicPromotion.Sdk.Services;

public static class PromotionApplicationService
{
    /// <summary>
    /// Returns the next academic position for a given current position.
    /// Academic promotion through this platform is only available to:
    ///   • Teaching track  : Lecturer and above
    ///   • Research track  : Research Fellow and above
    /// Anyone below those entry ranks (e.g. Assistant Lecturer, Research Assistant,
    /// Tutor, Teaching/Research Assistant) is NOT eligible to apply for promotion here.
    /// </summary>
    public static string? GetNextPosition(string currentPosition)
    {
        if (string.IsNullOrWhiteSpace(currentPosition))
            return null;

        return currentPosition.Trim().ToLowerInvariant() switch
        {
            // Teaching track (entry: Lecturer)
            "lecturer" => "Senior Lecturer",
            "senior lecturer" => "Associate Professor",
            "associate professor" => "Professor",

            // Research track (entry: Research Fellow)
            "research fellow" => "Senior Research Fellow",
            "senior research fellow" => "Associate Professor",

            _ => null
        };
    }

    /// <summary>
    /// True when the applicant's current rank is below the minimum entry rank for academic promotion.
    /// Used to surface a clear, accurate message to the user instead of a generic "top of ladder" notice.
    /// </summary>
    public static bool IsBelowEntryRank(string? currentPosition)
    {
        if (string.IsNullOrWhiteSpace(currentPosition)) return false;

        return currentPosition.Trim().ToLowerInvariant() switch
        {
            "assistant lecturer"
                or "teaching assistant"
                or "tutor"
                or "research assistant" => true,
            _ => false
        };
    }

    /// <summary>
    /// Human-readable message explaining why the applicant cannot promote.
    /// Returns a tailored message for below-entry ranks; otherwise the generic top-of-ladder message.
    /// </summary>
    public static string IneligibilityMessage(string? currentPosition)
    {
        var pos = (currentPosition ?? string.Empty).Trim().ToLowerInvariant();

        return pos switch
        {
            "assistant lecturer" =>
                "Academic promotion through this platform is available only to Lecturers and above. " +
                "Assistant Lecturers are not eligible to apply for promotion here.",

            "teaching assistant" or "tutor" =>
                "Academic promotion through this platform is available only to Lecturers and above. " +
                $"{currentPosition}s are not eligible to apply for promotion here.",

            "research assistant" =>
                "Promotion on the research track starts from Research Fellow. " +
                "Research Assistants are not eligible to apply for promotion through this platform.",

            _ => "You have reached the highest position available on this platform."
        };
    }
}