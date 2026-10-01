import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { onRequestGet, onRequestOptions } from "../functions/api/app-version.js";

const [updateSystemSource, updateCss, indexHtml, packageSource, versionSource] = await Promise.all([
  readFile(new URL("../update-system.js", import.meta.url), "utf8"),
  readFile(new URL("../update-system.css", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../app-version.json", import.meta.url), "utf8")
]);

const packageInfo = JSON.parse(packageSource);
const versionInfo = JSON.parse(versionSource);

const createCoreApi = (platform = "web") => {
  const eventTarget = { addEventListener() {} };
  const document = {
    ...eventTarget,
    documentElement: {
      lang: "zh-Hant",
      dataset: { gameVersion: "2.9.5", gameVersionCode: "38" }
    },
    visibilityState: "visible",
    getElementById() { return null; }
  };
  const window = {
    ...eventTarget,
    Capacitor: { getPlatform: () => platform, Plugins: {} },
    setTimeout,
    clearTimeout,
    location: { href: "https://localhost/", hostname: "localhost", search: "" }
  };
  const context = {
    window,
    document,
    sessionStorage: { getItem: () => null, setItem() {} },
    fetch: async () => { throw new Error("web checks should be skipped"); },
    AbortController,
    CustomEvent,
    URL,
    URLSearchParams,
    console,
    Date,
    Number,
    String,
    Math,
    Promise,
    encodeURIComponent
  };
  runInNewContext(updateSystemSource, context);
  return window.SpaceTowerUpdateSystem;
};

test("Android update manifest keeps the published 2.9.28 build 62 until release", () => {
  assert.equal(versionInfo.platform, "android");
  assert.equal(versionInfo.packageName, "com.mrchen.spacetowerdefense");
  assert.equal(packageInfo.version, "2.9.30");
  assert.equal(indexHtml.match(/data-game-version="([^"]+)"/)[1], packageInfo.version);
  assert.equal(Number(indexHtml.match(/data-game-version-code="(\d+)"/)[1]), 64);
  assert.equal(versionInfo.latestVersion, "2.9.28");
  assert.equal(versionInfo.latestVersionCode, 62);
  assert.equal(versionInfo.minimumVersionCode, 62);
  assert.equal(versionInfo.minimumVersion, "2.9.28");
  assert.equal(versionInfo.published, true);
  assert.equal(versionInfo.forceUpdate, true);
});

test("update system compares semantic versions and supports optional or required updates", () => {
  const api = createCoreApi();
  assert.equal(api.compareVersions("2.10.0", "2.9.9"), 1);
  assert.equal(api.compareVersions("2.9.5", "2.9.5"), 0);
  assert.equal(api.compareVersions("2.9.4", "2.9.5"), -1);

  const installed = { version: "2.9.5", versionCode: 38 };
  const optional = { ...versionInfo, published: true, forceUpdate: false, latestVersion: "2.10.0", latestVersionCode: 39, minimumVersion: "2.9.5", minimumVersionCode: 38 };
  const required = { ...optional, minimumVersion: "2.10.0", minimumVersionCode: 39 };
  assert.equal(api.shouldOfferUpdate(installed, versionInfo), true);
  assert.equal(api.shouldOfferUpdate(installed, { ...versionInfo, published: false }), false);
  assert.equal(api.isRequiredUpdate(installed, versionInfo), true);
  assert.equal(api.shouldOfferUpdate({ version: "2.9.27", versionCode: 61 }, versionInfo), true);
  assert.equal(api.shouldOfferUpdate({ version: "2.9.28", versionCode: 62 }, versionInfo), false);
  assert.equal(api.shouldOfferUpdate(installed, optional), true);
  assert.equal(api.isRequiredUpdate(installed, optional), false);
  assert.equal(api.isRequiredUpdate(installed, required), true);
});

test("update prompt is packaged, localized, and opens the Play Store through App Launcher", () => {
  assert.equal(packageInfo.dependencies["@capacitor/app-launcher"], "^8.0.0");
  assert.match(indexHtml, /data-game-version-code="64"/);
  assert.match(indexHtml, /update-system\.css\?v=2\.9\.30/);
  assert.match(indexHtml, /update-system\.js\?v=2\.9\.30/);
  assert.match(updateSystemSource, /Plugins\?\.App/);
  assert.match(updateSystemSource, /appPlugin\?\.getInfo/);
  assert.match(updateSystemSource, /market:\/\/details\?id=/);
  assert.match(updateSystemSource, /appStateChange/);
  assert.match(updateSystemSource, /space-tower-language-changed/);
  assert.match(updateSystemSource, /updatePreview/);
  assert.match(updateSystemSource, /latestVersionCode: 38/);
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    assert.match(updateSystemSource, new RegExp(`\\n    ${language}: \\{`));
  }
  assert.match(updateCss, /z-index: 10000/);
  assert.match(updateCss, /@media \(max-width: 380px\), \(max-height: 680px\)/);
});

test("version API returns the deployed asset with Android WebView CORS headers", async () => {
  const request = new Request("https://space-tower-defense.pages.dev/api/app-version", {
    headers: { Origin: "https://localhost" }
  });
  const env = {
    ASSETS: {
      fetch: async (url) => {
        assert.equal(new URL(url).pathname, "/app-version.json");
        return new Response(JSON.stringify(versionInfo), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  };
  const response = await onRequestGet({ request, env });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://localhost");
  assert.deepEqual(await response.json(), versionInfo);

  const options = onRequestOptions({ request });
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("Access-Control-Allow-Methods"), "GET, OPTIONS");
});
