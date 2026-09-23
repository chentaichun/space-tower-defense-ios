/* One-time introductory offer. Prices and ownership come from Play + the server. */
const STARTER_OFFER = Object.freeze({ id: "starter_emerald_v1", turretId: "emerald_drake", obsidian: 2400, spaceCoins: 2000,
  consumables: { reviveTicket: 3, obsidianDoubleVoucher: 3, goldDoubleVoucher: 3, freeUpgradeVoucher: 5, skipWaveVoucher: 3, bossSealVoucher: 1, stageProtectionVoucher: 2 } });
const STARTER_TEXT = {
  zh: { title: "碧焰啟航禮包", compact: "新手禮包", intro: "一座新砲台，十種出擊好禮。", exclusive: "新手包專屬 · 固定一星", once: "每個遊戲帳號限購一次", open: "查看 10 種好禮", buy: "解鎖全部好禮", close: "關閉", owned: "已擁有", ready: "立即裝備", pending: "等待付款完成", error: "尚未完成，請重試或恢復購買。", unavailable: "Google Play 價格暫時無法取得", restore: "恢復購買", value: "黑曜石量為 120 黑曜石包首購 240 的 10 倍，另外包含砲台、太空幣與消耗券。", note: "砲台永久保留；消耗券使用後扣除。詳細效果可在商店「道具」查看。", currency: "黑曜石", preview: "本機預覽 · 不會付款", success: "10 種好禮已送達" },
  en: { title: "Emerald Launch Pack", compact: "Launch Pack", intro: "One new turret. Ten rewards to explore.", exclusive: "Starter exclusive · fixed at 1 star", once: "One purchase per game account", open: "View all 10 rewards", buy: "Unlock every reward", close: "Close", owned: "Owned", ready: "Equip now", pending: "Waiting for payment", error: "Not completed. Retry or restore purchases.", unavailable: "Google Play price is temporarily unavailable", restore: "Restore purchases", value: "10× the Obsidian in the 120 pack's 240-Obsidian first purchase, plus the turret, Space Coins and consumable tickets.", note: "The turret is permanent. Tickets are consumed on use. See Utilities in the store for their effects.", currency: "Obsidian", preview: "Local preview · no payment", success: "All 10 rewards delivered" },
  ja: { title: "碧焔スタートパック", compact: "スタートパック", intro: "新砲台と、試せる10種の報酬。", exclusive: "パック限定 · 1星固定", once: "ゲームアカウントごとに1回限り", open: "10種の報酬を見る", buy: "すべての報酬を解放", close: "閉じる", owned: "購入済み", ready: "今すぐ装備", pending: "支払い完了を待っています", error: "未完了です。再試行または購入の復元をしてください。", unavailable: "Google Playの価格を取得できません", restore: "購入を復元", value: "黒曜石120個パックの初回240個に対して10倍。砲台、スペースコイン、消耗券も付属。", note: "砲台は永久所持。券は使用時に消費されます。効果はショップの道具で確認できます。", currency: "黒曜石", preview: "ローカルプレビュー・支払いなし", success: "10種の報酬を受け取りました" },
  ko: { title: "비취 출격 팩", compact: "스타터 팩", intro: "새 포탑과 체험할 보상 10종.", exclusive: "스타터 전용 · 1성 고정", once: "게임 계정당 한 번만 구매 가능", open: "보상 10종 보기", buy: "모든 보상 해제", close: "닫기", owned: "보유 중", ready: "지금 장착", pending: "결제 완료 대기 중", error: "완료되지 않았습니다. 재시도하거나 구매를 복원하세요.", unavailable: "Google Play 가격을 불러올 수 없습니다", restore: "구매 복원", value: "흑요석 120개 팩 첫 구매 240개의 10배에 포탑, 우주 코인, 소모권까지 포함됩니다.", note: "포탑은 영구 보유합니다. 티켓은 사용 시 소모됩니다. 상점 도구에서 효과를 확인하세요.", currency: "흑요석", preview: "로컬 미리보기 · 결제 없음", success: "보상 10종 지급 완료" },
  ru: { title: "Изумрудный старт", compact: "Стартовый набор", intro: "Новая турель и 10 видов наград.", exclusive: "Эксклюзив набора · одна звезда", once: "Одна покупка на игровой аккаунт", open: "Посмотреть все 10 наград", buy: "Получить все награды", close: "Закрыть", owned: "Куплено", ready: "Установить", pending: "Ожидание оплаты", error: "Не завершено. Повторите или восстановите покупки.", unavailable: "Цена Google Play временно недоступна", restore: "Восстановить покупки", value: "В 10 раз больше обсидиана, чем 240 за первую покупку набора на 120. Также турель, космические монеты и билеты.", note: "Турель остаётся навсегда. Билеты расходуются при использовании. Эффекты описаны в разделе предметов магазина.", currency: "Обсидиан", preview: "Локальный просмотр · без оплаты", success: "Все 10 наград получены" },
  es: { title: "Pack Despegue Esmeralda", compact: "Pack inicial", intro: "Una torreta nueva y 10 tipos de premios.", exclusive: "Exclusivo inicial · una estrella fija", once: "Una compra por cuenta de juego", open: "Ver los 10 premios", buy: "Desbloquear todos los premios", close: "Cerrar", owned: "Adquirido", ready: "Equipar ahora", pending: "Esperando el pago", error: "No se completó. Reintenta o restaura las compras.", unavailable: "El precio de Google Play no está disponible", restore: "Restaurar compras", value: "10 veces las 240 unidades de obsidiana de la primera compra del pack de 120, además de la torreta, monedas espaciales y cupones.", note: "La torreta es permanente. Los cupones se consumen al usarlos. Consulta sus efectos en Utilidades de la tienda.", currency: "Obsidiana", preview: "Vista local · sin pago", success: "Has recibido los 10 premios" }
};
const starterState = { product: null, busy: false, status: "", owned: false, viewed: false };
const starterSubmissions = new Map();
let starterHandledLoginSequence = 0;
const STARTER_PREVIEW = !IS_NATIVE_APP && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) && new URLSearchParams(location.search).get("starterPreview") === "1";
const starterDialog = document.createElement("dialog");
starterDialog.id = "starterPackDialog";
starterDialog.className = "starter-dialog";
starterDialog.setAttribute("aria-labelledby", "starterPackTitle");
document.body.appendChild(starterDialog);
window.getStarterPackText = () => STARTER_TEXT[currentLanguage] || STARTER_TEXT.en;
const starterText = window.getStarterPackText;

