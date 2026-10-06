// Read-only TestFlight verification through the existing Codemagic integration.
import { readFile } from 'node:fs/promises';
import { sign } from 'node:crypto';
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
  if (method !== 'GET') throw new Error('This verification script is read-only.');
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

const release = JSON.parse(await readFile(new URL('../ios/release-build.json', import.meta.url), 'utf8'));
const response = await api('GET', `builds?filter[app]=${APP_ID}&filter[version]=${release.iosBuild}&include=app,preReleaseVersion,buildBetaDetail,betaGroups,betaAppReviewSubmission&limit=10`);
const included = response.included || [];
const related = (item, name) => {
  const links = item.relationships?.[name]?.data;
  return (Array.isArray(links) ? links : links ? [links] : []).map(link => included.find(value => value.type === link.type && value.id === link.id)).filter(Boolean);
};
const builds = response.data.map(build => {
  const app = related(build, 'app')[0];
  const version = related(build, 'preReleaseVersion')[0];
  if (app?.id !== APP_ID || build.attributes.version !== release.iosBuild || version?.attributes.version !== release.gameVersion) {
    throw new Error('Unexpected build identity; verification stopped.');
  }
  return {id:build.id, ...build.attributes, version:version.attributes.version,
    iosBuild:build.attributes.version, beta:related(build,'buildBetaDetail').map(x=>x.attributes),
    groups:related(build,'betaGroups').map(x=>({id:x.id,name:x.attributes.name})),
    review:related(build,'betaAppReviewSubmission').map(x=>x.attributes)};
});
const groups = await api('GET', `betaGroups?filter[app]=${APP_ID}&include=builds&limit=50`);
console.log(JSON.stringify({readOnly:true,checkedAt:new Date().toISOString(),expectedVersion:release.gameVersion,expectedBuild:release.iosBuild,builds,
  existingGroups:groups.data.map(group=>({id:group.id,name:group.attributes.name,isInternalGroup:group.attributes.isInternalGroup,
    builds:group.relationships?.builds?.data?.map(link=>({id:link.id,build:groups.included?.find(x=>x.type==='builds'&&x.id===link.id)?.attributes.version}))}))}, null, 2));

