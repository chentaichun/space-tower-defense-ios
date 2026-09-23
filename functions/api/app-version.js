import { jsonResponse, optionsResponse } from "../_shared/cors.js";

const isValidVersionInfo = (value) => Boolean(
  value &&
  value.platform === "android" &&
  typeof value.packageName === "string" &&
  typeof value.latestVersion === "string" &&
  Number.isInteger(value.latestVersionCode) &&
  typeof value.minimumVersion === "string" &&
  Number.isInteger(value.minimumVersionCode) &&
  typeof value.forceUpdate === "boolean" &&
  typeof value.published === "boolean" &&
  typeof value.playStoreUrl === "string"
);

export async function onRequestGet({ request, env }) {
  if (!env.ASSETS?.fetch) {
    return jsonResponse(request, { error: "Version manifest is unavailable." }, 503);
  }

  try {
    const assetUrl = new URL("/app-version.json", request.url);
    assetUrl.searchParams.set("t", String(Date.now()));
    const response = await env.ASSETS.fetch(assetUrl);
    if (!response.ok) {
      return jsonResponse(request, { error: "Version manifest is unavailable." }, 503);
    }

    const versionInfo = await response.json();
    if (!isValidVersionInfo(versionInfo)) {
      return jsonResponse(request, { error: "Version manifest is invalid." }, 503);
    }

    return jsonResponse(request, versionInfo, 200);
  } catch {
    return jsonResponse(request, { error: "Version manifest is unavailable." }, 503);
  }
}

export function onRequestOptions({ request }) {
  return optionsResponse(request, "GET, OPTIONS");
}
