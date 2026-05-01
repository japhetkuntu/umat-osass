using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Umat.Osass.Identity.Api.Extensions;
public static class SerializationExtensions
{
    public static string Serialize<T>(this T @object, JsonSerializerSettings? settings = null)
        where T : notnull
    {
        settings ??= new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            Formatting = Formatting.Indented,
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };
        return JsonConvert.SerializeObject(@object, settings);
    }


    public static T? Deserialize<T>(this string json, JsonSerializerSettings? settings = null)
    {
        if (string.IsNullOrEmpty(json))
            return default;

        return JsonConvert.DeserializeObject<T>(json, settings);
    }

}