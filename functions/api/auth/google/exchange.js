import { jsonResponse, optionsResponse } from "../../../_shared/cors.js";
import {
  exchangeGoogleBridgeCode,
  googleAuthConfigured
} from "../../../_shared/google-auth.js";

export async function onRequestPost({ request, env }) {
  if (!googleAuthConfigured(env)) {
    return jsonResponse(request, { error: "Google sign-in is not configured.", code: "GOOGLE_NOT_CONFIGURED" }, 503);
  }

  const body = await request.json().catch(() => null);
  const result = await exchangeGoogleBridgeCode(env, body?.code);
  if (!result) {
    return jsonResponse(request, { error: "Google sign-in code is invalid or expired.", code: "GOOGLE_CODE_INVALID" }, 401);
  }

  return jsonResponse(request, {
    ok: true,
    player: { name: result.account.name },
    sessionToken: result.sessionToken
  });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
