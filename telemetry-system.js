(function initializeSpaceTowerTelemetry() {
  "use strict";

  const pendingEvents = [];
  let bridgeReady = false;

  function normalizeName(value, fallback = "game_event") {
    const normalized = String(value || fallback).trim().toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
    return normalized || fallback;
  }

  function normalizeValue(value) {
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    return String(value ?? "").slice(0, 100);
  }

  function normalizeParams(detail = {}) {
    const params = {};
    for (const [rawKey, value] of Object.entries(detail)) {
      if (rawKey === "name" || rawKey === "at" || value === undefined || value === null) continue;
      if (rawKey === "items" && Array.isArray(value)) {
        params.items = value.slice(0, 200).filter(item => item && typeof item === "object").map(item =>
          Object.fromEntries(Object.entries(item).filter(([, v]) => v != null && typeof v !== "object").map(([k, v]) => [normalizeName(k), normalizeValue(v)])));
      } else params[normalizeName(rawKey, "value")] = normalizeValue(value);
    }
    params.game_version = String(document.documentElement.dataset.gameVersion || "2.5.2");
    return params;
  }

  const analyticsPlugin = () => window.Capacitor?.Plugins?.FirebaseAnalytics || null;
  const crashlyticsPlugin = () => window.Capacitor?.Plugins?.FirebaseCrashlytics || null;

  async function sendEvent(detail) {
    const analytics = analyticsPlugin();
    if (!analytics?.logEvent) return false;
    try {
      await analytics.logEvent({ name: normalizeName(detail?.name), params: normalizeParams(detail) });
      return true;
    } catch (error) {
      console.warn("Firebase Analytics event failed", error);
      return false;
    }
  }

  async function flushPendingEvents() {
    if (!analyticsPlugin()?.logEvent) return;
    bridgeReady = true;
    while (pendingEvents.length > 0) await sendEvent(pendingEvents.shift());
  }

  function trackEvent(name, params = {}) {
    window.dispatchEvent(new CustomEvent("space-tower-analytics", {
      detail: { name: normalizeName(name), at: Date.now(), ...params }
    }));
  }

  async function recordException(error, context = {}) {
    const crashlytics = crashlyticsPlugin();
    if (!crashlytics?.recordException) return false;
    const message = String(error?.message || error || "Unknown JavaScript error").slice(0, 500);
    const stacktrace = String(error?.stack || "").split("\n").slice(0, 24)
      .map((line) => ({ functionName: line.trim().slice(0, 180) }));
    try {
      await crashlytics.recordException({
        message,
        stacktrace,
        keysAndValues: Object.entries(context).slice(0, 12).map(([key, value]) => ({
          key: normalizeName(key, "context"),
          value: normalizeValue(value),
          type: typeof value === "number" ? "double" : "string"
        }))
      });
      return true;
    } catch (recordError) {
      console.warn("Firebase Crashlytics report failed", recordError);
      return false;
    }
  }

  window.addEventListener("space-tower-analytics", (event) => {
    const detail = event.detail || {};
    if (!analyticsPlugin()?.logEvent) {
      if (pendingEvents.length < 40) pendingEvents.push(detail);
      return;
    }
    void sendEvent(detail);
  });
  window.addEventListener("error", (event) => void recordException(event.error || event.message, {
    source: event.filename || "window", line: event.lineno || 0, column: event.colno || 0
  }));
  window.addEventListener("unhandledrejection", (event) => void recordException(event.reason, { source: "unhandledrejection" }));

  window.spaceTowerTrackEvent = trackEvent;
  window.spaceTowerRecordException = recordException;
  // Firebase Analytics records first_open automatically on the native app.
  window.spaceTowerTelemetry = { trackEvent, recordException, automaticEvents: ["first_open"], get ready() { return bridgeReady; } };
  document.addEventListener("deviceready", () => void flushPendingEvents(), { once: true });
  setTimeout(() => void flushPendingEvents(), 1200);
  trackEvent("app_open", { language: localStorage.getItem("spaceTowerLanguage") || "auto" });
})();
