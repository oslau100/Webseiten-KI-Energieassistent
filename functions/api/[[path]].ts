interface PlatformApiBinding {
  fetch(request: Request): Response | Promise<Response>;
}

interface PagesFunctionContext {
  request: Request;
  env: {
    PUBLIC_PLATFORM_API?: unknown;
  };
}

function unavailable(): Response {
  return new Response("Service unavailable", {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

function isPlatformApiBinding(binding: unknown): binding is PlatformApiBinding {
  return (
    typeof binding === "object" &&
    binding !== null &&
    typeof (binding as Partial<PlatformApiBinding>).fetch === "function"
  );
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  if (!isPlatformApiBinding(context.env.PUBLIC_PLATFORM_API)) {
    return unavailable();
  }

  try {
    const response = await context.env.PUBLIC_PLATFORM_API.fetch(context.request);
    return response instanceof Response ? response : unavailable();
  } catch {
    return unavailable();
  }
}
