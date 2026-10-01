import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { applyGachaPityGuarantee, applyGachaReward, drawReward, GACHA_PACKS, getGachaMilestoneRewards, getSupportVoucherPulls } from "../../_shared/gacha.js";
import { sanitizeRecord } from "../player.js";
import { playerStorageAvailable, putPlayerAccount } from "../../_shared/player-storage.js";
import { currentSubscription } from "../vip-store.js";

const MAX_RECEIPTS = 20;

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env)) return jsonResponse(request, { error: "Missing player storage binding." }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth?.account || !auth.accountKey) return jsonResponse(request, { error: "Login required.", code: "LOGIN_REQUIRED" }, 401);
  const body = await readBody(request);
  const pack = GACHA_PACKS[String(body?.pack || "")];
  const pulls = Number(body?.pulls) === 10 ? 10 : Number(body?.pulls) === 1 ? 1 : 0;
  const requestId = String(body?.requestId || "").slice(0, 80);
  if (!pack || !pulls || requestId.length < 8) return jsonResponse(request, { error: "Invalid draw request.", code: "INVALID_DRAW" }, 400);

  const receipts = Array.isArray(auth.account.gachaReceipts) ? auth.account.gachaReceipts : [];
  const duplicate = receipts.find((receipt) => receipt.requestId === requestId);
  if (duplicate) {
    return jsonResponse(request, {
      ok: true,
      duplicate: true,
      results: duplicate.results,
      bonusRewards: duplicate.bonusRewards || [],
      loyaltyVoucherPulls: duplicate.loyaltyVoucherPulls || 0,
      starDustEarned: duplicate.starDustEarned || 0,
      voucherPullsUsed: duplicate.voucherPullsUsed || 0,
      save: sanitizeRecord(auth.account.save)
    });
  }

  const save = sanitizeRecord(auth.account.save);
  const useVoucher = body?.useVoucher === true;
  const voucherBalance = Math.max(0, Math.floor(Number(save.expansionProgress.packVouchers?.[pack.id]) || 0));
  const baseCost = pulls === 10 ? pack.tenCost : pack.oneCost;
  let vip = null;
  if (env.COMMERCE_DB) {
    try { vip = await currentSubscription(env, auth.accountKey); }
    catch { /* The VIP migration may be staged after this route. */ }
  }
  const cost = vip ? Math.ceil(baseCost * 0.8) : baseCost;
  let voucherPullsUsed = 0;
  let loyaltyVoucherPulls = 0;
  const totalBefore = Math.max(0, Math.floor(Number(save.expansionProgress.gachaPulls?.[pack.id]) || 0));
  const totalAfter = totalBefore + pulls;
  const pityBefore = Math.max(0, Math.floor(Number(save.expansionProgress.gachaPity?.[pack.id]) || 0));
  if (useVoucher) {
    if (voucherBalance < pulls) return jsonResponse(request, { error: "Insufficient pack voucher pulls.", code: "INSUFFICIENT_VOUCHER" }, 409);
    voucherPullsUsed = pulls;
    save.expansionProgress.packVouchers[pack.id] = voucherBalance - pulls;
  } else {
    if ((save[pack.currency] || 0) < cost) return jsonResponse(request, { error: "Insufficient currency.", code: "INSUFFICIENT_CURRENCY" }, 409);
    save[pack.currency] -= cost;
    save.economyRevision += 1;
    const paidField = pack.id === "normal" ? "normalPaidPulls" : "supremePaidPulls";
    const paidBefore = Math.max(0, Math.floor(Number(save.expansionProgress[paidField]) || 0));
    const paidAfter = paidBefore + pulls;
    save.expansionProgress[paidField] = paidAfter;
    loyaltyVoucherPulls = getSupportVoucherPulls(paidBefore, paidAfter);
    save.expansionProgress.packVouchers[pack.id] += loyaltyVoucherPulls;
  }

  const drawn = [];
  for (let index = 0; index < pulls; index += 1) {
    drawn.push(drawReward(pack));
  }
  const guaranteed = applyGachaPityGuarantee(pack.id, drawn, pityBefore);
  const milestoneDefinitions = getGachaMilestoneRewards(pack.id, totalBefore, totalAfter);
  const results = guaranteed.results.map((reward) => applyGachaReward(save, reward));
  const bonusRewards = milestoneDefinitions.map((reward) => applyGachaReward(save, reward));
  const starDustEarned = pulls + (pulls === 10 ? 2 : 0);
  save.expansionProgress.gachaPulls[pack.id] = totalAfter;
  save.expansionProgress.gachaPity[pack.id] = guaranteed.pity;
  save.expansionProgress.starDust += starDustEarned;
  save.expansionProgress.revision += 1;
  save.updatedAt = new Date().toISOString();
  auth.account.save = sanitizeRecord(save);
  auth.account.updatedAt = save.updatedAt;
  auth.account.gachaReceipts = [...receipts, { requestId, pack: pack.id, pulls, bonusRewards, loyaltyVoucherPulls, starDustEarned, voucherPullsUsed, results, at: save.updatedAt }].slice(-MAX_RECEIPTS);
  await putPlayerAccount(env, auth.accountKey, auth.account);
  return jsonResponse(request, { ok: true, results, bonusRewards, loyaltyVoucherPulls, starDustEarned, voucherPullsUsed, save: auth.account.save });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
