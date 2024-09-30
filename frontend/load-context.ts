import { Session, type AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";
import { createSessionStorage } from "./app/context/session/session";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    session: Session;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: {
    cloudflare: Cloudflare;
  }; // load context _before_ augmentation
}) => Promise<AppLoadContext>;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = async ({ context, request }) => {
  const { getSession } = createSessionStorage(context.cloudflare.env);

  return {
    ...context,
    session: await getSession(request.headers.get("Cookie")),
  };
};
