// Curated build snapshot; never upload the working folder wholesale.
import { copyFile, mkdir, readFile, readdir, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, WEB_FILES, verifyIos } from './ios-release.mjs';

const destination = resolve(ROOT, 'release/ios-cloud-source');
const verification = await verifyIos();
if (!verification.assetsMatch) throw new Error(verification.errors.join('\n'));
const names = new Set([...WEB_FILES,
  'tools/ios-capture-flow.yaml', 'tools/qa-account-dialog.cjs', 'tools/account-qa-server.mjs', 'tools/inspect-ios-testflight.mjs',
  'package.json', 'package-lock.json', 'capacitor.config.json', 'check_index_syntax.mjs',
  'codemagic.yaml', 'IOS_RELEASE_CHECKLIST.md', 'IOS_CLOUD_BUILD.md', 'APPLE_APP_STORE_LISTING.md',
  'tools/ios-release.mjs', 'tools/verify-ios-live-version.mjs', 'tools/verify-ios-bundle.py', 'tools/verify-ios-ipa.py', 'tools/ios-simulator-smoke.sh', 'tools/upload-ios-screenshots.mjs', 'tools/select-ios-store-build.mjs',
  'build-android.ps1', 'release/admob.closed-test.js', 'release/admob.production.js',
  'android/build.gradle', 'android/app/build.gradle', 'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/res/values/strings.xml',
  'android/app/src/main/java/com/mrchen/spacetowerdefense/GooglePlayBillingPlugin.java']);

async function collect(folder, accept) {
  for (const entry of await readdir(resolve(ROOT, folder), { withFileTypes: true })) {
    const name = `${folder}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${name}`);
    if (name.includes('/public') || name.includes('/build') || name.includes('/xcuserdata') || entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) await collect(name, accept);
    else if (accept(name)) names.add(name);
  }
}
await collect('assets', () => true);
await collect('ios', name => /\.(swift|plist|pbxproj|xcscheme|xcworkspacedata|xcsettings|xcconfig|storyboard|json|png|xml|podspec)$/.test(name));
await collect('functions', name => name.endsWith('.js') && !name.endsWith('/dev-test.js'));
await collect('migrations', name => name.endsWith('.sql'));
await collect('tests', name => name.endsWith('.test.mjs'));

// Check content without printing any secret values or matching snippets.
const knownAdminSecret = await readFile(resolve(ROOT, '.admin-key.txt'), 'utf8').then(x => x.trim()).catch(() => '');
const secretPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/]{20,}|\bgh[pousr]_[A-Za-z0-9]{25,}|\bgithub_pat_[A-Za-z0-9_]{30,}/;
const manifest = [];
for (const name of [...names].sort()) {
  const bytes = await readFile(resolve(ROOT, name));
  if (/\.(txt|json|js|mjs|py|ps1|java|gradle|md|yaml|plist|xml|sql|swift|pbxproj|xcconfig)$/.test(name)) {
    const text = bytes.toString('utf8');
    if (secretPattern.test(text) || (knownAdminSecret.length > 8 && text.includes(knownAdminSecret))) {
      throw new Error(`Potential credential in ${name}; snapshot stopped.`);
    }
  }
  manifest.push({ path: name, sha256: createHash('sha256').update(bytes).digest('hex') });
}
try { await access(destination); if (!process.argv.includes('--update-reviewed')) throw new Error('Snapshot already exists; review it before replacing.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const { path } of manifest) {
  const target = resolve(destination, path);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(ROOT, path), target);
}
await writeFile(resolve(destination, '.gitignore'), 'node_modules/\nsite/\nbuild/\nrelease/ios/\nios/App/App/public/\n**/xcuserdata/\n.DS_Store\n.env*\n*.p8\n*.p12\n*.mobileprovision\n*.jks\n.admin-key.txt\n.wrangler/\n');
await writeFile(resolve(destination, '.gitattributes'), '* -text\n');
await writeFile(resolve(destination, 'source-snapshot.json'), JSON.stringify({ version: verification.version,
  build: verification.build, gameContentSha256: verification.contentSha256, files: manifest }, null, 2) + '\n');
console.log(JSON.stringify({ destination, version: verification.version, build: verification.build,
  files: manifest.length, credentialScan: 'passed', uploaded: false }, null, 2));
