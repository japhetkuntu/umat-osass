using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;
using Umat.Osass.Storage.Sdk.Options;
using Umat.Osass.Storage.Sdk.Services.Implementations;

namespace Umat.Osass.Tests;

public class PrivateUploadTests
{
    [Fact]
    public async Task AttachmentIsPrivateAndSignedResponseCannotServeHtml()
    {
        var bucket = $"osass-test-{Guid.NewGuid():N}";
        var settings = new StorageConfig
        {
            Endpoint = "http://127.0.0.1:19002",
            CdnEndpoint = "http://127.0.0.1:19002",
            AccessKey = "test-only-access",
            SecretKey = "test-only-private-storage-password",
            BucketName = bucket,
            FolderName = "evidence"
        };
        using var client = new AmazonS3Client(settings.AccessKey, settings.SecretKey,
            new AmazonS3Config { ServiceURL = settings.Endpoint, ForcePathStyle = true });
        await client.PutBucketAsync(new PutBucketRequest { BucketName = bucket });
        try
        {
            var service = new StorageService(Options.Create(settings));
            var contents = "%PDF-1.7\n%%EOF"u8.ToArray();
            using var stream = new MemoryStream(contents);
            var upload = new FormFile(stream, 0, contents.Length, "evidence", "proof.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/html"
            };
            await service.UploadFileAsync(upload, "proof.pdf");
            using var http = new HttpClient();
            using var anonymous = await http.GetAsync($"{settings.Endpoint}/{bucket}/evidence/proof.pdf");
            Assert.Equal(HttpStatusCode.Forbidden, anonymous.StatusCode);
            var signed = service.GetFileUrl("proof.pdf");
            Assert.Equal("http", new Uri(signed).Scheme);
            Assert.Contains("X-Amz-Expires=900", signed);
            using var authorized = await http.GetAsync(signed);
            Assert.Equal(HttpStatusCode.OK, authorized.StatusCode);
            Assert.Equal("application/octet-stream", authorized.Content.Headers.ContentType?.MediaType);
            Assert.Equal("attachment", authorized.Content.Headers.ContentDisposition?.DispositionType);
            Assert.Equal(contents, await authorized.Content.ReadAsByteArrayAsync());
        }
        finally
        {
            await client.DeleteObjectAsync(bucket, "evidence/proof.pdf");
            await client.DeleteBucketAsync(bucket);
        }
    }
}
