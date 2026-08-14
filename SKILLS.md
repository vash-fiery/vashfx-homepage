# SKILLS.md

## Purpose

This file contains repeatable, repository-specific playbooks. Choose the skill
that matches the task, then follow `AGENTS.md` and any more specific nested
instructions.

A skill is a procedure, not permission. Production deployment, secret changes,
remote-resource access, destructive actions, and unrelated edits still require
explicit authorization.

## Cloudflare retrieval rule

Cloudflare APIs, Wrangler commands, configuration fields, and platform behavior
change over time. Before changing Worker code or configuration:

1. Read the complete relevant project files.
2. Inspect `node_modules/wrangler/config-schema.json` for configuration fields.
3. Inspect generated or installed types for API and binding signatures.
4. Retrieve the current official documentation:
   - <https://developers.cloudflare.com/workers/best-practices/workers-best-practices/>
   - <https://developers.cloudflare.com/workers/wrangler/commands/>
   - <https://developers.cloudflare.com/workers/vite-plugin/>
   - <https://developers.cloudflare.com/workers/runtime-apis/bindings/>
   - <https://developers.cloudflare.com/workers/static-assets/>
   - <https://developers.cloudflare.com/workers/ci-cd/builds/configuration/>
   - <https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/>

Do not copy a remembered command, config field, limit, or API signature without
verification.

## Skill map

| Skill | Use when | Primary paths |
| --- | --- | --- |
| Repository orientation | Establishing current structure, commands, and risk | root config and docs |
| Frontend UI | Building or changing React views and interactions | `src/` |
| Styling and responsive design | Changing layout, themes, typography, or motion | `src/*.css` |
| Worker API | Changing HTTP behavior under `/api/` | `worker/index.ts` |
| Wrangler and type synchronization | Changing bindings, compatibility, assets, observability, or environments | `wrangler.jsonc`, `worker-configuration.d.ts` |
| Cloudflare bindings | Reading or writing configured bindings such as KV | `worker/`, `wrangler.jsonc` |
| Dependency maintenance | Adding, removing, or upgrading npm packages | `package.json`, `package-lock.json` |
| Install-script review | Reviewing npm dependency lifecycle scripts | `package.json`, `package-lock.json` |
| Static assets | Adding images, icons, fonts, or public files | `src/assets/`, `public/` |
| Validation and review | Checking an implementation before handoff | changed files and npm scripts |
| CI workflow | Changing checks, permissions, or Node coverage | `.github/workflows/` |
| Workers Builds | Changing Cloudflare Git deployment behavior or build settings | `wrangler.jsonc`, Cloudflare settings |
| Deployment | Publishing an explicitly approved build to Cloudflare | `wrangler.jsonc`, build output |

## Repository orientation

Use this skill before a broad, ambiguous, or potentially deployment-sensitive
task.

1. Read `AGENTS.md`, `SKILLS.md`, `package.json`, `wrangler.jsonc`, and the
   relevant source files.
2. Read `.github/workflows/node.js.yml` when the task can affect build or
   deployment behavior.
3. Confirm current dependency versions, npm scripts, binding names, generated
   types, and the default branch. Do not rely on an earlier conversation.
4. Check for an existing branch or pull request that already owns the scope.
5. Classify the work as frontend, Worker, configuration, dependency, CI,
   documentation, or deployment work and select the matching skill.

The skill is complete when the exact files, validation commands, deployment
risk, and write target are known.

## Frontend UI

Use this skill for React components, client-side state, events, navigation, or
browser API integration.

1. Inspect `src/App.tsx`, `src/main.tsx`, and related styles before changing
   component structure.
2. Keep components focused. Extract reusable UI or behavior when it improves
   clarity, validation, or maintenance.
3. Use typed props and state. Avoid `any`, unsafe assertions, and duplicated
   sources of truth.
4. Use semantic HTML and preserve keyboard access, visible focus, useful
   labels, and meaningful alternative text.
5. Keep client requests aligned with Worker routes, methods, status codes, and
   response shapes.
6. Verify the interaction with `npm run dev`.
7. Run `npm run lint` and `npm run build`.

Done means the requested behavior works and responsive, accessible, lint, and
build checks pass.

## Styling and responsive design

Use this skill for CSS, layout, visual hierarchy, light/dark themes, or motion.

1. Reuse custom properties in `src/index.css` before adding new colors, fonts,
   spacing values, or shadows.
2. Prefer stylesheet rules over inline styles.
3. Preserve light and dark color schemes.
4. Check narrow and wide viewports, overflow, contrast, keyboard focus, and
   reduced-motion behavior when animation is involved.
5. Keep selectors scoped enough to avoid unintended global changes.
6. Run `npm run lint` and `npm run build`, then inspect with `npm run dev` or
   `npm run preview`.

## Worker API

Use this skill for routes, request parsing, response handling, validation,
errors, or background work in the Cloudflare Worker.

1. Retrieve the latest Workers best-practices documentation and read
   `worker/index.ts`, `wrangler.jsonc`, and every client call to the endpoint.
2. Keep application routes under `/api/` unless the task intentionally changes
   the public routing contract.
