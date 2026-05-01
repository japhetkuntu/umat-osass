# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for all Umat.Osass backend APIs.
# Pass the project name via --build-arg PROJECT_NAME=<value>
# Example: docker build --build-arg PROJECT_NAME=Umat.Osass.Identity.Api .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG PROJECT_NAME
WORKDIR /src

# Copy solution + all source (shared SDKs are needed for full restore)
COPY Umat.Osass.sln ./
COPY src/ ./src/

# Restore only the target project (and its transitive dependencies)
RUN dotnet restore "src/${PROJECT_NAME}/${PROJECT_NAME}.csproj"

# Publish the target project in Release configuration
RUN dotnet publish "src/${PROJECT_NAME}/${PROJECT_NAME}.csproj" \
        --configuration Release \
        --output /app/publish \
        --no-restore

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published output from build stage
COPY --from=build /app/publish .

# ASP.NET Core will listen on 8080 inside the container;
# docker-compose maps this to the desired host port.
EXPOSE 8080

# The specific DLL is supplied by docker-compose via the `command:` override,
# e.g.  command: ["Umat.Osass.Identity.Api.dll"]
ENTRYPOINT ["dotnet"]
