import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { WEB_FILES, sourceIdentity, verifyIos } from '../tools/ios-release.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'ios-integrity-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const put = async (name, text) => {
    await mkdir(dirname(join(root, name)), { recursive: true });
    await writeFile(join(root, name), text);
  };
  await put('package.json', JSON.stringify({ version: '4.0.1' }));
  await put('package-lock.json', JSON.stringify({ version: '4.0.1', packages: { '': { version: '4.0.1' } } }));
  const contents = {
    'index.html': '<html data-game-version="4.0.1" data-game-version-code="72">',
    'app-version.json': JSON.stringify({ latestVersion: '4.0.1', latestVersionCode: 72 })
  };
  for (const name of [...WEB_FILES, 'assets/music/test.ogg']) {
    for (const folder of ['', 'site/', 'ios/App/App/public/']) await put(folder + name, contents[name] || 'current bytes');
  }
  await put('ios/App/App.xcodeproj/project.pbxproj', 'MARKETING_VERSION = 4.0.1;\nCURRENT_PROJECT_VERSION = 72;\n'.repeat(2));
  await put('ios/App/CapApp-SPM/Package.swift', '.package(path: "../../../node_modules/plugin")');
  return { root, put };
}

test('iOS verification detects stale content even when version labels agree', async t => {
  const { root, put } = await fixture(t);
  assert.equal((await verifyIos(root)).assetsMatch, true);
  await put('ios/App/App/public/assets/music/test.ogg', 'old audio');
  const report = await verifyIos(root);
  assert.equal(report.assetsMatch, false);
  assert.ok(report.errors.some(e => e.includes('Stale file: ios/App/App/public/assets/music/test.ogg')));
});

test('iOS verification rejects stale native version and obsolete packaged assets', async t => {
  const { root, put } = await fixture(t);
  await put('ios/App/App.xcodeproj/project.pbxproj', 'MARKETING_VERSION = 3.0.0;\nCURRENT_PROJECT_VERSION = 1;\n'.repeat(2));
  await put('ios/App/App/public/assets/retired.png', 'obsolete');
  const report = await verifyIos(root);
  assert.equal(report.assetsMatch, false);
  assert.ok(report.errors.some(e => e.includes('version mismatch')));
  assert.ok(report.errors.some(e => e.includes('Obsolete packaged asset')));
});

test('iOS preparation refuses conflicting source versions', async t => {
  const { root, put } = await fixture(t);
  await put('package.json', JSON.stringify({ version: '4.0.2' }));
  await assert.rejects(() => sourceIdentity(root), /Source version mismatch/);
});
