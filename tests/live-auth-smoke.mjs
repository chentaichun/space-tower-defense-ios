import assert from "node:assert/strict";

const baseUrl = process.env.SPACE_TOWER_BASE_URL || "https://space-tower-defense.pages.dev";
const appOrigin = "https://localhost";
const name = `codex_e2e_${Date.now()}`;
const password = "E2eSecurePass!42";
let sessionToken = "";

async function jsonRequest(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

try {
  const preflight = await fetch(`${baseUrl}/api/player`, {
    method: "OPTIONS",
    headers: {
      Origin: appOrigin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,authorization"
    }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), appOrigin);
  assert.match(preflight.headers.get("access-control-allow-methods"), /POST/);
  console.log("CORS preflight: PASS");

  const googleStatus = await jsonRequest("/api/auth/google/status", {
    headers: { Origin: appOrigin }
  });
  assert.equal(googleStatus.response.status, 200);
  assert.equal(googleStatus.response.headers.get("access-control-allow-origin"), appOrigin);
  console.log(`Google configuration endpoint: PASS (enabled=${googleStatus.data.enabled === true})`);

  const registration = await jsonRequest("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: appOrigin },
    body: JSON.stringify({
      action: "register",
      name,
      password,
      save: { obsidian: 1000 }
    })
  });
  assert.equal(registration.response.status, 200);
  assert.equal(registration.data.registered, true);
  assert.ok(registration.data.sessionToken);
  assert.equal(registration.response.headers.get("access-control-allow-origin"), appOrigin);
  sessionToken = registration.data.sessionToken;
  console.log("Registration: PASS");

  const login = await jsonRequest("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: appOrigin },
    body: JSON.stringify({ action: "login", name, password })
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.data.sessionToken);
  assert.equal(login.data.player.save.obsidian, 1000);
  sessionToken = login.data.sessionToken;
  console.log("Password login: PASS");

  const draw = await jsonRequest("/api/shop/draw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
      Origin: appOrigin
    },
    body: JSON.stringify({
      pack: "normal",
      pulls: 1,
      useVoucher: false,
      requestId: `live-draw-${Date.now()}`
    })
  });
  assert.equal(draw.response.status, 200);
  assert.equal(draw.data.ok, true);
  assert.equal(draw.data.results.length, 1);
  assert.ok(draw.data.save.obsidian >= 800);
  assert.ok(draw.data.save.expansionProgress.normalPaidPulls >= 1);
  console.log("Authenticated card-pack draw: PASS");

  const save = await jsonRequest("/api/player", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
      Origin: appOrigin
    },
    body: JSON.stringify({ action: "save", name, save: draw.data.save })
  });
  assert.equal(save.response.status, 200);
  assert.equal(save.data.player.save.obsidian, draw.data.save.obsidian);
  console.log("Remembered session and cloud save: PASS");
} finally {
  if (sessionToken) {
    const deletion = await jsonRequest("/api/player", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        Origin: appOrigin
      }
    });
    assert.equal(deletion.response.status, 200);
    assert.equal(deletion.data.deleted, true);
    console.log("Temporary test account cleanup: PASS");
  }
}
