# Production dependency audit (CI)

CI runs a **blocking** check on pull requests and pushes to `main` that fails when a new **high** or **critical** npm advisory appears in the **production** dependency tree (`npm audit --omit=dev`).

Known advisories from the current lockfile are listed in `scripts/production-audit/production-audit-allowlist.json`. Each entry includes the GHSA id, affected package name, severity, and a short note that the issue is tracked by the dependency fix series. The check passes while every reported high/critical finding is on that list.

## Local commands

```bash
npm run audit:production
npm run test:production-audit
```

`audit:production` runs `npm audit --omit=dev` and compares results to the allowlist. `test:production-audit` includes unit tests and a fixture that proves the gate fails when an unlisted high advisory is present.

## Updating the allowlist

1. Run `npm audit --omit=dev` and confirm the advisory is high or critical in the production tree.
2. If it is a **new** issue you are intentionally deferring, add an object to `entries` in `production-audit-allowlist.json` with `id` (GHSA), `package`, `severity`, and `note`.
3. If a dependency upgrade **fixes** an advisory, remove the matching allowlist entry. CI fails while stale entries remain, so the list stays in sync with the lockfile.

Do not use `continue-on-error` or other soft-fail patterns for this job: new production high/critical advisories should block merges unless they are explicitly allowlisted.
