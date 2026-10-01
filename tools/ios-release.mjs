import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const WEB_FILES = ['index.html', 'privacy.html', 'app-ads.txt', 'app-version.json', 'admob-config.js',
  'v2.css', 'v2-i18n.js', 'v2-features.js', 'ultimate-system.css', 'ultimate-system.js',
  'engagement-system.css', 'expansion-system.css', 'expansion-system.js', 'telemetry-system.js',
  'progression-ux.js', 'update-system.css', 'update-system.js', 'ui-refinement.css',
  'render-performance.js', 'starter-pack.js', 'starter-pack.css', 'sale-promotion.js', 'sale-promotion.css', 'emerald-effects.js'];
const PROJECT = 'ios/App/App.xcodeproj/project.pbxproj';
const PUBLIC = 'ios/App/App/public';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const read = (root, name) => readFile(resolve(root, name), 'utf8');

async function filesIn(root, folder) {
  const files = [];
  for (const entry of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const name = `${folder}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed in release assets: ${name}`);
    if (entry.isDirectory()) files.push(...await filesIn(root, name));
    else if (entry.isFile()) files.push(name);
  }
  return files.sort();
}

export async function sourceIdentity(root = ROOT) {
  const pkg = JSON.parse(await read(root, 'package.json'));
  const manifest = JSON.parse(await read(root, 'app-version.json'));
  const html = await read(root, 'index.html');
  const version = html.match(/data-game-version="([^"]+)"/)?.[1];
  const build = Number(html.match(/data-game-version-code="(\d+)"/)?.[1]);
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version) || version !== pkg.version
      || !Number.isSafeInteger(build) || build < 1
      || !Number.isSafeInteger(manifest.latestVersionCode) || manifest.latestVersionCode > build
      || !Number.isSafeInteger(manifest.minimumVersionCode) || manifest.minimumVersionCode > manifest.latestVersionCode
      || (manifest.latestVersionCode === build && manifest.latestVersion !== version)) {
    throw new Error('Source version mismatch: build identity must match, and the published update manifest cannot be ahead of the build.');
  }
  const lock = JSON.parse(await read(root, 'package-lock.json'));
  if (lock.version !== version || lock.packages[''].version !== version) throw new Error('Lockfile version mismatch.');
  const iosRelease = await read(root, 'ios/release-build.json').then(JSON.parse).catch(error => {
    if (error.code === 'ENOENT') return { gameVersion: version, gameBuild: build, iosBuild: String(build) };
    throw error;
  });
  if (iosRelease.gameVersion !== version || iosRelease.gameBuild !== build
      || !new RegExp(`^${build}(?:\\.[1-9][0-9]{0,3})?$`).test(iosRelease.iosBuild)) {
    throw new Error('iOS build revision does not match the current game release.');
  }
  return { version, build, iosBuild: String(iosRelease.iosBuild), bundleId: 'com.mrchen.spacetowerdefense' };
}

export async function syncWeb(root = ROOT) {
  for (const name of [...WEB_FILES, ...await filesIn(root, 'assets')]) {
    const destination = resolve(root, 'site', name);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(root, name), destination);
  }
}

export async function verifyIos(root = ROOT) {
  const identity = await sourceIdentity(root);
  const errors = [];
  const project = await read(root, PROJECT);
  const versions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(m => m[1]);
  const builds = [...project.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map(m => m[1]);
  if (versions.length !== 2 || versions.some(v => v !== identity.version)) errors.push('Xcode Debug/Release version mismatch.');
  if (builds.length !== 2 || builds.some(v => v !== identity.iosBuild)) errors.push('Xcode Debug/Release build mismatch.');
  const spm = await read(root, 'ios/App/CapApp-SPM/Package.swift');
  if (/path: "[^"\n]*\\/.test(spm)) errors.push('Swift package paths contain Windows separators.');
  const files = [];
  for (const name of [...WEB_FILES, ...await filesIn(root, 'assets')].sort()) {
    const sourceHash = sha256(await readFile(resolve(root, name)));
    for (const folder of ['site', PUBLIC]) {
      try {
        if (sha256(await readFile(resolve(root, folder, name))) !== sourceHash) errors.push(`Stale file: ${folder}/${name}`);
      } catch { errors.push(`Missing file: ${folder}/${name}`); }
    }
    files.push({ path: name, sha256: sourceHash });
  }
  const sourceAssets = new Set(files.filter(f => f.path.startsWith('assets/')).map(f => f.path));
  for (const packaged of await filesIn(root, `${PUBLIC}/assets`)) {
    const name = packaged.slice(PUBLIC.length + 1);
    if (!sourceAssets.has(name)) errors.push(`Obsolete packaged asset: ${name}`);
  }
  return { ...identity, checkedAt: new Date().toISOString(), assetsMatch: errors.length === 0,
    fileCount: files.length, contentSha256: sha256(JSON.stringify(files)), files, errors,
    nativeBuildVerified: false, appStoreSubmitted: false };
}

async function prepareIos(root) {
  const identity = await sourceIdentity(root);
  await syncWeb(root);
  const cli = resolve(root, 'node_modules/@capacitor/cli/bin/capacitor');
  const result = spawnSync(process.execPath, [cli, 'sync', 'ios'], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error || new Error(`Capacitor sync failed (${result.status}).`);
  const project = await read(root, PROJECT);
  await writeFile(resolve(root, PROJECT), project
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${identity.version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${identity.iosBuild};`));
  // Capacitor's Windows-generated relative paths are invalid in Swift string literals.
  // Repair only generated path arguments; repeat after each sync, never edit node_modules.
  const spmPath = resolve(root, 'ios/App/CapApp-SPM/Package.swift');
  const spm = await readFile(spmPath, 'utf8');
  await writeFile(spmPath, spm.replace(/path: "([^"\n]+)"/g, (_, path) => `path: "${path.replaceAll('\\', '/')}"`));
}

async function main() {
  const command = process.argv[2];
  if (command === 'sync-web') { await syncWeb(); console.log('Web assets synchronized.'); return; }
  if (!['prepare', 'verify'].includes(command)) throw new Error('Usage: node tools/ios-release.mjs prepare|verify|sync-web');
  if (command === 'prepare') await prepareIos(ROOT);
  const report = await verifyIos();
  const reportPath = resolve(ROOT, 'release/ios/source-verification.json');
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, files: undefined, report: relative(ROOT, reportPath) }, null, 2));
  if (!report.assetsMatch) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
