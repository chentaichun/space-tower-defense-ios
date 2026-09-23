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

test("iOS target uses the current public version identity", () => {
  const version = indexHtml.match(/data-game-version="([^"]+)"/)[1];
  const build = indexHtml.match(/data-game-version-code="(\d+)"/)[1];
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

test("iOS does not initialize Android AdMob inventory before an iOS app ID exists", () => {
  assert.match(v2Features, /async function initializeRewardedAdsOnce\(\) \{\s*if \(IS_IOS_APP\)/);
  assert.match(v2Features, /rewardedSupplyCard\.hidden = true;/);
  assert.match(v2Features, /rewardedReviveAdButton\.hidden = IS_IOS_APP;/);
});

test("account deletion starts inside the app and is authorized by the active session", () => {
  assert.match(indexHtml, /id="settingsDeleteAccountButton"/);
  assert.match(indexHtml, /fetch\(apiUrl\("\/api\/player"\), \{\s*method: "DELETE",\s*headers: shopAuthHeaders\(\)/);
  assert.match(playerApi, /export async function onRequestDelete/);
  assert.match(playerApi, /authenticatePlayerSession\(request, env\)/);
  assert.match(playerApi, /deletePlayerAccount\(env, auth\.accountKey\)/);
});
