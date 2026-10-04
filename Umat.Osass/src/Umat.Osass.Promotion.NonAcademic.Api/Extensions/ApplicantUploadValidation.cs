using System.Collections;
using System.ComponentModel.DataAnnotations;
using Umat.Osass.Storage.Sdk.Services.Implementations;

namespace Umat.Osass.Promotion.NonAcademic.Api.Extensions;

public static class ApplicantUploadValidation
{
    public static async Task ValidateAsync(object request)
    {
        foreach (var file in Files(request))
        {
            if (file.Length <= 0 || file.Length > UploadValidation.MaximumBytes)
                throw new InvalidDataException("An attachment must contain between 1 byte and 20 MB.");
            await using var source = file.OpenReadStream();
            using var validated = await UploadValidation.ReadAsync(source, file.FileName);
        }
    }

    private static IEnumerable<IFormFile> Files(object? value)
    {
        if (value is IFormFile file)
            yield return file;
        else if (value is IEnumerable items && value is not string)
        {
            foreach (var item in items)
                foreach (var nested in Files(item)) yield return nested;
        }
        else if (value != null && value.GetType().Namespace?.Contains(".Models.Requests") == true)
        {
            foreach (var property in value.GetType().GetProperties())
            {
                var propertyValue = property.GetValue(value);
                if (property.Name == "Score" && propertyValue is double score && !double.IsFinite(score))
                    throw new InvalidDataException("Scores must be finite numbers.");
                var errors = new List<ValidationResult>();
                if (!Validator.TryValidateProperty(propertyValue, new ValidationContext(value) { MemberName = property.Name }, errors))
                    throw new InvalidDataException(errors[0].ErrorMessage);
                foreach (var nested in Files(propertyValue)) yield return nested;
            }
        }
    }
}
