import { sourceIdentity } from './ios-release.mjs';
import { readFile } from 'node:fs/promises';

const source = await sourceIdentity();
const published = JSON.parse(await readFile(new URL('../app-version.json', import.meta.url), 'utf8'));
const response = await fetch('https://space-tower-defense.pages.dev/api/app-version', {
  signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' }
});
if (!response.ok) throw new Error(`Cannot verify live version (${response.status}); stop this release.`);
const live = await response.json();
if (live.latestVersion !== published.latestVersion || live.latestVersionCode !== published.latestVersionCode
    || live.minimumVersion !== published.minimumVersion || live.minimumVersionCode !== published.minimumVersionCode
    || source.build < live.latestVersionCode || source.build > live.latestVersionCode + 1) {
  throw new Error(`Cloud checkout ${source.version}/${source.build} does not follow live ${live.latestVersion}/${live.latestVersionCode} with an unchanged published update policy.`);
}
console.log(`Cloud source ${source.version}/${source.build} follows live release ${live.latestVersion}/${live.latestVersionCode}; published update policy is unchanged.`);
