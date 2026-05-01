---
name: backend-project-structure
user-invocable: true
description: "Describe the backend service project structure for the Umat.Osass workspace, including service roots, API projects, SDK projects, and the common folder layout for backend services. Use when asked about backend architecture, service layout, or project structure."
---

# Backend Project Structure

This skill is for describing the backend service layout in the `Umat.Osass/src` workspace.

## Backend roots

- `Umat.Osass/src/`

## Service projects

- `Umat.Osass.Admin.Api/`
- `Umat.Osass.Identity.Api/`
- `Umat.Osass.Promotion.Academic.Api/`
- `Umat.Osass.Promotion.NonAcademic.Api/`
- `Umat.Osass.AcademicPromotion.Sdk/`
- `Umat.Osass.NonAcademicPromotion.Sdk/`
- `Umat.Osass.Common.Sdk/`
- `Umat.Osass.Email.Sdk/`
- `Umat.Osass.PostgresDb.Sdk/`
- `Umat.Osass.Redis.Sdk/`
- `Umat.Osass.Storage.Sdk/`
- `Umat.Osass.WhatsApp.Sdk/`

## Typical API project layout

For API services such as `Umat.Osass.Admin.Api`, `Umat.Osass.Identity.Api`, and `Umat.Osass.Promotion.Academic.Api`:

- `Actors/`
- `Controllers/`
- `Extensions/`
- `Middlewares/`
- `Models/`
- `Options/`
- `Program.cs`
- `Properties/`
- `Services/`
- `{ProjectName}.csproj`
- `appsettings.json`
- `appsettings.Development.json`

## Typical SDK/library layout

For SDK projects such as `Umat.Osass.Common.Sdk`, `Umat.Osass.Email.Sdk`, `Umat.Osass.PostgresDb.Sdk`, `Umat.Osass.Redis.Sdk`, `Umat.Osass.Storage.Sdk`, and `Umat.Osass.WhatsApp.Sdk`:

- library root directories like `Models/`, `Services/`, `Extensions/`
- project file: `{ProjectName}.csproj`
- source and generated folders such as `bin/` and `obj/` when built

## Usage

Use this skill to answer questions like:

- "What is the backend service structure?"
- "List the backend service projects in Umat.Osass."
- "Describe the folder layout of the backend APIs."
