import { publicCallsignFromCode, publicLeaderboardIdentity, publicPilotCode } from "./leaderboard-store.js";

const milestoneRewards = Object.freeze([[5, 10], [10, 20], [20, 40], [30, 70], [50, 120], [100, 250]]);
const weeklyPrizes = Object.freeze({ 1: { shards: 8, pulls: 30 }, 2: { shards: 5, pulls: 20 }, 3: { shards: 3, pulls: 10 } });
const trialTurretIds = new Set([
  "frost_core", "flame_core", "full_hp_berserk", "weakening_curse", "heavy_cannon", "pulse_quantum", "gatling", "split_cannon", "arcane_core", "reflect_bastion", "scatter_heavy", "double_burst", "annihilation_laser", "void_devourer", "vulnerability_mark", "capacitor_pulse", "royal_tide", "phase_echo", "missile_nest", "charged_laser", "frost_rail", "shield_generator", "flame_sprayer", "long_range_sniper", "chain_arc", "crit_resonance", "time_slow", "cluster_bomb", "mining_gold", "soul_drain", "shadow_replica", "antimatter", "vip_prism_lancer", "vip_thunder_throne", "vip_frost_bloom", "vip_star_phoenix", "vip_abyssal_tide", "vip_quantum_crown", "vip_singularity_king", "vip_solar_judgment", "vip_nebula_hymn", "vip_chrono_axis"
]);

export function trialCalendar(now = Date.now()) {
  const taipei = new Date(now + 8 * 3600_000);
  const day = taipei.toISOString().slice(0, 10);
  const monday = new Date(taipei);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const week = monday.toISOString().slice(0, 10);
  monday.setUTCDate(monday.getUTCDate() - 7);
  return { day, week, previousWeek: monday.toISOString().slice(0, 10) };
}

export function unlockedTrialTier(save) {
  const records = save?.tierRecords || {};
  let tier = 1;
  for (let campaignTier = 1; campaignTier < 20; campaignTier += 1) {
    const requiredWave = campaignTier === 1 ? 500 : 1500;
    if (Math.floor(Number(records[campaignTier]) || 0) < requiredWave) break;
    tier = campaignTier + 1;
  }
  return tier;
}

export function trialMilestoneRewards(tier) {
  const scale = trialTierRewardMultiplier(tier);
  return milestoneRewards.map(([wave, amount]) => ({ wave, obsidian: Math.round(amount * scale) }));
}

export function trialTierRewardMultiplier(tier) {
  const progress = (Math.max(1, Math.min(20, Math.floor(Number(tier) || 1))) - 1) / 19;
  return 1 + 24 * Math.pow(progress, 1.5);
}

export function trialRankPrize(rank, tier) {
  const base = weeklyPrizes[rank];
  if (!base) return null;
  const multiplier = trialTierRewardMultiplier(tier);
  return { shards: Math.ceil(base.shards * multiplier), pulls: Math.ceil(base.pulls * multiplier) };
}

export function trialWaveReward(wave, tier) {
  return trialMilestoneRewards(tier).reduce((total, reward) => total + (wave >= reward.wave ? reward.obsidian : 0), 0);
}

export async function getTrialRewardTotals(env, playerKey) {
  if (!env.COMMERCE_DB) return { obsidian: 0, normalPulls: 0, shards: {} };
  let rows;
  try { rows = await env.COMMERCE_DB.prepare("SELECT obsidian, normal_pulls AS normalPulls, shard_id AS shardId, shards FROM trial_reward_ledger WHERE player_key = ?").bind(playerKey).all(); }
  catch { return { obsidian: 0, normalPulls: 0, shards: {} }; }
  const totals = { obsidian: 0, normalPulls: 0, shards: {} };
  for (const row of rows?.results || []) {
    totals.obsidian += Math.max(0, Number(row.obsidian) || 0);
    totals.normalPulls += Math.max(0, Number(row.normalPulls) || 0);
    if (row.shardId && trialTurretIds.has(row.shardId)) totals.shards[row.shardId] = (totals.shards[row.shardId] || 0) + Math.max(0, Number(row.shards) || 0);
  }
  return totals;
}

