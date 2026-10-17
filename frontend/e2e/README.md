# Real-Chrome end-to-end gate

**Addendum 2 verified:** `<-loopback>` comes **first** in every proxy bypass
list, before explicit hosts. The renewed legacy contract passes unchanged;
both viewport regressions load the allowed source (200), reject redirected
navigation (403) and fetch, and prove zero destination requests. Default e2e:
29 passed, 17 documented fixmes, no failures or retries. Full handoff/evidence:
`.cockpit/20261013-neon/plans/018-executor.md` at the repository root.

From the repository root or `frontend`, run `npm run e2e`. Node >=22, installed
dependencies, system Google Chrome and Playwright's **FFmpeg** are prerequisites:
`cd frontend; npm ci; npx playwright install ffmpeg`. No bundled browser, paid
service, deployment, production database or real AI provider is needed.

Every default run builds a fresh, byte-identical snapshot of current product
sources in an owned OS temporary directory. Only its public Wrangler bindings
are replaced with synthetic local values. The ordinary `frontend/dist` and
`.wrangler/deploy/config.json` are not changed. The built JS is not patched.
Wrangler runs that Worker with a fresh local D1, KV, synthetic accounts and a
deterministic fake backend. Dependencies are linked, not copied. Source hashes
are checked against both snapshot and checkout after building.

## Commands

```powershell
npm run e2e
npm run e2e -- --project mobile
# From frontend:
npx playwright show-report
npx playwright show-trace test-results/<failed-test>/trace.zip

# Deliberate RED: nonzero exit, five specific guard failures, one clean control.
$env:E2E_GUARD_RED='1'; npm run e2e -- guard-self --project desktop
Remove-Item Env:E2E_GUARD_RED

# Reproduce all listed fixmes (expected to fail until product fixes land).
$env:E2E_AUDIT='1'; npm run e2e -- --grep D018-
Remove-Item Env:E2E_AUDIT

# Explicitly opt-in only: read-only real production smoke. NOT run by default.
$env:E2E_PROD='1'; npm run e2e -- --project prod-smoke
Remove-Item Env:E2E_PROD
```

Both default projects use installed Chrome: desktop 1440×900 and touch/mobile
390×844. Retries are disabled. Failed tests retain trace, screenshot and video;
successful screenshots form a tour. The HTML/JSON reports, tour, source/build
receipt, runtime log, egress/owner-hash receipt and cleanup receipt are ignored
under `playwright-report`, `test-results` and `e2e/.artifacts`.

## Safety and gate semantics

- Setup/teardown hashes owner `.dev.vars`, `.env.local`, `.neon` as streams only;
  it never parses, copies, loads or modifies them. The temporary source snapshot
  excludes dotfiles and tooling/test/output folders. The ordinary explicit
  `npm run build` and legacy contract gate remain separate existing commands.
- The Worker outbound service permits **only the exact owned fake origin**;
  fetch redirects use `redirect: 'error'`. External and redirect deny canaries
  run before any app traffic. Teardown asserts exact egress and Render count 0.
- Chrome uses a deny-only proxy and context routing. The subtractive
  `<-loopback>` marker must precede explicit host bypasses: removing it leaks
  redirected loopback traffic; appending it blocks even the allowed source.
  String and positive-source/negative-redirect self-tests protect this order.
  The exact Google Fonts
  stylesheet is fulfilled with empty CSS to avoid any remote font call. Tour
  images therefore use system fallback fonts; typography is not certified.
  Self-hosting fonts remains Track A6. No app JS, HTML or first-party response
  is stubbed. Clinical browsing uses the real bundled lists, not live NLM search.
- Each named state and final page is checked for console errors, page errors,
  failed same-origin requests, Render attempts, serious/critical axe violations
  across WCAG 2.0/2.1 A/AA tags, and the brief's ICD regex on visible intake,
  review and dashboard text. Axe violations and incomplete results are attached
  for review; passing automation is not a WCAG or medical-safety certification.
- **Narrowly reasoned console exception:** Chrome's exact native 404 message
  for the exact intentional `/this-page-does-not-exist-018` document URL. That
  journey separately asserts HTTP 404. No other console or accessibility
  messages are allow-listed.
- Same-origin request failures, including canceled RSC streams, remain fatal.
  An observed intermittent `/welcome?_rsc=...` cancellation is recorded in the
  handoff; HTTP 200 headers alone do not prove a successful replacement stream.
  No cancellation exception or blanket `ERR_ABORTED` ignore is installed.
- Known defects are `test.fixme` annotations with IDs in [DEFECTS.md](DEFECTS.md),
  not weakened gates or product fixes. The account-menu capture is audit-only;
  its failing accessibility check is separately retained as D018-03. The outage
  capture is not acceptance of its copy; D018-04 asserts the intended behavior.
- Fake profiles are keyed by synthetic JWT identity. Normal users exercise
  missing-profile ensure, all five steps, save and reload persistence. Seeded
  `dashboard-*`, `waking-*` and `save-waking-*` identities provide deterministic
  states; suggestions return 503 by default. This is not real backend/Neon proof.
- Production config is created **only** with `E2E_PROD=1`; it replaces the local
  project list with `prod-smoke`. Non-GET/HEAD requests are aborted before dispatch.
  It visits only `/`, `/login`, `/privacy`, with fresh unauthenticated contexts.
  App-generated read-only wake GETs may occur. No signup or credentials are used.

Playwright test/core are pinned together at 1.64.1. The initially attempted
1.49.1 conflicted with Next's >=1.51.1 optional peer, and 1.51.1 carried
[GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp).
Axe's Playwright integration is pinned at 4.10.2. API references:
[global lifecycle](https://playwright.dev/docs/test-global-setup-teardown),
[Chrome channel](https://playwright.dev/docs/browsers),
[accessibility](https://playwright.dev/docs/accessibility-testing).
