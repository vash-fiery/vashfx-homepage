# SKILLS.md

## Purpose

This file catalogs repeatable playbooks for work in this repository. Use it to
choose the right workflow for a task, then follow the repository-wide rules in
`AGENTS.md`.

A skill describes how to perform a class of work; it does not grant permission
for production deployment, secret changes, destructive actions, or unrelated
repository edits.

## Skill map

| Skill | Use when | Primary paths |
| --- | --- | --- |
| Frontend UI | Building or changing React views and interactions | `src/` |
| Styling and responsive design | Changing layout, color, typography, or themes | `src/*.css` |
| Worker API | Adding or changing HTTP behavior under `/api/` | `worker/index.ts` |
| Cloudflare configuration | Changing bindings, compatibility, assets, or observability | `wrangler.jsonc`, `worker-configuration.d.ts` |
| Dependency maintenance | Adding, removing, or upgrading npm packages | `package.json`, `package-lock.json` |
| Install-script review | Reviewing, approving, or denying dependency lifecycle scripts | `package.json`, `package-lock.json` |
| Static assets | Adding images, icons, fonts, or public files | `src/assets/`, `public/` |
| Validation and review | Checking any implementation before handoff | source files and npm scripts |
| CI workflow | Changing checks, Node.js coverage, or deployment triggers | `.github/workflows/ci.yml` |
| Deployment | Publishing an explicitly approved build to Cloudflare | `wrangler.jsonc`, build output |

## Frontend UI

Use this skill for React components, client-side state, events, navigation, or
browser API integration.

1. Inspect `src/App.tsx`, `src/main.tsx`, and the related styles before
   changing component structure.
2. Keep components focused. Extract reusable UI or behavior when doing so makes
   the change easier to understand, test, or maintain.
3. Use typed props and state. Avoid `any`, unsafe assertions, and duplicated
   source-of-truth state.
4. Use semantic HTML and preserve keyboard access, visible focus behavior,
   useful labels, and meaningful alternative text.
5. Keep client requests aligned with the Worker route and response shape.
6. Verify the affected interaction with `npm run dev`.
7. Run `npm run lint` and `npm run build`.

The skill is complete when the requested behavior works, TypeScript and Oxlint
pass, and responsive and accessible behavior has been checked.

## Styling and responsive design

Use this skill for CSS, layout, visual hierarchy, light/dark themes, or
responsive behavior.

1. Reuse the custom properties in `src/index.css` before introducing new
   colors, fonts, spacing values, or shadows.
2. Prefer stylesheet rules over inline styles.
3. Preserve the existing light and dark color schemes.
4. Check narrow and wide viewports, content overflow, readable contrast,
   keyboard focus, and reduced-motion needs when animation is involved.
5. Keep selectors scoped enough to avoid unintended global changes.
6. Run `npm run lint` and `npm run build`, then inspect the result with
   `npm run dev` or `npm run preview`.

## Worker API

Use this skill for routes, request handling, validation, or JSON responses in
the Cloudflare Worker.

1. Inspect `worker/index.ts` and every client call to the affected endpoint.
2. Keep application API routes under `/api/` unless the task intentionally
   changes the public routing contract.
3. Handle supported HTTP methods explicitly and return appropriate status
   codes for invalid input, missing resources, and server errors.
4. Keep response bodies stable and type client expectations where practical.
5. Do not expose secrets, internal error details, or environment values.
6. Exercise the happy path and at least one relevant failure path locally.
7. Run `npm run lint` and `npm run build`.

## Cloudflare configuration

Use this skill for bindings, compatibility flags or dates, asset behavior,
observability, source maps, and generated Worker types.

The current bindings are:

| Binding | Resource | Configuration key |
| --- | --- | --- |
| `KV` | Cloudflare KV namespace | `kv_namespaces` |
| `R2_bucket` | R2 bucket named `vashfx` | `r2_buckets` |
| `worker` | Service binding to `vashfx-homepage` | `services` |

1. Read `wrangler.jsonc`, `worker/index.ts`, and
   `worker-configuration.d.ts` before changing bindings or runtime behavior.
2. Keep secrets out of tracked files. Store them with the appropriate
   Cloudflare secret mechanism.
3. Preserve binding names unless the task intentionally includes the matching
   Worker code and infrastructure migration.
4. After changing bindings, run `npm run cf-typegen` and confirm the generated
   `Env` declarations match `wrangler.jsonc`.
5. Treat compatibility-date and compatibility-flag updates as runtime changes;
   explain their purpose and verify affected behavior.
6. Run `npm run lint` and `npm run build`.
7. Do not run `npm run deploy` unless the user explicitly requests deployment
   and confirms the target environment.

## Dependency maintenance

