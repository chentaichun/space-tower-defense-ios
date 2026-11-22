/* Value packs + monthly pass. Login sequence: starter pack -> value packs -> monthly pass.
   Also places entries in the home event rail, the store and the codex.
   Purchases and grants still need Play products and server fulfilment. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  // The Android app is also served from https://localhost, so native builds are never a preview.
  const PREVIEW_LOCAL = !window.Capacitor?.isNativePlatform?.() && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const esc = value => (typeof escapeHtml === 'function' ? escapeHtml(value) : String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

  // Nine new turrets. Strength follows price: 1.99 -> G6, 2.99 -> G7, 4.99 -> G8. Stats are a first draft.
  const NEW_TURRETS = Object.freeze({
    vital_orb: { name: '元氣聚能砲', grade: 'G6', color: '#9dff6a', role: '主砲', type: '魔法', hp: 190, dmg: .9, rate: 1.1, range: '中', text: '蓄積元氣，周期性為核心回復並強化周圍砲台。', skill: '每 8 秒回復核心 6% 血量，周圍砲台攻速 +10%。', pack: 0 },
    icewall_orb: { name: '冰牆結界砲', grade: 'G7', color: '#8fe8ff', role: '主砲', type: '魔法', hp: 260, dmg: .7, rate: .8, range: '中', text: '豎起冰晶牆，阻擋並凍結衝向核心的敵機。', skill: '每 6 秒在前方築起冰牆 4 秒，擋住敵機並減速 40%，碎裂時造成範圍傷害。', pack: 1 },
    bomb_orb: { name: '爆彈副砲', grade: 'G7', color: '#ffb056', role: '副砲', type: '物理', hp: 150, dmg: 1.4, rate: .35, range: '大', text: '拋射爆彈，炸毀的敵機會連鎖再爆。', skill: '爆炸追加最大血量 4% 傷害，炸毀的敵機連鎖爆炸。', pack: 1 },
    phoenix_orb: { name: '火鳳烈焰砲', grade: 'G8', color: '#ff7a3d', role: '主砲', type: '魔法', hp: 200, dmg: 1.6, rate: 1.4, range: '中', text: '火鳳展翼，射出火元素砲彈並灼燒敵群。', skill: '火彈範圍灼燒，每 10 秒火鳳俯衝掠過整條航道。', pack: 2 },
    afterimage_orb: { name: '殘像幻影砲', grade: 'G8', color: '#5f3ff0', role: '主砲', type: '魔法', hp: 180, dmg: .35, rate: 2, range: '中', text: '11 道紫色殘像環繞砲台，碰觸即傷。', skill: '11 道殘像環繞砲台，碰到敵機造成最大血量 0.5% 的傷害。', pack: 2 },
    sword_orb: { name: '千刃劍匣', grade: 'G8', color: '#ffe6a8', role: '主砲', type: '物理', hp: 170, dmg: .5, rate: .5, range: '大', text: '水墨古劍，御劍成河。', skill: '12 把古劍依序出匣如劍河追敵；每第 3 次化為金劍陣齊發。', pack: 2 },
    missile_orb: { name: '五芒飛彈艙', grade: 'G8', color: '#ff9c7a', role: '副砲', type: '物理', hp: 160, dmg: .6, rate: .25, range: '大', text: '一次五發，排成正五邊形齊射。', skill: '每 4 秒 5 發飛彈排成正五邊形飛出，落成五芒星陣引爆並定身。', pack: 2 },
    ninja_orb: { name: '六芒忍刃砲', grade: 'G8', color: '#7affd8', role: '副砲', type: '物理', hp: 155, dmg: .5, rate: .33, range: '中', text: '六枚迴旋手裏劍，劃出六瓣花。', skill: '每 3 秒擲出 6 枚迴旋手裏劍，去回各斬一次。', pack: 2 },
    frostbite_orb: { name: '冰蝕寒霜砲', grade: 'G8', color: '#a8d8ff', role: '副砲', type: '魔法', hp: 165, dmg: 1.2, rate: .5, range: '中', text: '冰蝕層層疊加，凍結後碎裂。', skill: '冰蝕疊滿 5 層凍成冰塊，冰裂造成最大血量 12% 傷害並擴散。', pack: 2 }
  });
  const VALUE_OFFERS = Object.freeze([
    { id: 'value_pack_199_v1', name: '元氣啟程包', price: 'US$1.99', tier: 'G6', hue: '#9dff6a', turrets: ['vital_orb'], cores: 5, pulls: 20 },
    { id: 'value_pack_299_v1', name: '冰火雙砲包', price: 'US$2.99', tier: 'G7', hue: '#8fe8ff', turrets: ['icewall_orb', 'bomb_orb'], cores: 5, pulls: 50 },
    { id: 'value_pack_499_v1', name: '傳說六砲包', price: 'US$4.99', tier: 'G8', hue: '#ffc35a', turrets: ['phoenix_orb', 'afterimage_orb', 'sword_orb', 'missile_orb', 'ninja_orb', 'frostbite_orb'], cores: 5, pulls: 100 }
  ]);

  // Monthly pass: 30 levels, 100 XP each. Login +60/day, normal-mode waves +1 each (max 60/day).
  const PASS = Object.freeze({ levels: 30, xpPerLevel: 100, loginXp: 60, waveXpCap: 60, tiers: [['US$6.66', 1, '解鎖特典', 'monthly_pass_666_v1'], ['US$10', 2, '全部 ×2', 'monthly_pass_1000_v1'], ['US$20', 4, '全部 ×4', 'monthly_pass_2000_v1']] });
  const FREE_TRACK = { 1: ['obs', 10], 3: ['obs', 50], 5: ['obs', 50], 8: ['obs', 10], 10: ['shard', 1], 15: ['obs', 50], 20: ['shard', 3], 25: ['obs', 50], 28: ['obs', 20], 29: ['obs', 20], 30: ['shard', 10] };
  const NOBLE_TRACK = { 1: ['revive', 1], 2: ['obs', 50], 3: ['obs', 250], 4: ['coin', 50], 5: ['obs', 250], 6: ['coin', 100], 7: ['coin', 100], 8: ['obs', 250], 9: ['obsDouble', 1], 10: ['shard', 5], 11: ['coin', 100], 12: ['skip', 1], 13: ['coin', 100], 14: ['obs', 250], 15: ['obs', 250], 16: ['coin', 50], 17: ['seal', 1], 18: ['coin', 100], 19: ['goldDouble', 1], 20: ['shard', 10], 21: ['skip', 1], 22: ['dice', 50], 23: ['coin', 100], 24: ['obs', 250], 25: ['meteor', 10], 26: ['coin', 200], 27: ['revive', 2], 28: ['obs', 250], 29: ['obs', 200], 30: ['imperial', 10] };
  const REWARD = { obs: ['◆', '黑曜石', '#b892ff'], coin: ['✦', '太空幣', '#ffd36e'], shard: ['⬡', '隨機砲台碎片', '#7ff1ff'], revive: ['↻', '復活券', '#5ee6a0'], obsDouble: ['◆2', '黑曜石雙倍券', '#b892ff'], skip: ['»', '跳回合券', '#8fd3ff'], seal: ['⊘', 'Boss 封印券', '#ff8fae'], goldDouble: ['G2', '金幣翻倍券', '#ffd36e'], dice: ['⚂', '黑曜石骰子', '#b892ff'], meteor: ['✧', '星隕補給艙', '#7ff1ff'], imperial: ['♛', '皇極星庫', '#ffc35a'] };

  /* ---------- pass progress (local until the server side ships) ---------- */
  const PASS_KEY = 'spaceTowerMonthlyPass';
  const today = () => new Date().toISOString().slice(0, 10);
  const daysLeft = () => { const d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 1); return Math.max(1, Math.ceil((end - d) / 864e5)); };
  function loadPass() {
    let p = {};
    try { p = JSON.parse(localStorage.getItem(PASS_KEY) || '{}'); } catch {}
    const month = today().slice(0, 7);
    if (p.month !== month) p = { month, xp: 0, lastLogin: '', waveDay: '', waveXp: 0, claimedFree: [], claimedNoble: [], noble: 0 };
    return p;
  }
  let pass = loadPass();
  const savePass = () => { try { localStorage.setItem(PASS_KEY, JSON.stringify(pass)); } catch {} renderEntries(); };
  const level = () => Math.min(PASS.levels, Math.floor(pass.xp / PASS.xpPerLevel));

  /* ---------- live store: Google Play purchases + server-side pass ---------- */
  const PRODUCT_IDS = [...VALUE_OFFERS.map(o => o.id), ...PASS.tiers.map(t => t[3])];
  const live = { products: new Map(), bought: [], busy: false, status: '', pendingWaves: 0 };
  const online = () => !PREVIEW_LOCAL && typeof playerSessionToken !== 'undefined' && Boolean(playerSessionToken);
  const priceOf = (id, fallback) => live.products.get(id)?.formattedPrice || fallback;
  const rerender = () => { renderEntries(); if (packDialog.open) renderPacks(); if (passDialog.open) renderPass(); };
  function applyServerState(o) {
    if (!o) return;
    pass = { month: o.month, xp: Number(o.xp) || 0, noble: Number(o.noble) || 0, claimedFree: o.claimedFree || [], claimedNoble: o.claimedNoble || [], lastLogin: today(), waveDay: '', waveXp: 0 };
    live.bought = o.boughtThisMonth || [];
    rerender();
  }
  async function offerApi(path, body, stage = 'pass') {
    const { response, data } = await commerceRequest(apiUrl(path), { method: 'POST', headers: shopAuthHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) }, stage);
    return { response, data: data || {} };
  }
  async function passApi(action, extra = {}) {
    if (!online()) return null;
    try { const { response, data } = await offerApi('/api/player/monthly-pass', { action, ...extra }); if (response.ok && data.offers) { applyServerState(data.offers); return data; } } catch {}
    return null;
  }
  function flushWaves() { const waves = live.pendingWaves; if (!waves) return; live.pendingWaves = 0; void passApi('waves', { waves }); }
  async function claimOnline() {
    if (live.busy) return; live.busy = true; rerender();
    try { const data = await passApi('claim'); if (data?.claimed) { await syncFulfilledPurchase('monthly_pass'); if (typeof showTaskToast === 'function') showTaskToast('無敵月卡', '獎勵已發放'); } }
    finally { live.busy = false; rerender(); }
  }
  async function buyOffer(productId) {
    if (live.busy || !productId) return;
    const attemptId = crypto.randomUUID();
    if (!beginCommercePurchase(productId, attemptId)) return;
    live.busy = true; live.status = '處理中…'; rerender();
    try {
      if ((!playerSessionToken || !shopAuthenticated) && IS_NATIVE_APP) await window.ensureSpaceTowerCommerceSession?.();
      if (!IS_NATIVE_APP || !playerSessionToken || !live.products.get(productId)) throw Object.assign(new Error('購買暫時無法完成，請稍後再試。'), { code: 'BILLING_NOT_READY' });
      await syncPlayerSave('save', { save: getLocalSavePayload() });
      trackGameEvent('begin_checkout', { attempt_id: attemptId, product_id: productId });
      const result = await nativeStoreBilling().purchase(nativePurchaseOptions(productId, attemptId));
      await handleGooglePlayPurchaseResult(result, { productId, attemptId });
      live.status = result?.status === 'cancelled' ? getShopUiText().googlePlayCancelled : '';
    } catch (error) { live.status = shopErrorMessage(error, '購買暫時無法完成，請稍後再試。'); }
    finally { live.busy = false; endCommercePurchase(); rerender(); }
  }
  window.updateOfferPlayProducts = details => { for (const id of PRODUCT_IDS) if (details?.get(id)) live.products.set(id, details.get(id)); rerender(); };
  window.submitOfferPlayPurchase = async (purchase, { restored = false } = {}) => {
    if (Number(purchase?.purchaseState) !== 1 || !purchase.purchaseToken) return null;
    const productId = (purchase.products || []).find(id => PRODUCT_IDS.includes(id));
    const { response, data } = await offerApi('/api/shop/value-offer', { productId, purchaseToken: purchase.purchaseToken }, 'verification');
    if (response.status === 202 || data.pending) { live.status = '付款處理中，完成後會自動發放。'; rerender(); return data; }
    if (!response.ok || !data.fulfilled) throw Object.assign(new Error('購買暫時無法完成，請稍後再試。'), { code: data.code || `HTTP_${response.status}`, stage: 'verification' });
    if (data.offers) applyServerState(data.offers);
    await syncFulfilledPurchase(productId);
    if (data.newlyFulfilled) {
      const p = live.products.get(productId);
      trackGameEvent('purchase', { product_id: productId, transaction_id: data.transactionId, restored: Boolean(restored), ...(p?.priceAmountMicros > 0 ? { value: p.priceAmountMicros / 1e6, currency: p.priceCurrencyCode } : {}) });
      if (typeof showTaskToast === 'function') showTaskToast('購買完成', '獎勵已發放');
    }
    live.status = ''; rerender(); return data;
  };
  const claimable = () => { const lv = level(); let n = 0; for (let i = 1; i <= lv; i++) { if (FREE_TRACK[i] && !pass.claimedFree.includes(i)) n++; if (pass.noble && !pass.claimedNoble.includes(i)) n++; } return n; };
  function grantLoginXp() { if (online() || pass.lastLogin === today()) return; pass.lastLogin = today(); pass.xp += PASS.loginXp; savePass(); }
  function grantWaveXp() { if (online()) { if (++live.pendingWaves >= 5) flushWaves(); return; } if (pass.waveDay !== today()) { pass.waveDay = today(); pass.waveXp = 0; } if (pass.waveXp >= PASS.waveXpCap) return; pass.waveXp++; pass.xp++; savePass(); }
  if (typeof beginNextWave === 'function') {
    const base = beginNextWave;
    beginNextWave = function () { const r = base.apply(this, arguments); if (activeRunMode !== 'trial' && running) grantWaveXp(); return r; };
  }

  /* ---------- animated turret art ---------- */
  function poly(c, n, r, a = 0) { c.beginPath(); for (let i = 0; i < n; i++) { const t = a + i * TAU / n; i ? c.lineTo(Math.cos(t) * r, Math.sin(t) * r) : c.moveTo(Math.cos(t) * r, Math.sin(t) * r); } c.closePath(); }
  function glow(c, color, r) { const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, color + 'aa'); g.addColorStop(1, color + '00'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); }
  function core(c, color, r) { glow(c, color, r * 2.2); c.fillStyle = '#081624'; c.strokeStyle = color; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke(); c.fillStyle = color; c.beginPath(); c.arc(0, 0, r * .45, 0, TAU); c.fill(); }
  const ART = {
    vital_orb(c, t, d) { const p = (Math.sin(t * 3) + 1) / 2; core(c, d.color, 18 + p * 3); for (let i = 0; i < 6; i++) { const a = t * 1.4 + i * TAU / 6, r = 34 + Math.sin(t * 2 + i) * 4; c.save(); c.translate(Math.cos(a) * r, Math.sin(a) * r); c.rotate(a); c.fillStyle = d.color; c.beginPath(); c.ellipse(0, 0, 6, 2.5, 0, 0, TAU); c.fill(); c.restore(); } c.strokeStyle = d.color; c.globalAlpha = 1 - p; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 22 + p * 26, 0, TAU); c.stroke(); },
    icewall_orb(c, t, d) { core(c, d.color, 14); for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * .32, r = 40; c.save(); c.translate(Math.cos(a) * r, Math.sin(a) * r); c.rotate(a + Math.PI / 2); c.fillStyle = d.color + '55'; c.strokeStyle = '#e8fbff'; c.lineWidth = 1.5; poly(c, 6, 9 + Math.sin(t * 2 + i) * 1.2, Math.PI / 6); c.fill(); c.stroke(); c.restore(); } for (let i = 0; i < 8; i++) { const q = (t * .6 + i / 8) % 1; c.globalAlpha = 1 - q; c.fillStyle = '#e8fbff'; c.fillRect(Math.cos(i * 2.3) * (14 + q * 40), Math.sin(i * 2.3) * (14 + q * 40), 2, 2); } },
    bomb_orb(c, t, d) { const q = (t % 1.6) / 1.6; c.fillStyle = '#2a1b10'; c.strokeStyle = d.color; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 4, 18, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#d9b48a'; c.lineWidth = 3; c.beginPath(); c.moveTo(8, -12); c.quadraticCurveTo(16, -24, 22, -20); c.stroke(); c.fillStyle = Math.sin(t * 30) > 0 ? '#fff4b0' : d.color; c.beginPath(); c.arc(22, -20, 3.5, 0, TAU); c.fill(); if (q > .55) { const e = (q - .55) / .45; c.globalAlpha = 1 - e; c.strokeStyle = d.color; c.lineWidth = 4 * (1 - e) + 1; c.beginPath(); c.arc(0, 4, 20 + e * 32, 0, TAU); c.stroke(); for (let i = 0; i < 10; i++) { const a = i * TAU / 10; c.beginPath(); c.moveTo(Math.cos(a) * (22 + e * 20), 4 + Math.sin(a) * (22 + e * 20)); c.lineTo(Math.cos(a) * (30 + e * 30), 4 + Math.sin(a) * (30 + e * 30)); c.stroke(); } } },
    phoenix_orb(c, t, d) { glow(c, d.color, 50); const flap = Math.sin(t * 6) * .35; for (const s of [-1, 1]) { c.save(); c.scale(s, 1); c.rotate(-flap); c.fillStyle = d.color; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(28, -34, 46, -12); c.quadraticCurveTo(30, -10, 36, 4); c.quadraticCurveTo(20, 0, 2, 8); c.fill(); c.fillStyle = '#ffd36e'; c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(22, -22, 34, -10); c.quadraticCurveTo(18, -6, 4, 6); c.fill(); c.restore(); } c.fillStyle = '#fff1c9'; c.beginPath(); c.ellipse(0, 2, 6, 12, 0, 0, TAU); c.fill(); for (let i = 0; i < 3; i++) { const q = (t * 1.2 + i / 3) % 1; c.globalAlpha = 1 - q; c.fillStyle = '#ffcf6e'; c.beginPath(); c.arc(0, -14 - q * 44, 4 - q * 2, 0, TAU); c.fill(); } },
    afterimage_orb(c, t, d) { for (let i = 0; i < 11; i++) { const a = t * 4 + i * TAU / 11; c.globalAlpha = .25 + (i % 3) * .2; c.save(); c.translate(Math.cos(a) * 34, Math.sin(a) * 34); c.fillStyle = d.color; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill(); c.restore(); } c.globalAlpha = 1; core(c, d.color, 15); },
    sword_orb(c, t, d) { const cyc = t % 3, charge = Math.min(1, cyc / 1.8), out = cyc > 1.8 ? (cyc - 1.8) / 1.2 : 0;
      if (typeof drawSwordOrbArt === 'function') drawSwordOrbArt(c, d.color, 30, t); else core(c, d.color, 14);
      const blade = (x, y, a, s2, al) => { c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = al; c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(150,220,255,.5)'; c.lineWidth = s2 * .5; c.beginPath(); c.moveTo(-s2 * .2, 0); c.lineTo(s2 * 3, 0); c.stroke(); c.globalCompositeOperation = 'source-over';
        c.fillStyle = '#1d1712'; c.fillRect(-s2 * 1.05, -s2 * .1, s2 * .6, s2 * .2); c.fillStyle = '#d8b25a'; c.fillRect(-s2 * .52, -s2 * .3, s2 * .1, s2 * .6);
        const g = c.createLinearGradient(0, -s2 * .14, 0, s2 * .14); g.addColorStop(0, '#a9b6c4'); g.addColorStop(.5, '#ffffff'); g.addColorStop(1, '#bcd0e0'); c.fillStyle = g; c.beginPath(); c.moveTo(-s2 * .38, -s2 * .14); c.lineTo(s2 * 2.75, -s2 * .1); c.lineTo(s2 * 3.25, 0); c.lineTo(s2 * 2.75, s2 * .1); c.lineTo(-s2 * .38, s2 * .14); c.closePath(); c.fill(); c.restore(); };
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 - Math.PI / 2 + t * .35; if (!out) { if (i / 12 > charge) continue; blade(Math.cos(a) * 40, Math.sin(a) * 40, a, 4.2, .9); }
        else { const k = Math.min(1, out * 1.4 - i * .04); if (k <= 0) { blade(Math.cos(a) * 40, Math.sin(a) * 40, a, 4.2, .9); continue; } const sw = a + Math.sin(k * Math.PI) * .9, r = 40 + k * 70; blade(Math.cos(sw) * r, Math.sin(sw) * r, sw + .9 * Math.cos(k * Math.PI), 4.2, 1 - k * .7); } } },
    missile_orb(c, t, d) { core(c, d.color, 13); const cyc = t % 2, q = Math.min(1, cyc / 1.2), seal = cyc > 1.2 ? (cyc - 1.2) / .8 : 0, R = 16 + q * 26, spin = q * 2.4;
      if (!seal) { c.globalAlpha = .55; c.strokeStyle = d.color; c.lineWidth = 1; poly(c, 5, R, -Math.PI / 2 + spin); c.stroke(); c.globalAlpha = 1;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + spin + i * TAU / 5; c.save(); c.translate(Math.cos(a) * R, Math.sin(a) * R); c.rotate(a); c.fillStyle = '#f3e7df'; c.beginPath(); c.moveTo(8, 0); c.lineTo(-4, -3); c.lineTo(-4, 3); c.closePath(); c.fill(); c.fillStyle = d.color; c.fillRect(-9, -1.5, 5, 3); c.restore(); } }
      else { c.globalAlpha = 1 - seal; c.strokeStyle = '#ffd2b8'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 42, 0, TAU); c.stroke(); c.strokeStyle = d.color; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + spin + (i * 2 % 5) * TAU / 5; i ? c.lineTo(Math.cos(a) * 42, Math.sin(a) * 42) : c.moveTo(Math.cos(a) * 42, Math.sin(a) * 42); } c.stroke(); c.globalAlpha = 1; } },
    ninja_orb(c, t, d) { core(c, d.color, 12); const k = (t % 1.4) / 1.4;
      c.globalAlpha = .18; c.strokeStyle = d.color; c.lineWidth = 1; for (let i = 0; i < 6; i++) { const a0 = i * TAU / 6; c.beginPath(); for (let j = 0; j <= 24; j++) { const q = j / 24, f = 50 * Math.sin(Math.PI * q), l = 16 * Math.sin(2 * Math.PI * q); const x = Math.cos(a0) * f - Math.sin(a0) * l, y = Math.sin(a0) * f + Math.cos(a0) * l; j ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const a0 = i * TAU / 6, f = 50 * Math.sin(Math.PI * k), l = 16 * Math.sin(2 * Math.PI * k); c.save(); c.translate(Math.cos(a0) * f - Math.sin(a0) * l, Math.sin(a0) * f + Math.cos(a0) * l); c.rotate(t * 14); c.fillStyle = '#dffff6'; for (let b = 0; b < 4; b++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(-2, -2); c.quadraticCurveTo(.5, -6, 1.5, -10); c.quadraticCurveTo(2.5, -5, 2, -2); c.closePath(); c.fill(); } c.restore(); } },
    frostbite_orb(c, t, d) { core(c, d.color, 13); const cyc = t % 3, n = Math.min(5, Math.floor(cyc / .45)), x = 34, y = -18;
      c.fillStyle = '#2b4f6b'; c.beginPath(); c.moveTo(x + 9, y); c.lineTo(x - 6, y - 6); c.lineTo(x - 3, y); c.lineTo(x - 6, y + 6); c.closePath(); c.fill();
      c.fillStyle = '#dff3ff'; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * TAU / 5; c.save(); c.translate(x + Math.cos(a) * 11, y + Math.sin(a) * 11); c.rotate(a); c.beginPath(); c.moveTo(4, 0); c.lineTo(0, -2); c.lineTo(-2, 0); c.lineTo(0, 2); c.closePath(); c.fill(); c.restore(); }
      if (cyc > 2.25 && cyc < 2.7) { c.fillStyle = 'rgba(190,232,255,.45)'; c.strokeStyle = '#eaf6ff'; c.lineWidth = 1.2; c.save(); c.translate(x, y); poly(c, 6, 15, 0); c.fill(); c.stroke(); c.restore(); }
      if (cyc >= 2.7) { const e = (cyc - 2.7) / .3; c.save(); c.translate(x, y); c.strokeStyle = '#eaf6ff'; c.globalAlpha = 1 - e; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + .3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 12 * (e + .3), Math.sin(a) * 12 * (e + .3)); c.lineTo(Math.cos(a + .4) * 18 * (e + .3), Math.sin(a + .4) * 18 * (e + .3)); c.stroke(); } c.restore(); }
      if (cyc < 2.25) { const q = (cyc % .45) / .45; c.fillStyle = '#eaf6ff'; c.beginPath(); c.moveTo(-6 + q * 32 + 7, y); c.lineTo(-6 + q * 32 - 4, y - 3); c.lineTo(-6 + q * 32 - 4, y + 3); c.closePath(); c.fill(); } },
  };
  // One shared animation loop for every turret canvas on screen. Battery matters on phones: it runs at
  // 30 fps, only draws canvases an IntersectionObserver reports as on screen (no per-frame DOM queries or
  // layout reads), and sleeps while the page is hidden or a battle is running.
  const visibleArt = new Set();
  const artObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) visibleArt.add(e.target); else visibleArt.delete(e.target); }
  }) : null;
  const watched = new WeakSet();
  function watchArt() {
    for (const canvas of document.querySelectorAll('canvas[data-new-turret]')) {
      if (watched.has(canvas)) continue; watched.add(canvas);
      if (artObserver) artObserver.observe(canvas); else visibleArt.add(canvas);
    }
  }
  let watchQueued = false;
  if (typeof MutationObserver === 'function') new MutationObserver(() => { if (watchQueued) return; watchQueued = true; setTimeout(() => { watchQueued = false; watchArt(); }, 250); }).observe(document.documentElement, { childList: true, subtree: true });
  let lastArtFrame = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || now - lastArtFrame < 33) return;
    if (typeof running !== 'undefined' && running && typeof gameStarted !== 'undefined' && gameStarted && !document.querySelector('dialog[open]')) return;
    lastArtFrame = now;
    const t = now / 1000;
    for (const canvas of visibleArt) {
      if (!canvas.isConnected) { visibleArt.delete(canvas); continue; }
      const d = NEW_TURRETS[canvas.dataset.newTurret], c = canvas.getContext('2d'), s = canvas.width / 120;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
      c.setTransform(s, 0, 0, s, canvas.width / 2, canvas.height / 2); c.globalAlpha = 1;
      ART[canvas.dataset.newTurret](c, t, d);
    }
  }
  watchArt();
  requestAnimationFrame(tick);
  const art = (id, size = 240) => `<canvas width="${size}" height="${size}" data-new-turret="${id}" aria-label="${esc(NEW_TURRETS[id].name)}"></canvas>`;

  /* ---------- dialogs ---------- */
  function makeDialog(id, cls) { const d = document.createElement('dialog'); d.id = id; d.className = `offer-dialog ${cls}`; document.body.append(d); return d; }
  const packDialog = makeDialog('valuePackDialog', 'value-pack');
  const passDialog = makeDialog('monthlyPassDialog', 'monthly-pass');
  const detailDialog = makeDialog('newTurretDialog', 'turret-detail');
  let packTab = 2, featured = 0, featureTimer = 0;

  function stat(label, value, ratio, color) { return `<div class="td-stat"><span>${label}</span><i><em style="width:${Math.round(Math.min(1, ratio) * 100)}%;background:${color}"></em></i><b>${value}</b></div>`; }
  function openDetail(id) {
    const d = NEW_TURRETS[id], o = VALUE_OFFERS[d.pack];
    detailDialog.style.setProperty('--c', d.color);
    detailDialog.innerHTML = `<div class="offer-body"><header class="offer-head"><span class="td-grade">${d.grade} · ${d.role} · ${d.type}</span><button type="button" class="offer-close" data-close aria-label="關閉">×</button></header>
      <div class="td-stage">${art(id, 360)}</div><h2>${esc(d.name)}</h2><p class="td-text">${esc(d.text)}</p>
      <section class="td-skill"><b>技能</b><p>${esc(d.skill)}</p></section>
      <section class="td-stats">${stat('血量', d.hp, d.hp / 300, '#5ee6a0')}${stat('傷害倍率', '×' + d.dmg, d.dmg / 1.8, '#ff8f6b')}${stat('攻速', d.rate + ' 次/秒', d.rate / 2.2, '#7ff1ff')}${stat('射程', d.range, { 小: .33, 中: .66, 大: 1 }[d.range], '#b892ff')}</section>
      <section class="td-where"><div><small>上場位置</small><b>一般模式${d.role}　·　排位可出戰</b></div><div><small>取得方式</small><b>${o.name} ${o.price}</b></div></section>
      <p class="offer-note">數值為草案，實戰版本上線前會依平衡再調整。</p>
      <button type="button" class="offer-buy" data-goto-pack="${d.pack}">查看${esc(o.name)}</button></div>`;
    if (!detailDialog.open) detailDialog.showModal();
  }
  detailDialog.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) detailDialog.close();
    const go = e.target.closest('[data-goto-pack]'); if (go) { detailDialog.close(); openPacks(Number(go.dataset.gotoPack)); }
  });

  function renderPacks() {
    const o = VALUE_OFFERS[packTab], ids = o.turrets, hero = ids[featured % ids.length], hd = NEW_TURRETS[hero];
    packDialog.style.setProperty('--hue', o.hue);
    packDialog.innerHTML = `<div class="offer-body">
      <div class="vp-stars" aria-hidden="true"></div>
      <header class="offer-head"><span class="offer-tag">三大超值禮包</span><span class="vp-timer">本月剩 ${daysLeft()} 天</span><button type="button" class="offer-close" data-close aria-label="關閉">×</button></header>
      <nav class="pack-tabs">${VALUE_OFFERS.map((x, i) => `<button type="button" data-tab="${i}" aria-pressed="${i === packTab}" style="--hue:${x.hue}"><b>${esc(priceOf(x.id, x.price))}</b><small>${x.tier} ×${x.turrets.length}</small></button>`).join('')}</nav>
      <section class="vp-hero"><h2>${esc(o.name)}</h2>
        <button type="button" class="vp-feature" data-detail="${hero}" style="--c:${hd.color}"><div class="vp-feature-art">${art(hero, 400)}</div><span class="vp-feature-label"><small>${hd.grade} · ${hd.role}</small><b>${esc(hd.name)}</b><em>點我看特效與數值</em></span></button>
        ${ids.length > 1 ? `<div class="vp-thumbs">${ids.map((id, i) => `<button type="button" data-feature="${i}" aria-pressed="${id === hero}" style="--c:${NEW_TURRETS[id].color}">${art(id, 120)}</button>`).join('')}</div>` : ''}
      </section>
      <div class="pack-rewards"><div><i>⬡</i><span>每座專屬晶核</span><b>×${o.cores}</b></div><div><i>✧</i><span>星隕補給艙</span><b>${o.pulls} 抽</b></div><div><i>♛</i><span>皇極星庫</span><b>${o.pulls} 抽</b></div></div>
      <footer class="offer-foot"><small>每月限購一次</small><strong class="offer-price">${esc(priceOf(o.id, o.price))}</strong><button type="button" class="offer-buy vp-buy" data-buy="${o.id}" ${PREVIEW_LOCAL || live.busy || live.bought.includes(o.id) || !live.products.get(o.id) ? 'disabled' : ''}>${PREVIEW_LOCAL ? '本機預覽 · 不會付款' : live.bought.includes(o.id) ? '本月已購買' : live.busy ? '處理中…' : '立即購買'}</button></footer>${live.status ? `<p class="offer-note">${esc(live.status)}</p>` : ''}</div>`;
  }
  function openPacks(tab) {
    if (Number.isInteger(tab)) packTab = tab;
    featured = 0; renderPacks(); if (!packDialog.open) packDialog.showModal();
    clearInterval(featureTimer);
    featureTimer = setInterval(() => { if (!packDialog.open) return clearInterval(featureTimer); if (VALUE_OFFERS[packTab].turrets.length > 1 && !packDialog.matches(':hover')) { featured++; renderPacks(); } }, 3200);
  }
  packDialog.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) packDialog.close();
    const tab = e.target.closest('[data-tab]'); if (tab) { packTab = Number(tab.dataset.tab); featured = 0; renderPacks(); }
    const f = e.target.closest('[data-feature]'); if (f) { featured = Number(f.dataset.feature); renderPacks(); }
    const d = e.target.closest('[data-detail]'); if (d) openDetail(d.dataset.detail);
    const b = e.target.closest('[data-buy]'); if (b && !b.disabled) void buyOffer(b.dataset.buy);
  });

  function rewardTile(entry, mult = 1, big = false) {
    if (!entry) return '<span class="mp-empty"></span>';
    const [key, n] = entry, [icon, name, color] = REWARD[key];
    return `<span class="mp-reward ${big ? 'big' : ''}" style="--rc:${color}"><i>${icon}</i><b>×${(n * mult).toLocaleString('en-US')}</b><small>${name}</small></span>`;
  }
  function renderPass() {
    const lv = level(), into = lv >= PASS.levels ? PASS.xpPerLevel : pass.xp % PASS.xpPerLevel, mult = pass.noble || 1, ready = claimable();
    const ring = 2 * Math.PI * 34;
    passDialog.innerHTML = `<div class="offer-body">
      <section class="mp-banner"><div class="mp-crown" aria-hidden="true">♛</div><div class="mp-title"><b>無敵月卡</b><small>${new Date().getMonth() + 1} 月 · 剩 ${daysLeft()} 天</small></div><button type="button" class="offer-close" data-close aria-label="關閉">×</button>
        <div class="mp-level"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#3a2f16" stroke-width="7"/><circle cx="40" cy="40" r="34" fill="none" stroke="#ffd36e" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ring}" stroke-dashoffset="${ring * (1 - into / PASS.xpPerLevel)}" transform="rotate(-90 40 40)"/></svg><span><small>LV</small><b>${lv}</b></span></div>
        <div class="mp-xp"><b>${lv >= PASS.levels ? '已滿級' : `${into} / ${PASS.xpPerLevel} XP`}</b><small>每日登入 +${PASS.loginXp}　·　一般模式每過 1 波 +1（每日最多 ${PASS.waveXpCap}）</small></div></section>
      ${pass.noble ? `<section class="mp-noble on"><b>貴族特典已啟用</b><small>右欄獎勵 ×${pass.noble}</small></section>` : `<section class="mp-noble"><div><b>貴族特典</b><small>解鎖右欄 30 級獎勵，含星隕 10 抽、皇極 10 抽</small></div><div class="pass-tiers">${PASS.tiers.map(([price, x, sub, id]) => `<button type="button" data-noble="${x}" data-product="${id}" class="${x === 4 ? 'best' : ''}" data-best="${esc(globalThis.SpaceTowerLocale?.text('最划算') ?? '最划算')}" ${live.busy ? 'disabled' : ''}><b>${esc(priceOf(id, price))}</b><small>${sub}</small></button>`).join('')}</div></section>`}
      ${ready ? `<button type="button" class="offer-buy mp-claim-all" data-claim-all>一鍵領取 ${ready} 項</button>` : ''}
      <div class="mp-track"><div class="mp-row mp-head"><span>免費</span><span>LV</span><span>貴族特典${mult > 1 ? ` ×${mult}` : ''}</span></div>${Array.from({ length: PASS.levels }, (_, i) => { const n = i + 1, reached = lv >= n, milestone = n % 10 === 0, fc = pass.claimedFree.includes(n), nc = pass.claimedNoble.includes(n);
        return `<div class="mp-row ${reached ? 'reached' : ''} ${milestone ? 'milestone' : ''}"><button type="button" class="mp-cell ${fc ? 'claimed' : ''}" data-claim="free" data-lv="${n}" ${!FREE_TRACK[n] || !reached || fc ? 'disabled' : ''}>${rewardTile(FREE_TRACK[n], 1, milestone)}</button><span class="mp-node">${n}</span><button type="button" class="mp-cell noble ${nc ? 'claimed' : ''} ${pass.noble ? '' : 'locked'}" data-claim="noble" data-lv="${n}" ${!reached || !pass.noble || nc ? 'disabled' : ''}>${rewardTile(NOBLE_TRACK[n], mult, milestone)}</button></div>`; }).join('')}</div>
      <p class="offer-note">${live.status ? esc(live.status) : PREVIEW_LOCAL ? '本機預覽：付款與發獎尚未接上伺服器，點特典價位可模擬開通。' : '月卡每月重置等級與獎勵。'}</p></div>`;
  }
  function claim(kind, n) { const list = kind === 'free' ? pass.claimedFree : pass.claimedNoble; if (!list.includes(n)) list.push(n); }
  passDialog.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) passDialog.close();
    const noble = e.target.closest('[data-noble]');
    if (noble && PREVIEW_LOCAL) { pass.noble = Number(noble.dataset.noble); savePass(); renderPass(); }
    else if (noble && !noble.disabled) void buyOffer(noble.dataset.product);
    if (online() && e.target.closest('[data-claim-all],[data-claim]:not([disabled])')) { void claimOnline(); return; }
    if (e.target.closest('[data-claim-all]')) { const lv = level(); for (let i = 1; i <= lv; i++) { if (FREE_TRACK[i]) claim('free', i); if (pass.noble) claim('noble', i); } savePass(); renderPass(); }
    const c = e.target.closest('[data-claim]'); if (c && !c.disabled) { claim(c.dataset.claim, Number(c.dataset.lv)); savePass(); renderPass(); }
  });
  function openPass() { if (!online()) pass = loadPass(); renderPass(); if (!passDialog.open) passDialog.showModal(); if (online()) { flushWaves(); void passApi('state'); } }

  /* ---------- entries: home event rail, store, codex ---------- */
  const rail = document.createElement('div');
  rail.className = 'event-rail';
  rail.innerHTML = `<button type="button" class="er-card er-packs" data-open="packs"><span class="er-icon er-pack">${art('phoenix_orb', 96)}</span><span class="er-copy"><b>超值禮包</b><small>US$1.99 起</small></span></button><button type="button" class="er-card er-passcard" data-open="pass"><span class="er-icon er-pass">♛<i class="er-dot" hidden></i></span><span class="er-copy"><b>無敵月卡</b><small data-rail-pass></small></span></button>`;
  // A strip above the deploy card: visible on arrival, never covering the hero.
  document.querySelector('#homePlayPage .home-command-grid')?.prepend(rail);
  rail.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) b.dataset.open === 'packs' ? openPacks() : openPass(); });

  const store = document.querySelector('#homeStorePage .reserved-store');
  const storeBlock = document.createElement('section');
  storeBlock.className = 'store-events';
  storeBlock.innerHTML = `<button type="button" class="se-card se-packs" data-open="packs"><span class="se-art">${art('sword_orb', 160)}</span><span class="se-copy"><small>限時 · 每月限購</small><b>三大超值禮包</b><em>US$1.99 起　·　9 座新砲台</em></span><span class="se-go">›</span></button><button type="button" class="se-card se-pass" data-open="pass"><span class="se-art se-crown">♛</span><span class="se-copy"><small>每月重置</small><b>無敵月卡</b><em data-pass-line></em></span><span class="se-go">›</span></button>`;
  store?.prepend(storeBlock);
  storeBlock.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) b.dataset.open === 'packs' ? openPacks() : openPass(); });

  function addCodexSection() {
    const archive = document.querySelector('.home-turret-archive');
    if (!archive || archive.hidden || archive.querySelector('.codex-new')) return;
    const box = document.createElement('section');
    box.className = 'codex-new';
    box.innerHTML = `<h3>禮包限定砲台 <small>9 座 · 點選看特效與數值</small></h3><div class="codex-new-grid">${Object.entries(NEW_TURRETS).map(([id, d]) => `<button type="button" data-detail="${id}" style="--c:${d.color}">${art(id, 140)}<b>${esc(d.name)}</b><small>${d.grade} · ${d.role}</small></button>`).join('')}</div>`;
    archive.prepend(box);
    box.addEventListener('click', e => { const b = e.target.closest('[data-detail]'); if (b) openDetail(b.dataset.detail); });
  }
  new MutationObserver(addCodexSection).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });

  function renderEntries() {
    const n = claimable();
    const dot = rail.querySelector('.er-dot'); if (dot) { dot.hidden = !n; dot.textContent = n || ''; }
    const line = storeBlock.querySelector('[data-pass-line]'); if (line) line.textContent = `LV ${level()} / 30${n ? `　·　可領 ${n} 項` : ''}`;
    const railLine = rail.querySelector('[data-rail-pass]'); if (railLine) railLine.textContent = n ? `可領 ${n} 項` : `LV ${level()} / 30`;
  }
  grantLoginXp();
  renderEntries();
  if (online()) void passApi('state');
  window.addEventListener('space-tower-cloud-save-applied', () => { if (online()) void passApi('state'); });
  window.SpaceTowerOffers = Object.freeze({ productIds: PRODUCT_IDS, drawArt: (c, id, t) => ART[id]?.(c, t, NEW_TURRETS[id]), openPacks, openPass, openDetail, NEW_TURRETS, VALUE_OFFERS, state: () => ({ ...pass, level: level(), claimable: claimable() }) });

  /* ---------- login sequence: starter -> value packs -> monthly pass ---------- */
  let chain = 'starter';
  // Never interrupt the tutorial or a running battle.
  const blocked = () => !!window.SpaceTowerIntroActive || document.body.classList.contains('in-game');
  const introDone = () => { try { return (DEV_MODE ? SpaceTowerRecruit.read() : v2Progress).onboarding?.introClaimed === true; } catch { return false; } };
  document.getElementById('starterPackDialog')?.addEventListener('close', () => {
    if (chain !== 'starter') return;
    chain = 'packs';
    if (introDone() && !blocked()) setTimeout(() => { if (!blocked()) openPacks(); else chain = 'done'; }, 120); else chain = 'done';
  });
  packDialog.addEventListener('close', () => { clearInterval(featureTimer); if (chain === 'packs') { chain = 'pass'; setTimeout(() => { if (!blocked()) openPass(); else chain = 'done'; }, 120); } });
  passDialog.addEventListener('close', () => { if (chain === 'pass') chain = 'done'; });
})();
