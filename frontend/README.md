## Food4U


[![Netlify Status](https://api.netlify.com/api/v1/badges/e24cb77b-2ea3-42eb-884f-4a19ecc4cc63/deploy-status)](https://app.netlify.com/sites/thefoodproject/deploys)


install node (20 or newer, per package.json engines)

npm i

## Local development

Next.js 16 (App Router) running on [vinext](https://vinext.dev) and deployed to Cloudflare Workers.

```bash
npm install
cp .dev.vars.example .dev.vars        # dev-only placeholder secrets (gitignored)
npm run d1:local-initialize           # create the local D1 user table
npm run typegen                       # worker-configuration.d.ts from wrangler.jsonc
npm run dev                           # http://localhost:3001
```

`wrangler.jsonc` holds the KV/D1 bindings and non-secret vars; secrets come from `.dev.vars` locally and `wrangler secret put` in production. Login also calls the FastAPI backend at `API_BASE_URL`; it only succeeds when `JWT_SECRET_KEY` matches that backend's secret, so point `API_BASE_URL` at a local backend for full end-to-end testing.

Build with `npm run build`; deploy with `npm run deploy` (`@vinext/cloudflare deploy`, needs `CLOUDFLARE_API_TOKEN` or `wrangler login`).





Local_URL: http://localhost:3001
Deployed_URL: https://development.my-remix-app-7c2.pages.dev/