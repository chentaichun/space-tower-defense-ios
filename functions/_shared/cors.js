const APP_ORIGINS = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost"
]);

const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  if (APP_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    return url.protocol === "https:" && (
      url.hostname === "space-tower-defense.pages.dev" ||
      url.hostname.endsWith(".space-tower-defense.pages.dev")
    );
  } catch {
    return false;
  }
};

export const corsHeaders = (request, options = {}) => {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": options.methods || "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": options.headers || "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
};

export const jsonResponse = (request, data, status = 200, options = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request, options)
    }
  });

export const optionsResponse = (request, methods = "GET, POST, DELETE, OPTIONS") => {
  const origin = request.headers.get("Origin") || "";
  const headers = corsHeaders(request, { methods });
  if (origin && !headers["Access-Control-Allow-Origin"]) {
    return jsonResponse(request, { error: "Origin is not allowed." }, 403);
  }
  return new Response(null, { status: 204, headers });
};
