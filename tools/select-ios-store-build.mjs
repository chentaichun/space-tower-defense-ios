// Associate the verified iOS build with the existing App Store draft.
// Runs in the already-configured Codemagic App Store Connect integration.
// Never prints or persists the private key or bearer token.
import { readFile } from 'node:fs/promises';
import { sign } from 'node:crypto';

const VERSION_ID = '1d4d448f-cc2e-4938-9f84-e9e37d3fc5fb';
const BUILD_ID = '8b12269e-8d61-4a63-8629-17ab8463f811';
const APP_ID = '6815095860';

let key = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
if (!key) throw new Error('App Store Connect integration private key missing.');
if (key.startsWith('@file:')) key = await readFile(key.slice(6), 'utf8');
else if (key.startsWith('/')) key = await readFile(key, 'utf8');
key = key.replaceAll('\\n', '\n').trim();
if (!key.includes('-----BEGIN PRIVATE KEY-----')) key = Buffer.from(key, 'base64').toString('utf8').trim();
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function authorization() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({alg:'ES256',kid:process.env.APP_STORE_CONNECT_KEY_IDENTIFIER,typ:'JWT'})}.${encode({iss:process.env.APP_STORE_CONNECT_ISSUER_ID,iat:now,exp:now+600,aud:'appstoreconnect-v1'})}`;
  return `Bearer ${unsigned}.${sign('sha256', Buffer.from(unsigned), {key,dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
}
async function api(method, path, body) {
  const response = await fetch(`https://api.appstoreconnect.apple.com/v1/${path}`, {
    method,
    headers: { Authorization: authorization(), 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : {body:JSON.stringify(body)}),
    signal: AbortSignal.timeout(60000),
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`Apple API ${method} ${path}: HTTP ${response.status} ${JSON.stringify(result?.errors ?? [])}`);
  return result;
}

const versionResponse = await api('GET', `appStoreVersions/${VERSION_ID}?include=app`);
const buildResponse = await api('GET', `builds/${BUILD_ID}?include=app`);
const version = versionResponse.data;
const build = buildResponse.data;
const versionAppId = version.relationships?.app?.data?.id ?? versionResponse.included?.find(item => item.type === 'apps')?.id;
const buildAppId = build.relationships?.app?.data?.id ?? buildResponse.included?.find(item => item.type === 'apps')?.id;
if (version.attributes.versionString !== '2.9.30' || versionAppId !== APP_ID ||
    build.attributes.version !== '64.3' || buildAppId !== APP_ID) {
  throw new Error('Expected App Store version 2.9.30 and matching app build 64.3; no change made.');
}
const path = `appStoreVersions/${VERSION_ID}/relationships/build`;
const before = (await api('GET', path)).data?.id ?? null;
if (before !== BUILD_ID) {
  await api('PATCH', path, {data:{type:'builds',id:BUILD_ID}});
}
const after = (await api('GET', path)).data?.id ?? null;
if (after !== BUILD_ID) throw new Error(`Apple did not retain build 64.3; current build ID: ${after}`);
console.log(JSON.stringify({version:'2.9.30',versionState:version.attributes.appStoreState,build:'64.3',before,after,verified:true}));
