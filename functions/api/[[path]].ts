interface PlatformService {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  PUBLIC_PLATFORM_API?: PlatformService;
}

interface PagesFunctionContext {
  request: Request;
  env: Env;
}

const unavailable = () => new Response("Service unavailable", {
  status: 503,
  headers: { "Cache-Control": "no-store" },
});

export const onRequest = async (context: PagesFunctionContext): Promise<Response> => {
  if (!context.env.PUBLIC_PLATFORM_API || typeof context.env.PUBLIC_PLATFORM_API.fetch !== "function") {
    return unavailable();
  }

  try {
    return await context.env.PUBLIC_PLATFORM_API.fetch(context.request);
  } catch {
    return unavailable();
  }
};
