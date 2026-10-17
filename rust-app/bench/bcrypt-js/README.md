# Local bcrypt-ts benchmark prototype

Never deploy this worker. It has no bindings or secrets and exists only to
compare bcrypt cost 10 inside local workerd, not to implement production login.
It imports the frontend's installed `bcrypt-ts` 5.0.3 browser export directly;
there is no separate install or dependency manifest.

Run only inside **WSL Ubuntu-24.04**; the installed binaries are Linux binaries.
From `rust-app`, after confirming WSL loopback port 8790 is free, use the existing pinned
Wrangler installation (no global CLI or dependency download):

```sh
node node_modules/wrangler/bin/wrangler.js dev --local --config bench/bcrypt-js/wrangler.jsonc
```

- `GET /_spike/health` returns `{ready:true,runtime:"bcrypt-ts/workerd",version:"5.0.3"}` without invoking bcrypt.
- `POST /_spike/bcrypt` accepts JSON `{password,hash}` with a string password and
  a cost-10 `$2a$`, `$2b$`, or `$2y$` bcrypt hash. It returns
  `{valid,elapsed_ms,runtime:"bcrypt-ts/workerd",version:"5.0.3"}`; a wrong password
  produces `valid:false` with HTTP 200.
- Invalid methods, malformed JSON, or invalid parameters return HTTP 400;
  unknown paths return HTTP 404. Responses never echo input values.
- `elapsed_ms` uses `Date.now()` immediately around `await compare(...)` only;
  it excludes body parsing and response serialization. Local wall-clock timing
  is indicative, not billed CPU.

Run dependency-free handler contract tests with
`node --test bench/bcrypt-js/worker.test.mjs`. These run under Node, do not open
ports, and do not establish workerd performance. The shared benchmark driver
owns live workerd verification and timing evidence.

For the full sequential Rust-release/JS comparison, stop any owned dev server,
set the PATH and Cargo cache as documented in `rust-app/README.md`, then run:

```sh
npx topcoat-cloudflare build
node --test scripts/bench-bcrypt.test.mjs
node scripts/bench-bcrypt.mjs
```

The driver requires a release build, starts only its own local Wrangler instances,
and refuses occupied ports (8789/8790 and inspectors 9238/9239). It records one
excluded warmup, 30 measured calls and a first call after restart for each runtime.
After timing, CDP retrieves the loaded Rust Wasm bytes and verifies their SHA256
against the release artifact and build metadata. Results are ignored
`.evidence/003-*.json`, with a shared run ID and explicit completion status;
interrupted/failed reruns cannot masquerade as a previous successful run.
The cancellation regression intentionally invalidates result files; rerun the
benchmark afterwards to restore a complete result set.
