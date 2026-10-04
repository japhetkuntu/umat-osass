namespace Umat.Osass.AcademicPromotion.Sdk.Services;

public class ImageFormatter
{
    public static string GetFileNameFromUrl(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return string.Empty;
        var path = Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri)
            ? uri.LocalPath
            : fileUrl.Split('?', '#')[0];
        return Path.GetFileName(path);
    }
}
