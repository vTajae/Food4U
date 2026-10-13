# Food4U Topcoat compatibility spike

This is slice 001, **not** a replacement for the existing application. It has
one SSR page, a bundled CSS asset, and a browser signal counter. It does not
connect to accounts, profiles, D1, KV, CockroachDB, or external providers.

## Pinned environment

- WSL Ubuntu-24.04, user `apples`; Node 22+ (verified with 24.15.0).
- Rust 1.98.1 with `wasm32-unknown-unknown`, Clippy, and rustfmt.
- Topcoat 0.9.0, topcoat-cloudflare 0.2.0, worker/worker-build 0.8.7.
- npm adapter 0.2.0, Wrangler 4.142.0; compatibility date 2026-09-27.

Run npm, Cargo, and Wrangler **only from WSL**, not Windows: dependencies
contain Linux binaries. On `/mnt/g`, npm executable symlinks fail with EPERM.
The project disables bin links and creates regular file wrappers at postinstall
for the two pinned CLIs; the packages themselves are unchanged.

```sh
cd /mnt/g/WebDev/Food4U/Food4U/rust-app
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
export CARGO_TARGET_DIR="$HOME/.cargo/food4u-rust-targets/slice001"
npm ci
cargo fmt --check
cargo clippy --target wasm32-unknown-unknown -- -D warnings
npx wrangler dev --local --ip 127.0.0.1 --port 8789
```

The target directory is a WSL-local cache, not source. The adapter obtains its
path from Cargo metadata and uses it for the Wasm artifact and native builder.

In another WSL shell, run:

```sh
cd /mnt/g/WebDev/Food4U/Food4U/rust-app
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
SPIKE_URL=http://127.0.0.1:8789 npm run test:http
```

`tests/browser.mjs` uses the existing frontend's Playwright dependency and a
real headless Chrome executable. It verifies click and keyboard changes and
reload reset, rejects browser errors, and saves the required counter screenshot.
To use installed Windows Chrome from a WSL shell:

```sh
"/mnt/c/Program Files/nodejs/node.exe" \
  G:/WebDev/Food4U/Food4U/rust-app/tests/browser.mjs
```

This browser is Windows Chrome exercising **WSL's local workerd**, not a Linux
browser or deployed Cloudflare Worker.

For command-to-ready timing, use `node scripts/dev-timed.mjs` in place of the
dev command. It records the first ready event and raw output under ignored
`.evidence/`. Run `npx topcoat-cloudflare build` after stopping dev for a release
build; this does not deploy anything. Preserve the exact dependency pins even
when the audit reports advisories; report them rather than silently upgrading.

## Upstream references

- [Adapter installation](https://github.com/kdcokenny/topcoat-cloudflare/blob/main/packages/adapter/README.md)
- [Pinned compatibility](https://github.com/kdcokenny/topcoat-cloudflare/blob/main/docs/compatibility.md)
- [UI app APIs](https://github.com/kdcokenny/topcoat-cloudflare/blob/main/examples/ui/src/app.rs)
- [Adapter fixture counter](https://github.com/kdcokenny/topcoat-cloudflare/blob/main/tests/fixture/src/lib.rs)

No Cloudflare account login, deployment, remote bindings, or real secrets have
been used. See the cockpit receipts for measured results and remaining limitations.

## Slice 002: local auth compatibility

The spike now also serves `/login`, `/me`, and `/logout`. It is still **not** the
Food4U application replacement. D1/KV bindings use dummy IDs and their isolated
local `.wrangler` state. Copy `.dev.vars.example` to `.dev.vars` for the fake
local keys; never use those keys outside this experiment.

Initialize only the **new local spike database** (this SQL drops the local
`user` table; it does not target the existing frontend database):

```sh
npx wrangler d1 execute cloudflare_db --local --file=../frontend/database/basic.sql
```

`basic.sql` already includes `public_id`. Do not also apply the legacy
`0001_user_public_id.sql` migration to that fresh schema: it would add the same
column again. No existing database or production migration is part of this slice.

Login is a Topcoat JSON-array procedure, `POST /api/login` with
`[username,password]`; the real form calls it through Topcoat's browser runtime.
It returns an empty string on success or the exact existing credential error.
It uses the existing D1 row fields, bcrypt cost 10, the existing HMAC cookie/KV
format, and HS256 JWTs with the stable `public_id` and 30-minute expiry. No mutable
current-user/token state is shared across requests.

The `/register` path and `/_spike/*` fixture/measurement routes require both
`SPIKE_DEBUG=1` and a localhost request URL; they are unavailable otherwise. They
exist only to prove cross-language compatibility with fake local data, not as
production registration/admin APIs. Topcoat's default origin policy stays enabled.

With workerd running on port 8789, run these **sequentially** from WSL:

```sh
npm run test:http
npm run test:auth
"/mnt/c/Program Files/nodejs/node.exe" \
  G:/WebDev/Food4U/Food4U/rust-app/tests/auth-browser.mjs
```

The auth tests use the existing frontend's bcrypt-ts and JWT packages, real local
D1/KV, and independent WebCrypto session signing. The browser test uses a real
form, verifies visible credential errors, login, logout, and saves `002-login.png`.
Tests seed fake users; successful session keys are cleaned up. The HTTP suite
emits a `PYJWT_FIXTURE` JSON line; save it to `.evidence/002-pyjwt-fixture.json`,
then run the backend verifier from Windows:

```powershell
backend/.venv/Scripts/python.exe rust-app/tests/check-jwt.py rust-app/.evidence/002-pyjwt-fixture.json
```

The HTTP suite also records 20 cost-10 verification samples for local Wasm and
bcrypt-ts under Node. These are **local elapsed-time estimates**, not deployed
billable CPU measurements. Compare them with the Free 10 ms/request and Paid
default 30,000 ms/request CPU budgets; do not infer that Rust is faster or that
the Free plan can support this auth path. See the slice 002 receipt for results.
