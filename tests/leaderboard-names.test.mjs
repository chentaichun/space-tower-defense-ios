import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet as getLeaderboard } from "../functions/api/leaderboard.js";
import { onRequestPost as saveName } from "../functions/api/leaderboard-profile.js";
import { onRequestPost as reportPlayer } from "../functions/api/leaderboard-report.js";
import { upsertLeaderboardEntry } from "../functions/_shared/leaderboard-store.js";
import { createPlayerSession } from "../functions/_shared/player-auth.js";
import { putPlayerAccount } from "../functions/_shared/player-storage.js";

function makeEnv() {
  const db = new DatabaseSync(":memory:");
  for (const file of ["0005_leaderboard.sql", "0006_player_auth.sql", "0010_leaderboard_profiles.sql"]) {
    db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
  const values = new Map();
  const d1 = {
    prepare(sql) {
      const stmt = (args = []) => ({
        bind: (...next) => stmt(next),
        first: async () => db.prepare(sql).get(...args) || null,
        all: async () => ({ results: db.prepare(sql).all(...args) }),
        run: async () => ({ meta: { changes: db.prepare(sql).run(...args).changes } })
      });
      return stmt();
    }
  };
  return { db, env: { COMMERCE_DB: d1, FEEDBACK_STORE: {
    get: async key => values.get(key) || null,
    put: async (key, value) => { values.set(key, value); }
  } }, values };
}

test("public rankings use distinct callsigns until a player consents to publish a moderated name", async () => {
  const { db, env } = makeEnv();
  try {
    const key = "player:secret-account-id";
    await putPlayerAccount(env, key, { name: "secret-account-id", createdAt: "2026-01-01T00:00:00.000Z" });
    const token = await createPlayerSession(env, key, "secret-account-id");
    await upsertLeaderboardEntry(env, { playerKey: key, name: "secret-account-id", tier: 2, wave: 15 });
    await upsertLeaderboardEntry(env, { playerKey: "player:someone@example.com", name: "someone@example.com", tier: 1, wave: 5 });
    const named = async () => (await getLeaderboard({ request: new Request("https://game.example/api/leaderboard?display=names", { headers: { Authorization: `Bearer ${token}` } }), env })).json();
    const before = await named();
    assert.match(before.entries[0].name, /^(Nova|Solar|Lunar|Ion|Astral|Quantum|Comet|Aurora|Nebula|Cosmic|Meteor|Orbit|Stellar|Prism|Eclipse|Zenith) /);
    assert.match(before.entries[0].id, /^Pilot-[0-9A-F]{12}$/);
    assert.equal(before.me.rank, 1);
    assert.equal(before.me.id, before.entries[0].id);
    assert.doesNotMatch(JSON.stringify(before), /secret-account-id|someone@example.com|player:/);

    const submit = (body) => saveName({ request: new Request("https://game.example/api/leaderboard-profile", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body)
    }), env });
    assert.equal((await submit({ publicName: "銀河先鋒", acceptedRules: false })).status, 400);
    assert.equal((await submit({ publicName: "admin support", acceptedRules: true })).status, 400);
    assert.equal((await submit({ publicName: "銀河先鋒", acceptedRules: true })).status, 200);
    const after = await named();
    assert.match(after.entries[0].name, /^銀河先鋒 · [0-9A-F]{4}$/);
    assert.equal(after.profile.name, "銀河先鋒");
    assert.equal(after.me.name, after.entries[0].name);
    const legacy = await (await getLeaderboard({ request: new Request("https://game.example/api/leaderboard"), env })).json();
    assert.match(legacy.entries[0].name, /^[A-Za-z]+ [A-Za-z]+ · [0-9A-F]{4}$/);
    assert.notEqual(legacy.entries[0].name, after.entries[0].name);
    assert.equal(legacy.entries[0].id, undefined);
    db.prepare("UPDATE leaderboard_profiles SET suppressed = 1 WHERE player_key = ?").run(key);
    const hidden = await named();
    assert.notEqual(hidden.entries[0].name, after.entries[0].name);
  } finally { db.close(); }
});

test("reports reach the moderation inbox without exposing account identifiers", async () => {
  const { db, env, values } = makeEnv();
  try {
    const request = () => new Request("https://game.example/api/leaderboard-report", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: "Pilot-ABCDEF123456", reason: "inappropriate_name", installationId: "install-reporting-device-123456" })
    });
    assert.equal((await reportPlayer({ request: request(), env })).status, 200);
    assert.equal((await reportPlayer({ request: request(), env })).status, 200);
    const reports = [...values.entries()].filter(([key]) => key.startsWith("feedback:"));
    assert.equal(reports.length, 1);
    assert.match(reports[0][1], /Leaderboard report/);
  } finally { db.close(); }
});
