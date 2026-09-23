import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { GACHA_PACKS } from "../../_shared/gacha.js";
import { sanitizeRecord } from "../player.js";
import { playerStorageAvailable, putPlayerAccount } from "../../_shared/player-storage.js";

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
  const requestId = String(body?.requestId || "").slice(0, 80);
  if (!pack || requestId.length < 8) return jsonResponse(request, { error: "Invalid promotion mail request.", code: "INVALID_PROMO_MAIL" }, 400);

  const receipts = Array.isArray(auth.account.promoMailReceipts) ? auth.account.promoMailReceipts : [];
  const duplicate = receipts.find((receipt) => receipt.requestId === requestId);
  if (duplicate) {
    return jsonResponse(request, { ok: true, duplicate: true, pack: duplicate.pack, voucherPullsAdded: duplicate.voucherPullsAdded, save: sanitizeRecord(auth.account.save) });
  }

  const save = sanitizeRecord(auth.account.save);
  const waiting = Math.max(0, Math.floor(Number(save.expansionProgress.promoMail?.[pack.id]) || 0));
  if (waiting < 1) return jsonResponse(request, { error: "Promotion mail is not available.", code: "PROMO_MAIL_NOT_AVAILABLE" }, 409);

  save.expansionProgress.promoMail[pack.id] = waiting - 1;
  save.expansionProgress.packVouchers[pack.id] = Math.max(0, Math.floor(Number(save.expansionProgress.packVouchers?.[pack.id]) || 0)) + 100;
  save.expansionProgress.revision += 1;
  save.updatedAt = new Date().toISOString();
  auth.account.save = sanitizeRecord(save);
  auth.account.updatedAt = save.updatedAt;
  auth.account.promoMailReceipts = [...receipts, { requestId, pack: pack.id, voucherPullsAdded: 100, at: save.updatedAt }].slice(-MAX_RECEIPTS);
  await putPlayerAccount(env, auth.accountKey, auth.account);

  return jsonResponse(request, { ok: true, pack: pack.id, voucherPullsAdded: 100, save: auth.account.save });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
