type PreviewEnv = {
  SITE_PREVIEW_LOCK?: string;
  PREVIEW_USERNAME?: string;
  PREVIEW_PASSWORD?: string;
};

type PreviewContext = {
  request: Request;
  env: PreviewEnv;
  next: () => Promise<Response>;
};

const protectedResponse = (body: string, status: number) => new Response(body, {
  status,
  headers: {
    "WWW-Authenticate": 'Basic realm="Energieassistent Preview"',
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Content-Type": "text/plain; charset=utf-8",
  },
});

export const onRequest = async ({ request, env, next }: PreviewContext): Promise<Response> => {
  if (env.SITE_PREVIEW_LOCK?.trim().toLowerCase() !== "true") return next();

  if (!env.PREVIEW_USERNAME?.trim() || !env.PREVIEW_PASSWORD?.trim()) {
    return protectedResponse("Preview access is not configured.", 503);
  }

  const authorization = request.headers.get("Authorization") || "";
  const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
  let credentials = "";
  try {
    if (match) {
      const bytes = Uint8Array.from(atob(match[1]), (character) => character.charCodeAt(0));
      credentials = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
  } catch { /* Malformed credentials are unauthorized. */ }

  if (credentials !== `${env.PREVIEW_USERNAME}:${env.PREVIEW_PASSWORD}`) {
    return protectedResponse("Authentication required.", 401);
  }

  const upstream = await next();
  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
};
