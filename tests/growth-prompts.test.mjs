import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { WEB_FILES } from "../tools/ios-release.mjs";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const source = read("growth-prompts.js");

function boot({ native = true, platform = "android", storage = {}, now = Date.now(), extra = {} } = {}) {
  const store = new Map(Object.entries(storage)), calls = { review: 0, share: [], toasts: [] }, timers = [];
  const body = { classList: { contains: () => false }, appendChild: (node) => { body.child = node; }, child: null };
  const context = {
    console, Date: class extends Date { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } },
    location: { pathname: extra.pathname || "/index.html" },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    document: { hidden: false, body, documentElement: { lang: "zh" }, getElementById: () => null, querySelector: () => null,
      createElement: () => ({ setAttribute() {}, addEventListener() {}, querySelector: () => null, remove() {}, set innerHTML(v) { this.html = v; }, get innerHTML() { return this.html; } }) },
    navigator: {},
    setTimeout: (fn) => timers.push(fn), setInterval: () => 0,
    showTaskToast: (a, b) => calls.toasts.push([a, b]),
    obsidian: 100, saveObsidian() {}, currentLanguage: "zh",
    window: {}, ...extra
  };
  context.window = context;
  context.window.Capacitor = native ? { isNativePlatform: () => true, getPlatform: () => platform, Plugins: {
    InAppReview: { requestReview: async () => { calls.review += 1; } },
    Share: { share: async (o) => { calls.share.push(o); } } } } : undefined;
  vm.runInNewContext(source, context);
  return { api: context.SpaceTowerGrowth, context, store, calls, runTimers: () => timers.splice(0).forEach((f) => f()) };
}
const STATE = "spaceTowerGrowthPrompts.v1";
const old = (days) => Date.now() - days * 86400000;

test("rating uses the native review sheet at happy moments, every 3 days at most", () => {
  const g = boot({ storage: { [STATE]: JSON.stringify({ firstSeen: old(5) }) } });
  g.api.moment("ranked_win"); g.runTimers();
  assert.equal(g.calls.review, 1);
  g.api.moment("boss"); g.runTimers(); // same day: no second ask
  assert.equal(g.calls.review, 1);
});

test("no rating ask in the first two days, and no reward is ever tied to rating", () => {
  const g = boot({ storage: { [STATE]: JSON.stringify({ firstSeen: old(1) }) } });
  g.api.moment("gacha"); g.runTimers();
  assert.equal(g.calls.review, 0);
  assert.doesNotMatch(source.slice(source.indexOf("async function requestReview"), source.indexOf("function grantShareReward")), /obsidian/);
});

test("each completed share gives 5 obsidian, at most 5 times a day", async () => {
  const g = boot({ storage: { [STATE]: JSON.stringify({ firstSeen: old(5) }) } });
  let total = 0;
  for (let i = 0; i < 7; i += 1) total += await g.api.shareAndReward();
  assert.equal(total, 25);
  assert.equal(g.context.obsidian, 125);
  assert.equal(g.calls.share.length, 5); // the share sheet is not even opened once the day's rewards are used
  assert.equal(g.calls.share[0].url, "https://play.google.com/store/apps/details?id=com.mrchen.spacetowerdefense");
  const cancelled = boot({ storage: { [STATE]: JSON.stringify({ firstSeen: old(5) }) } });
  cancelled.context.Capacitor.Plugins.Share.share = async () => { throw new Error("Share canceled"); };
  assert.equal(await cancelled.api.shareAndReward(), 0);
  assert.equal(cancelled.context.obsidian, 100);
  const ios = boot({ platform: "ios", storage: { [STATE]: JSON.stringify({ firstSeen: old(5) }) } });
  await ios.api.shareAndReward();
  assert.equal(ios.calls.share[0].url, "https://apps.apple.com/app/id6815095860");
});

test("share popup offers the reward for sharing only (no install promise) in all six languages", () => {
  const block = source.slice(source.indexOf("const TEXT = {"), source.indexOf("const lang ="));
  const keys = ["each", "kicker", "title", "body", "left", "share", "later", "done", "reward", "got", "message", "copied"];
  for (const lang of ["zh", "en", "ja", "ko", "ru", "es"]) {
    const row = block.match(new RegExp(`\\n    ${lang}: \\{(.*)\\}`))?.[1];
    assert.ok(row, lang);
    for (const key of keys) assert.match(row, new RegExp(`\\b${key}: "`), `${lang}.${key}`);
  }
  assert.doesNotMatch(block, /下載也|朋友下載|if your friend (installs|downloads)/i);
  assert.match(source, /SHARE_REWARD = 5, SHARE_DAILY_LIMIT = 5/);
});

test("prompts are hooked to ranked wins, major bosses and great pulls, and ship in the app", () => {
  assert.match(read("ranked-mode.js"), /result\.outcome==='win'&&!previewScenario\)window\.SpaceTowerGrowth\?\.moment\('ranked_win'\)/);
  assert.match(read("index.html"), /if \(wave >= 10\) window\.SpaceTowerGrowth\?\.moment\("boss"\)/);
  assert.match(read("expansion-system.js"), /GACHA_RARITY_ORDER\.epic\) window\.SpaceTowerGrowth\?\.moment\("gacha"\)/);
  assert.match(read("index.html"), /src="growth-prompts\.js/);
  assert.match(read("ranked.html"), /src="growth-prompts\.js/);
  assert.ok(WEB_FILES.includes("growth-prompts.js") && WEB_FILES.includes("growth-prompts.css"));
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.dependencies["@capacitor/share"] && pkg.dependencies["@capacitor-community/in-app-review"]);
});
