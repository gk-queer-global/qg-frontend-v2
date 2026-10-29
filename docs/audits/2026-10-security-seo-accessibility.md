# QueerGlobal frontend (`qg-frontend-v2`) security, SEO, and accessibility review

## Document control

| Field | Value |
| --- | --- |
| Application | QueerGlobal public marketing frontend (Create React App SPA) |
| Repository | `gk-queer-global/qg-frontend-v2` |
| Commit reviewed | `a6e639f111d75d9abcaa1587e20e6294fc056d45` (`Attach the grandkru.com staging hostname on every deploy (#2)`) |
| Review date (UTC) | 2026-10-25 |
| Environment | Local production build served with `serve` 14.x on `http://127.0.0.1:4173` (no live or staging hostname accessed) |
| Report status | Draft for independent review |
| Parent program | Site-wide audit under the Linear work item titled *Audit site security, SEO and accessibility; prioritize gaps and document the release process* |
| Pull request | https://github.com/gk-queer-global/qg-frontend-v2/pull/9 (draft) |
| CI for this report | https://github.com/gk-queer-global/qg-frontend-v2/actions/runs/40219750624 (pass). Earlier run https://github.com/gk-queer-global/qg-frontend-v2/actions/runs/40219540219 failed until jest-axe TypeScript declarations were added. |

This report mirrors the structure used for the Activism hub slice (`docs/audits/2026-10-security-seo-accessibility.md` in `activism-grandkru-hub`). That source file was not readable from this environment (private repository); section headings and gap-register fields follow the same program requirements recorded on the parent audit ticket.

## Executive summary

The QueerGlobal frontend at the reviewed commit builds and passes existing unit tests on Node 22, but **does not yet meet an evidence-based bar for security dependency hygiene, search discoverability, or WCAG 2.2 AA** on primary navigation journeys.

Confirmed themes:

1. **Dependencies:** `npm audit --omit=dev` reports **93** vulnerabilities including **7 critical** and **33 high** in the production dependency tree (Create React App and related packages live in `dependencies`, not only dev tooling).
2. **Accessibility:** Playwright + axe against the local production build found **critical** mobile navigation issues (icon-only menu button, invalid ARIA reference). Desktop routes also show **color contrast** and **touch target size** violations. An open pull request in this repository addresses several navigation defects; it is not merged on the reviewed commit.
3. **SEO:** A single global `<title>` and meta description, no canonical URLs, no sitemap, and SPA fallback returning **HTTP 200** with the home shell for unknown paths and for `/sitemap.xml` (soft 404).
4. **Security (frontend):** No `dangerouslySetInnerHTML` or obvious client secret leakage in the built bundle; CI uses least-privilege defaults and no `pull_request_target`. **No Content-Security-Policy or related headers are defined in-repo** for Cloudflare Pages. The mobile navbar `fetch('/user')` chain can throw when the response is not OK (latent runtime error, not an auth boundary).

