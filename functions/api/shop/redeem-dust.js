import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { applyGachaReward, TURRET_IDS, ULTIMATE_IDS } from "../../_shared/gacha.js";
import { sanitizeRecord } from "../player.js";
import { playerStorageAvailable, putPlayerAccount } from "../../_shared/player-storage.js";

const MAX_RECEIPTS = 20;
const OFFERS = Object.freeze({
  turret: Object.freeze({ cost: 50, kind: "wishlistTurretFragments", amount: 10 }),
  ultimate: Object.freeze({ cost: 100, kind: "wishlistUltimateFragments", amount: 10 })
});

async function readBody(request) {
  try { return await request.json(); }
  catch { return null; }
}

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env)) return jsonResponse(request, { error: "Missing player storage binding." }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth?.account || !auth.accountKey) return jsonResponse(request, { error: "Login required.", code: "LOGIN_REQUIRED" }, 401);

  const body = await readBody(request);
  const offerId = String(body?.offer || "");
  const offer = OFFERS[offerId];
  const requestId = String(body?.requestId || "").slice(0, 80);
  if (!offer || requestId.length < 8) return jsonResponse(request, { error: "Invalid stardust redemption.", code: "INVALID_REDEMPTION" }, 400);

  const receipts = Array.isArray(auth.account.stardustReceipts) ? auth.account.stardustReceipts : [];
  const duplicate = receipts.find((receipt) => receipt.requestId === requestId);
  if (duplicate) return jsonResponse(request, { ok: true, duplicate: true, reward: duplicate.reward, save: sanitizeRecord(auth.account.save) });

  const save = sanitizeRecord(auth.account.save);
  const wishlist = offerId === "turret" ? save.v2Progress.fragmentWishlist : save.ultimateProgress.fragmentWishlist;
  const allowed = offerId === "turret" ? TURRET_IDS : ULTIMATE_IDS;
  if (!allowed.includes(wishlist)) return jsonResponse(request, { error: "Choose a wishlist target first.", code: "WISHLIST_REQUIRED" }, 409);
  if (save.expansionProgress.starDust < offer.cost) return jsonResponse(request, { error: "Insufficient stardust.", code: "INSUFFICIENT_STARDUST" }, 409);

  save.expansionProgress.starDust -= offer.cost;
  const reward = applyGachaReward(save, { id: `stardust_${offerId}`, kind: offer.kind, amount: offer.amount, weight: 0, bonus: true });
  save.expansionProgress.revision += 1;
  save.updatedAt = new Date().toISOString();
  auth.account.save = sanitizeRecord(save);
  auth.account.updatedAt = save.updatedAt;
  auth.account.stardustReceipts = [...receipts, { requestId, offer: offerId, reward, at: save.updatedAt }].slice(-MAX_RECEIPTS);
  await putPlayerAccount(env, auth.accountKey, auth.account);
  return jsonResponse(request, { ok: true, reward, save: auth.account.save });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
