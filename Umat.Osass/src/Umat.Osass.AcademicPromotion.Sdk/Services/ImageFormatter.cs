namespace Umat.Osass.AcademicPromotion.Sdk.Services;

public class ImageFormatter
{
    public static string GetFileNameFromUrl(string fileUrl)
    {
        return string.IsNullOrWhiteSpace(fileUrl)
            ? string.Empty
            :
            // Handles full URLs and plain file names
            Path.GetFileName(new Uri(fileUrl, UriKind.RelativeOrAbsolute).LocalPath);
    }
}