**Release blockers** for treating this frontend as production-ready are listed in [Release blockers](#release-blockers). **Post-release improvements** and **explicitly untested** areas are separated below.

Automated axe scores and green CI are **not** treated as conformance or security acceptance.

## Scope and limitations

| In scope | Out of scope or not tested |
| --- | --- |
| Static SPA shipped from this repository | QueerGlobal hub API, Python handler, Go hub-framework (see related backend ticket on the Python example handler body contract) |
| OWASP Top 10:2025 / CWE Top 25:2025 / OWASP ASVS 5.0 checks applicable to a browser bundle and its CI | Live staging or production hostnames, Basic Auth bypass, deployed Cloudflare response headers |
| Google Search Essentials for crawlable marketing pages | Production Search Console indexing state |
| WCAG 2.2 AA baseline (automated + manual-style checks documented here) | Full screen reader certification, every stub route at all breakpoints |

No credentials, secrets, or personal data appear in this document.

## Methodology and tools

| Tool | Version (recorded 2026-10-25 UTC) | Use |
| --- | --- | --- |
| Node.js | v22.23.4 | Build and test |
| npm | 10.9.9 | Install, `npm audit` (audit report version 2) |
| `react-scripts` | 5.0.1 (from lockfile) | Production build |
| ESLint | 8.57.1 | Static analysis (`npm run lint`) |
| Jest + Testing Library | via `react-scripts` 5.0.1 | Unit tests (`npm run test:ci`) |
| jest-axe + axe-core | 11.0.0 / 4.14.0 | Component-level axe in jsdom (`npm run test:a11y`) |
| Playwright | 1.49.1 (installed for this review only) | Headless browser axe scans against local `serve` |
| @axe-core/playwright | 4.10.1 (installed for this review only) | WCAG-tagged rulesets in browser |
| `serve` | 14.x (via `npx`) | Local static hosting of `build/` |
| shellcheck-py | 0.11.0.1 (CI pin) | Referenced for deploy script job in workflow |
| Python | 3.12.3 | Deploy script unit tests (CI job) |
| Manual review | n/a | Router map, link targets, heading structure, keyboard/focus inspection in source |

Evidence rule: each row uses **pass**, **fail**, **not applicable**, or **not tested**. Missing evidence is never a pass.

## Pages and user journeys exercised

Build: `CI=true npm run build` (success).

Local server: `npx serve -s build -l 4173` (SPA fallback enabled, matching `public/_redirects`).

| Journey | Route(s) | What was done |
| --- | --- | --- |
| Home (desktop) | `/` | axe @ 1280×720; visual structure review |
| Home (mobile) | `/` | axe @ 390×844; mobile nav markup review |
| About | `/about` | axe; heading and button review |
| Donate / Blog / Add resource / Search | `/donate`, `/blog`, `/add-resource`, `/search` | axe; stub content check |
| Registered profile / logout | `/profile`, `/logout` | Route render via build |
| Footer / top nav links to unregistered paths | `/resources`, `/get-involved`, `/contact-us` | HTTP status and shell-only HTML |
| Unknown URL | `/unknown-audit-route` | HTTP status and body |
| Crawler files | `/robots.txt`, `/sitemap.xml` | Fetch body and status |
| Social outbound | Facebook, Twitter/X, Instagram, LinkedIn, Pinterest | `rel` and `target` review in source |
| Authenticated shell (mobile nav) | `/user` fetch in `Navbar` | Code review; fetch not backed by local API (failure mode) |

Keyboard and focus: manual review of `TopNav`, `Navbar`, `Footer`, and `About` buttons (no full manual walkthrough of every stub page at 200% zoom).

## Summary matrix

Counts are **checklist rows** in the detailed sections below (rounded themes, not individual CWE IDs).

| Area | Pass | Fail | Not applicable | Not tested |
| --- | ---: | ---: | ---: | ---: |
| Security | 11 | 6 | 4 | 5 |
| SEO | 3 | 9 | 1 | 2 |
| Accessibility | 4 | 10 | 1 | 6 |

## Security review

Frontend-relevant mapping to OWASP Top 10:2025 themes and selected ASVS V5.x verification levels (client-only).

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| S1 | Injection via React JSX text binding (no HTML sinks) | **pass** | Repo grep: no `dangerouslySetInnerHTML`, `innerHTML`, or `eval` in `src/` |
| S2 | URL / link handling (`javascript:`, open redirect patterns) | **pass** | External links use `https://`; internal nav uses path strings |
| S3 | XSS via third-party script tags in `index.html` | **pass** | Only first-party bundle and Google Fonts |
| S4 | Secrets in repository | **pass** | No live API keys in tree; CI expects Cloudflare secrets via GitHub Actions secrets only |
| S5 | Secrets in production JS bundle | **pass** | Grep of `build/static/js/*.js` for common key patterns: no matches |
| S6 | Dependency vulnerabilities (production tree) | **fail** | `npm audit --omit=dev`: 93 total (7 critical, 33 high, 40 moderate, 13 low). Example critical advisories: `cipher-base`, `elliptic`, `form-data`, `pbkdf2`, `proxy-addr`, `sha.js`, `websocket-driver` (transitive via `react-scripts` / webpack dev server chain listed under `dependencies`) |
| S7 | Dependency audit in CI | **fail** | `.github/workflows/ci.yml` runs `npm ci --no-audit` |
| S8 | Authentication / session for SPA | **not applicable** | No login flow in reviewed routes; `/user` fetch is unauthenticated stub |
| S9 | `/user` fetch error handling | **fail** | `Navbar.tsx` destructures JSON when `response.ok` is false → `undefined` rejection path (runtime error in browser console) |
| S10 | CSRF / cookie flags | **not applicable** | No state-changing browser forms to backend in reviewed pages |
| S11 | CI default `permissions` | **pass** | Top-level `contents: read`; deploy job adds `deployments: write` only |
| S12 | `pull_request_target` misuse | **pass** | Not used |
| S13 | Third-party GitHub Actions pinning | **fail** | `cloudflare/wrangler-action@v3` and `npx wrangler@3` are floating major tags / latest 3.x |
| S14 | Deploy trust boundary (secrets → Cloudflare) | **pass** | Deploy gated to `main` push; secrets referenced by name only; smoke tests use deployment URL output |
| S15 | Security headers / CSP in repo | **fail** | No `public/_headers`, `_headers` for Pages, or meta CSP; local `serve` responses had no `Content-Security-Policy`, `X-Frame-Options`, or `Strict-Transport-Security` |
| S16 | Security headers on deployed staging/production | **not tested** | Instruction: do not rely on live deploy; Cloudflare dashboard config not in repo |
| S17 | Logging of sensitive data | **not tested** | No structured logging or Sentry in this frontend |
| S18 | Error pages / stack traces to users | **pass** | CRA generic error overlay in dev only; production build shows no stack traces in static shell |
| S19 | File upload / media | **not applicable** | No upload UI in reviewed routes |
| S20 | Clickjacking defenses | **not tested** | Depends on deployed headers (S16) |
| S21 | Subresource Integrity on Google Fonts | **fail** | Fonts loaded from Google without SRI (common CRA pattern) |
| S22 | Bootstrap / Font Awesome supply chain | **pass** | Locked in `package-lock.json`; no CDN script tags for JS |
| S23 | Rate limiting / abuse | **not applicable** | Static hosting |
| S24 | I1 2025 broken access control (UI) | **not tested** | Profile routes are stubs without authorization |
| S25 | Software data integrity (CI artifacts) | **pass** | Build artifact uploaded from CI job; deploy downloads named artifact |

## SEO review (Google Search Essentials)

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| E1 | Unique, descriptive `<title>` per URL | **fail** | Built `index.html` only: `Queer Global`; client routes do not update title |
| E2 | Meta description per URL | **fail** | Single `content="Queer Global"` for all routes |
| E3 | Canonical link | **fail** | No `<link rel="canonical">` |
| E4 | `robots.txt` present | **pass** | `public/robots.txt` allows all agents |
| E5 | Staging / pre-production indexing controls | **not tested** | Staging hostname not audited (would be `noindex` expectation when protected) |
| E6 | `sitemap.xml` | **fail** | No file in repo; `/sitemap.xml` returns 200 with SPA HTML shell |
| E7 | HTTP status for unknown URLs | **fail** | `/unknown-audit-route` → 200 + home shell (soft 404) |
| E8 | HTTP status for linked but unimplemented URLs | **fail** | `/resources`, `/contact-us`, etc. → 200 with empty main content |
| E9 | Crawlable rendering (primary content in HTML) | **fail** | Initial HTML is empty `#root`; content requires JS |
| E10 | Structured data (JSON-LD / OG where appropriate) | **fail** | No JSON-LD; no Open Graph tags beyond implicit lack |
| E11 | Mobile viewport | **pass** | `width=device-width, initial-scale=1` |
| E12 | Internal link consistency | **fail** | Footer and nav link to many paths with no `Route` in `App.tsx` |
| E13 | `lang` on `<html>` | **pass** | `lang="en"` |
| E14 | Performance / Core Web Vitals | **not tested** | No Lighthouse run in this review |
| E15 | hreflang / international | **not applicable** | Single-language content |

## Accessibility review (WCAG 2.2 AA baseline)

Automated scans use axe rule tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` where supported. **Automated results are not a conformance claim.**

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| A1 | Automated scan (desktop routes) | **fail** | Playwright+axe @ 1280×720: `color-contrast` (3 nodes on `/`), `target-size` (2 nodes) on `/`, `/about`, `/donate`, `/blog`, `/add-resource`, `/search` |
| A2 | Automated scan (mobile home) | **fail** | Playwright+axe @ 390×844 on `/`: `aria-valid-attr-value` (critical), `button-name` (critical), `color-contrast` (serious) |
| A3 | jest-axe regression baseline in CI | **pass** | `src/accessibility/accessibilityBaseline.test.tsx` encodes mobile nav rule IDs; runs in `npm run test:ci` |
| A4 | Mobile menu button accessible name | **fail** | Icon-only `MenuButton` without `aria-label` on reviewed commit (addressed in open nav accessibility PR) |
| A5 | `aria-controls` / panel id consistency | **fail** | `aria-controls="offcanvasScrolling"` vs panel `id="sidebar"` (open PR) |
| A6 | `aria-labelledby` target exists | **fail** | Panel references `offcanvasScrollingLabel` without matching element (open PR) |
| A7 | Desktop interactive nesting (button inside link) | **fail** | `TopNav.tsx` wraps `SignUpBtn` / `DonateBtn` buttons inside `NavLink` (open PR) |
| A8 | Document heading hierarchy on home | **fail** | No `h1`; styled headings; React warns `h2` nested inside `h2` in `HomepageContents2` during tests |
| A9 | Page titles for screen reader context | **fail** | Same as SEO E1 |
| A10 | Landmarks (`main`, `nav`, `footer`) | **fail** | No `<main>`; nav regions not semantically distinguished in DOM review |
| A11 | Keyboard access to primary nav | **not tested** | Requires manual browser pass; open PR adds RTL keyboard tests for mobile menu |
| A12 | Focus visibility | **not tested** | Styles reset focus color to white-on-purple in nav CSS; manual check deferred |
| A13 | Form labels / errors | **not applicable** | No production forms on reviewed routes |
| A14 | Images / alt text | **fail** | Home hero image `alt=""`; logo alt text generic (`logo`) |
| A15 | Color contrast (manual) | **not tested** | Automated serious failures; manual spot check deferred |
| A16 | Zoom / reflow 200% | **not tested** | |
| A17 | About page buttons | **fail** | `<button>` elements without accessible names (text-only inside, but no `type`; not in landmark) |
| A18 | Touch target size (WCAG 2.2) | **fail** | axe `target-size` failures on desktop chrome |
| A19 | Skip link | **fail** | No skip to main content |
| A20 | Motion / animation | **not tested** | |

### Playwright axe excerpt (local build, 2026-10-25)

Desktop `/`:

```json
{"violationCount":2,"violations":[{"id":"color-contrast","impact":"serious","nodes":3},{"id":"target-size","impact":"serious","nodes":2}]}
```

Mobile `/`:

```json
{"violationCount":3,"violations":[{"id":"aria-valid-attr-value","impact":"critical","nodes":1},{"id":"button-name","impact":"critical","nodes":1},{"id":"color-contrast","impact":"serious","nodes":2}]}
```

## Gap register

| Gap ID | Area | Finding | Impact | Severity | Blocks release | Suggested owner | Linked work | Dependencies | Definition of done | Verification | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | Security | Production dependency tree: 7 critical / 33 high npm advisories | Known vulnerable tooling in install tree; increases supply-chain and build-time risk; some packages may affect shipped bundle surface | High | **Yes** (per existing QueerGlobal release security condition) | Frontend maintainer | Linear tickets on fixing security warnings in browser-shipped code, safe npm updates, forced safe build-tool versions, grouping dependency PRs, and optional Vite migration | Merge order of open dependency PRs | `npm audit --omit=dev` shows no critical/high OR documented accepted exceptions with compensating controls; CI runs audit or equivalent | `npm audit --omit=dev`, CI | Revert dependency PR merges |
| G2 | Accessibility | Mobile nav critical axe: unnamed menu button, invalid ARIA | Keyboard and screen reader users cannot reliably open or understand navigation | Critical | **Yes** | Frontend maintainer | [Open PR: Fix site navigation accessibility for desktop and mobile menus](https://github.com/gk-queer-global/qg-frontend-v2/pull/8) | None | PR #8 merged; Playwright mobile scan has no critical violations on `/`; jest baseline updated | `npm run test:a11y`, Playwright scan | Revert merge |
| G3 | Accessibility | Desktop nav buttons nested in links | Invalid HTML, confusing AT behavior | Serious | **Yes** (with G2) | Frontend maintainer | Same open nav PR #8 | G2 | Same as G2 | jest + axe | Revert merge |
| G4 | SEO | Soft 404 and missing sitemap | Search engines may index thin/duplicate URLs | High | **Yes** for SEO launch | Frontend + DevOps | New work (no open PR) | Cloudflare Pages redirect rules | Unknown paths return 404 (or dedicated 404 page with 404 status); valid `sitemap.xml` lists public URLs | curl status codes; Search Console inspection | Revert redirect/sitemap change |
| G5 | SEO | Single global title/description | Poor snippets; all URLs appear as same document | Medium | No (launch blocker for search, not static security) | Frontend | New work | Optional router-level meta helper | Each public route sets unique title and meta description | View source or automated test | Revert meta change |
| G6 | Security | No CSP / security headers in repo | XSS impact mitigation relies on platform defaults | Medium | **Yes** for hardening milestone | DevOps / Frontend | New work | Cloudflare Pages `_headers` | Documented header set on staging and production; verified with curl | `curl -I` on deployed host when authorized | Remove `_headers` |
| G7 | Security | CI disables audit; floating Wrangler versions | Regressions slip through; supply-chain drift | Medium | No | DevOps | New work | None | `npm audit` in CI at least on main; pin Wrangler action + CLI | CI logs | Revert workflow |
| G8 | Security | `/user` fetch assumes JSON body | Console errors; brittle when API absent | Low | No | Frontend | Backend readiness (Python handler contract ticket in hub-framework) | Staging API | Guard `.then` when response not OK; add tests | Unit test with failed fetch | Revert handler |
| G9 | Accessibility | Color contrast and target size (axe serious) | Low vision and motor users affected | Serious | No | Design + Frontend | Follow-on after G2 | Design tokens | axe serious cleared on primary routes | Playwright scan | Revert CSS |
| G10 | Accessibility | Missing `h1` / nested headings | Navigation by headings impaired | Moderate | No | Frontend | New work | Content edit | One `h1` per route; valid heading order | jest-axe / manual | Revert markup |
| G11 | SEO | Client-only rendering | Delayed indexing | Medium | No | Frontend | Vite/SSR ticket optional | Hosting choice | Documented SSR/prerender strategy OR accepted limitation | Rich Results / URL inspection | Revert prerender |
| G12 | Accessibility | Stub routes linked from nav/footer | Users reach blank content | Serious UX | No | Product + Frontend | Public surface audit ticket (remove or implement broken surfaces) | Content | Each linked path renders meaningful content or is removed from nav | Manual crawl | Revert routes |
| G13 | Backend (related) | Hub Python handler body contract | Staging API readiness for `/user` and future features | Medium | **Yes** for integrated release, not static-only | Backend owner | Linear ticket on fixing the Python example handler body contract locally (hub-framework) | PR review on hub-framework | Recorded passing contract tests on pinned revision | Python unit tests in hub-framework | Revert handler deploy |

## Release blockers

1. **G1** dependency vulnerabilities in the production npm tree (align with the in-flight Linear dependency security series).
2. **G2 + G3** mobile and desktop navigation accessibility defects on `main` (merge or supersede [PR #8](https://github.com/gk-queer-global/qg-frontend-v2/pull/8)).
3. **G4** soft 404 behavior for unknown and sitemap URLs if organic search is in scope for release.
4. **G6** if the release gate includes explicit security headers (none configured in this repo today).
5. **G13** when release includes hub-backed `/user` or authenticated nav (backend contract), not for static-only hosting.

## Post-release improvements

- G5 per-route metadata and G11 rendering strategy.
- G7 CI audit and pinned deploy tools.
- G8 defensive fetch handling.
- G9 contrast and target sizes.
- G10 heading structure and G19 skip link.
- G12 stub routes and footer link hygiene.
- Lighthouse / Core Web Vitals (E14).
- Manual keyboard, focus, zoom, and screen reader passes (A11, A12, A15, A16, A20).

## Untested areas

- Deployed `qg-frontend.staging.grandkru.com` response headers, TLS, and Basic Auth behavior.
- Cloudflare Pages production custom domains and redirect behavior beyond local `serve` + `_redirects` rule.
- Authenticated flows (profile, messages, logout) beyond stub components.
- Storybook 6 build and supply-chain (dev-only).
- Visual regression and cross-browser manual testing.
- Complete keyboard tour of every footer link at 200% zoom.
- Live exploit or penetration testing (explicitly out of scope).

## Related work (do not duplicate)

| Topic | Where it is already tracked |
| --- | --- |
| Navigation keyboard and screen reader fixes | [PR #8](https://github.com/gk-queer-global/qg-frontend-v2/pull/8) (open on this repo) |
| npm security warnings in shipped browser code | Linear: *QueerGlobal frontend: fix the security warnings in code sent to visitors' browsers* |
| Safe npm dependency updates | Linear: *QueerGlobal frontend: apply the safe dependency updates npm can make on its own* |
| Build-tool overrides | Linear: *QueerGlobal frontend: force safe versions of the leftover build-tool packages* |
| Dev vs prod dependency classification | Linear: *QueerGlobal frontend: mark build and test tools as development-only so the audit shows what actually ships* |
| Grouping Dependabot-style PR noise | Linear: *QueerGlobal frontend: group automatic dependency update PRs so they stop piling up* |
| Optional CRA to Vite migration | Linear: *QueerGlobal frontend: move the site's build from Create React App to Vite (bigger change)* |
| Python handler request body contract | Linear: *QueerGlobal: fix the Python example handler body contract locally* (hub-framework) |

## Appendix A: Commands exercised

```bash
git rev-parse HEAD
npm ci --no-audit --no-fund
npm run lint
CI=true npm run build
npm run test:ci
npm audit --omit=dev
npx serve -s build -l 4173
# Playwright axe (review machine; optional script: node scripts/a11y-local-scan.mjs --base-url http://127.0.0.1:4173)
npm run test:a11y
```

## Appendix B: Local HTTP probes

| URL | Status | Notes |
| --- | ---: | --- |
| `/` | 200 | SPA shell |
| `/about` | 200 | About content after JS |
| `/unknown-audit-route` | 200 | Soft 404 (same shell) |
| `/sitemap.xml` | 200 | Returns HTML shell, not XML |
| `/robots.txt` | 200 | Allows all |

---

_Independent reviewer: challenge coverage, confirm false positives, and reconcile release blockers before merge of this report._
