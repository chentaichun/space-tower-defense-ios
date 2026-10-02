// Upload actual simulator captures to the existing Apple draft, never submit review.
import { readFile } from 'node:fs/promises';
import { createHash, sign } from 'node:crypto';
const versionId = '1d4d448f-cc2e-4938-9f84-e9e37d3fc5fb';
let key = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
if (!key) throw new Error('Apple integration private key missing');
if (key.startsWith('@file:')) key = await readFile(key.slice(6), 'utf8');
else if (key.startsWith('/')) key = await readFile(key, 'utf8');
key = key.replaceAll('\\n','\n').trim();
if (!key.includes('-----BEGIN PRIVATE KEY-----')) key = Buffer.from(key,'base64').toString('utf8').trim();
const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
function token() {
  const now = Math.floor(Date.now()/1000);
  const value = `${enc({alg:'ES256',kid:process.env.APP_STORE_CONNECT_KEY_IDENTIFIER,typ:'JWT'})}.${enc({iss:process.env.APP_STORE_CONNECT_ISSUER_ID,iat:now,exp:now+600,aud:'appstoreconnect-v1'})}`;
  return `${value}.${sign('sha256',Buffer.from(value),{key,dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
}
async function api(method, path, data, version = 'v1') {
  const result = await fetch(`https://api.appstoreconnect.apple.com/${version}/${path}`, {
    method, headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},
    ...(data ? {body:JSON.stringify({data})}:{}), signal:AbortSignal.timeout(60000)
  });
  const body = result.status===204 ? {} : await result.json();
  if (!result.ok) {
    const error = new Error(`${method} ${path}: ${JSON.stringify(body.errors)}`);
    error.status = result.status;
    throw error;
  }
  return body.data;
}
const locales = await api('GET', `appStoreVersions/${versionId}/appStoreVersionLocalizations`);
if (process.argv.includes('--check-auth')) {
  console.log(`Apple integration authenticated; ${locales.length} listing locales found.`);
}
const captureFamily = process.env.STD_CAPTURE_FAMILY;
if (process.env.STD_CAPTURE_LISTING_ONLY === '1' && captureFamily) {
  const display = captureFamily === 'iphone' ? 'APP_IPHONE_65' : 'APP_IPAD_PRO_3GEN_129';
  for (const locale of locales) {
    const sets = await api('GET',`appStoreVersionLocalizations/${locale.id}/appScreenshotSets`);
    const set = sets.find(x => x.attributes.screenshotDisplayType === display);
    if (!set) continue;
    const existing = await api('GET',`appScreenshotSets/${set.id}/appScreenshots`);
    for (const old of existing.filter(x => x.attributes.fileName === `native-${captureFamily}-gameplay.png`)) {
      await api('DELETE',`appScreenshots/${old.id}`);
      console.log(`${locale.attributes.locale} ${display}: removed obscured gameplay capture`);
    }
  }
}
for (const [file, display, width, height] of process.argv.includes('--check-auth') ? [] : [
  ...['home','shop','store'].map(phase=>[`iphone-${phase}.png`,'APP_IPHONE_65',1242,2688]),
  ...['home','shop','store'].map(phase=>[`ipad-${phase}.png`,'APP_IPAD_PRO_3GEN_129',2064,2752])
].filter(([file]) => !captureFamily || file.startsWith(`${captureFamily}-`))) {
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
    for (const old of existing.filter(x => x.attributes.fileName === `native-${file}`)) {
      await api('DELETE', `appScreenshots/${old.id}`);
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
if (!process.argv.includes('--check-auth') && process.env.STD_CAPTURE_LISTING_ONLY !== '1') {
  const products = await api('GET','apps/6815095860/inAppPurchasesV2?limit=200');
  for (const product of products) {
    const file = `iphone-${product.attributes.productId}.png`;
    const bytes = await readFile(`build/ios-simulator/smoke/${file}`);
    const checksum = createHash('md5').update(bytes).digest('hex');
    const current = await api('GET',`inAppPurchases/${product.id}/appStoreReviewScreenshot`, undefined, 'v2').catch(error=>{
      if (error.status===404) return null;
      throw error;
    });
    if (current?.attributes?.sourceFileChecksum===checksum && current.attributes.assetDeliveryState?.state==='COMPLETE') continue;
    if (current) await api('DELETE',`inAppPurchaseAppStoreReviewScreenshots/${current.id}`);
    const shot = await api('POST','inAppPurchaseAppStoreReviewScreenshots',{
      type:'inAppPurchaseAppStoreReviewScreenshots',attributes:{fileName:file,fileSize:bytes.length},
      relationships:{inAppPurchaseV2:{data:{type:'inAppPurchases',id:product.id}}}
    });
    for (const op of shot.attributes.uploadOperations) {
      const result = await fetch(op.url,{method:op.method,headers:Object.fromEntries(op.requestHeaders.map(x=>[x.name,x.value])),body:bytes.subarray(op.offset,op.offset+op.length),signal:AbortSignal.timeout(60000)});
      if (!result.ok) throw new Error(`IAP image upload failed: ${result.status}`);
    }
    await api('PATCH',`inAppPurchaseAppStoreReviewScreenshots/${shot.id}`,{
      type:'inAppPurchaseAppStoreReviewScreenshots',id:shot.id,attributes:{uploaded:true,sourceFileChecksum:checksum}
    });
    console.log(`${product.attributes.productId}: actual native review capture uploaded; visual acceptance still required`);
  }
}
