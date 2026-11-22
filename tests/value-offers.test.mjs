import test from 'node:test';
import assert from 'node:assert/strict';
import { applyOfferLedger, packRewards, rollRewards, passLevel, OFFER_PRODUCT_IDS, OFFER_TURRET_IDS, FREE_TRACK, NOBLE_TRACK } from '../functions/_shared/value-offers.js';

const save = () => ({
  obsidian: 0, spaceCoins: 0, economyRevision: 0,
  expansionProgress: { revision: 0, packVouchers: { normal: 0, supreme: 0 }, consumables: { reviveTicket: 0, skipWaveVoucher: 0 } },
  v2Progress: { revision: 0, assembled: {}, stars: {}, active: {}, fragments: {}, cores: {}, lifetimeFragments: 0, loadoutPresets: { progress: {} } }
});

test('six Play products and nine pack-only turrets exist in the shared catalog', () => {
  assert.deepEqual(OFFER_PRODUCT_IDS, ['value_pack_199_v1', 'value_pack_299_v1', 'value_pack_499_v1', 'monthly_pass_666_v1', 'monthly_pass_1000_v1', 'monthly_pass_2000_v1']);
  assert.equal(OFFER_TURRET_IDS.length, 9);
  for (const id of OFFER_TURRET_IDS) assert.equal(globalThis.SpaceTowerCatalog.byId.get(id)?.offerExclusive, true, id);
  assert.equal(passLevel(99), 0); assert.equal(passLevel(250), 2); assert.equal(passLevel(99999), 30);
  for (let level = 1; level <= 30; level += 1) assert.ok(NOBLE_TRACK[level], 'noble ' + level);
  assert.ok(Object.keys(FREE_TRACK).every((level) => level >= 1 && level <= 30));
});

test('a pack grants turrets, cores and pulls once; a repeat purchase raises stars', () => {
  const s = save(), account = {};
  const ledger = [{ id: 1, rewards: packRewards('value_pack_299_v1') }];
  assert.equal(applyOfferLedger(s, account, ledger), true);
  assert.equal(s.v2Progress.assembled.icewall_orb, 1); assert.equal(s.v2Progress.stars.bomb_orb, 1);
  assert.equal(s.v2Progress.cores.icewall_orb, 5); assert.equal(s.expansionProgress.packVouchers.normal, 50);
  assert.equal(applyOfferLedger(s, account, ledger), false, 'applied rows are not re-applied');
  ledger.push({ id: 2, rewards: packRewards('value_pack_299_v1') });
  applyOfferLedger(s, account, ledger);
  assert.equal(s.v2Progress.stars.icewall_orb, 2); assert.equal(s.expansionProgress.packVouchers.supreme, 100);
});

test('pack turrets the player never bought are stripped, but not when the ledger is unknown', () => {
  const s = save();
  s.v2Progress.assembled.sword_orb = 1; s.v2Progress.stars.sword_orb = 5; s.v2Progress.loadoutPresets.progress.sword_orb = 1;
  assert.equal(applyOfferLedger(s, {}, null), false);
  assert.equal(s.v2Progress.assembled.sword_orb, 1, 'a failed read never deletes turrets');
  assert.equal(applyOfferLedger(s, {}, []), true);
  assert.equal(s.v2Progress.assembled.sword_orb, undefined); assert.equal(s.v2Progress.loadoutPresets.progress.sword_orb, undefined);
});

test('pass rewards roll dice and shards up front and never include pack turrets', () => {
  let n = 0; const random = () => ((n++ * 0.37) % 1);
  const dice = rollRewards('dice', 50, random);
  assert.ok(dice.obsidian >= 50 && dice.obsidian <= 300);
  const shards = rollRewards('shard', 10, random);
  assert.equal(Object.values(shards.shards).reduce((a, b) => a + b, 0), 10);
  for (const id of Object.keys(shards.shards)) assert.ok(!OFFER_TURRET_IDS.includes(id) && !id.startsWith('vip_'), id);
  assert.deepEqual(rollRewards('revive', 2).consumables, { reviveTicket: 2 });
  assert.equal(rollRewards('imperial', 10).supremePulls, 10);
});
