// Run with the local preview server and an installed Playwright module.
// All API traffic is intercepted. Player requests use the real handler with disposable in-memory storage.
const assert = require('node:assert/strict');
const { writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
class MemoryKV {
  records = new Map();
  async get(key, type) { const value = this.records.get(key); return value === undefined ? null : type === 'json' ? JSON.parse(value) : value; }
  async put(key, value) { this.records.set(key, String(value)); }
  async delete(key) { this.records.delete(key); }
  async list({ prefix = '' } = {}) { return { keys: [...this.records.keys()].filter(k => k.startsWith(prefix)).map(name => ({name})), list_complete: true }; }
}
(async () => {
  const {onRequestPost} = await import('../functions/api/player.js');
  const {onRequestPost: guest} = await import('../functions/api/player/guest.js');
  const output = resolve('tmp/ios-login-20261006'); mkdirSync(output, {recursive:true});
  const results=[];
  for (const engine of ['chromium','webkit']) {
    const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({channel:'msedge',headless:true}));
    try {
      for (const [width,height] of [[393,852],[375,667],[852,393],[820,1180]]) {
        const env = {FEEDBACK_STORE:new MemoryKV()};
        const request = body => new Request('https://example.test/api/player', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        const guestData = await (await guest({env,request:request({installationId:'dialog-qa-installation-1234'})})).json();
        const page = await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
        page.setDefaultTimeout(8000);
        const errors=[];const calls=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.addInitScript(({name,sessionToken}) => {
          window.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{}};
          localStorage.setItem('spaceTowerPlayerSession',sessionToken);
          localStorage.setItem('spaceTowerPlayerName',name);
          localStorage.setItem('spaceTowerLanguage','zh');
        }, {name:guestData.player.name,sessionToken:guestData.sessionToken});
        await page.route('**/api/**',async route => {
          const req=route.request(),path=new URL(req.url()).pathname;
          if(path==='/api/player' && req.method()==='POST') {
            const response=await onRequestPost({env,request:new Request(req.url(),{method:'POST',headers:req.headers(),body:req.postData()})});
            const data=await response.json();calls.push({action:req.postDataJSON().action,name:data.player?.name,status:response.status});
            return route.fulfill({status:response.status,json:data});
          }
          return route.fulfill({json:{}});
        });
        try {
          await page.goto(process.env.ACCOUNT_QA_URL || 'http://127.0.0.1:4186/?dev=0&lang=zh');
          await page.waitForFunction(()=>typeof window.renderPilotLoginToggle==='function' && cloudSaveReady);
          await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
          await page.locator('#pilotLoginToggle').click();
          assert.equal(await page.locator('#pilotAccountDialog').evaluate(d=>d.matches(':modal')),true);
          for (const id of ['loginName','loginPassword','accountSignInTab','accountRegisterTab']) assert.equal(await page.locator('#'+id).isVisible(),true,id);
          assert.equal(await page.locator('#googleSignInButton').isVisible(),false,'iOS must hide Google sign-in');
          await page.locator('#accountRegisterTab').click();
          await page.locator('#loginName').fill('DialogPilotOne');
          await page.locator('#loginPassword').fill('DialogTestPass123!');
          await page.locator('#registerButton').click();
          await page.waitForFunction(()=>sessionPlayerName==='DialogPilotOne' && !authBusy && cloudSaveReady);
          await page.evaluate(()=>document.querySelectorAll('dialog[open]:not(#pilotAccountDialog)').forEach(d=>d.close()));
          await page.locator('#newAccountButton').click();
          await page.locator('#loginName').fill('DialogPilotTwo');
          await page.locator('#loginPassword').fill('DialogTestPass123!');
          await page.locator('#registerButton').click();
          await page.waitForFunction(()=>sessionPlayerName==='DialogPilotTwo' && !authBusy && cloudSaveReady);
          await page.locator('#savedAccountSelect').selectOption('dialogpilotone');
          await page.locator('#useSavedAccountButton').click();
          await page.waitForFunction(()=>sessionPlayerName==='DialogPilotOne' && !authBusy && cloudSaveReady);
          await page.locator('#accountSignInTab').click();
          await page.locator('#loginName').fill('DialogPilotTwo');
          await page.locator('#loginPassword').fill('wrong-password');
          await page.locator('#startButton').click();
          await page.waitForFunction(()=>!authBusy && loginStatus.textContent.length>0 && !cloudSaveReady);
          assert.ok(calls.some(c=>c.status===401),'wrong password must fail');
          await page.locator('#loginPassword').fill('DialogTestPass123!');
          await page.locator('#loginPassword').press('Enter');
          await page.waitForFunction(()=>sessionPlayerName==='DialogPilotTwo' && !authBusy && cloudSaveReady);
          await page.locator('#pilotLoginToggle').click();
          assert.equal(await page.locator('#pilotAccountDialog').isVisible(),false);
          await page.locator('#pilotAccountChange').click();
          assert.equal(await page.locator('#loginName').isVisible(),true);
          await page.setViewportSize({width,height:Math.min(390,height)});
          await page.locator('#loginName').fill('DialogPilotTwo');
          await page.locator('#loginPassword').fill('DialogTestPass123!');
          await page.locator('#startButton').click();
          await page.waitForFunction(()=>!authBusy && cloudSaveReady);
          const rect=await page.locator('#pilotAccountDialog').boundingBox();
          assert.ok(rect.x>=0 && rect.y>=0 && rect.y+rect.height<=Math.min(390,height)+1,'dialog fits reduced visual viewport');
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#pilotAccountDialog').isVisible(),false);
          await page.setViewportSize({width,height});
          await page.locator('#pilotLoginToggle').click();
          await page.locator('#pilotAccountDialog').evaluate(d=>d.scrollTop=0);
          await page.screenshot({path:resolve(output,`${engine}-${width}x${height}.png`)});
          assert.deepEqual(errors,[]);
          results.push({engine,width,height,passed:true,requests:calls.length});
          console.log(`PASS ${engine} ${width}x${height}: guest, registration, saved switch, password login, retry, Enter, close/reopen, small viewport`);
        } catch(error) {
          await page.screenshot({path:resolve(output,`${engine}-${width}-failure.png`)});
          console.error({errors,calls});throw error;
        } finally { await page.close(); }
      }
    } finally { await browser.close(); }
  }
  writeFileSync(resolve(output,'browser-qa.json'),JSON.stringify({checkedAt:new Date().toISOString(),physicalDeviceVerified:false,results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