export async function trialStatus(env, playerKey, now = Date.now(), named = false) {
  const { day, week, previousWeek } = trialCalendar(now);
  const usedRow = await env.COMMERCE_DB.prepare("SELECT COUNT(*) AS used FROM trial_runs WHERE player_key = ? AND day_key = ?").bind(playerKey, day).first();
  const ad = await env.COMMERCE_DB.prepare("SELECT 1 AS used FROM trial_ad_bonus WHERE player_key = ? AND day_key = ?").bind(playerKey, day).first();
  const weekly = await env.COMMERCE_DB.prepare("SELECT tier, best_wave AS bestWave FROM trial_weekly_best WHERE week_key = ? AND player_key = ? ORDER BY tier").bind(week, playerKey).all();
  const leaders = await env.COMMERCE_DB.prepare(named
    ? "SELECT b.tier, b.best_wave AS bestWave, b.player_key AS playerKey, CASE WHEN p.suppressed = 0 THEN p.public_name ELSE NULL END AS publicName FROM trial_weekly_best b LEFT JOIN leaderboard_profiles p ON p.player_key = b.player_key WHERE b.week_key = ? ORDER BY b.tier, b.best_wave DESC, b.achieved_at ASC, b.player_key ASC"
    : "SELECT tier, best_wave AS bestWave, player_key AS playerKey FROM trial_weekly_best WHERE week_key = ? ORDER BY tier, best_wave DESC, achieved_at ASC, player_key ASC").bind(week).all();
  const topByTier = {};
  const myRankByTier = {};
  const rankCounts = {};
  for (const row of leaders?.results || []) {
    const rank = rankCounts[row.tier] = (rankCounts[row.tier] || 0) + 1;
    const list = topByTier[row.tier] ||= [];
    const identity = named ? await publicLeaderboardIdentity(row.playerKey, row.publicName) : { name: publicCallsignFromCode(await publicPilotCode(row.playerKey)) };
    if (list.length < 3) list.push({ rank, wave: row.bestWave, ...identity, me: row.playerKey === playerKey });
    if (row.playerKey === playerKey) myRankByTier[row.tier] = { rank, wave: row.bestWave, ...identity };
  }
  const previous = await env.COMMERCE_DB.prepare("SELECT tier, best_wave AS bestWave, player_key AS playerKey FROM trial_weekly_best WHERE week_key = ? ORDER BY tier, best_wave DESC, achieved_at ASC, player_key ASC").bind(previousWeek).all();
  const ranks = {};
  for (const row of previous?.results || []) {
    ranks[row.tier] = (ranks[row.tier] || 0) + 1;
    if (row.playerKey === playerKey && ranks[row.tier] <= 3) {
      const rewardKey = `trial:weekly:${previousWeek}:${row.tier}:${playerKey}`;
      const claimed = await env.COMMERCE_DB.prepare("SELECT 1 AS yes FROM trial_reward_ledger WHERE reward_key = ?").bind(rewardKey).first();
      (topByTier.claimable ||= []).push({ tier: row.tier, rank: ranks[row.tier], ...trialRankPrize(ranks[row.tier], row.tier), claimed: Boolean(claimed) });
    }
  }
  return { day, week, used: Math.max(0, Number(usedRow?.used) || 0), limit: ad ? 4 : 3, adUsed: Boolean(ad), best: weekly?.results || [], topByTier, myRankByTier };
}

export async function startTrial(env, playerKey, tier, now = Date.now()) {
  const { day, week } = trialCalendar(now);
  const safeTier = Math.max(1, Math.min(20, Math.floor(Number(tier) || 1)));
  const id = crypto.randomUUID();
  const result = await env.COMMERCE_DB.prepare(`INSERT INTO trial_runs(id, player_key, tier, day_key, week_key, started_at, ad_entry)
    SELECT ?, ?, ?, ?, ?, ?, CASE WHEN COUNT(*) >= 3 THEN 1 ELSE 0 END
    FROM trial_runs WHERE player_key = ? AND day_key = ?
    HAVING COUNT(*) < 3 + (SELECT COUNT(*) FROM trial_ad_bonus WHERE player_key = ? AND day_key = ?)`)
    .bind(id, playerKey, safeTier, day, week, now, playerKey, day, playerKey, day).run();
  return result?.meta?.changes ? { id, tier: safeTier } : null;
}

