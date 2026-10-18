// Release operator utility. Reads the user-supplied key outside the repository.
// Never prints or persists the private key or bearer token.
import { readFile } from 'node:fs/promises';
import { sign } from 'node:crypto';
const keyPath = process.env.APPLE_KEY_PATH;
if (!keyPath) throw new Error('Set APPLE_KEY_PATH to the private .p8 file outside the repository.');
const key = await readFile(keyPath, 'utf8');
const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
const now = Math.floor(Date.now()/1000);
const head = enc({alg:'ES256',kid:process.env.APPLE_KEY_ID,typ:'JWT'});
const body = enc({iss:process.env.APPLE_ISSUER_ID,iat:now,exp:now+600,aud:'appstoreconnect-v1'});
const unsigned = `${head}.${body}`;
const token = `${unsigned}.${sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
const [method='GET', path, payloadFile] = process.argv.slice(2);
if (!path?.startsWith('/v1/') && !path?.startsWith('/v2/')) throw new Error('Expected Apple API resource path.');
if (!['GET','POST','PATCH','DELETE'].includes(method)) throw new Error('Unsupported method.');
const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
  method, headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  ...(payloadFile ? {body:await readFile(payloadFile,'utf8')} : {})
});
const responseText = await response.text();
const result = responseText ? JSON.parse(responseText) : { status: response.status };
// Profiles/certificates contain signed binary data; omit it from normal console output.
console.log(JSON.stringify(result,(name,value)=> ['profileContent','certificateContent'].includes(name)? '[binary omitted]':value,2));
if (!response.ok) process.exitCode=1;
