# AGENTS.md

Guidance for automated coding agents working in `vash-fiery/vashfx-homepage`.
These instructions apply to the entire repository unless a more specific
`AGENTS.md` exists below the file being changed.

## Project overview

This repository contains a React 19 and TypeScript single-page application
built with Vite and served by a Cloudflare Worker. The Worker exposes API routes
under `/api/`; Cloudflare's asset binding serves the compiled frontend and uses
single-page-application fallback behavior.

| Area | Primary files | Purpose |
| --- | --- | --- |
| Frontend | `src/`, `index.html`, `public/` | React UI, styles, and static assets |
| Worker | `worker/index.ts` | Cloudflare request handling and API responses |
| Build | `vite.config.ts`, `tsconfig*.json` | Vite, React, Cloudflare, and TypeScript configuration |
| Cloudflare | `wrangler.jsonc` | Worker entry point, assets, bindings, placement, and observability |
| Generated types | `worker-configuration.d.ts` | Wrangler-generated Worker runtime and binding types |
| Automation | `.github/`, `.codex/` | CI, dependency updates, labels, and agent configuration |

## Repository rules

- Use npm. The lockfile is `package-lock.json`, and `package.json` pins the npm
  package-manager version.
- Prefer the smallest change that fully solves the requested problem. Preserve
  unrelated work and avoid drive-by refactors.
- Do not edit `worker-configuration.d.ts` by hand. Change `wrangler.jsonc` first,
  then regenerate the file with `npm run cf-typegen`.
- Never commit credentials, API tokens, `.env` files, or production data. Store
  Cloudflare secrets with Wrangler or the deployment platform.
- Do not run a production deployment unless the user explicitly requests it.
  Use a dry run when deployment packaging needs validation.
- Update `package-lock.json` in the same change whenever dependencies in
  `package.json` change.
- Keep frontend-only code in `src/` and Worker/runtime code in `worker/`. Do not
  import browser-only modules into the Worker.

## Commands

Run commands from the repository root.

| Task | Command |
| --- | --- |
| Install locked dependencies | `npm ci` |
| Start local development | `npm run dev` |
| Lint | `npm run lint` |
| Type-check and build | `npm run build` |
| Regenerate Worker types | `npm run cf-typegen` |
| Verify generated Worker types | `npx wrangler types --check` |
| Preview the production build | `npm run preview` |
| Validate deployment packaging | `npx wrangler deploy --dry-run` |
| Deploy to Cloudflare | `npm run deploy` |

## Change-specific validation

| Change | Minimum validation |
| --- | --- |
| React, TypeScript, CSS, or Worker code | `npm run lint` and `npm run build` |
| `wrangler.jsonc` or Worker bindings | `npm run cf-typegen`, `npx wrangler types --check`, `npm run lint`, and `npm run build` |
| Build or deployment configuration | `npm run build` and `npx wrangler deploy --dry-run` |
| Dependencies or lockfile | `npm ci`, `npm run lint`, and `npm run build` |
| Markdown-only documentation | Review rendered Markdown and check links and commands |

If a required command cannot run because of missing credentials, unavailable
network access, or an external service, report the exact command and blocker.
Do not claim that skipped validation passed.

## Coding conventions

- Follow the strict TypeScript settings in the checked-in `tsconfig` files;
  unused locals and parameters are build failures.
- Use React function components and hooks. Preserve accessibility with semantic
  elements, useful alternative text, and labels for interactive controls.
- Keep state local unless sharing it is necessary. Avoid adding a dependency for
  behavior that the platform or existing stack already provides.
- In Worker handlers, parse request URLs explicitly, return intentional status
  codes, and keep response bodies stable for existing consumers.
- Use the generated `Env` and Cloudflare runtime types for bindings. Current
  bindings include `ASSETS`, the `BUCKET` R2 bucket, and the `DB` Analytics
  Engine dataset.
- Follow the style of the file being edited. Do not reformat untouched files or
  mix a broad formatting pass into a functional change.

## CI and pull requests

Pull requests targeting `main` run npm installation, linting, and builds on
Node.js 24 and 26. Pushes to `main` additionally deploy with Node.js 24 after
the build matrix succeeds.

Every pull request should include:

1. A concise summary of the user-visible and technical changes.
2. The exact validation commands run and their results.
3. Any Cloudflare binding, generated-type, dependency, or deployment impact.
4. Screenshots for meaningful visual changes when practical.

Before handing off a change, review the final diff, confirm that only intended
files are present, and ensure generated artifacts are consistent with their
source configuration.
