import {
  createGoogleState,
  googleAuthorizationUrl,
  googleAuthConfigured,
  googleAuthResultUrl
} from "../../../_shared/google-auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const flow = url.searchParams.get("flow") === "app" ? "app" : "web";
  if (!googleAuthConfigured(env)) {
    return Response.redirect(googleAuthResultUrl(flow, { error: "not_configured" }), 302);
  }

  const state = await createGoogleState(env, flow);
  return Response.redirect(googleAuthorizationUrl(env, state), 302);
}