function starterOwned() { return Boolean(starterState.owned || (v2Progress.stars.emerald_drake > 0 && !DEV_MODE)); }
function renderStarterPack() {
  const t = starterText();
  const owned = starterOwned();
  for (const banner of document.querySelectorAll("[data-starter-banner]")) {
    banner.hidden = owned;
    banner.innerHTML = `<span class="starter-emblem" aria-hidden="true">✧</span><span><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.open)}</small></span><strong>2,400 ◆</strong>`;
  }
  const compactBanner = document.getElementById("homeStarterPackButton");
  if (compactBanner) {
    compactBanner.hidden = owned;
    const title = document.getElementById("homeStarterPackTitle");
    const hint = document.getElementById("homeStarterPackHint");
    if (title) title.textContent = t.compact || t.title;
    if (hint) hint.textContent = t.open;
  }
  if (!starterDialog.open) return;
  const turret = V2_TURRET_DEFS.find((item) => item.id === STARTER_OFFER.turretId);
  const rewardText = EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en;
  const icons = { reviveTicket: "↻", obsidianDoubleVoucher: "◆", goldDoubleVoucher: "×2", freeUpgradeVoucher: "↑", skipWaveVoucher: "»", bossSealVoucher: "⊘", stageProtectionVoucher: "⬡" };
  const rewards = [["◆", t.currency, 2400], ["✦", getSpaceCoinName(), 2000], ...Object.entries(STARTER_OFFER.consumables).map(([key, count]) => [icons[key], rewardText[key], count])];
  const available = Boolean(starterState.product?.formattedPrice && shopGooglePlayServerReady);
  const price = STARTER_PREVIEW ? t.preview : (starterState.product?.formattedPrice || t.unavailable);
  const cta = owned ? t.ready : (!playerSessionToken && !IS_ANDROID_APP && !STARTER_PREVIEW ? getShopUiText().loginButton : t.buy);
  starterDialog.innerHTML = `<div class="starter-dialog-body"><header class="starter-heading"><span class="starter-value">2,400 ◆ + 2,000 ✦</span><button type="button" data-starter-close aria-label="${escapeHtml(t.close)}">×</button></header><h2 id="starterPackTitle">${escapeHtml(t.title)}</h2><p class="starter-intro">${escapeHtml(t.intro)}</p><section class="starter-turret"><div class="starter-turret-aura" aria-hidden="true"><canvas width="240" height="240" role="img" aria-label="${escapeHtml(turret.name)}"></canvas></div><div><span class="starter-grade">G8 · ★</span><h3>${escapeHtml(turret.name)}</h3><p>${escapeHtml(turret.description)}</p></div></section><div class="starter-rewards">${rewards.map(([icon, label, amount]) => `<div class="starter-reward"><i aria-hidden="true">${icon}</i><span>${escapeHtml(label)}</span><b>×${amount.toLocaleString("en-US")}</b></div>`).join("")}</div><p class="starter-note">${escapeHtml(t.note)}</p><footer class="starter-footer"><small>${escapeHtml(t.once)}</small><strong class="starter-price">${escapeHtml(owned ? t.owned : price)}</strong><button type="button" class="starter-buy" data-starter-buy ${starterState.busy || (!owned && playerSessionToken && !available) || STARTER_PREVIEW ? "disabled" : ""}>${escapeHtml(cta)}</button><p class="starter-status" role="status">${escapeHtml(starterState.status)}</p><button type="button" class="starter-restore" data-starter-restore ${starterState.busy || !IS_ANDROID_APP ? "disabled" : ""}>${escapeHtml(t.restore)}</button></footer></div>`;
  drawTurretPreviewCanvas(starterDialog.querySelector("canvas"), turret);
}

