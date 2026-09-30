const clampInteger = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, Math.floor(Number(value) || minimum)));

// Public rankings expose only fixed-format system identifiers, never account names.
// Derive from the stable internal key so progress/name changes do not change the label.
async function publicPilotCode(key) {
  const bytes = new TextEncoder().encode(`leaderboard-pilot-v1:${key}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return `Pilot-${Array.from(digest.slice(0, 6), byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
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

export async function readLeaderboard(env, limit = 100) {
  if (!env.COMMERCE_DB) return null;
  const safeLimit = clampInteger(limit, 1, 100);
  const rows = await env.COMMERCE_DB.prepare(`
    SELECT player_key AS playerKey, tier, wave
    FROM leaderboard_entries
    WHERE NOT (tier = 1 AND wave = 1)
    ORDER BY tier DESC, wave DESC, display_name ASC
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
      name: await publicPilotCode(row.playerKey),
      tier: clampInteger(row.tier, 1, 20),
      wave: clampInteger(row.wave, 1, 999999)
    })))
  };
}
