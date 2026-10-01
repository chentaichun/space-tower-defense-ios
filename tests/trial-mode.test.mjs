import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { claimTrialPrize, finishTrial, getTrialRewardTotals, startTrial, trialCalendar, trialStatus, trialWaveReward } from "../functions/_shared/trial-store.js";

class TrialD1 {
  constructor() {
    this.db = new DatabaseSync(":memory:");
    this.db.exec(readFileSync(new URL("../migrations/0007_trial.sql", import.meta.url), "utf8"));
  }
  prepare(sql) {
    const bind = (args = []) => ({
      bind: (...next) => bind(next),
      first: async () => this.db.prepare(sql).get(...args) || null,
      all: async () => ({ results: this.db.prepare(sql).all(...args) }),
      run: async () => ({ meta: { changes: this.db.prepare(sql).run(...args).changes } })
    });
    return bind();
  }
}

test("trial attempts are capped at three plus one daily ad bonus", async () => {
  const env = { COMMERCE_DB: new TrialD1() };
  const now = Date.parse("2026-10-01T02:00:00Z");
  for (let index = 0; index < 3; index += 1) assert.ok(await startTrial(env, "player:one", 1, now + index));
  assert.equal(await startTrial(env, "player:one", 1, now + 100), null);
  const { day } = trialCalendar(now);
  await env.COMMERCE_DB.prepare("INSERT INTO trial_ad_bonus(player_key, day_key) VALUES (?, ?)").bind("player:one", day).run();
  assert.ok(await startTrial(env, "player:one", 1, now + 101));
  assert.equal(await startTrial(env, "player:one", 1, now + 102), null);
  const status = await trialStatus(env, "player:one", now + 103);
  assert.equal(status.used, 4);
  assert.equal(status.limit, 4);
});

test("trial settlement is once per run and awards only reached milestones", async () => {
  const env = { COMMERCE_DB: new TrialD1() };
  const now = Date.parse("2026-10-01T02:00:00Z");
  const run = await startTrial(env, "player:one", 2, now);
  assert.equal(await finishTrial(env, "player:one", run.id, 10, now + 2000), null);
  const settled = await finishTrial(env, "player:one", run.id, 10, now + 60_000);
  assert.equal(settled.obsidian, trialWaveReward(10, 2));
  assert.equal(await finishTrial(env, "player:one", run.id, 100, now + 600_000), null);
  assert.equal((await getTrialRewardTotals(env, "player:one")).obsidian, settled.obsidian);
  assert.equal((await trialStatus(env, "player:one", now + 70_000)).best[0].bestWave, 10);
});

test("weekly top-three prize is claimed once with a selected turret", async () => {
  const env = { COMMERCE_DB: new TrialD1() };
  const now = Date.parse("2026-10-05T03:00:00Z");
  const { previousWeek } = trialCalendar(now);
  for (const [index, player] of ["player:first", "player:second", "player:third", "player:fourth"].entries()) {
    await env.COMMERCE_DB.prepare("INSERT INTO trial_weekly_best(week_key, tier, player_key, best_wave, achieved_at) VALUES (?, 1, ?, ?, ?)")
      .bind(previousWeek, player, 20 - index, now - 100000 + index).run();
  }
  const prize = await claimTrialPrize(env, "player:second", 1, "frost_core", now);
  assert.deepEqual({ rank: prize.rank, shards: prize.shards, obsidian: prize.obsidian }, { rank: 2, shards: 5, obsidian: 3600 });
  assert.deepEqual(await getTrialRewardTotals(env, "player:second"), { obsidian: 3600, shards: { frost_core: 5 } });
  assert.deepEqual(await claimTrialPrize(env, "player:second", 1, "frost_core", now), { alreadyClaimed: true });
  assert.equal(await claimTrialPrize(env, "player:fourth", 1, "frost_core", now), null);
});
