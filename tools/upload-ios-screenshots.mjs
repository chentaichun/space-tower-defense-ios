// Upload actual simulator captures to the existing Apple draft, never submit review.
import { readFile } from 'node:fs/promises';
import { createHash, sign } from 'node:crypto';
const versionId = '1d4d448f-cc2e-4938-9f84-e9e37d3fc5fb';
const key = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
if (!key) throw new Error('Apple integration private key missing');
const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
function token() {
  const now = Math.floor(Date.now()/1000);
  const value = `${enc({alg:'ES256',kid:process.env.APP_STORE_CONNECT_KEY_IDENTIFIER,typ:'JWT'})}.${enc({iss:process.env.APP_STORE_CONNECT_ISSUER_ID,iat:now,exp:now+600,aud:'appstoreconnect-v1'})}`;
  return `${value}.${sign('sha256',Buffer.from(value),{key,dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
}
async function api(method, path, data) {
  const result = await fetch(`https://api.appstoreconnect.apple.com/v1/${path}`, {
    method, headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},
    ...(data ? {body:JSON.stringify({data})}:{}), signal:AbortSignal.timeout(60000)
  });
  const body = await result.json();
  if (!result.ok) throw new Error(`${method} ${path}: ${JSON.stringify(body.errors)}`);
  return body.data;
}
const locales = await api('GET', `appStoreVersions/${versionId}/appStoreVersionLocalizations`);
for (const [file, display, width, height] of [
  ['launch.png','APP_IPHONE_65',1242,2688],
  ['ipad-launch.png','APP_IPAD_PRO_3GEN_129',2064,2752]
]) {
  const bytes = await readFile(`build/ios-simulator/smoke/${file}`);
  const w=bytes.readUInt32BE(16), h=bytes.readUInt32BE(20);
  if (!((w===width&&h===height)||(w===height&&h===width))) throw new Error(`Unexpected native capture size ${file}: ${w}x${h}`);
  const checksum = createHash('md5').update(bytes).digest('hex');
  for (const locale of locales) {
    const sets = await api('GET',`appStoreVersionLocalizations/${locale.id}/appScreenshotSets`);
    let set = sets.find(x => x.attributes.screenshotDisplayType===display);
    if (!set) set = await api('POST','appScreenshotSets',{type:'appScreenshotSets',attributes:{screenshotDisplayType:display},relationships:{appStoreVersionLocalization:{data:{type:'appStoreVersionLocalizations',id:locale.id}}}});
    const existing = await api('GET',`appScreenshotSets/${set.id}/appScreenshots`);
    if (existing.some(x=>x.attributes.sourceFileChecksum===checksum && x.attributes.assetDeliveryState?.state==='COMPLETE')) {
      console.log(`${locale.attributes.locale} ${display}: identical capture already uploaded`); continue;
    }
    const shot = await api('POST','appScreenshots',{type:'appScreenshots',attributes:{fileName:`native-${file}`,fileSize:bytes.length},relationships:{appScreenshotSet:{data:{type:'appScreenshotSets',id:set.id}}}});
    for (const op of shot.attributes.uploadOperations) {
      const response = await fetch(op.url,{method:op.method,headers:Object.fromEntries(op.requestHeaders.map(x=>[x.name,x.value])),body:bytes.subarray(op.offset,op.offset+op.length),signal:AbortSignal.timeout(60000)});
      if (!response.ok) throw new Error(`Apple asset upload failed: ${response.status}`);
    }
    await api('PATCH',`appScreenshots/${shot.id}`,{type:'appScreenshots',id:shot.id,attributes:{uploaded:true,sourceFileChecksum:checksum}});
    console.log(`${locale.attributes.locale} ${display}: draft screenshot ${shot.id} uploaded (${w}x${h}); visual acceptance still required`);
  }
}
