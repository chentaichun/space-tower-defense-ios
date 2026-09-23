(() => {
  "use strict";

  const VERSION_ENDPOINT = "https://space-tower-defense.pages.dev/api/app-version";
  const DEFAULT_PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.mrchen.spacetowerdefense";
  const CHECK_INTERVAL_MS = 5 * 60 * 1000;
  const FETCH_TIMEOUT_MS = 7000;
  const DISMISSED_SESSION_KEY = "spaceTowerDismissedUpdateVersion";
  const PREVIEW_MODE = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    ? new URLSearchParams(window.location.search).get("updatePreview")
    : "";

  const TEXT = {
    zh: {
      kicker: "偵測到新版本",
      title: "請更新 Space Tower Defense",
      message: "Google Play 已推出 {version}。更新後可取得最新內容、問題修正與廣告獎勵功能。",
      required: "此版本包含重要修正，必須更新後才能繼續遊戲。",
      current: "目前版本",
      latest: "最新版本",
      update: "前往 Google Play 更新",
      later: "稍後提醒我",
      opening: "正在開啟 Google Play…"
    },
    en: {
      kicker: "New version available",
      title: "Update Space Tower Defense",
      message: "Version {version} is now on Google Play. Update for the latest content, fixes, and rewarded-ad features.",
      required: "This version contains an important fix. You must update before continuing.",
      current: "Installed",
      latest: "Latest",
      update: "Update on Google Play",
      later: "Remind me later",
      opening: "Opening Google Play…"
    },
    ja: {
      kicker: "新しいバージョンがあります",
      title: "Space Tower Defense を更新",
      message: "Google Play でバージョン {version} を公開しました。最新コンテンツ、修正、リワード広告機能をご利用いただけます。",
      required: "重要な修正を含むため、続行するにはアップデートが必要です。",
      current: "現在のバージョン",
      latest: "最新バージョン",
      update: "Google Play で更新",
      later: "後で通知",
      opening: "Google Play を開いています…"
    },
    ko: {
      kicker: "새 버전 출시",
      title: "Space Tower Defense 업데이트",
      message: "Google Play에 버전 {version}이 출시되었습니다. 최신 콘텐츠, 수정 사항 및 보상형 광고 기능을 이용해 보세요.",
      required: "중요한 수정이 포함되어 있어 계속하려면 업데이트해야 합니다.",
      current: "현재 버전",
      latest: "최신 버전",
      update: "Google Play에서 업데이트",
      later: "나중에 알림",
      opening: "Google Play 여는 중…"
    },
    ru: {
      kicker: "Доступна новая версия",
      title: "Обновите Space Tower Defense",
      message: "Версия {version} уже доступна в Google Play. Обновитесь, чтобы получить новый контент, исправления и функции рекламы с наградой.",
      required: "Версия содержит важное исправление. Для продолжения необходимо обновление.",
      current: "Установлено",
      latest: "Последняя версия",
      update: "Обновить в Google Play",
      later: "Напомнить позже",
      opening: "Открываем Google Play…"
    },
    es: {
      kicker: "Nueva versión disponible",
      title: "Actualiza Space Tower Defense",
      message: "La versión {version} ya está en Google Play. Actualiza para obtener contenido nuevo, correcciones y funciones de anuncios con recompensa.",
      required: "Esta versión contiene una corrección importante. Debes actualizar para continuar.",
      current: "Instalada",
      latest: "Más reciente",
      update: "Actualizar en Google Play",
      later: "Recordármelo después",
      opening: "Abriendo Google Play…"
    }
  };

  let lastCheckedAt = 0;
  let activeVersionInfo = null;
  let installedVersionInfo = null;
  let checkPromise = null;

  const normalizeLanguage = (language = document.documentElement.lang) => {
    const value = String(language || "en").toLowerCase();
    if (value.startsWith("zh")) return "zh";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    if (value.startsWith("ru")) return "ru";
    if (value.startsWith("es")) return "es";
    return "en";
  };

  const versionParts = (value) => String(value || "0")
    .split(".")
    .map((part) => Number.parseInt(part.replace(/\D.*$/, ""), 10) || 0);

  const compareVersions = (left, right) => {
    const a = versionParts(left);
    const b = versionParts(right);
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) {
      const difference = (a[index] || 0) - (b[index] || 0);
      if (difference !== 0) return difference > 0 ? 1 : -1;
    }
    return 0;
  };

  const isAndroidApp = () => {
    const platform = String(window.Capacitor?.getPlatform?.() || "").toLowerCase();
    return platform === "android" || PREVIEW_MODE === "optional" || PREVIEW_MODE === "required";
  };

  const getInstalledVersionInfo = async () => {
    const fallback = {
      version: document.documentElement.dataset.gameVersion || "0.0.0",
      versionCode: Number(document.documentElement.dataset.gameVersionCode || 0)
    };
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (!appPlugin?.getInfo) return fallback;

    try {
      const info = await appPlugin.getInfo();
      return {
        version: String(info?.version || fallback.version),
        versionCode: Number.parseInt(info?.build, 10) || fallback.versionCode
      };
    } catch {
      return fallback;
    }
  };

  const fetchVersionInfo = async () => {
    if (PREVIEW_MODE === "optional" || PREVIEW_MODE === "required") {
      return {
        platform: "android",
        packageName: "com.mrchen.spacetowerdefense",
        latestVersion: "2.10.0",
        latestVersionCode: 38,
        minimumVersion: PREVIEW_MODE === "required" ? "2.10.0" : "2.9.4",
        minimumVersionCode: PREVIEW_MODE === "required" ? 38 : 37,
        forceUpdate: PREVIEW_MODE === "required",
        published: true,
        playStoreUrl: DEFAULT_PLAY_STORE_URL
      };
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const separator = VERSION_ENDPOINT.includes("?") ? "&" : "?";
      const response = await fetch(`${VERSION_ENDPOINT}${separator}t=${Date.now()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`version_check_${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const shouldOfferUpdate = (installed, latest) => {
    if (!latest || latest.published !== true || latest.platform !== "android") return false;
    if (Number(latest.latestVersionCode) > 0 && installed.versionCode > 0) {
      return Number(latest.latestVersionCode) > installed.versionCode;
    }
    return compareVersions(latest.latestVersion, installed.version) > 0;
  };

  const isRequiredUpdate = (installed, latest) => {
    if (latest.forceUpdate === true) return true;
    if (Number(latest.minimumVersionCode) > 0 && installed.versionCode > 0) {
      return Number(latest.minimumVersionCode) > installed.versionCode;
    }
    return compareVersions(latest.minimumVersion, installed.version) > 0;
  };

  const ensureDialog = () => {
    let overlay = document.getElementById("appUpdateOverlay");
    if (overlay) return overlay;

    overlay = document.createElement("section");
    overlay.id = "appUpdateOverlay";
    overlay.className = "app-update-overlay";
    overlay.hidden = true;
    overlay.setAttribute("role", "presentation");
    overlay.innerHTML = `
      <div class="app-update-dialog" role="dialog" aria-modal="true" aria-labelledby="appUpdateTitle" aria-describedby="appUpdateMessage">
        <div class="app-update-visual" aria-hidden="true"><div class="app-update-orbit"></div><div class="app-update-icon">↥</div></div>
        <div class="app-update-content">
          <span class="app-update-kicker" id="appUpdateKicker"></span>
          <h2 class="app-update-title" id="appUpdateTitle"></h2>
          <p class="app-update-message" id="appUpdateMessage"></p>
          <p class="app-update-required" id="appUpdateRequired" hidden></p>
          <div class="app-update-versions">
            <div class="app-update-version"><span id="appUpdateCurrentLabel"></span><b id="appUpdateCurrent"></b></div>
            <div class="app-update-version"><span id="appUpdateLatestLabel"></span><b id="appUpdateLatest"></b></div>
          </div>
          <div class="app-update-actions">
            <button class="app-update-primary" id="appUpdateButton" type="button"></button>
            <button class="app-update-later" id="appUpdateLater" type="button"></button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector("#appUpdateButton").addEventListener("click", () => void openPlayStore());
    overlay.querySelector("#appUpdateLater").addEventListener("click", dismissUpdate);
    return overlay;
  };

  const renderDialogLanguage = () => {
    if (!activeVersionInfo || !installedVersionInfo) return;
    const overlay = ensureDialog();
    const text = TEXT[normalizeLanguage()] || TEXT.en;
    const required = isRequiredUpdate(installedVersionInfo, activeVersionInfo);
    overlay.querySelector("#appUpdateKicker").textContent = text.kicker;
    overlay.querySelector("#appUpdateTitle").textContent = text.title;
    overlay.querySelector("#appUpdateMessage").textContent = text.message.replace("{version}", activeVersionInfo.latestVersion);
    overlay.querySelector("#appUpdateRequired").textContent = text.required;
    overlay.querySelector("#appUpdateRequired").hidden = !required;
    overlay.querySelector("#appUpdateCurrentLabel").textContent = text.current;
    overlay.querySelector("#appUpdateCurrent").textContent = installedVersionInfo.version;
    overlay.querySelector("#appUpdateLatestLabel").textContent = text.latest;
    overlay.querySelector("#appUpdateLatest").textContent = activeVersionInfo.latestVersion;
    overlay.querySelector("#appUpdateButton").textContent = text.update;
    overlay.querySelector("#appUpdateLater").textContent = text.later;
    overlay.querySelector("#appUpdateLater").hidden = required;
  };

  const showUpdate = (installed, latest) => {
    activeVersionInfo = latest;
    installedVersionInfo = installed;
    const required = isRequiredUpdate(installed, latest);
    if (!required && sessionStorage.getItem(DISMISSED_SESSION_KEY) === String(latest.latestVersionCode || latest.latestVersion)) {
      return;
    }
    const overlay = ensureDialog();
    renderDialogLanguage();
    overlay.hidden = false;
    document.body.classList.add("app-update-visible");
    overlay.querySelector("#appUpdateButton").focus();
  };

  function dismissUpdate() {
    if (!activeVersionInfo || !installedVersionInfo || isRequiredUpdate(installedVersionInfo, activeVersionInfo)) return;
    sessionStorage.setItem(DISMISSED_SESSION_KEY, String(activeVersionInfo.latestVersionCode || activeVersionInfo.latestVersion));
    const overlay = ensureDialog();
    overlay.hidden = true;
    document.body.classList.remove("app-update-visible");
  }

  async function openPlayStore() {
    if (!activeVersionInfo) return;
    const overlay = ensureDialog();
    const button = overlay.querySelector("#appUpdateButton");
    const text = TEXT[normalizeLanguage()] || TEXT.en;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = text.opening;
    const packageName = activeVersionInfo.packageName || "com.mrchen.spacetowerdefense";
    const marketUrl = `market://details?id=${encodeURIComponent(packageName)}`;
    const webUrl = activeVersionInfo.playStoreUrl || DEFAULT_PLAY_STORE_URL;
    const launcher = window.Capacitor?.Plugins?.AppLauncher;

    try {
      if (launcher?.openUrl) {
        const result = await launcher.openUrl({ url: marketUrl });
        if (result?.completed !== false) return;
        await launcher.openUrl({ url: webUrl });
        return;
      }
      const opened = window.open(webUrl, "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = webUrl;
    } catch {
      try {
        if (launcher?.openUrl) await launcher.openUrl({ url: webUrl });
        else window.location.href = webUrl;
      } catch {
        window.location.href = webUrl;
      }
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = originalLabel;
      }, 700);
    }
  }

  const checkForUpdate = async ({ force = false } = {}) => {
    if (!isAndroidApp()) return null;
    const now = Date.now();
    if (!force && now - lastCheckedAt < CHECK_INTERVAL_MS) return null;
    if (checkPromise) return checkPromise;

    checkPromise = (async () => {
      lastCheckedAt = now;
      try {
        const [installed, latest] = await Promise.all([getInstalledVersionInfo(), fetchVersionInfo()]);
        if (shouldOfferUpdate(installed, latest)) showUpdate(installed, latest);
        return { installed, latest };
      } catch (error) {
        console.info("[Update] Version check skipped:", error?.message || error);
        return null;
      } finally {
        checkPromise = null;
      }
    })();
    return checkPromise;
  };

  window.SpaceTowerUpdateSystem = {
    checkForUpdate,
    compareVersions,
    shouldOfferUpdate,
    isRequiredUpdate
  };

  window.addEventListener("space-tower-language-changed", renderDialogLanguage);
  window.addEventListener("pageshow", () => void checkForUpdate());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkForUpdate();
  });
  window.Capacitor?.Plugins?.App?.addListener?.("appStateChange", ({ isActive }) => {
    if (isActive) void checkForUpdate();
  });
  void checkForUpdate({ force: true });
})();
