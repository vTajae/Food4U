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

No login, deployment, remote bindings, or real secrets are configured in this
slice. See the cockpit receipt for measured results and remaining limitations.
