# Production deployment

Use docker-compose.prod.yml for production. Only the gateway publishes public
ports 80 and 443; PostgreSQL, Redis and MinIO bind to loopback. Keep the host
firewall restricted to HTTPS, ACME HTTP and authorized SSH access. The MinIO
console must remain private, accessible through an SSH tunnel when needed.

The gateway has fixed address 172.30.90.10 on subnet 172.30.90.0/24.
Identity trusts forwarded headers only from that address via
AuthSecurity__KnownProxies__0 (plus the framework's default loopback trust).
Verify this subnet does not overlap host/VPN networks before deployment; if
changing it, update both the gateway address and Identity trusted-proxy setting.
Do not enable wildcard proxy trust. AUTH_IP_ATTEMPTS_PER_MINUTE defaults to 100;
account limits remain 10 login attempts per 15 minutes and 3 reset requests per
30 minutes, with 5 attempts per reset challenge.

The other API owners must verify forwarded-header processing occurs before
HTTPS redirects and trusts this same gateway address. HTTPS through the gateway
must be tested for redirect loops and accurate client IPs before launch.

## Credentials and initial administrator

Provision secrets outside version control through the deployment secret manager.
All tracked environment templates, including .env.production.test, contain blank
values. Populate a separate ignored deployment file; do not commit filled copies.
CI scans tracked working-tree files for recognizable credential patterns and
non-placeholder environment/JSON secret assignments, reporting paths and line
numbers only. This heuristic scan does not prove that all secrets are absent and
does not inspect or clean Git history.
Never print resolved Compose configuration or credentials in logs. Set
BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD explicitly for the initial
administrator. The password must have at least 16 characters and at most 72 UTF-8
bytes. Startup refuses to seed an empty admin database without valid credentials.
Existing admins are left unchanged. Remove bootstrap variables after initial
creation and rotate the bootstrap password through the application.

The SDK also accepts BootstrapAdmin:Email and BootstrapAdmin:Password through
IConfiguration; the existing one-argument entry point reads
BootstrapAdmin__Email and BootstrapAdmin__Password from the environment.

Previously exposed credentials require external rotation: administrator
passwords, database and Redis credentials where applicable, object-storage
credentials, signing keys, and mail/provider secrets. Revoke existing sessions
when rotating signing keys. Review deployed credentials and access logs with the
responsible operators. These changes do not remove secrets from Git history and
do not reset an already seeded administrator.

## TLS

The default gateway configuration is docker/nginx/nginx.tls.conf. It requires
a certificate named osass.umat.edu.gh in the shared certbot_conf volume, with SANs
for every hostname declared in that configuration (including www). Missing
certificates cause gateway startup to fail rather than serve application traffic
over HTTP. Port 80 serves ACME challenges and redirects other requests to HTTPS.

Before first startup, provision that certificate using DNS validation or a
temporary ACME-only HTTP listener. Do not expose the existing HTTP application
configuration during certificate issuance. The deploy.sh --ssl helper alone
does not enable HTTPS or guarantee the shared SAN certificate required here.
If overriding NGINX_CONF_FILE, supply a reviewed TLS configuration with the same
HTTP redirect and ACME-only behavior. nginx.ip.conf is for private development.

After renewal, test nginx configuration and reload nginx so it uses the renewed
certificate; the certbot renewal container does not reload nginx automatically.
Monitor certificate expiry and verify the served certificate and redirects for
each hostname before directing users to the deployment.

Publish MinIO's object API through a separately configured HTTPS reverse proxy
or managed storage endpoint, forwarding to loopback port 9000. Set
STORAGE_CDN_ENDPOINT to that HTTPS URL and STORAGE_ENDPOINT to the internal
container endpoint. Browser links must never use an exposed HTTP storage port.
STORAGE_CDN_ENDPOINT must be a browser-reachable S3 endpoint or reverse proxy
that preserves the signed Host header, path and query parameters. A bare cache
CDN is unsuitable. Configure the proxy so it does not rewrite the signed host or
strip signature parameters. File URLs expire after 15 minutes and use attachment
disposition and application/octet-stream responses.

Production bucket initialization disables anonymous access and fails on policy
errors. Existing running buckets remain public until operators successfully
apply the initialization policy; editing Compose alone does not update them.
Historical stored public URLs may need migration to object keys or refreshed
presigned links. Verify that old unsigned URLs are denied after policy rollout.
No live bucket policy or database changes have been applied by this patch.

## Migration orchestration

All startup migration extensions call DatabaseMigration.MigrateAsync in the
PostgreSQL SDK. The helper acquires the same session advisory-lock key for each
target database before applying migrations. Identity migration and administrator
seeding share one lock interval. A dedicated nonpooled connection owns the lock,
so EF migration transactions cannot release it prematurely and pooled sessions
cannot retain it. Connections close on errors; acquisition waits up to five
minutes before the existing startup retry policy runs.

PostgreSQL advisory locks are database-local: independent databases may migrate
concurrently, while services targeting the same database serialize. Any future
migration runner must use this helper or the same advisory lock protocol.
Do not run an uncoordinated EF migration command during service startup.

## Verification

CI runs each portal's test and typecheck scripts and builds all five portals, then
builds the .NET solution and runs the existing test project, including upload and
bootstrap validation tests. Reset guard tests use a dedicated Redis instance on
loopback port 16389 with random test keys, checking atomic consumption and the
five-attempt limit. Start an isolated Redis instance on that port for local tests;
CI supplies its own disposable Redis service. No CI job connects to production.

Portal tests are required CI checks; assessment portals currently need test
suites added by their owners. Lint runs for every portal as an explicitly
advisory step until existing violations and missing assessment ESLint
configurations are resolved. Remove continue-on-error from the lint step to
make it required once that cleanup is complete. Local audit results were:
academic 27 errors/17 warnings, admin 3 errors/10 warnings, non-academic
56 errors/19 warnings; assessment portals lacked ESLint configurations.
No blanket frontend lint changes are included in this deployment patch.

For local .NET checks in constrained environments, use single-node builds with
node reuse and shared compilation disabled:

```sh
dotnet test Umat.Osass/tests/Umat.Osass.Tests/Umat.Osass.Tests.csproj -m:1 -nodeReuse:false -p:UseSharedCompilation=false -clp:ErrorsOnly
```

Use synthetic variables and an isolated temporary working directory when
validating Compose; never read deployment .env files or print resolved secrets.
