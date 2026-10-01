import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyAdMobTrialCallback } from "../functions/_shared/admob-ssv.js";

const base64url = (bytes) => Buffer.from(bytes).toString("base64url");

function p1363ToDer(bytes) {
  const integer = (part) => {
    let value = Buffer.from(part);
    while (value.length > 1 && value[0] === 0) value = value.subarray(1);
    if (value[0] & 0x80) value = Buffer.concat([Buffer.from([0]), value]);
    return Buffer.concat([Buffer.from([2, value.length]), value]);
  };
  const r = integer(bytes.subarray(0, 32));
  const s = integer(bytes.subarray(32));
  return Buffer.concat([Buffer.from([0x30, r.length + s.length]), r, s]);
}

test("AdMob SSV accepts an authentic trial callback and rejects signed-query tampering", async () => {
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const publicKey = Buffer.from(await crypto.subtle.exportKey("spki", keys.publicKey)).toString("base64");
  const now = Date.now();
  const id = "4383d306-01f4-4580-a982-b603e6b43ed4";
  const signed = `ad_unit=9681205002&custom_data=trial%3A${id}&reward_amount=1&reward_item=attempt&timestamp=${now}&transaction_id=18fa792de1bca816048293fc71035638`;
  const signature = p1363ToDer(new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, keys.privateKey, new TextEncoder().encode(signed))));
  const query = `${signed}&signature=${base64url(signature)}&key_id=42`;
  const fetcher = async () => new Response(JSON.stringify({ keys: [{ keyId: 42, base64: publicKey }] }), { status: 200 });
  const result = await verifyAdMobTrialCallback(new Request(`https://example.com/api/trial-ssv?${query}`), now, fetcher);
  assert.equal(result.intentId, id);
  assert.equal(result.adUnit, "9681205002");
  await assert.rejects(() => verifyAdMobTrialCallback(new Request(`https://example.com/api/trial-ssv?${query.replace("reward_amount=1", "reward_amount=9")}`), now, fetcher), /INVALID_SSV_SIGNATURE/);
  await assert.rejects(() => verifyAdMobTrialCallback(new Request(`https://example.com/api/trial-ssv?${query.replace("ad_unit=9681205002", "ad_unit=123456")}`), now, fetcher), /INVALID_SSV_REWARD/);
  await assert.rejects(() => verifyAdMobTrialCallback(new Request(`https://example.com/api/trial-ssv?${query}`), now + 31 * 60_000, fetcher), /INVALID_SSV_TIME/);
});
