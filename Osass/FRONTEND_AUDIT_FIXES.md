# Frontend audit core pass

Source changes are confined to Osass, plus the explicitly requested frontend build-context entries in root dev/prod Compose files. Existing working-tree changes and localhost port bindings were retained; no backend source or real data was modified by this pass.

## Review groups and files

### Build and TypeScript

- Root `package.json` and `package-lock.json`: aggregate build/typecheck scripts and the shared workspace dependency.
- All five `apps/*/package.json`: `typecheck` scripts; production and development builds run typecheck before Vite.
- All five `apps/*/vite.config.ts`: remove the unused configuration callback parameter.
- Academic assessment `src/pages/ApplicationHistoryPage.tsx`, and non-academic assessment `src/pages/ApplicationHistoryPage.tsx` / `PendingApplicationsPage.tsx`: use the typed `results` paging shape.
- Non-academic applicant `src/services/academicService.ts`: preserve its legacy exports while fixing nonexistent model/client imports and using the non-academic endpoints.
- Non-academic applicant `src/types/auth.ts`, `src/pages/Eligibility.tsx`: align knowledge-material and journal requirement fields with the API contract.
- Admin `src/components/ThemeSwitcher.tsx`: match the existing light-only theme provider.

### Applicant workflow

- Academic `src/pages/ScoreGuide.tsx`: load service categories and their nested positions using the current service method.
- Academic `src/types/academic.ts`, `src/services/academicService.ts`, `src/pages/ApplicationView.tsx`: type and render the submitted-preview response, including current service titles/categories and system/applicant publication scores; show load failures.
- Both applicant `src/pages/ApplicationProgress.tsx` and `src/lib/status.ts`: match actual API review stages and normalize status labels.
- Both applicant `src/pages/Dashboard.tsx`: label the API's time-in-rank eligibility accurately and route applicants to eligibility guidance when the time requirement is unmet. Non-academic dashboard also handles under-review and unsuccessful decisions correctly.
- Both applicant `src/pages/Eligibility.tsx`: classify inadequate performance correctly rather than matching the adequate substring first.

### Stored HTML, password, and evidence

- Academic applicant / academic assessment `src/components/common/HtmlContent.tsx`, and both applicant `src/pages/StaffUpdates.tsx`: sanitize HTML using installed DOMPurify. Existing sanitized non-academic HTML components are retained.
- Academic applicant, non-academic applicant, and admin `src/components/ui/chart.tsx`: render generated style text through React instead of an HTML sink.
- All five apps' change/reset password pages: shared validation and guidance for 12–72 characters, including new-password input limits. Login and current-password fields retain legacy password acceptance. No registration UI exists in these apps.
- Both applicant `src/components/application/{TeachingCategoryCard,PublicationCard,ServiceRecordCard,RequiredDocumentsCard}.tsx`: enforce PDF, PNG, JPG, JPEG, DOCX, XLSX, maximum 20 MB per file; reject unsupported selections with a clear message.
- Four non-admin apps' `src/lib/files.ts` and `src/components/common/FilePreviewModal.tsx`, both assessment `src/pages/ApplicationReviewPage.tsx`, and applicant evidence cards: extract decoded filenames from URL pathname rather than signed query strings; offer download/open fallback and expiry guidance. Known attachment PDFs use the download view; existing inline public PDF previews remain supported.
- New `packages/frontend-core/{package.json,src/files.ts,src/password.ts}`: shared upload policy, signed URL filename handling, and new-password validation.
- Local `.gitignore`: ensure the frontend workspace package is tracked despite the repository's .NET packages ignore rule.

### Docker workspace compatibility

- All five app `Dockerfile` files: build with Node/npm, copy root `package.json` / `package-lock.json`, all app manifests, and shared workspace source; install with `npm ci`; build the selected app with its typecheck gate; serve its output with Nginx.
- Root `docker-compose.yml` and `docker-compose.prod.yml`: use `./Osass` context and the matching app Dockerfile. Existing args, backend configuration, and localhost port bindings are preserved.
- Root frontend `.dockerignore`: exclude dependencies, generated bundles, environment files, and TypeScript build-info files from the monorepo context.
- Frontend `.gitignore`: ignore `*.tsbuildinfo` artifacts.

### Admin pagination and persistent layout

- Admin `src/services/api.ts`: fix recursive paged-response parsing; load every staff/committee page and report incomplete pagination rather than silently truncating it. Existing `useAdminData.ts` paging and CRUD helpers are retained.
- Admin `src/App.tsx`, `src/components/layout/{AdminLayout,AdminSidebar}.tsx`, and all admin pages that previously wrapped `AdminLayout`: move the layout into one protected parent route and render pages through its outlet. Sidebar state survives page navigation; the SuperAdmin restriction remains.

### Regression checks

- Academic `src/test/{frontend-audit.test,application-view.test}.tsx`: sanitization, password limits, upload limits/allowlist, signed filenames, performance normalization, progress labels, and submitted-preview rendering/errors.
- Admin `src/test/{pagination.test.ts,layout.test.tsx}`: multi-page lists, clamped pages, missing total-page metadata, premature paging failure, response parsing, persistent sidebar state, authentication, and SuperAdmin restriction.
- Non-academic applicant `src/test/progress.test.ts`: actual HOU/AAPSC/UAPC stages and terminal decisions.

## Validation

- All five app production builds passed with TypeScript as a mandatory first step.
- All five standalone typechecks passed.
- All five actual frontend Docker images built through dev Compose using the monorepo context and `npm ci`. Each image passed Nginx configuration and nonempty static-output smoke checks in temporary containers without networks, ports, or data volumes.
- Both dev and production Compose configurations validated. Production images were not separately built; both configurations reference the same verified Dockerfiles. Production validation warns about unset Google client and admin API variables; supply these before deployment.
- 22 tests passed across the three apps with existing test suites. The two assessment apps currently have no test files; their existing test scripts report “No test files found.”
- Whitespace validation passed.
- Remaining build warnings: stale Browserslist data and large generated chunks. Regression tests also emit existing React Router future-flag notices.

## Remaining scope

- Shared UI, API-client and domain packages are now integrated alongside frontend-core; see `FRONTEND_STRUCTURAL_CLEANUP.md` for structural ownership and files.
- The admin CRUD hook factory is extracted and adopted; a broader generic CRUD page/form rendering abstraction is not included.
- Both assessment review pages are decomposed into hooks and cohesive components by the UI worker.
- Live authenticated browser testing and deployment-specific private-storage/CORS/attachment behavior remain unverified. Expired links require refreshing the page; the frontend does not alter storage policy or refresh signatures itself.
- Actual application PDF generation remains unavailable, as in the existing UI.
- Backend secret scanning, deployment policy, and the reported .NET ImageFormatter failure are outside this frontend pass.

Remaining frontend follow-up: authenticated end-to-end regression checks, deployment-specific attachment behavior, and optional generic admin page/form rendering. Backend/catalog mapping ownership remains with the backend agent.
