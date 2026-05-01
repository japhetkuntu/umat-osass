namespace Umat.Osass.Storage.Sdk.Options
{
    public class StorageConfig
    {
        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
        public string BucketName { get; set; }
        public string Region { get; set; } // e.g. "nyc3"
        public string Endpoint { get; set; } // e.g. "https://nyc3.digitaloceanspaces.com"
        public string CdnEndpoint { get; set; } // e.g. "https://cdn.example.com" for CDN access
        public string FolderName { get; set; } // e.g. "uploads"
    }
}