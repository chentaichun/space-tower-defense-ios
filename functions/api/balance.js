const BALANCE_KEY = "balance:official";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

const getAdminKey = (request) => {
  const header = request.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

const isBalanceConfig = (value) => Boolean(
  value && typeof value === "object" &&
  value.tower && value.upgrades && value.enemyBase && value.enemyTypes &&
  value.bosses && value.wave && value.tiers && value.economy &&
  value.v2 && value.v2.fragmentChanceByGrade && value.v2.maxStars &&
  value.permanent && value.permanent.upgrades &&
  value.engagement && value.engagement.launchRewards && value.engagement.dailyRewards &&
  value.ultimate && value.ultimate.gradeDropChance
);

export async function onRequestGet({ env }) {
  if (!env.FEEDBACK_STORE) return json({ error: "Missing FEEDBACK_STORE KV binding." }, 503);
  const record = await env.FEEDBACK_STORE.get(BALANCE_KEY, "json");
  const storedConfig = record && isBalanceConfig(record.config) ? record.config : {};
  return json({
    ...(record && isBalanceConfig(record.config) ? record : {}),
    config: {
      ...storedConfig,
      enemyBase: { ...(storedConfig.enemyBase || {}), speed: 20 },
      tiers: {
        ...(storedConfig.tiers || {}),
        unlockWave: 1500,
        hpGrowth: 1.6,
        speedGrowth: 1.1,
        defensePerTier: 12,
        collisionGrowth: 1.35,
        countPerTier: 0.1,
        rewardGrowth: 1.2
      }
    }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.FEEDBACK_STORE) return json({ error: "Missing FEEDBACK_STORE KV binding." }, 503);
  if (!env.ADMIN_KEY) return json({ error: "Missing ADMIN_KEY secret." }, 503);
  if (getAdminKey(request) !== env.ADMIN_KEY) return json({ error: "Unauthorized." }, 401);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 200000) return json({ error: "Balance payload is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  if (!isBalanceConfig(body?.config)) return json({ error: "Invalid balance config." }, 400);
  const record = {
    config: body.config,
    version: String(body.config.version || "unversioned").slice(0, 100),
    updatedAt: new Date().toISOString()
  };
  await env.FEEDBACK_STORE.put(BALANCE_KEY, JSON.stringify(record));
  return json({ ok: true, version: record.version, updatedAt: record.updatedAt });
}
