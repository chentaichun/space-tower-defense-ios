// Copy a reviewed source allowlist into the public Git checkout. Never push implicitly.
import {readFile, readdir, mkdir, writeFile, copyFile, unlink, lstat} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {WEB_FILES} from './ios-release.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const destination = args.find(x => !x.startsWith('--'));
if (!destination) throw new Error('Usage: node tools/sync-public-source.mjs DESTINATION [--check] [--update-reviewed]');
const target = resolve(destination);
const check = args.includes('--check');
const git = (...argv) => execFileSync('git', ['-C', target, ...argv], {encoding:'utf8'}).trim();
if (target === resolve(root) || !relative(root,target).startsWith('..')) throw new Error('Use a separate Git checkout outside the playable source.');
if (!/^https:\/\/github\.com\/chentaichun\/space-tower-defense-ios(?:\.git)?$|^git@github\.com:chentaichun\/space-tower-defense-ios\.git$/.test(git('remote','get-url','origin'))) throw new Error('Unexpected destination remote.');
if (git('branch','--show-current') !== 'main') throw new Error('Synchronize main only; preserve the independent iOS build branch.');
if (!check && git('status','--porcelain') && !args.includes('--update-reviewed')) throw new Error('Destination has changes. Review them before using --update-reviewed.');

const names = new Set([...WEB_FILES, 'README.md','docs/GITHUB_SYNC.md','.gitleaks.toml',
  'package.json','package-lock.json','capacitor.config.json','check_index_syntax.mjs',
  'build-android.ps1','codemagic.yaml','wrangler.toml','wrangler.ranked.toml',
  '_headers','robots.txt','sitemap.xml','admin.html','v2-balance-sim.mjs',
  'APPLE_APP_STORE_LISTING.md','IOS_CLOUD_BUILD.md','IOS_RELEASE_CHECKLIST.md',
  'release/admob.closed-test.js','release/admob.production.js']);
const excludedDirs = new Set(['.git','.gradle','.idea','.wrangler','node_modules','build','Pods','DerivedData','xcuserdata','public','__pycache__']);
const unsafeName = name => /(?:^|\/)(?:\.env[^/]*|\.dev\.vars[^/]*|\.admin-key\.txt|local\.properties|key\.properties|keystore\.properties|[^/]*upload-key[^/]*)$|\.(?:jks|keystore|p8|p12|pem|mobileprovision|aab|apk|ipa|log|pyc)$/i.test(name);
async function collect(folder, accept) {
  for (const entry of await readdir(resolve(root,folder),{withFileTypes:true})) {
    const name = `${folder}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlink rejected: ${name}`);
    if (excludedDirs.has(entry.name) || entry.name.startsWith('.') || unsafeName(name)) continue;
    if (name === 'android/app/src/main/assets') continue;
    if (entry.isDirectory()) await collect(name,accept);
    else if (accept(name)) names.add(name);
  }
}
await collect('assets',()=>true);
await collect('functions',name=>name.endsWith('.js')&&!name.endsWith('/dev-test.js'));
await collect('server',name=>/\.(mjs|js|json)$/.test(name));
await collect('migrations',name=>name.endsWith('.sql'));
await collect('tests',name=>/\.(mjs|js|json)$/.test(name));
await collect('tools',name=>/\.(mjs|cjs|js|py|ps1|sh|yaml|html)$/.test(name)&&!name.endsWith('/sync_ranked_balance_doc.py'));
await collect('android',name=>/\.(gradle|properties|java|kt|xml|json|png|webp|jar|bat|pro)$/.test(name)||name==='android/gradlew');
await collect('ios',name=>/\.(swift|plist|pbxproj|xcscheme|xcworkspacedata|xcsettings|xcconfig|storyboard|json|png|xml|podspec)$/.test(name));
// This independent iOS source snapshot is required by the native-version regression test.
names.add('ios/App/App/public/index.html');

const adminSecret = await readFile(resolve(root,'.admin-key.txt'),'utf8').then(x=>x.trim()).catch(()=> '');
const secretPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/]{20,}|\bgh[pousr]_[A-Za-z0-9]{25,}|\bgithub_pat_[A-Za-z0-9_]{30,}|\bAKIA[A-Z0-9]{16}\b/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function safeTarget(name) {
  const path = resolve(target,name), rel = relative(target,path);
  if (!rel || rel.startsWith('..') || isAbsolute(rel) || name.split('/').includes('.git')) throw new Error('Unsafe destination path.');
  return path;
}
const manifest = [];
for (const name of [...names].sort()) {
  if (unsafeName(name)) throw new Error(`Disallowed file: ${name}`);
  const source = resolve(root,name);
  if ((await lstat(source)).isSymbolicLink()) throw new Error(`Symlink rejected: ${name}`);
  const bytes = await readFile(source);
  if (bytes.length > 50*1024*1024) throw new Error(`Oversized source file: ${name}`);
  const text = bytes.toString('utf8');
  if (secretPattern.test(text) || (adminSecret.length>8 && text.includes(adminSecret))) throw new Error(`Potential credential in ${name}; sync stopped.`);
  manifest.push({path:name,sha256:hash(bytes)});
}
const pkg = JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const android = await readFile(resolve(root,'android/app/build.gradle'),'utf8');
const ios = JSON.parse(await readFile(resolve(root,'ios/release-build.json'),'utf8'));
const ignore = `node_modules/\nsite/\nbuild/\n.wrangler/\n.env*\n.dev.vars*\n.admin-key.txt\n*.jks\n*.keystore\n*.p8\n*.p12\n*.pem\n*.mobileprovision\n*upload-key*\n*.aab\n*.apk\n*.ipa\n*.log\n**/__pycache__/\n**/.gradle/\n**/build/\n**/xcuserdata/\n**/local.properties\nandroid/app/src/main/assets/\nios/App/App/public/*\n!ios/App/App/public/index.html\nrelease/*\n!release/admob.closed-test.js\n!release/admob.production.js\n.DS_Store\n`;
const generated = new Map([
  ['.gitignore',ignore],['.gitattributes','* -text\n'],
  ['source-snapshot.json',JSON.stringify({version:pkg.version,androidBuild:Number(android.match(/versionCode\s+(\d+)/)[1]),ios,files:manifest},null,2)+'\n']
]);
const previous = await readFile(safeTarget('source-snapshot.json'),'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return {files:[]};throw e;});
const changes=[];
for (const file of manifest) {
  const current = await readFile(safeTarget(file.path)).then(hash).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if (current!==file.sha256) changes.push(file.path);
}
for (const [name,contents] of generated) {
  const current = await readFile(safeTarget(name),'utf8').catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if (current!==contents) changes.push(name);
}
const deleted = previous.files.map(f=>f.path).filter(name=>!names.has(name)&&!generated.has(name));
// Validate every deletion path before any mutation. Never recursively remove directories.
for (const name of deleted) safeTarget(name);
if (!check) {
  for (const file of manifest) {
    const path=safeTarget(file.path);
    await mkdir(dirname(path),{recursive:true});
    await copyFile(resolve(root,file.path),path);
  }
  for (const [name,contents] of generated) await writeFile(safeTarget(name),contents);
  for (const name of deleted) await unlink(safeTarget(name)).catch(e=>{if(e.code!=='ENOENT')throw e;});
}
console.log(JSON.stringify({version:pkg.version,files:manifest.length,changed:changes.length,removed:deleted.length,credentialScan:'passed',mode:check?'check':'stage',destination:target},null,2));
if (check && (changes.length||deleted.length)) { console.log(JSON.stringify({changes,deleted},null,2)); process.exitCode=1; }