export async function finishTrial(env, playerKey, runId, wave, now = Date.now()) {
  const run = await env.COMMERCE_DB.prepare("SELECT tier, week_key AS weekKey, started_at AS startedAt, reached_wave AS reachedWave, finished_at AS finishedAt FROM trial_runs WHERE id = ? AND player_key = ?").bind(runId, playerKey).first();
  if (!run || run.finishedAt) return null;
  const reached = Math.max(0, Math.min(100, Math.floor(Number(wave) || 0)));
  if (now - Number(run.startedAt) < reached * 3000 || now - Number(run.startedAt) > 12 * 3600_000) return null;
  const updated = await env.COMMERCE_DB.prepare("UPDATE trial_runs SET reached_wave = ?, finished_at = ? WHERE id = ? AND player_key = ? AND finished_at IS NULL")
    .bind(reached, now, runId, playerKey).run();
  if (!updated?.meta?.changes) return null;
  if (reached > 0) {
    await env.COMMERCE_DB.prepare(`INSERT INTO trial_weekly_best(week_key, tier, player_key, best_wave, achieved_at)
      VALUES (?, ?, ?, ?, ?) ON CONFLICT(week_key, tier, player_key) DO UPDATE SET
      best_wave = CASE WHEN excluded.best_wave > trial_weekly_best.best_wave THEN excluded.best_wave ELSE trial_weekly_best.best_wave END,
      achieved_at = CASE WHEN excluded.best_wave > trial_weekly_best.best_wave THEN excluded.achieved_at ELSE trial_weekly_best.achieved_at END`)
      .bind(run.weekKey, run.tier, playerKey, reached, now).run();
  }
  let obsidian = 0;
  for (const milestone of trialMilestoneRewards(run.tier)) {
    if (reached < milestone.wave) break;
    const result = await env.COMMERCE_DB.prepare("INSERT OR IGNORE INTO trial_reward_ledger(reward_key, player_key, obsidian, created_at) VALUES (?, ?, ?, ?)")
      .bind(`trial:milestone:${run.weekKey}:${run.tier}:${milestone.wave}:${playerKey}`, playerKey, milestone.obsidian, now).run();
    if (result?.meta?.changes) obsidian += milestone.obsidian;
  }
  return { tier: run.tier, wave: reached, obsidian };
}

export async function claimTrialPrize(env, playerKey, tier, shardId, now = Date.now()) {
  if (!trialTurretIds.has(shardId)) return null;
  const { previousWeek } = trialCalendar(now);
  const safeTier = Math.max(1, Math.min(20, Math.floor(Number(tier) || 1)));
  const rows = await env.COMMERCE_DB.prepare("SELECT player_key AS playerKey FROM trial_weekly_best WHERE week_key = ? AND tier = ? ORDER BY best_wave DESC, achieved_at ASC, player_key ASC LIMIT 3").bind(previousWeek, safeTier).all();
  const rank = (rows?.results || []).findIndex((row) => row.playerKey === playerKey) + 1;
  const prize = trialRankPrize(rank, safeTier);
  if (!prize) return null;
  const result = await env.COMMERCE_DB.prepare("INSERT OR IGNORE INTO trial_reward_ledger(reward_key, player_key, normal_pulls, shard_id, shards, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(`trial:weekly:${previousWeek}:${safeTier}:${playerKey}`, playerKey, prize.pulls, shardId, prize.shards, now).run();
  return result?.meta?.changes ? { tier: safeTier, rank, shardId, ...prize } : { alreadyClaimed: true };
}