Use this skill when adding, removing, or upgrading npm dependencies.

1. Use npm 11.19.0, matching the `packageManager` field in `package.json`.
2. Confirm whether the package belongs in `dependencies` or
   `devDependencies`.
3. Use npm commands to change dependencies so `package.json` and
   `package-lock.json` stay synchronized.
4. Review release notes and migration requirements for major upgrades.
5. Inspect the lockfile diff for unexpected package churn, source changes, or
   engine requirement changes.
6. Run `npm approve-scripts --allow-scripts-pending` and follow the
   install-script review skill for every reported package.
7. Update imports, configuration, and code required by the new version.
8. Run `npm run lint` and `npm run build`.
9. Report any unresolved advisories, peer-dependency warnings, or runtime
   compatibility concerns.

Do not hand-edit resolved versions or integrity hashes in `package-lock.json`.

## Install-script review

Use this skill when npm reports dependency install scripts that are not yet
covered by the repository's `allowScripts` policy.

1. List pending scripts without changing policy:

   ```sh
   npm approve-scripts --allow-scripts-pending
   ```

2. For each package, inspect its exact installed version, lifecycle command,
   package source, lockfile resolution, and why the script is required.
3. Approve only named, reviewed packages with `npm approve-scripts <package>`.
   Deny a named package with `npm deny-scripts <package>` when its script is
   unnecessary or unsafe.
4. Do not use `--all`, approve an unfamiliar package, or change an existing
   denial unless the user explicitly authorizes that action.
5. Review the resulting `allowScripts` diff in `package.json`, then run
   `npm ci`, `npm run lint`, and `npm run build`.
6. Report the package names and pinned versions that were approved or denied.

The listing command is read-only. Completing the review requires an explicit
decision for every package that remains pending.

## Static assets

Use this skill for images, icons, fonts, and files served without application
logic.

1. Put imported, bundled assets in `src/assets/`.
2. Put files that require stable root-relative URLs in `public/`.
3. Use descriptive names and avoid duplicate or unused assets.
4. Provide dimensions where useful to reduce layout shift.
5. Use meaningful alternative text for informative images and empty
   alternative text for purely decorative images.
6. Check rendering in light and dark themes when the asset's contrast matters.
7. Run `npm run build` to verify paths and bundling.

## Validation and review

Use this skill before handing off any implementation change.

1. Review the complete diff and remove unrelated edits, debugging output,
   generated clutter, and stale comments.
2. Confirm tracked files contain no secrets or local environment values.
3. Run `git diff --check` for every change.
4. Run the checks appropriate to the change:

   ```sh
   npm run lint
   npm run build
   ```

5. Use `npm run dev` or `npm run preview` for behavior or visual changes.
6. Verify both the SPA and affected `/api/` routes when work crosses the
   frontend/Worker boundary.
7. Report exactly which checks ran and their results.

The repository currently has no automated test script. Do not describe lint,
build, or manual verification as automated tests.

## CI workflow

Use this skill for changes to `.github/workflows/ci.yml` or work that affects
its build and deployment behavior.

1. Read the complete workflow and identify every event, matrix entry,
   permission, secret, and conditional before editing it.
2. Preserve npm caching and reproducible installation with `npm ci`.
3. Keep pull-request jobs non-deploying unless deployment previews are
   explicitly requested and safely scoped.
4. The current workflow deploys non-PR runs from its Node.js 22, 24, and 26
   matrix. Treat changes to `main`, the matrix, or the deploy condition as
   production-impacting.
5. Use least-privilege workflow permissions and never print secret values.
6. Validate the YAML structure and run the same local build commands used by
   the workflow when practical.

## Deployment

Use this skill only when deployment is explicitly requested.

1. Confirm whether deployment will be manual or triggered by a push to
   `main` through `.github/workflows/ci.yml`.
2. Confirm the target Cloudflare account, Worker, branch, and environment.
3. Confirm the working change is approved and validation has passed.
4. Review `wrangler.jsonc` for the intended Worker name, bindings, and runtime
   settings.
5. Run `npm run deploy` only for an explicitly approved manual deployment;
   otherwise use the approved GitHub workflow path.
6. Record the deployment result, URL, version or commit, and any warnings.
7. Perform a focused smoke check of the homepage and relevant API routes.

Do not deploy merely to validate a change, and do not modify or remove an
existing production deployment unless that action was explicitly requested.

## Adding a new skill

Add a new section when a workflow becomes repeatable and materially different
from the existing playbooks. Include:

- when the skill applies;
- the files and systems it may change;
- an ordered procedure;
- required validation;
- permission or safety boundaries; and
- a concrete definition of done.

Keep new skills repository-specific and update the skill map in the same
change.
