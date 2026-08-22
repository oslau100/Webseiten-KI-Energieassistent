interface PlatformApiBinding {
  fetch(request: Request): Response | Promise<Response>;
}

interface PagesFunctionContext {
  request: Request;
  env: {
    PUBLIC_PLATFORM_API?: PlatformApiBinding;
  };
}

const unavailable = () => new Response("Service unavailable", {
  status: 503,
  headers: { "Cache-Control": "no-store" },
});

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const binding = context.env?.PUBLIC_PLATFORM_API;

  if (!binding || typeof binding.fetch !== "function") return unavailable();

  try {
    return await binding.fetch(context.request);
  } catch {
    return unavailable();
  }
}
