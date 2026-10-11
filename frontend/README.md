## Food4U


[![Netlify Status](https://api.netlify.com/api/v1/badges/e24cb77b-2ea3-42eb-884f-4a19ecc4cc63/deploy-status)](https://app.netlify.com/sites/thefoodproject/deploys)


install node (20 or newer, per package.json engines)

npm i

## Local development

```bash
npm install
cp wrangler.toml.example wrangler.toml   # dev-only bindings and placeholder secrets (wrangler.toml is gitignored)
npm run d1:local-initialize              # create the local D1 user table
npm run dev                              # http://localhost:5173
```

Login also calls the FastAPI backend at `API_BASE_URL`. It only succeeds when `JWT_SECRET_KEY` matches that backend's secret, so point `API_BASE_URL` at a local backend for full end-to-end testing.





Local_URL: http://127.0.0.1:5173
Deployed_URL: https://development.my-remix-app-7c2.pages.dev/