export interface EnvWithKV {
  USER_SESSION_SECRET: string;
  USER_COOKIE_SECRET: string;
  ASSETS: object;
  theform: KVNamespace;
  __STATIC_CONTENT: KVNamespace;
  DB: D1Database;
}

export interface RequestContext {
  request: Request;
  env?: EnvWithKV;
  context?: any;
}
