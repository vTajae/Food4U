// Local compatibility/CPU prototype only. Never deploy this password probe.
import { compare } from '../../../frontend/node_modules/bcrypt-ts/dist/browser.mjs';

const identity = { runtime: 'bcrypt-ts/workerd', version: '5.0.3' };
const cost10Hash = /^\$2[aby]\$10\$[./A-Za-z0-9]{53}$/;
const badRequest = () => Response.json({ error: 'Invalid benchmark request' }, { status: 400 });

export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/_spike/health') {
      return request.method === 'GET'
        ? Response.json({ ready: true, ...identity })
        : badRequest();
    }
    if (path !== '/_spike/bcrypt') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    if (request.method !== 'POST') return badRequest();

    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest();
    }
    if (!body || typeof body.password !== 'string' ||
        typeof body.hash !== 'string' || !cost10Hash.test(body.hash)) {
      return badRequest();
    }

    const start = Date.now();
    const valid = await compare(body.password, body.hash);
    const elapsed_ms = Date.now() - start;
    return Response.json({ valid, elapsed_ms, ...identity });
  },
};
