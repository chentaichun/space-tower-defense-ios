import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const v2=readFileSync(new URL('../v2-features.js',import.meta.url),'utf8');
const expansion=readFileSync(new URL('../expansion-system.js',import.meta.url),'utf8');
const starter=readFileSync(new URL('../starter-pack.js',import.meta.url),'utf8');
const fn=(source,name)=>source.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))[0];

test('rendering an equipped background never normalizes the whole shop and respects live VIP access',()=>{
  let vip=true,normalizations=0;
  const c={shopState:{backgroundStore:{equipped:'vip'}},V2_BACKGROUND_DEFS:[{id:'vip',vipExclusive:true},{id:'normal'}],
    getBackgroundStoreState(){normalizations++;return{equipped:'normal'}},window:{hasSpaceTowerVip:()=>vip}};
  vm.runInNewContext(fn(v2,'getEquippedV2Background'),c);
  for(let i=0;i<600;i++)assert.equal(c.getEquippedV2Background().id,'vip');
  assert.equal(normalizations,0);vip=false;assert.equal(c.getEquippedV2Background(),null);
  c.shopState.backgroundStore.equipped='normal';assert.equal(c.getEquippedV2Background().id,'normal');
});

test('unchanged consumables retain hit targets; inventory, disabled state and reopening refresh them',()=>{
  let count=2,disabled=false,writes=0,markup='',revision=0;
  const dock={dataset:{},get childElementCount(){return markup?1:0},replaceChildren(){markup='';revision++},
    set innerHTML(value){markup=value;writes++;revision++},get innerHTML(){return markup}};
  const nodes={consumableDrawer:{classList:{toggle(){}}},consumableDock:dock,
    consumableDrawerToggle:{setAttribute(){}},consumableDrawerLabel:{},consumableDrawerCount:{}};
  const c={document:{getElementById:id=>nodes[id],body:{classList:{contains:()=>true}}},gameStarted:true,running:true,
    consumableDrawerOpen:true,consumableDockText:()=>({drawer:'Items',freeUpgradeVoucher:'Upgrade'}),
    getConsumableCount:id=>id==='freeUpgradeVoucher'?count:0,isConsumableAlreadyActivated:()=>false,
    isConsumableActionDisabled:()=>disabled,escapeHtml:x=>x,setConsumableDrawer(){}};
  vm.runInNewContext(fn(expansion,'renderConsumableDock'),c);
  c.renderConsumableDock();const before=revision;
  for(let i=0;i<100;i++)c.renderConsumableDock();
  assert.equal(writes,1);assert.equal(revision,before,'pointer target must survive HUD refreshes');
  count=1;c.renderConsumableDock();assert.match(markup,/×1/);
  disabled=true;c.renderConsumableDock();assert.match(markup,/disabled/);
  c.gameStarted=false;c.renderConsumableDock();assert.equal(markup,'');
  c.gameStarted=true;c.renderConsumableDock();assert.match(markup,/×1/);
});

test('commander avatar only refreshes when level, selection or language changes',()=>{
  let level=1,queries=0;
  const c={commanderAvatarRenderKey:'',getCommanderLevel:()=>level,currentLanguage:'en',userSettings:{commanderAvatar:'orbit'},
    COMMANDER_AVATARS:{orbit:{glyph:'A',names:{en:'Orbit',zh:'軌道'}}},AVATAR_UI_TEXT:{en:{open:'Open',title:'Avatar'},zh:{open:'開啟',title:'頭像'}},
    commanderAvatarArt:{},commanderAvatarLevel:{},commanderAvatarButton:{setAttribute(){}},avatarPickerTitle:{},
    avatarChoiceGrid:{querySelectorAll(){queries++;return[]}}};
  vm.runInNewContext(fn(v2,'renderCommanderAvatar'),c);
  for(let i=0;i<100;i++)c.renderCommanderAvatar();assert.equal(queries,1);
  level=2;c.renderCommanderAvatar();assert.equal(c.commanderAvatarLevel.textContent,'LV.2');
  c.currentLanguage='zh';c.renderCommanderAvatar();assert.equal(c.avatarPickerTitle.textContent,'頭像');assert.equal(queries,3);
});

