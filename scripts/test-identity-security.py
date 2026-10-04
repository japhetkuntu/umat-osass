import json
import secrets
import subprocess
import time
import urllib.error
import urllib.request
import uuid


def docker(*arguments):
    return subprocess.check_output(["docker", *arguments], text=True, stderr=subprocess.PIPE).strip()


def main():
    suffix = uuid.uuid4().hex[:10]
    network = f"osass-test-{suffix}"
    postgres = f"{network}-postgres"
    redis = f"{network}-redis"
    identity = f"{network}-identity"
    password = secrets.token_urlsafe(24)
    database_password = secrets.token_urlsafe(24)
    email = f"audit-{suffix}@umat.edu.gh"
    containers = []
    docker("network", "create", network)

    def request(path, body=None, token=None, method=None):
        headers = {"Origin": "http://localhost:3005"}
        if body is not None:
            headers["Content-Type"] = "application/json"
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if method == "OPTIONS":
            headers["Access-Control-Request-Method"] = "POST"
            headers["Access-Control-Request-Headers"] = "content-type"
        data = None if body is None else json.dumps(body).encode()
        if method == "POST" and body is None:
            headers["Content-Type"] = "multipart/form-data; boundary=audit"
            data = b"--audit--\r\n"
        message = urllib.request.Request(
            f"http://127.0.0.1:15601{path}",
            data=data,
            headers=headers, method=method,
        )
        try:
            response = urllib.request.urlopen(message, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        contents = response.read()
        is_json = "application/json" in response.headers.get("Content-Type", "")
        return response.status, json.loads(contents) if contents and is_json else {}, response.headers

    def credential(path, email_address, credential_password):
        status, response, _ = request(path, {"email": email_address, "password": credential_password})
        assert status == 200, f"Login returned {status}"
        return response["data"]["accessToken"]

    def challenge_otp(unique_id):
        for key in docker("exec", redis, "redis-cli", "--raw", "KEYS", "*").splitlines():
            if unique_id in key and not key.endswith(":attempts"):
                value = json.loads(docker("exec", redis, "redis-cli", "--raw", "GET", key))
                return value.get("OTP") or value.get("OtpCode")
        raise AssertionError("Synthetic challenge not found")

    try:
        docker("run", "--rm", "-d", "--name", postgres, "--network", network,
               "-e", "POSTGRES_USER=audit", "-e", f"POSTGRES_PASSWORD={database_password}",
               "-e", "POSTGRES_DB=audit_identity", "postgres:15-alpine")
        containers.append(postgres)
        docker("run", "--rm", "-d", "--name", redis, "--network", network, "redis:7-alpine")
        containers.append(redis)
        for _ in range(60):
            try:
                docker("exec", postgres, "pg_isready", "-U", "audit")
                break
            except subprocess.CalledProcessError:
                time.sleep(0.5)
        environment = {
            "ASPNETCORE_ENVIRONMENT": "Production",
            "ASPNETCORE_URLS": "http://+:8080",
            "ConnectionStrings__IdentityConnection":
                f"Host={postgres};Database=audit_identity;Username=audit;Password={database_password}",
            "Redis__IdentityRedisConfig__ConnectionString": f"{redis}:6379",
            "Redis__IdentityRedisConfig__DbNumber": "0",
            "Redis__IdentityRedisConfig__Alias": "disposable-security-tests",
            "BearerTokenConfig__Issuer": "https://audit.example.invalid",
            "BearerTokenConfig__Audience": "https://audit.example.invalid",
            "BearerTokenConfig__ApplicantSigningKey": secrets.token_urlsafe(48),
            "BearerTokenConfig__AdminSigningKey": secrets.token_urlsafe(48),
            "BootstrapAdmin__Email": "bootstrap@example.invalid",
            "BootstrapAdmin__Password": password,
            "ExtraConfig__UniversityDomain": "umat.edu.gh",
            "EmailConfig__SmtpHost": "127.0.0.1",
            "EmailConfig__SmtpPort": "1",
        }
        arguments = ["run", "--rm", "-d", "--name", identity, "--network", network,
                     "-p", "127.0.0.1:15601:8080"]
        for key, value in environment.items():
            arguments.extend(["-e", f"{key}={value}"])
        docker(*arguments, "osass/identity-api:audit", "Umat.Osass.Identity.Api.dll")
        containers.append(identity)
        for _ in range(120):
            try:
                if request("/health")[0] == 200:
                    break
            except (OSError, json.JSONDecodeError):
                pass
            time.sleep(0.5)
        else:
            diagnostics = docker("logs", "--tail", "30", identity)
            for key, value in environment.items():
                if any(label in key.lower() for label in ("password", "signingkey", "connectionstring")):
                    diagnostics = diagnostics.replace(value, "[test-setting]")
            print(diagnostics, flush=True)
            raise AssertionError("Isolated identity API did not become healthy")

        admin_token = credential("/api/v1/Admins/login", "bootstrap@example.invalid", password)
        assert request("/api/v1/Staffs/add-bulk", token=admin_token, method="POST")[0] == 400
        status = request("/api/v1/Staffs/add-bulk", method="POST")[0]
        assert status == 401, f"Anonymous bulk probe returned {status}"
        registration = {
            "email": email, "password": password, "confirmPassword": password,
            "firstName": "Disposable", "lastName": "Audit", "title": "Dr",
            "rank": "Lecturer", "staffId": suffix, "staffCategory": "Academic",
        }
        status, registered, _ = request("/api/v1/Staffs/register", registration)
        assert status == 200, f"Synthetic registration returned {status}"
        unique_id = registered["data"]["uniqueId"]
        status, repeated, _ = request("/api/v1/Staffs/register", registration)
        assert status == 200 and repeated["data"]["uniqueId"] == unique_id
        status, verified, _ = request("/api/v1/Staffs/register/verify-email", {
            "uniqueId": unique_id, "otp": challenge_otp(unique_id),
        })
        assert status == 200, f"Synthetic verification returned {status}"
        staff_token = verified["data"]["accessToken"]
        assert request("/api/v1/Staffs/add-bulk", token=staff_token, method="POST")[0] == 403
        print("PASS: bulk import rejects anonymous and applicant tokens; admin route remains available", flush=True)

        status, reset, _ = request(f"/api/v1/Staffs/reset-password/{email}")
        assert status == 200
        unique_id = reset["data"]["uniqueId"]
        otp = challenge_otp(unique_id)
        replacement = secrets.token_urlsafe(24)
        reset_body = {"uniqueId": unique_id, "otpCode": "000000",
                      "password": replacement, "confirmPassword": replacement}
        for _ in range(5):
            assert request("/api/v1/Staffs/reset-password", reset_body)[0] == 400
        reset_body["otpCode"] = otp
        assert request("/api/v1/Staffs/reset-password", reset_body)[0] == 400
        print("PASS: five failed reset guesses invalidate even a subsequent correct code", flush=True)

        status, reset, _ = request(f"/api/v1/Staffs/reset-password/{email}")
        assert status == 200
        unique_id = reset["data"]["uniqueId"]
        reset_body.update(uniqueId=unique_id, otpCode=challenge_otp(unique_id))
        assert request("/api/v1/Staffs/reset-password", reset_body)[0] == 200
        assert request("/api/v1/Staffs/reset-password", reset_body)[0] == 400
        print("PASS: a successful synthetic reset cannot be replayed", flush=True)

        status, reset, _ = request("/api/v1/Admins/reset-password/bootstrap@example.invalid")
        assert status == 200
        admin_challenge = reset["data"]["uniqueId"]
        admin_body = {"uniqueId": admin_challenge, "otpCode": challenge_otp(admin_challenge),
                      "password": replacement, "confirmPassword": replacement}
        assert request("/api/v1/Admins/reset-password", admin_body)[0] == 200
        assert request("/api/v1/Admins/reset-password", admin_body)[0] == 400
        credential("/api/v1/Admins/login", "bootstrap@example.invalid", replacement)
        print("PASS: administrator reset consumes its challenge and preserves login", flush=True)

        fake_email = f"unknown-{suffix}@example.invalid"
        for _ in range(10):
            assert request("/api/v1/Staffs/login", {"email": fake_email, "password": password})[0] == 400
        status, _, headers = request("/api/v1/Staffs/login", {"email": fake_email, "password": password})
        assert status == 429
        assert headers.get("Access-Control-Allow-Origin") == "*"
        for _ in range(100):
            assert request("/api/v1/Staffs/login", method="OPTIONS")[0] in (200, 204)
        credential("/api/v1/Staffs/login", email, replacement)
        print("PASS: account login throttle returns a CORS-visible 429; preflights do not consume attempts", flush=True)
    finally:
        for container in reversed(containers):
            try:
                docker("rm", "-f", container)
            except subprocess.CalledProcessError:
                pass
        docker("network", "rm", network)


if __name__ == "__main__":
    main()