async function openStarterPack(source = "home") {
  starterState.status = "";
  starterDialog.showModal();
  renderStarterPack();
  trackGameEvent("starter_pack_open", { source, product_id: STARTER_OFFER.id });
  await loadShopCatalog();
  renderStarterPack();
}

function showStarterPackAfterLogin(detail = {}) {
  const sequence = Math.max(0, Number(detail.sequence) || Number(window.spaceTowerAuthenticatedLoginSequence) || 0);
  if (!sequence || sequence <= starterHandledLoginSequence) return;
  starterHandledLoginSequence = sequence;
  window.setTimeout(() => {
    if (!STARTER_PREVIEW) return;
    if (starterOwned() || starterDialog.open) return;
    void openStarterPack("login");
  }, 0);
}

window.addEventListener("space-tower-authenticated-login", (event) => {
  showStarterPackAfterLogin(event.detail);
});
if (STARTER_PREVIEW) showStarterPackAfterLogin({ sequence: 1, player: "Preview" });
else showStarterPackAfterLogin();

function installStarterBanner(anchor, position) {
  if (!anchor) return;
  const button = document.createElement("button");
  button.type = "button"; button.className = "starter-banner"; button.dataset.starterBanner = position;
  button.addEventListener("click", () => void openStarterPack(position));
  anchor.insertAdjacentElement(position === "home" ? "afterend" : "beforebegin", button);
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !starterOwned() && !starterState.viewed) {
      starterState.viewed = true;
      trackGameEvent("starter_pack_view", { source: position, product_id: STARTER_OFFER.id });
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(button);
}
installStarterBanner(document.getElementById("shopGrid"), "shop");
// The home Store tab is a separate surface from the currency shop overlay.
installStarterBanner(document.querySelector("#homeStorePage > :first-child"), "store");
document.getElementById("homeStarterPackButton")?.addEventListener("click", () => void openStarterPack("home"));

window.updateStarterPackCatalog = (offer) => {
  if (offer) starterState.owned = offer.owned === true;
  renderStarterPack();
};
window.updateStarterPlayProduct = (product) => { starterState.product = product || null; renderStarterPack(); };

window.submitStarterPlayPurchase = async (purchase, { restored = false } = {}) => {
  if (Number(purchase?.purchaseState) !== 1 || !purchase.purchaseToken) return null;
  const token = purchase.purchaseToken;
  if (starterSubmissions.has(token)) return starterSubmissions.get(token);
  const pending = (async () => {
    const { response, data } = await commerceRequest(apiUrl("/api/shop/starter-pack"), {
      method: "POST", headers: shopAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ productId: STARTER_OFFER.id, purchaseToken: token })
    }, "verification");
    if (response.status === 202 || data.pending) { starterState.status = starterText().pending; renderStarterPack(); return data; }
    if (!response.ok || !data.fulfilled) throw Object.assign(new Error(starterText().error), {
      code: data.code || `HTTP_${response.status}`, stage: "verification"
    });
    // Non-consumable: only the backend acknowledges. Never consume this token.
    const synced = await syncFulfilledPurchase(STARTER_OFFER.id);
    starterState.owned = true;
    starterState.status = synced ? starterText().success : commerceSyncText();
    if (data.newlyFulfilled) {
      const p = starterState.product;
      const params = { product_id: STARTER_OFFER.id, transaction_id: data.transactionId, restored: Boolean(restored) };
      if (p?.priceAmountMicros > 0 && p.priceCurrencyCode) Object.assign(params, { value: p.priceAmountMicros / 1e6, currency: p.priceCurrencyCode });
      trackGameEvent("purchase", params);
      trackGameEvent("starter_pack_purchase", params);
      showTaskToast(starterText().title, starterText().success);
    }
    renderStarterPack();
    return data;
  })();
  starterSubmissions.set(token, pending);
  try { return await pending; } finally { starterSubmissions.delete(token); }
};

