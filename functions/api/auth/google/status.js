import { jsonResponse, optionsResponse } from "../../../_shared/cors.js";
import { googleAuthConfigured } from "../../../_shared/google-auth.js";

export async function onRequestGet({ request, env }) {
  return jsonResponse(request, { enabled: googleAuthConfigured(env) });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "GET, OPTIONS");
}
