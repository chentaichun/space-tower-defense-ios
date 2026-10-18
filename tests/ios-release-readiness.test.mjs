import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [indexHtml, v2Features, infoPlist, projectFile, playerApi] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../v2-features.js", import.meta.url), "utf8"),
  readFile(new URL("../ios/App/App/Info.plist", import.meta.url), "utf8"),
  readFile(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/player.js", import.meta.url), "utf8")
]);

test("iOS target matches its independently staged app version", async () => {
  const iosHtml = await readFile(new URL("../ios/App/App/public/index.html", import.meta.url), "utf8");
  const version = iosHtml.match(/data-game-version="([^"]+)"/)[1];
  const build = JSON.parse(await readFile(new URL('../ios/release-build.json', import.meta.url), 'utf8')).iosBuild;
  assert.deepEqual([...projectFile.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(m => m[1]), [version, version]);
  assert.deepEqual([...projectFile.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map(m => m[1]), [build, build]);
  assert.match(projectFile, /PRODUCT_BUNDLE_IDENTIFIER = com\.mrchen\.spacetowerdefense;/);
});

test("iOS plist declares current device and export-compliance basics", () => {
  assert.match(infoPlist, /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/);
  assert.match(infoPlist, /<key>UIRequiredDeviceCapabilities<\/key>\s*<array>\s*<string>arm64<\/string>/);
  assert.doesNotMatch(infoPlist, /<string>armv7<\/string>/);
});

test("iOS does not expose Google-only sign-in or billing paths", () => {
  assert.match(indexHtml, /googleSignInButton\.hidden = true;/);
  assert.match(indexHtml, /nativePlugin\(IS_IOS_APP \? "AppleStoreBilling" : "GooglePlayBilling"\)/);
  assert.match(indexHtml, /if \(!IS_NATIVE_APP \|\| shopGooglePlayListenerReady\) return;/);
  assert.match(indexHtml, /if \(IS_IOS_APP\) return fulfillAppleStorePurchase/);
});

test("iOS ads use their own inventory and declare tracking purpose", () => {
  assert.match(infoPlist, /NSUserTrackingUsageDescription/);
  assert.match(v2Features, /!IS_IOS_APP && GOOGLE_REWARDED_PRODUCTION_UNIT_IDS/);
});

test("account deletion starts inside the app and is authorized by the active session", () => {
  assert.match(indexHtml, /id="settingsDeleteAccountButton"/);
  assert.match(indexHtml, /fetch\(apiUrl\("\/api\/player"\), \{\s*method: "DELETE",\s*headers: shopAuthHeaders\(\)/);
  assert.match(playerApi, /export async function onRequestDelete/);
  assert.match(playerApi, /authenticatePlayerSession\(request, env\)/);
  assert.match(playerApi, /deletePlayerAccount\(env, auth\.accountKey\)/);
});
