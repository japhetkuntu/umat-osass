# Frontend structural cleanup source report

## Parent integration completed

All five app manifests now declare `@osass/ui`, `@osass/api-client`, and `@osass/domain` at version `0.0.0`. The root npm lockfile includes these workspace links and UI dependencies. Docker installs from the monorepo root with all workspace manifests and sources present.

The UI worker's source extraction is integrated with the parent-owned manifests, lockfile, API/domain packages and admin CRUD hooks. Backend code is outside this frontend scope.

## API, domain and CRUD integration

- `packages/api-client/src/index.ts` owns the shared request engine. Five `src/services/apiClient.ts` adapters preserve their auth refresh, interceptor ordering, envelope/error, timeout and abort policies.
- `packages/domain/src/{index,performance,status}.ts` shares response/paging contracts, exact performance normalization and academic/non-academic stage normalization. Unknown labels such as `notgood` do not become Good.
- Admin `src/hooks/createCrudHooks.ts` supplies the typed factory used by fourteen resources through `useAdminData.ts`, preserving mutations, invalidation and notifications. Generic page/form rendering is not claimed as completed.
- Root scripts gate builds on typechecks and include owned package lint. Shared `nginx.conf` adds nosniff, DENY and strict-origin-when-cross-origin headers without a restrictive CSP.
- Applicant review summaries display teaching/work totals out of 100; publications and services remain point totals. Academic promotion letters show raw teaching `/100`, publication points and service points alongside performance labels, without normalization. Teaching entry totals and all six category preview tiers match the backend sum thresholds.
- Added API adapter, domain and CRUD regression tests alongside the UI worker's tests. No live data or authenticated workflows were modified during validation.

## Shared UI sources

`packages/ui/src` contains:

- `HtmlContent.tsx`: DOMPurify rendering with the existing `html`/`className` contract, invalid/empty-content behavior and prose classes. All five portals expose the same named/default re-export through their common component path; admin now has that path available too.
- `ScoreInputPanel.tsx`: shared controlled score/remarks panel for DAPC/FAPSC/HOU/AAPSC/UAPC, with existing colors, numeric step/range behavior, callbacks and unique label IDs. Uses relative imports for shared input/label primitives.
- `FilePreviewModal.tsx`: existing signed-file handling, PDF/image preview and attachment/download fallback. Four portal common components re-export it.
- `RichTextEditor.tsx`: existing extensions, editing commands, controlled HTML synchronization and link dialog. Both assessment portals re-export it. The admin wrapper supplies its original button/input/label primitives to retain its styling.
- `GoogleSignInButton.tsx`: existing Google initialization and credential callback; each portal wrapper supplies its own environment client ID.
- `button.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `toggle.tsx`, `tooltip.tsx`, `utils.ts`: existing reusable primitives and class merging. Matching app primitives re-export them. Admin's distinct button/input/label implementations remain local.
- `index.ts`: public barrel; `package.json` also exports individual component/primitive paths.

All five `tailwind.config.ts` files scan `../../packages/ui/src/**/*.{ts,tsx}` so extracted classes remain in production CSS.

## Assessment review sources

Both assessment portals have `src/hooks/useApplicationReview.tsx`, containing the existing loading/query state, committee permissions, editable score state, mutation callbacks, cache invalidation, validation state and workflow dialog state. API requests and payloads are preserved.

Each portal has these cohesive components under `src/components/review`:

- `ActivityTimeline.tsx`: comment composer/category selection and existing activity history rendering.
- `EvidenceList.tsx`: signed-file names, preview callbacks and accessible preview/download controls.
- `ScoreBreakdown.tsx`: compact/full displays of applicant and committee scores and remarks.
- `PerformanceCell.tsx`: existing score/performance summary cells.
- `ApprovalDialog.tsx`, `FinalReturnDialog.tsx`, `AdvanceDialog.tsx`, `ReturnDialog.tsx`: existing validation, approval, feedback, advancement and return forms/buttons.
- Academic: `TeachingReviewSection.tsx`, `PublicationsReviewSection.tsx`, `ServicesReviewSection.tsx`.
- Non-academic: `PerformanceReviewSection.tsx`, `KnowledgeReviewSection.tsx`, `ServicesReviewSection.tsx`.

`src/pages/ApplicationReviewPage.tsx` retains composition, loading/error presentation, applicant information, score summary and action visibility. Academic shrank from 2,312 to 511 lines; non-academic from 2,313 to 507 lines, approximately 78% reductions. Extracted component types use narrow `Pick<ApplicationReviewContext, ...>` props; the parent hook remains the owner of state and side effects.

## UI worker validation before parent integration

- All five app typechecks passed.
- All five production builds passed. After preserving the admin editor label style, all three editor-consuming apps were rebuilt successfully.
- Workspace regression suite passed: 31 tests across nine test files. Assessment apps currently have no dedicated suites; their test commands used `--passWithNoTests`.
- Added nine shared UI cases in `apps/academic-portal/src/test/shared-ui.test.tsx`: sanitization/prose classes, all five committee score inputs including decimal/cap/clear semantics and focus retention, independent accessible IDs, Google credential forwarding and signed PDF/attachment behavior.
- Diff whitespace check passed for tracked files in this scope.

Existing build/test warnings remain: large output chunks, stale Browserslist data, React Router future flags and the existing preview dialog's missing description warning. No authenticated end-to-end workflow or live data mutation was performed.

## Final integrated validation

- All five app production builds passed with mandatory typechecks; API-client and domain strict package checks also passed.
- Root lint passed with zero errors, including the owned shared packages. There are 245 app warnings; unused imports were not indiscriminately deleted.
- 80 tests passed across twelve files. The two assessment apps have no dedicated test files; their typechecks/builds passed and adapter behavior is covered by cross-app API tests.
- All five actual Docker images built from the root workspace using npm ci. Isolated containers verified Nginx configuration, SPA fallback and all three security response headers, without host ports or data volumes.
- Remaining: authenticated workflow/browser checks, deployment-specific evidence/download behavior, optional generic CRUD page/form rendering, and dependency/security warning triage. Non-academic service catalog legacy bucket mapping belongs to the backend agent; no invented frontend category mapping was introduced.
