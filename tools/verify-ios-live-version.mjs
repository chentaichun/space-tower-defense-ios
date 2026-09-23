import { sourceIdentity } from './ios-release.mjs';

const source = await sourceIdentity();
const response = await fetch('https://space-tower-defense.pages.dev/api/app-version', {
  signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' }
});
if (!response.ok) throw new Error(`Cannot verify live version (${response.status}); stop this release.`);
const live = await response.json();
if (live.latestVersion !== source.version || live.latestVersionCode !== source.build) {
  throw new Error(`Cloud checkout ${source.version}/${source.build} differs from live ${live.latestVersion}/${live.latestVersionCode}. Refresh the release source before building.`);
}
console.log(`Cloud source matches live release: ${source.version}/${source.build}`);
