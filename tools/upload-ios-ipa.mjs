// Upload the verified IPA with an explicit App Store Connect app ID.
// Xcode 26.4's altool could not resolve the app from the bundle ID alone
// ("Cannot determine the Apple ID from Bundle ID", Codemagic build 9).
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const APP_ID = '6815095860';
const BUNDLE_ID = 'com.mrchen.spacetowerdefense';
const keyId = process.env.APP_STORE_CONNECT_KEY_IDENTIFIER;
const issuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
let key = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
if (!keyId || !issuer || !key) throw new Error('App Store Connect integration credentials missing.');
if (key.startsWith('@file:')) key = await readFile(key.slice(6), 'utf8');
else if (key.startsWith('/')) key = await readFile(key, 'utf8');
key = key.replaceAll('\\n', '\n').trim();
if (!key.includes('-----BEGIN PRIVATE KEY-----')) key = Buffer.from(key, 'base64').toString('utf8').trim();

const release = JSON.parse(await readFile(new URL('../ios/release-build.json', import.meta.url), 'utf8'));
const ipaDir = 'build/ios/ipa';
const ipa = (await readdir(ipaDir)).find(name => name.endsWith('.ipa'));
if (!ipa) throw new Error('No IPA found to upload.');

// altool looks for AuthKey_<id>.p8 in ~/private_keys; never print the key.
const keyDir = join(homedir(), 'private_keys');
await mkdir(keyDir, { recursive: true });
await writeFile(join(keyDir, `AuthKey_${keyId}.p8`), key + '\n', { mode: 0o600 });

const result = spawnSync('xcrun', ['altool', '--upload-package', join(ipaDir, ipa), '--type', 'ios',
  '--apple-id', APP_ID, '--bundle-id', BUNDLE_ID,
  '--bundle-version', release.iosBuild, '--bundle-short-version-string', release.gameVersion,
  '--apiKey', keyId, '--apiIssuer', issuer], { stdio: 'inherit' });
if (result.error || result.status !== 0) throw result.error || new Error(`altool upload failed (${result.status}).`);
console.log(`Uploaded ${ipa} as ${release.gameVersion} (${release.iosBuild}) to app ${APP_ID}.`);
