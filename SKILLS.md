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
| Static assets | Adding images, icons, fonts, or public files | `src/assets/`, `public/` |
| Validation and review | Checking any implementation before handoff | source files and npm scripts |
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

1. Read `wrangler.jsonc`, `worker/index.ts`, and
   `worker-configuration.d.ts` before changing bindings or runtime behavior.
2. Keep secrets out of tracked files. Store them with the appropriate
   Cloudflare secret mechanism.
3. After changing bindings, run `npm run cf-typegen` and review the generated
   type diff.
4. Treat compatibility-date and compatibility-flag updates as runtime changes;
   explain their purpose and verify affected behavior.
5. Run `npm run lint` and `npm run build`.
6. Do not run `npm run deploy` unless the user explicitly requests deployment
   and confirms the target environment.

## Dependency maintenance

Use this skill when adding, removing, or upgrading npm dependencies.

1. Confirm whether the package belongs in `dependencies` or
   `devDependencies`.
2. Use npm commands to change dependencies so `package.json` and
   `package-lock.json` stay synchronized.
3. Review release notes and migration requirements for major upgrades.
4. Inspect the lockfile diff for unexpected package churn, source changes, or
   engine requirement changes.
5. Update imports, configuration, and code required by the new version.
6. Run `npm run lint` and `npm run build`.
7. Report any unresolved advisories, peer-dependency warnings, or runtime
   compatibility concerns.

Do not hand-edit resolved versions or integrity hashes in `package-lock.json`.

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
3. Run the checks appropriate to the change:

   ```sh
   npm run lint
   npm run build
   ```

4. Use `npm run dev` or `npm run preview` for behavior or visual changes.
5. Verify both the SPA and affected `/api/` routes when work crosses the
   frontend/Worker boundary.
6. Report exactly which checks ran and their results.

The repository currently has no automated test script. Do not describe lint,
build, or manual verification as automated tests.

## Deployment

Use this skill only when deployment is explicitly requested.

1. Confirm the target Cloudflare account, Worker, branch, and environment.
2. Confirm the working change is approved and validation has passed.
3. Review `wrangler.jsonc` for the intended Worker name and runtime settings.
4. Run `npm run deploy`.
5. Record the deployment result, URL, version or commit, and any warnings.
6. Perform a focused smoke check of the homepage and relevant API routes.

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