3. Use module Worker syntax and `satisfies ExportedHandler<Env>`.
4. Handle supported methods explicitly and return stable JSON with appropriate
   status codes for invalid input, missing resources, and internal errors.
5. Keep request state per request. Never store request data or clients derived
   from bindings in mutable module-level state.
6. Await or otherwise deliberately handle every Promise. Use
   `ctx.waitUntil()` for post-response work and never destructure it from
   `ctx`.
7. Stream large or unknown-size bodies; buffer only bounded payloads.
8. Use bindings instead of Cloudflare REST calls for KV, R2, and Worker-to-
   Worker communication.
9. Use structured logs and do not expose secrets or internal error details in
   responses.
10. Exercise the happy path and at least one relevant failure path locally.
11. Run `npm run lint`, `npm run build`, and
    `npx wrangler deploy --dry-run`.

## Wrangler and type synchronization

Use this skill for bindings, compatibility dates or flags, asset routing,
module rules, environments, secrets declarations, observability, or generated
Worker types.

The current configuration declares no Cloudflare resource bindings.
Its `account_id` selects the Cloudflare account used by non-interactive Workers
Builds deployments and is not a runtime binding.

1. Read the full `wrangler.jsonc`, the installed Wrangler schema, relevant
   Worker code, and `worker-configuration.d.ts`.
2. Verify every code binding exists in config and every configured binding is
   intentional. Names are exact and case-sensitive.
3. Preserve binding names unless the task includes the matching code and
   infrastructure migration.
4. Make the smallest configuration change and never put a secret value in
   `vars` or source control.
5. After any relevant change, run:

   ```sh
   npm run cf-typegen
   npx wrangler types --check
   npm run build
   npx wrangler deploy --dry-run
   ```

6. Review the generated `worker-configuration.d.ts` diff; do not hand-edit it.
7. Before changing `compatibility_date` or `compatibility_flags`, review the
   official compatibility changes and test affected behavior.
8. Keep observability enabled. Configure log or trace sampling deliberately
   and use structured application logs.
9. Do not deploy, change secrets, use remote bindings, or mutate Cloudflare
   resources unless explicitly authorized.

Done means the config matches the schema, generated types match the config,
the build and dry run pass, and infrastructure or deployment impact is stated.

## Cloudflare bindings

Use this skill when implementing behavior with configured Cloudflare bindings.

1. Confirm the exact binding in `wrangler.jsonc` and generated `Env` type.
2. Use the binding through `env`; do not add Cloudflare API credentials or call
   the REST API for a bound resource.
3. For KV, handle `null` on missing reads and avoid assuming immediate global
   consistency.
4. Await all binding operations.
5. Local bindings are simulated by default. Use remote bindings only when the
   user authorizes the target resource and mutation risk.
6. Validate success, missing-data, invalid-input, and relevant failure paths.

## Dependency maintenance

Use this skill when adding, removing, or upgrading npm dependencies.

1. Use npm 11.19.0, matching `packageManager` in `package.json`.
2. Confirm whether the package belongs in `dependencies` or
   `devDependencies`.
3. Use npm commands so `package.json` and `package-lock.json` stay synchronized.
4. Review release notes, migration requirements, runtime support, peer
   dependencies, and engine constraints.
5. Inspect the lockfile for unexpected package churn, source changes, and
   integrity or engine changes.
6. Run `npm approve-scripts --allow-scripts-pending` and use the install-script
   review skill for every reported package.
7. Update code and configuration required by the new version.
8. Run `npm ci`, `npm run lint`, and `npm run build`.
9. For Wrangler, the Cloudflare Vite plugin, or Workers runtime changes, also
   run `npx wrangler types --check` and `npx wrangler deploy --dry-run`.
10. Report unresolved advisories, peer warnings, skipped scripts, and runtime
    compatibility concerns.

Do not hand-edit resolved versions or integrity hashes in
`package-lock.json`.

## Install-script review

Use this skill when npm reports dependency install scripts not covered by the
project's `allowScripts` policy.

1. List pending scripts without changing policy:

   ```sh
   npm approve-scripts --allow-scripts-pending
   ```

2. For each package, inspect the exact installed version, lifecycle command,
   source, lockfile resolution, purpose, and expected outputs.
3. Approve only named, reviewed packages with
   `npm approve-scripts <package>`. Deny a named package with
   `npm deny-scripts <package>` when its script is unnecessary or unsafe.
4. Prefer version-pinned approvals written by npm. Do not use `--all`, approve
   an unfamiliar package, or reverse a denial without explicit authorization.
5. Review the resulting `allowScripts` change in `package.json`, then run
   `npm ci`, `npm run lint`, and `npm run build`.
6. Report every package name and pinned version approved or denied.

The pending-list command is read-only. Approval and denial change project
policy and require an explicit package-by-package decision.

## Static assets

Use this skill for images, icons, fonts, and SPA routing behavior.

1. Put imported, bundled assets in `src/assets/`.
2. Put files requiring stable root-relative URLs in `public/`.
3. Use descriptive names, avoid duplicates, and provide dimensions where they
   reduce layout shift.