test('VIP preview caps visual drawing and does no GPU work while backgrounded',()=>{
  let draws=0;
  const c={vipShowcase:{hidden:false},vipShowcaseTurret:{},vipShowcaseFrame:0,vipShowcaseStarted:0,vipShowcaseLastFrame:0,
    requestAnimationFrame(){return 1},document:{hidden:false,getElementById:()=>({getContext:()=>({})})},commerceAppActive:true,
    drawVipCombatPreview:()=>draws++};
  vm.runInNewContext(fn(v2,'drawVipShowcaseFrame'),c);
  for(let i=0;i<1200;i++)c.drawVipShowcaseFrame(i*1000/120);
  assert.ok(draws<=300&&draws>=240);const before=draws;
  c.document.hidden=true;c.drawVipShowcaseFrame(11000);assert.equal(draws,before);
  c.document.hidden=false;c.commerceAppActive=false;c.drawVipShowcaseFrame(12000);assert.equal(draws,before);
});

test('launch restore cannot reopen the offer after dismissal; later explicit logins show it once',()=>{
  const opened=[];
  const c={starterHandledLoginSequence:0,starterLaunchLoginPending:true,starterDialog:{open:false},
    window:{spaceTowerAuthenticatedLoginSequence:0,setTimeout:f=>f()},openStarterPack:source=>opened.push(source)};
  vm.runInNewContext(fn(starter,'showStarterPackAfterLogin'),c);
  c.showStarterPackAfterLogin({sequence:1});assert.equal(opened.length,0);
  c.showStarterPackAfterLogin({sequence:1});assert.equal(opened.length,0);
  c.showStarterPackAfterLogin({sequence:2});assert.deepEqual(opened,['login']);
  c.showStarterPackAfterLogin({sequence:2});assert.equal(opened.length,1);
  c.starterDialog.open=true;c.showStarterPackAfterLogin({sequence:3});assert.equal(opened.length,1);
});

test('stardust redemption blocks duplicate taps and announces the actual server reward after applying it',async()=>{
  let calls=0,applied=false;const toasts=[];
  const c={stardustRedeemBusy:false,DEV_MODE:false,playerSessionToken:'fixture',v2Progress:{fragmentWishlist:'a'},ultimateProgress:{},
    expansionProgress:{starDust:100},document:{getElementById:()=>({classList:{add(){},remove(){}}})},
    crypto:{randomUUID:()=> 'fixture-request'},apiUrl:x=>x,shopAuthHeaders:x=>x,
    fetch:async()=>{calls++;return{ok:true,json:async()=>({save:{},reward:{targetId:'b',amount:10}})}},
    applyCloudSave(){applied=true},setSupplyPackStatus(){},gachaFeatureText:()=>({redeemed:'Redeemed'}),
    gachaContentText:()=>({drawFailed:'Failed'}),expansionText:()=>({need:'Need more'}),
    V2_TURRET_DEFS:[{id:'a',name:'A'},{id:'b',name:'B'}],ULTIMATE_DEFS:[],localizedRewardLabel:()=> 'Fragments +10',
    showTaskToast:(title,detail)=>{assert.equal(applied,true);toasts.push({title,detail})}};
  vm.runInNewContext('async '+fn(expansion,'redeemStardust'),c);
  await Promise.all([c.redeemStardust('turret'),c.redeemStardust('turret')]);
  assert.equal(calls,1);assert.equal(toasts.length,1);assert.equal(toasts[0].detail,'B · Fragments +10');assert.equal(c.stardustRedeemBusy,false);
  c.fetch=async()=>({ok:false,json:async()=>({error:'Offline'})});await c.redeemStardust('turret');
  assert.equal(toasts.length,1);assert.equal(c.stardustRedeemBusy,false);
});
