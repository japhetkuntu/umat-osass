namespace Umat.Osass.NonAcademicPromotion.Sdk.Services;

public static class NonAcademicPromotionApplicationService
{
    /// <summary>
    /// Returns the next non-academic promotion grade for a given current position.
    /// Promotion through this platform is only available from Senior Member upwards.
    /// Anyone below Senior Member (e.g. Junior Member, Member) is NOT eligible to apply.
    /// </summary>
    public static string? GetNextPosition(string currentPosition)
    {
        if (string.IsNullOrWhiteSpace(currentPosition))
            return null;

        return currentPosition.Trim().ToLowerInvariant() switch
        {
            "senior member" => "Principal Member",
            "principal member" => "Deputy Director",
            "deputy director" => "Director",
            _ => null
        };
    }

    /// <summary>
    /// True when the applicant's current rank is below the minimum entry rank for non-academic promotion.
    /// Used to surface a clear, accurate message instead of a generic "top of ladder" notice.
    /// </summary>
    public static bool IsBelowEntryRank(string? currentPosition)
    {
        if (string.IsNullOrWhiteSpace(currentPosition)) return false;

        return currentPosition.Trim().ToLowerInvariant() switch
        {
            "junior member" or "member" => true,
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
            "junior member" or "member" =>
                "Non-academic promotion through this platform is available only to Senior Members and above. " +
                $"{currentPosition}s are not eligible to apply for promotion here.",

            _ => "You have reached the highest position available on this platform."
        };
    }
}

