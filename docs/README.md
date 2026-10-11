# Food4U documentation

Start here to follow the life of the project. Documents are listed in the order they were written; each one says what was decided and what was proven at that point.

## 0. Origins (2024, hackathon)
- [`history/`](history/) — the original idea, roadmap, product-vision draft, "room for improvement" notes and the API research (USDA FoodData Central, NLM ICD-10-CM / Clinical Tables) that shaped the MVP.
- [`API/`](API/), [`DB/`](DB/) — the MVP's API and database notes; [`javascript-snippets.md`](javascript-snippets.md), [`typescript-snippets.md`](typescript-snippets.md).

## 1. Vision
- [`upgrade-plan.md`](upgrade-plan.md) — the architectural blueprint: from the hackathon MVP to an agentic "context-to-commerce" engine for people managing Crohn's and other dietary constraints. Phases 0–9, provider evaluation, safety layer, commerce integrations.

## 2. Sprint 1 — UI foundation and framework (October 2026)
Read in order.

| # | Document | What it settles |
|---|---|---|
| 1 | [`sprint/phase0-sprint1-plan.md`](sprint/phase0-sprint1-plan.md) | Phase 0 decisions and the Sprint 1 backlog (7 items) |
| 2 | [`sprint/x-post-analysis.md`](sprint/x-post-analysis.md) | Review of two X posts on "vibe-coding" UI resources; what applies to a clinical product and what doesn't |
| 3 | [`sprint/x-posts-ui-takeaways.md`](sprint/x-posts-ui-takeaways.md) | The 11 concrete UI takeaways and the exact screen each one changes |
| 4 | [`../frontend/DESIGN.md`](../frontend/DESIGN.md) | The design system ("Pantry Label"): tokens, type, components, rules. The source of truth for every screen |
| 5 | [`sprint/sprint1-step1-2-report.md`](sprint/sprint1-step1-2-report.md) | Items 1–2: DESIGN.md committed, Tailwind 3 → 4, tokens as CSS variables |
| 6 | [`sprint/sprint1-wrangler-report.md`](sprint/sprint1-wrangler-report.md) | Cloudflare tooling upgrade so `build`/`dev` work on Windows; first screenshots |
| 7 | [`sprint/sprint1-item3-report.md`](sprint/sprint1-item3-report.md) | Item 3: shadcn/ui migration with keyboard/a11y checks |
| 8 | branch `rr7-attempt` | The React Router 7→8 migration attempt. Stopped when the direction changed to Next.js; no report, the branch and `sprint1-nextjs-report.md` §1 explain why |
| 9 | [`sprint/sprint1-nextjs-report.md`](sprint/sprint1-nextjs-report.md) | The port to Next.js 16 on vinext + Cloudflare Workers, with the redesign of every screen (items 4–5 pulled forward) |
| 10 | [`sprint/data-flow-report.md`](sprint/data-flow-report.md) | Diagnosis of the frontend ↔ backend identity flow: the D1↔CockroachDB id collision, proven with feedback loops, and the fix |
| 11 | [`sprint/data-flow-plan.md`](sprint/data-flow-plan.md) | What remains (migrations, deploys, dead paths), written as a cockpit objective for OMC → OMX |

Screenshots for each report are under [`sprint/screenshots/`](sprint/screenshots/).

## Branches
- `main` — the hackathon MVP (Remix 2 on Cloudflare Pages).
- `sprint1-ui-foundation` — Sprint 1 items 1–3 on Remix.
- `sprint1-nextjs` — the current line: Next.js 16 on vinext/Workers, redesigned UI, identity fix. Branched from the end of item 3.
- `rr7-attempt` — the abandoned React Router 7/8 migration, kept for reference.

## Running things
- Frontend: `frontend/README.md` (dev, build, deploy, D1/KV). Tests: `npm test`; e2e loop: `npm run e2e:login` against a running dev server.
- Backend: `backend/README.md`. Identity tests: `backend/.venv/Scripts/python -m pytest backend/tests` (create the venv with `fastapi pydantic asyncpg SQLAlchemy PyJWT pytest httpx python-dotenv greenlet`).
- Loops used in the diagnosis: `backend/scripts/loop-profile.sh`, `frontend/scripts/e2e/login-loop.mjs`.
