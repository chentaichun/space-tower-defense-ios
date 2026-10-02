const clampInteger = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, Math.floor(Number(value) || minimum)));

// The stable public ID never exposes the account name or internal player key.
export async function publicPilotCode(key) {
  const bytes = new TextEncoder().encode(`leaderboard-pilot-v1:${key}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return `Pilot-${Array.from(digest.slice(0, 6), byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

const callsignPrefixes = ["Nova", "Solar", "Lunar", "Ion", "Astral", "Quantum", "Comet", "Aurora", "Nebula", "Cosmic", "Meteor", "Orbit", "Stellar", "Prism", "Eclipse", "Zenith"];
const callsignNouns = ["Phoenix", "Falcon", "Vanguard", "Guardian", "Lancer", "Sentinel", "Ranger", "Voyager", "Striker", "Sovereign", "Comet", "Dragon", "Warden", "Specter", "Knight", "Hunter"];

export function publicCallsignFromCode(code) {
  const hex = String(code || "").replace(/^Pilot-/, "");
  if (!/^[0-9A-F]{12}$/.test(hex)) return "Nova Guardian";
  return `${callsignPrefixes[parseInt(hex.slice(0, 2), 16) % callsignPrefixes.length]} ${callsignNouns[parseInt(hex.slice(2, 4), 16) % callsignNouns.length]} · ${hex.slice(0, 4)}`;
}

export async function publicLeaderboardIdentity(key, publicName = "") {
  const id = await publicPilotCode(key);
  return { id, name: publicName ? `${publicName} · ${id.slice(6, 10)}` : publicCallsignFromCode(id) };
}

export async function upsertLeaderboardEntry(env, entry = {}) {
  if (!env.COMMERCE_DB || !entry.playerKey) return false;
  const tier = clampInteger(entry.tier, 1, 20);
  const wave = clampInteger(entry.wave, 1, 999999);
  try {
    await env.COMMERCE_DB.prepare(`
      INSERT INTO leaderboard_entries (player_key, display_name, tier, wave, is_guest, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(player_key) DO UPDATE SET
        display_name = excluded.display_name,
        tier = CASE
          WHEN excluded.tier > leaderboard_entries.tier THEN excluded.tier
          ELSE leaderboard_entries.tier
        END,
        wave = CASE
          WHEN excluded.tier > leaderboard_entries.tier THEN excluded.wave
          WHEN excluded.tier = leaderboard_entries.tier AND excluded.wave > leaderboard_entries.wave THEN excluded.wave
          ELSE leaderboard_entries.wave
        END,
        is_guest = excluded.is_guest,
        updated_at = excluded.updated_at
    `).bind(
      String(entry.playerKey),
      String(entry.name || "Player").slice(0, 32),
      tier,
      wave,
      entry.isGuest ? 1 : 0,
      String(entry.updatedAt || new Date().toISOString())
    ).run();
    return true;
  } catch {
    return false;
  }
}

export async function readLeaderboard(env, limit = 100, named = false) {
  if (!env.COMMERCE_DB) return null;
  const safeLimit = clampInteger(limit, 1, 100);
  const rows = await env.COMMERCE_DB.prepare(`
    SELECT e.player_key AS playerKey, e.tier, e.wave${named ? ", CASE WHEN p.suppressed = 0 THEN p.public_name ELSE NULL END AS publicName" : ""}
    FROM leaderboard_entries e
    ${named ? "LEFT JOIN leaderboard_profiles p ON p.player_key = e.player_key" : ""}
    WHERE NOT (tier = 1 AND wave = 1)
    ORDER BY e.tier DESC, e.wave DESC, e.display_name ASC
    LIMIT ?
  `).bind(safeLimit).all();
  const count = await env.COMMERCE_DB.prepare(`
    SELECT COUNT(*) AS total
    FROM leaderboard_entries
    WHERE NOT (tier = 1 AND wave = 1)
  `).first();
  const results = rows?.results || [];
  return {
    total: Math.max(0, Math.floor(Number(count?.total) || 0)),
    entries: await Promise.all(results.map(async (row) => ({
      ...(named ? await publicLeaderboardIdentity(row.playerKey, row.publicName) : { name: publicCallsignFromCode(await publicPilotCode(row.playerKey)) }),
      tier: clampInteger(row.tier, 1, 20),
      wave: clampInteger(row.wave, 1, 999999)
    })))
  };
}

export async function readOwnLeaderboardRank(env, playerKey, named = false) {
  if (!env.COMMERCE_DB || !playerKey) return null;
  const row = await env.COMMERCE_DB.prepare(
    named
      ? "SELECT e.tier, e.wave, e.display_name AS displayName, CASE WHEN p.suppressed = 0 THEN p.public_name ELSE NULL END AS publicName FROM leaderboard_entries e LEFT JOIN leaderboard_profiles p ON p.player_key = e.player_key WHERE e.player_key = ? AND NOT (e.tier = 1 AND e.wave = 1)"
      : "SELECT tier, wave, display_name AS displayName FROM leaderboard_entries WHERE player_key = ? AND NOT (tier = 1 AND wave = 1)"
  ).bind(playerKey).first();
  if (!row) return null;
  const ahead = await env.COMMERCE_DB.prepare(`
    SELECT COUNT(*) AS count FROM leaderboard_entries
    WHERE NOT (tier = 1 AND wave = 1) AND
      (tier > ? OR (tier = ? AND wave > ?) OR
      (tier = ? AND wave = ? AND display_name < ?))
  `).bind(row.tier, row.tier, row.wave, row.tier, row.wave, row.displayName).first();
  return {
    rank: Math.max(1, Number(ahead?.count || 0) + 1),
    ...(named ? await publicLeaderboardIdentity(playerKey, row.publicName) : { name: publicCallsignFromCode(await publicPilotCode(playerKey)) }),
    tier: clampInteger(row.tier, 1, 20),
    wave: clampInteger(row.wave, 1, 999999)
  };
}
