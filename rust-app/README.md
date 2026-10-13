# Food4U Rust / Topcoat app — auth vertical slice

The Rust app now serves Food4U's public authentication and privacy surface.
Dashboard and welcome are protected **not-yet-migrated placeholders**. The three
profile/reference/suggestion APIs and backend-outage flows are not implemented;
this is not a complete application replacement. No backend is called.

## Pinned local environment

- WSL Ubuntu-24.04 (`apples`), Linux Node22+ (verified24.15.0).
- Rust1.98.1, wasm32-unknown-unknown, rustfmt/Clippy.
- Topcoat0.9.0, topcoat-cloudflare0.2.0, worker/worker-build0.8.7.
- npm adapter0.2.0, Wrangler4.142.0, compatibility date2026-09-27.

Run npm/Cargo/Wrangler **in WSL only**: dependencies contain Linux binaries.
On `/mnt/g`, npm bin links fail with EPERM; the existing postinstall creates
regular wrappers for the pinned CLIs without modifying packages.

```sh
cd /mnt/g/WebDev/Food4U/Food4U
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
export CARGO_TARGET_DIR="$HOME/.cargo/food4u-rust-targets/slice001"
# Dependencies already installed; for a fresh checkout: (cd rust-app && npm ci)
node contract/local-rust.mjs --fixtures --checks --contract --visual
```

This command owns and stops its local server on8789 (inspector9238). It uses
ignored temporary configs, dummy D1/KV bindings and the **fake example keys**,
never production credentials. Existing isolated `rust-app/.wrangler/state`
must already contain the slice002 local user schema. It does not initialize or
reset databases. A new empty isolated database can be initialized from
`frontend/database/basic.sql` using Wrangler **--local** only: that SQL drops
its local user table, so never reapply it to retained state or another app.

The `--checks` files run serially to avoid shared KV snapshot races:
HTTP3, original auth13 and server-validation2 checks. The unchanged contract
uses Windows Node/Chrome and the frontend's installed Playwright. Expected
result: **20 scoped pass,16 out-of-scope leaf failures,6 skips**; Node reports17
failures including the failed parent and exits1. The helper exits0 only when
those exact gaps, all scoped passes and `ONRENDER_REQUESTS_OBSERVED=0` are proven.
It rejects Wrangler's stale-build fallback instead of testing old artifacts.

`--visual` captures six pages (1440x900 and390x844, mobile DPR2) and actual
baseline-left/Rust-right PNG comparisons in `docs/sprint/screenshots/rust-005/`.
It checks tab keyboard/focus behavior, input error associations, raw-password
validation and disabled/blocked-JavaScript safety. A deny-only proxy blocks
external requests, including redirects; fonts are served locally. Evidence
is under ignored `contract/.evidence/005-*` and `rust-app/.evidence/005-visual.json`.
Use `node contract/local-rust.mjs --fixtures` for a persistent local fixture
server; Ctrl+C stops it. Without `--fixtures`, dev has no debug routes.

## Auth and fixtures

Public login/register are Topcoat JSON-array procedures:
`POST /api/login` and `/api/register`, body `[username,password]`. They return
an empty JSON string on success or the existing validation/credential message.
Client and server check raw email and six UTF16 password units **before trim**;
raw values cross the request seam so server validation applies the same schema.
The SSR submit is disabled until enhancement initializes, and the native form
uses POST, never GET, to prevent passwords appearing in URLs when JS fails.

Registration uses UUIDv4, role2, integer Unix seconds and bcrypt cost10.
Auth retains the existing D1 fields, signed `__session` cookie, KV SessionData,
and HS256 JWT with stable public_id/30-minute expiry. Login preserves welcome
and flash state. `/api/auth/logout` deletes KV and expires the cookie; `/logout`
remains an alias. Real dashboard/welcome flows are deferred.

`/_spike/*`, test `POST /register` and legacy `/me` are compiled only with
Cargo feature `debug-fixtures`, **off by default**. Fixtures additionally need
`SPIKE_DEBUG=1`; no spoofable Host-header security check remains.
`scripts/worker-build-fixtures.sh` uses the adapter's supported WORKER_BUILD_BIN
override, validates the real worker-build0.8.7 and adds the actual Cargo feature
only for `--dev`. It refuses standalone release builds. No adapter patch or
fake cfg/RUSTFLAGS is used.

## Default release and static gates

Stop any dev server before building release. From the repo root in WSL:

```sh
node contract/local-rust.mjs --release --release-proof
cd rust-app
cargo fmt --check
cargo clippy --target wasm32-unknown-unknown -- -D warnings
cargo clippy --target wasm32-unknown-unknown --features debug-fixtures -- -D warnings
```

Release proof clears build overrides, runs standalone
`npx --no-install topcoat-cloudflare build`, verifies optimized release metadata
and Wasm hash, checks debug strings absent, and serves those exact bytes with
**no build hook**. Even with `SPIKE_DEBUG=1`, all seven fixture method/routes
must404 while public login/validation remain live. Logs/results use the separate
`005-rust-release-*` prefix. This proves a local release artifact, not deployment
or production performance. No login, deploy, --remote or push is part of this task.

## Earlier spike evidence

Slices001–003 established adapter compatibility and cross-language auth.
Historical counter/browser scripts and002 screenshots remain as earlier evidence;
the counter page is no longer served. Original auth tests still require fixtures.
Local elapsed bcrypt timing is not deployed billable CPU and is not a Rust speed
claim. Exact framework pins remain unchanged; advisories are not silently upgraded.

Fonts and redistribution notices: [assets/fonts/README.md](assets/fonts/README.md).
See the cockpit receipts for validation results and known unmigrated flows.