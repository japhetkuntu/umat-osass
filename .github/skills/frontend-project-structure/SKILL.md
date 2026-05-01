---
name: frontend-project-structure
user-invocable: true
description: "Describe the frontend app project structure for the Osass workspace, including app roots, common Vite/Tailwind setup, and typical folders/files for each portal application. Use when asked about frontend architecture, app layout, or project structure."
---

# Frontend Project Structure

This skill describes the frontend application layout in the `Osass/apps` workspace.

## Frontend roots

- `Osass/apps/`

## Frontend app projects

- `academic-assessment-portal/`
- `academic-portal/`
- `admin-portal/`
- `non-academic-assessment-portal/`
- `non-academic-portal/`

## Typical app layout

Each frontend app follows a common Vite-based structure with these files and directories:

- `Dockerfile`
- `README.md`
- `.dockerignore`
- `.env`, `.env.example`, `.env.local`
- `package.json`
- `package-lock.json` or `bun.lockb`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `postcss.config.js`
- `tailwind.config.ts`
- `eslint.config.js`
- `vitest.config.ts`
- `index.html`
- `public/`
- `src/`
- `components.json`
- `DESIGN_SYSTEM.md` (present in some apps)
- `dist/` (build output)
- `node_modules/` (local dependencies)

## Source layout

Inside `src/` each app typically contains:

- `main.ts` or app entry files
- components, pages, and layouts
- styles or CSS files
- feature modules and utility code

## Usage

Use this skill to answer questions like:

- "What is the frontend app structure in Osass?"
- "List the frontend portals and their common files."
- "Describe the folder layout for the Osass Vite apps."