async function buyStarterPack() {
  if (starterState.busy || STARTER_PREVIEW) return;
  if (starterOwned()) {
    starterDialog.close(); closeShop(); returnHome();
    changeTurretEquipment(STARTER_OFFER.turretId, 1);
    document.getElementById("homeWorkshopTab")?.click();
    return;
  }
  const attemptId = crypto.randomUUID();
  if (!beginCommercePurchase(STARTER_OFFER.id, attemptId)) return;
  let stage = "session";
  try {
    starterState.busy = true; starterState.status = getShopUiText().redirecting; renderStarterPack();
    trackGameEvent("purchase_intent", { product_id: STARTER_OFFER.id, attempt_id: attemptId, source: "starter_pack" });
    if ((!playerSessionToken || !shopAuthenticated) && IS_ANDROID_APP) await window.ensureSpaceTowerCommerceSession?.();
    if (!playerSessionToken || !IS_ANDROID_APP || !starterState.product?.formattedPrice || !shopGooglePlayServerReady) throw Object.assign(new Error(starterText().unavailable), { code: "BILLING_NOT_READY" });
    stage = "save_sync";
    await syncPlayerSave("save", { save: getLocalSavePayload() });
    stage = "native_launch";
    trackGameEvent("begin_checkout", { attempt_id: attemptId, product_id: STARTER_OFFER.id, value: starterState.product.priceAmountMicros / 1e6, currency: starterState.product.priceCurrencyCode });
    const result = await nativePlugin("GooglePlayBilling").purchase({ productId: STARTER_OFFER.id, obfuscatedAccountId: shopGooglePlayAccountId, attemptId });
    trackGameEvent("checkout_native_result", { product_id: STARTER_OFFER.id, attempt_id: attemptId,
      status: String(result?.status || "unknown"), code: String(result?.responseCode ?? "UNKNOWN") });
    stage = "verification";
    await handleGooglePlayPurchaseResult(result, { productId: STARTER_OFFER.id, attemptId });
    if (result?.status === "cancelled") starterState.status = getShopUiText().googlePlayCancelled;
    else if (result?.purchases?.some((p) => Number(p.purchaseState) === 2)) starterState.status = starterText().pending;
  } catch (error) {
    starterState.status = shopErrorMessage(error, starterText().error);
    trackGameEvent("starter_pack_checkout_failed", { product_id: STARTER_OFFER.id, attempt_id: attemptId, stage: error?.stage || stage, code: String(error?.code || "UNKNOWN") });
  } finally { starterState.busy = false; endCommercePurchase(); renderStarterPack(); }
}
starterDialog.addEventListener("click", async (event) => {
  if (event.target.closest("[data-starter-close]")) starterDialog.close();
  else if (event.target.closest("[data-starter-buy]")) await buyStarterPack();
  else if (event.target.closest("[data-starter-restore]") && !starterState.busy) {
    starterState.busy = true; starterState.status = ""; renderStarterPack();
    try {
      if (!playerSessionToken || !shopAuthenticated) await window.ensureSpaceTowerCommerceSession?.();
      const result = await nativePlugin("GooglePlayBilling").queryPurchases();
      await handleGooglePlayPurchaseResult(result, { restored: true });
      await syncFulfilledPurchase(STARTER_OFFER.id);
      await loadShopCatalog();
    } catch { starterState.status = starterText().error; }
    finally { starterState.busy = false; renderStarterPack(); }
  }
});
const starterBaseApplyCloudSave = applyCloudSave;
applyCloudSave = function (save, options = {}) {
  const result = starterBaseApplyCloudSave(save, options);
  starterState.owned = save?.starterPackOwned === true;
  renderStarterPack();
  return result;
};
window.addEventListener("space-tower-language-changed", renderStarterPack);
renderStarterPack();
