import { sourceIdentity } from './ios-release.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyIosReleasePolicy(source, published, live) {
  const policyFields = ['platform', 'packageName', 'latestVersion', 'latestVersionCode',
    'minimumVersion', 'minimumVersionCode', 'forceUpdate', 'published', 'playStoreUrl'];
  if (policyFields.some(field => live[field] !== published[field])
      || !Number.isSafeInteger(live.latestVersionCode) || source.build < live.latestVersionCode) {
    throw new Error(`Cloud checkout ${source.version}/${source.build} does not follow live ${live.latestVersion}/${live.latestVersionCode} with an unchanged published update policy.`);
  }
  // Android and iOS are reviewed independently. A prepared iOS fix may be more
  // than two builds ahead of the published Android app; never change its policy.
}

async function main() {
const source = await sourceIdentity();
const published = JSON.parse(await readFile(new URL('../app-version.json', import.meta.url), 'utf8'));
const response = await fetch('https://space-tower-defense.pages.dev/api/app-version', {
  signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' }
});
if (!response.ok) throw new Error(`Cannot verify live version (${response.status}); stop this release.`);
const live = await response.json();
verifyIosReleasePolicy(source, published, live);
console.log(`Cloud source ${source.version}/${source.build} follows live release ${live.latestVersion}/${live.latestVersionCode}; published update policy is unchanged.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