4. Use meaningful alternative text for informative images and empty
   alternative text for decorative images.
5. Preserve `assets.not_found_handling: "single-page-application"` unless the
   task explicitly changes fallback behavior.
6. When changing Worker-first routing, retrieve the current static-assets docs
   and verify that `/api/*` reaches the Worker without breaking SPA navigation.
7. Check light/dark contrast and responsive rendering where relevant.
8. Run `npm run build` and inspect with `npm run preview`.

## Validation and review

Use this skill before handing off any implementation.

1. Review the complete diff and remove unrelated edits, debugging output,
   generated clutter, and stale comments.
2. Confirm tracked files contain no secrets or local environment values.
3. Run `git diff --check`.
4. Choose the validation set:

   | Scope | Commands and checks |
   | --- | --- |
   | Docs | Markdown, path, command, and link review |
   | Frontend | `npm run lint`, `npm run build`, focused UI check |
   | Worker | lint, build, local route checks, Wrangler dry run |
   | Config/bindings | type generation, `wrangler types --check`, build, dry run |
   | Dependencies | `npm ci`, script review, lint, build |
   | Workflow | YAML/event/permission review plus workflow command parity |

5. Verify both the SPA and affected `/api/` routes when work crosses the
   frontend/Worker boundary.
6. Report exactly which checks ran, which did not, and why.

The repository currently has no automated test script. Do not describe lint,
build, Wrangler checks, or manual verification as tests.

## CI workflow

Use this skill for `.github/workflows/node.js.yml`, CodeQL, Dependabot, or work
that affects build and deployment behavior.

1. Read complete workflow and configuration files. Identify every trigger,
   matrix entry, permission, secret, condition, and deployment action.
2. Preserve reproducible installs with `npm ci` and npm caching.
3. The current build matrix uses Node.js 22, 24, and 26.
4. Pull requests, pushes to `main`, and manual workflow dispatches validate but
   never deploy from GitHub Actions.
5. Runs for the same ref use concurrency cancellation so an older commit
   cannot consume validation capacity after a newer commit starts.
6. Node.js 24 validates generated Worker types and performs a Wrangler dry run
   in addition to the normal lint and build checks.
7. Cloudflare Workers Builds is the sole deployment owner. Do not add
   `wrangler deploy`, Cloudflare API tokens, or deployment jobs to GitHub
   Actions.
8. Apply least-privilege permissions. Do not assume every existing top-level
   permission is required by every job.
9. Never print `CLOUDFLARE_API_TOKEN` or other secret values.
10. Validate YAML structure and run the same local commands used by the workflow
   when practical.

## Workers Builds

Use this skill for the Cloudflare Git integration, build ownership, preview
versions, production deployments, or Workers Builds failures.

1. Treat Workers Builds as the only automated deployment system for this
   repository. GitHub Actions remains validation-only.
2. Keep the Worker name in `wrangler.jsonc` aligned with the Worker connected
   in Cloudflare.
3. Keep `account_id` aligned with that Worker so non-interactive Wrangler
   commands select the intended Cloudflare account.
4. Store the Workers Builds API token only in Cloudflare build settings. Never
   commit it or copy it into a GitHub workflow.
5. For an account-selection failure, verify `account_id` or the
   `CLOUDFLARE_ACCOUNT_ID` build variable. For a deleted, rolled, or stale
   token, select or create a valid user token in Workers Builds settings.
6. Keep production branch deployment and non-production preview behavior
   distinct. Confirm both commands before changing build settings.
7. Validate repository changes locally, then inspect the Workers Builds check
   and build log without retrying production blindly.

Done means exactly one automated system owns deployment, the Cloudflare build
uses the intended account and valid token, previews do not promote production,
and GitHub validation remains green.

## Deployment

Use this skill only when deployment is explicitly requested.

1. Confirm whether deployment is a Workers Builds push to `main` or an
   explicitly approved local Wrangler deployment.
2. Confirm the Cloudflare account, Worker name, branch, and environment.
3. Confirm the change is approved and required validation has passed.
4. Review `wrangler.jsonc`, binding targets, compatibility settings, required
   secrets, and deployment-trigger conditions.
5. Run the preflight checks:

   ```sh
   npm run lint
   npm run build
   npx wrangler types --check
   npx wrangler deploy --dry-run
   ```

6. Production automation belongs to Workers Builds. Run `npm run deploy` only
   for an explicitly approved local deployment; never add a duplicate GitHub
   deployment path.
7. Remember that `wrangler secret put` and `wrangler secret delete` create and
   deploy a new version; treat them as deployment actions.
8. Record the deployment result, URL, version or commit, and warnings.
9. Smoke-check the homepage and relevant API routes.

Do not deploy merely to validate a change, and do not modify or remove an
existing production deployment unless explicitly requested.

## Adding a new skill

Add a section only when a workflow is repeatable and materially different from
the existing playbooks. Include:

- when it applies;
- files and systems it may change;
- an ordered procedure;
- required validation;
- permission and safety boundaries; and
- a concrete definition of done.

Keep new skills repository-specific and update the skill map in the same
change.
