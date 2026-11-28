/* Rating and share prompts, shown only at happy moments (ranked win, major boss down, great card pull).
   - Rating: the platform's own in-app review sheet (Google Play / App Store). No reward is ever tied to it
     (store policy). At most once every 3 days, never in the first 2 days, at most 3 times a year.
   - Share: a popup offering the native share sheet; every completed share gives SHARE_REWARD obsidian,
     up to SHARE_DAILY_LIMIT times a day. The reward is for sharing only: nothing is promised for installs.
   Prompts never appear during an active battle or over another dialog. */
(() => {
  const KEY = "spaceTowerGrowthPrompts.v1";
  const DAY = 86400000;
  const REVIEW_GAP = 3 * DAY, REVIEW_FIRST_DELAY = 2 * DAY, REVIEW_YEARLY_LIMIT = 3;
  const SHARE_REWARD = 5, SHARE_DAILY_LIMIT = 5, SHARE_POPUP_GAP = 6 * 3600000, SHARE_POPUPS_PER_DAY = 2, SHARE_FIRST_DELAY = DAY;
  const PROMPT_GAP = 10 * 60000;
  const PLAY_URL = "https://play.google.com/store/apps/details?id=com.mrchen.spacetowerdefense";
  const APP_STORE_URL = "https://apps.apple.com/app/id6815095860";
  const isRankedPage = /ranked\.html$/i.test(location.pathname);

  const TEXT = {
    zh: { each: "每次分享", kicker: "分享獎勵", title: "邀請朋友一起守護星系！", body: "把遊戲分享給朋友，每次分享立即獲得 {n} 黑曜石。", left: "今日剩餘 {left} / {max} 次", share: "分享給朋友", later: "稍後再說", done: "今天的分享獎勵已領完，明天再來！", reward: "分享獎勵", got: "黑曜石 +{n}", message: "我在玩《Space Tower Defense》太空塔防，砲台特效超華麗！一起來守護星系吧：", copied: "已複製下載連結，貼給朋友就算分享成功！" },
    en: { each: "per share", kicker: "Share reward", title: "Invite friends to defend the galaxy!", body: "Share the game with a friend and get {n} Obsidian for every share.", left: "{left} / {max} left today", share: "Share with friends", later: "Maybe later", done: "Today's share rewards are all claimed. Come back tomorrow!", reward: "Share reward", got: "Obsidian +{n}", message: "I'm playing Space Tower Defense and the turret effects are stunning! Come defend the galaxy with me:", copied: "Download link copied. Paste it to a friend to share!" },
    ja: { each: "シェア1回ごと", kicker: "シェア報酬", title: "友だちと一緒に銀河を守ろう！", body: "友だちにゲームをシェアすると、1回ごとに黒曜石 {n} 個をすぐにもらえます。", left: "本日残り {left} / {max} 回", share: "友だちにシェア", later: "あとで", done: "本日のシェア報酬はすべて受け取りました。また明日！", reward: "シェア報酬", got: "黒曜石 +{n}", message: "『Space Tower Defense』をプレイ中！砲台のエフェクトがすごく派手だよ。一緒に銀河を守ろう：", copied: "ダウンロードリンクをコピーしました。友だちに貼り付けて送ればシェア完了！" },
    ko: { each: "공유할 때마다", kicker: "공유 보상", title: "친구와 함께 은하를 지켜요!", body: "친구에게 게임을 공유할 때마다 흑요석 {n}개를 바로 받습니다.", left: "오늘 남은 횟수 {left} / {max}", share: "친구에게 공유", later: "나중에", done: "오늘의 공유 보상을 모두 받았습니다. 내일 다시 오세요!", reward: "공유 보상", got: "흑요석 +{n}", message: "Space Tower Defense 하는 중인데 포탑 이펙트가 정말 화려해! 같이 은하를 지키자:", copied: "다운로드 링크를 복사했습니다. 친구에게 붙여넣어 보내면 공유 완료!" },
    ru: { each: "за каждый репост", kicker: "Награда за репост", title: "Зовите друзей защищать галактику!", body: "Поделитесь игрой с другом и получайте {n} обсидиана за каждый репост.", left: "Осталось сегодня: {left} / {max}", share: "Поделиться с друзьями", later: "Позже", done: "Все награды за репосты на сегодня получены. Возвращайтесь завтра!", reward: "Награда за репост", got: "Обсидиан +{n}", message: "Играю в Space Tower Defense — эффекты турелей просто потрясающие! Давай защищать галактику вместе:", copied: "Ссылка скопирована. Отправьте её другу — и репост засчитан!" },
    es: { each: "por cada vez", kicker: "Recompensa por compartir", title: "¡Invita a tus amigos a defender la galaxia!", body: "Comparte el juego con un amigo y recibe {n} de Obsidiana por cada vez que compartas.", left: "Quedan {left} / {max} hoy", share: "Compartir con amigos", later: "Quizá luego", done: "Ya reclamaste todas las recompensas de hoy. ¡Vuelve mañana!", reward: "Recompensa por compartir", got: "Obsidiana +{n}", message: "¡Estoy jugando Space Tower Defense y los efectos de las torretas son espectaculares! Ven a defender la galaxia conmigo:", copied: "Enlace copiado. ¡Pégalo a un amigo para compartir!" }
  };
  const lang = () => {
    const l = (typeof currentLanguage === "string" && currentLanguage) || globalThis.SpaceTowerLocale?.language || document.documentElement.lang || "en";
    return TEXT[l] ? l : "en";
  };
  const t = (key, vars = {}) => String(TEXT[lang()][key] ?? TEXT.en[key]).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  const dayKey = (time = Date.now()) => { const d = new Date(time); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
    s = s && typeof s === "object" ? s : {};
    s.firstSeen = Number(s.firstSeen) || Date.now();
    s.reviewAsks = Array.isArray(s.reviewAsks) ? s.reviewAsks.filter((x) => Date.now() - x < 365 * DAY) : [];
    s.lastPrompt = Number(s.lastPrompt) || 0;
    s.sharePopups = Array.isArray(s.sharePopups) ? s.sharePopups.filter((x) => Date.now() - x < DAY) : [];
    if (s.shareDay !== dayKey()) { s.shareDay = dayKey(); s.shares = 0; }
    s.pending = typeof s.pending === "string" ? s.pending : "";
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
  const state = load(); save(state);

  const capacitor = () => window.Capacitor;
  const isNative = () => Boolean(capacitor()?.isNativePlatform?.());
  const platform = () => String(capacitor()?.getPlatform?.() || "web").toLowerCase();
  const plugin = (name) => (isNative() ? capacitor().Plugins?.[name] || capacitor().registerPlugin?.(name) || null : null);
  const storeUrl = () => (platform() === "ios" ? APP_STORE_URL : PLAY_URL);

  function reviewEligible(now = Date.now()) {
    if (!isNative() || !plugin("InAppReview")) return false;
    if (now - state.firstSeen < REVIEW_FIRST_DELAY) return false;
    if (state.reviewAsks.length >= REVIEW_YEARLY_LIMIT) return false;
    const last = state.reviewAsks[state.reviewAsks.length - 1] || 0;
    return now - last >= REVIEW_GAP;
  }
  function shareEligible(now = Date.now()) {
    if (isRankedPage) return false; // the reward lives in the main game's wallet
    if (state.shares >= SHARE_DAILY_LIMIT) return false;
    let best = 0;
    try { if (typeof tierRecords === "object" && tierRecords) best = Math.max(0, ...Object.values(tierRecords).map(Number).filter(Number.isFinite)); } catch {}
    if (now - state.firstSeen < SHARE_FIRST_DELAY && best < 10) return false; // past the first stage only
    if (state.sharePopups.length >= SHARE_POPUPS_PER_DAY) return false;
    const last = state.sharePopups[state.sharePopups.length - 1] || 0;
    return now - last >= SHARE_POPUP_GAP;
  }

  // Safe = no battle running and no other dialog/overlay in front.
  function safeToPrompt() {
    if (document.hidden || document.getElementById("growthSharePrompt")) return false;
    if (isRankedPage) return true; // called only once the result screen is up; the review sheet is native
    if (window.SpaceTowerIntroActive || window.SpaceTowerStarterGateActive) return false; // first-run tutorial / starter gate
    if (document.querySelector("dialog[open], #gachaReveal:not([hidden]), .launch-interstitial:not([hidden])")) return false;
    try { if (typeof running !== "undefined" && running && typeof isPaused !== "undefined" && !isPaused && document.body.classList.contains("in-game")) return false; } catch {}
    return true;
  }

  async function requestReview() {
    state.reviewAsks.push(Date.now()); state.lastPrompt = Date.now(); state.pending = ""; save(state);
    try { await plugin("InAppReview").requestReview(); } catch {}
  }

  function grantShareReward() {
    if (state.shares >= SHARE_DAILY_LIMIT) return 0;
    state.shares += 1; save(state);
    try {
      if (typeof obsidian === "number" && typeof saveObsidian === "function") { obsidian += SHARE_REWARD; saveObsidian({ critical: true }); }
    } catch { return 0; }
    try { if (typeof trackGameEvent === "function") trackGameEvent("share_reward", { count: state.shares }); } catch {}
    if (typeof showTaskToast === "function") showTaskToast(t("reward"), t("got", { n: SHARE_REWARD }));
    return SHARE_REWARD;
  }

  // Resolves true only when the player actually completed a share (or copied the link where sharing is unavailable).
  async function shareGame() {
    const text = t("message"), url = storeUrl();
    const native = plugin("Share");
    try {
      if (native) { await native.share({ title: "Space Tower Defense", text, url, dialogTitle: t("share") }); return true; }
      if (navigator.share) { await navigator.share({ title: "Space Tower Defense", text, url }); return true; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      if (typeof showTaskToast === "function") showTaskToast(t("reward"), t("copied"));
      return true;
    } catch { return false; } // cancelled
  }

  async function shareAndReward() {
    if (state.shares >= SHARE_DAILY_LIMIT) return 0;
    return (await shareGame()) ? grantShareReward() : 0;
  }

  function showSharePrompt() {
    if (document.getElementById("growthSharePrompt")) return;
    state.sharePopups.push(Date.now()); state.lastPrompt = Date.now(); state.pending = ""; save(state);
    const box = document.createElement("div");
    box.id = "growthSharePrompt"; box.className = "growth-prompt"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.setAttribute("data-no-translate", "");
    const render = () => {
      const left = Math.max(0, SHARE_DAILY_LIMIT - state.shares);
      box.innerHTML = `<div class="growth-card"><i class="growth-orbit" aria-hidden="true"></i>
        <div class="growth-emblem" aria-hidden="true"><span>✦</span></div>
        <small class="growth-kicker">${t("kicker")}</small><h2>${t("title")}</h2><p>${t("body", { n: SHARE_REWARD })}</p>
        <div class="growth-reward"><b>${t("got", { n: SHARE_REWARD })}</b><span>${t("each")}</span></div>
        <div class="growth-pips" aria-label="${t("left", { left, max: SHARE_DAILY_LIMIT })}">${Array.from({ length: SHARE_DAILY_LIMIT }, (_, i) => `<i class="${i < state.shares ? "used" : ""}"></i>`).join("")}</div>
        <small class="growth-left">${left ? t("left", { left, max: SHARE_DAILY_LIMIT }) : t("done")}</small>
        <button type="button" class="growth-share" data-growth-share ${left ? "" : "disabled"}>${t("share")}</button>
        <button type="button" class="growth-later" data-growth-close>${t("later")}</button></div>`;
    };
    render();
    let busy = false;
    box.addEventListener("click", async (event) => {
      if (event.target === box || event.target.closest("[data-growth-close]")) { box.remove(); return; }
      if (!event.target.closest("[data-growth-share]") || busy) return;
      busy = true;
      await shareAndReward();
      busy = false; render();
    });
    document.body.appendChild(box);
    box.querySelector("[data-growth-share]")?.focus();
  }

  function flush() {
    if (!state.pending || !safeToPrompt()) return;
    const now = Date.now();
    if (now - state.lastPrompt < PROMPT_GAP) { state.pending = ""; save(state); return; }
    if (reviewEligible(now)) { void requestReview(); return; }
    if (shareEligible(now)) { showSharePrompt(); return; }
    if (!isRankedPage) { state.pending = ""; save(state); } // nothing to show: drop the moment
  }

  // kind: "ranked_win" | "boss" | "gacha". The prompt waits until the moment is safe (battle over, dialogs closed).
  function moment(kind) {
    state.pending = String(kind || "moment"); save(state);
    setTimeout(flush, isRankedPage ? 1800 : 600);
  }
  // The main game re-checks for a safe moment (a boss falls mid-battle; the prompt waits for the run to end).
  // Ranked only tries right after the result screen, never during a match.
  if (!isRankedPage) { setInterval(flush, 3000); setTimeout(flush, 4000); }

  window.SpaceTowerGrowth = Object.freeze({
    moment, flush, shareGame, shareAndReward, showSharePrompt,
    get state() { return { ...state }; },
    limits: Object.freeze({ SHARE_REWARD, SHARE_DAILY_LIMIT, REVIEW_GAP, REVIEW_YEARLY_LIMIT })
  });
})();
