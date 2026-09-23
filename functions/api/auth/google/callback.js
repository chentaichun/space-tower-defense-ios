import {
  consumeGoogleState,
  createGoogleBridgeCode,
  exchangeGoogleAuthorizationCode,
  getOrCreateGoogleAccount,
  googleAuthConfigured,
  googleAuthResultUrl
} from "../../../_shared/google-auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const state = await consumeGoogleState(env, url.searchParams.get("state"));
  const flow = state?.flow === "app" ? "app" : "web";
  if (!googleAuthConfigured(env)) {
    return Response.redirect(googleAuthResultUrl(flow, { error: "not_configured" }), 302);
  }
  if (!state) {
    return Response.redirect(googleAuthResultUrl(flow, { error: "invalid_state" }), 302);
  }
  if (url.searchParams.get("error")) {
    return Response.redirect(googleAuthResultUrl(flow, { error: "cancelled" }), 302);
  }

  const authorizationCode = url.searchParams.get("code");
  if (!authorizationCode) {
    return Response.redirect(googleAuthResultUrl(flow, { error: "missing_code" }), 302);
  }

  try {
    const profile = await exchangeGoogleAuthorizationCode(env, authorizationCode);
    const { account, accountKey } = await getOrCreateGoogleAccount(env, profile);
    const bridgeCode = await createGoogleBridgeCode(env, accountKey, account.name);
    return Response.redirect(googleAuthResultUrl(flow, { code: bridgeCode }), 302);
  } catch {
    return Response.redirect(googleAuthResultUrl(flow, { error: "verification_failed" }), 302);
  }
}
