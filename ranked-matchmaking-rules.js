/* Shared matchmaking rules. Ratings come from the ranked service. */
(() => {
  'use strict';
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0));
  const BOT_WAIT_MS=30000, QUEUE_LEASE_MS=6000, RECONNECT_MS=20000, READY_MS=15000;
  // Draw once per queue ticket, with millisecond precision across the full 0–30 s range.
  const botWaitMs=seed=>Math.floor((Number(seed)>>>0)/4294967296*(BOT_WAIT_MS+1));
  function band(waitMs){return Math.min(300,100+Math.floor(Math.max(0,waitMs)/4000)*50);}
  function botProfile(rating,seed=0){
    const q=clamp(rating,0,4000)/4000;
    let state=Number(seed)>>>0;
    const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
    const stronger=random()<.2,variation=random();
    const distance=15+Math.floor(random()*(65+80*q)),direction=random()<.5?-1:1;
    let cups=Math.round(clamp(rating,0,100000))+direction*distance;
    if(cups<0||cups>100000)cups=Math.round(clamp(rating,0,100000))-direction*distance;
    return {rating:cups,difficulty:stronger?'challenging':'gentle',
      damageScale:stronger?1.05+.05*q+.04*variation:.86+.07*q+.03*variation,
      hpScale:stronger?1.03+.04*q+.03*variation:.90+.06*q+.03*variation,
      reaction:stronger?1.05-.23*q-.08*variation:1.95-.85*q-.10*variation,
      mergeChance:stronger?.22+.10*q:.12+.10*q,upgradeChance:stronger?.97:.80+.15*q,counterChance:stronger?.35:.15+.1*q};
  }
  // Opponent names: a hand-written list plus a generator that mixes name parts from several languages, so
  // opponents rarely repeat. Everything is derived from the seed (deterministic on client and server).
  const names=Object.freeze(['NovaRush','Mochi_7','LunaFox','KaiZen','PixelOtter','Rin.','Skywalker','Noctis','Astra_99','ZeroGravity','OrbitCat','FrostByte','Sora','Echo_21','TinyComet','NightOwl','ゆき','そらねこ','ハル','별빛','구름','小橘不熬夜','晚風','星塵汽水','月球散步','鹽味奶蓋','路過的阿宇','光年之外','BlueMint','Neko404','Rex77','mikan','KUMA','Vega','Orion','Lyra','Kestrel','Quasar','Nebby','Halo_3','Juniper','Pip','Marlowe','Tofu','Sakura_x','Taro','Ember','Kiwi','Ghostlight','Starling','Comet.K','Driftwood','Moss','Polaris','Cypher','Waffle','Zephyr','Inkwell','Tanuki','Kitsune','Raven','Bramble','Saturnine','Lumen','Pebble','Sprout','Gale','Yuzu','Matcha','Boba','Dango','Onigiri','Ramune','ひかり','つばさ','ほしぞら','みかづき','あおい','하늘','달빛','바람','새벽','은하','소나기','夜行貓','銀河郵差','藍莓鬆餅','奶茶續命','追星少年','宇宙小白','不想上班','早睡失敗','流浪星球','薄荷糖','海鹽餅乾','咖啡加冰','雲朵棉花','天台看星','一顆番茄','Звезда','Комета','Лис','Сова','Ветер','Nube','Estrella','Lucero','Cometa','Brisa','Luna_Roja','Sol']);
  const PARTS={en:[['Neon','Silent','Swift','Lucky','Cosmic','Frozen','Crimson','Velvet','Hidden','Rapid','Lunar','Solar','Quantum','Little','Wild','Mellow','Pixel','Rusty','Shiny','Sleepy'],['Fox','Comet','Pilot','Otter','Nova','Rider','Wolf','Panda','Orbit','Spark','Byte','Hawk','Drift','Moth','Golem','Kite','Sprite','Mango','Raven','Turtle']],
    zh:[['深夜','迷路的','會飛的','不睡的','快樂','安靜的','銀色','藍色','微醺','路過的','認真的','佛系','暴走','溫柔的','傲嬌'],['貓咪','太空人','小熊','火箭','企鵝','柴犬','領航員','星星','月亮','鯨魚','狐狸','砲手','布丁','麻糬','海獺']],
    ja:[['ちいさな','ねむい','はしる','ひかる','まよう','しずかな'],['ねこ','うさぎ','ほし','くじら','たぬき','パイロット']],
    ko:[['졸린','반짝','작은','조용한','빠른','행복한'],['고양이','별','여우','고래','토끼','조종사']]};
  function botName(seed){const n=Number(seed)>>>0,h=Math.imul(n^0x9E3779B9,2654435761)>>>0,style=h%10;
    if(style<4){const base=names[(h>>>4)%names.length];return (h>>>12)%3===0?base+String((h>>>16)%990+10):base;}
    const lang=style<7?'en':style<9?'zh':(h>>>20)%2?'ja':'ko',[adj,noun]=PARTS[lang],a=adj[(h>>>5)%adj.length],b=noun[(h>>>11)%noun.length];
    const glue=lang==='en'?['','_','.',''][(h>>>17)%4]:'',num=(h>>>19)%4===0?String((h>>>21)%99+1):'';return a+glue+b+num;}
  function power(loadout){return loadout.reduce((sum,id)=>{const d=globalThis.SpaceTowerCatalog.byId.get(id);if(!d)return sum;
    const volleys=d.missiles||d.pellets||1,area=d.area||d.tideEvery||d.chain?1.25:1;
    return sum+globalThis.SpaceTowerCatalog.health(d)+80*(d.rankedDamage??d.damage)*(d.rankedSpeed??d.speed)*volleys*area+(d.shield?25:0)+(d.slowAura?15:0);
  },0);}
  // Cup tiers decide which turret grades a bot may field. Players start at 1,200 cups.
  const CUP_TIERS=Object.freeze([[1300,1,2],[1600,1,3],[2000,2,4],[2500,3,5],[3000,4,6],[3500,5,7],[Infinity,6,8]]);
  function gradeWindow(rating){const [,min,max]=CUP_TIERS.find(([limit])=>clamp(rating,0,100000)<limit);return {min,max};}
  function botLoadout(rating,playerLoadout,seed,profile=null){
    let state=Number(seed)>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const C=globalThis.SpaceTowerCatalog,playerGrade=Math.max(...playerLoadout.map(id=>C.byId.get(id)?.strengthGrade||1));
    // Never field more than two grades above the player's best gun, so a cup
    // spike cannot pit a starter roster against late-game artillery.
    const window=gradeWindow(rating),maxGrade=Math.max(window.min,Math.min(window.max,playerGrade+2)),minGrade=Math.min(window.min,maxGrade);
    const allowVip=rating>=3500;
    const pool=C.turrets.filter(d=>d.vipExclusive?allowVip:d.strengthGrade>=minGrade&&d.strengthGrade<=maxGrade);
    const themes=[['assault','burst','control','tank',null],['tank','bruiser','assault','burst',null],['control','control','assault','burst',null],['burst','burst','support','assault',null],['assault','assault','tank','control',null],
      ['burst','control','support',null,null],['assault','burst','burst','tank',null],['control','tank','burst','support',null],['bruiser','assault','control',null,null],[null,null,null,null,null]];
    const theme=themes[Math.floor(random()*themes.length)],ownKey=[...playerLoadout].sort().join(',');
    // Showcase slot: opponents regularly field one pack (offer) or VIP turret so players see them in action.
    // At most one per loadout; the rest of the roster still follows the cup tier.
    const showcasePool=C.turrets.filter(d=>d.offerExclusive||d.vipExclusive),showcase=showcasePool.length&&random()<(rating<1600?.4:.7)?showcasePool[Math.floor(random()*showcasePool.length)]:null;
    for(let attempt=0;attempt<60;attempt++){
      const chosen=showcase?[showcase]:[];
      for(const role of theme.slice(chosen.length)){const available=pool.filter(d=>!chosen.includes(d)&&!d.offerExclusive&&(!d.vipExclusive||!chosen.some(t=>t.vipExclusive||t.offerExclusive)));const themed=available.filter(d=>d.healthRole===role);const from=themed.length?themed:available;if(!from.length)break;chosen.push(from[Math.floor(random()*from.length)]);}
      const ids=chosen.map(d=>d.id);
      if(ids.length===5&&chosen.filter(d=>d.damage||d.antimatter).length>=3&&[...ids].sort().join(',')!==ownKey)return ids;
    }
    // A defensive fallback still chooses five distinct guns from the tier.
    const fallback=[...pool].sort(()=>random()-.5).slice(0,5).map(d=>d.id);
    return fallback.length===5?fallback:C.turrets.filter(d=>!d.vipExclusive&&d.strengthGrade<=2).slice(0,5).map(d=>d.id);
  }
  function compatible(a,b,now){
    if(a.key===b.key||a.rules!==b.rules)return false;
    const wait=Math.max(now-a.joined,now-b.joined),limit=band(wait);
    return Math.abs(a.rating-b.rating)<=limit&&Math.max(a.power,b.power)/Math.max(1,Math.min(a.power,b.power))<=1.6;
  }
  globalThis.SpaceTowerMatchRules=Object.freeze({VERSION:2,gradeWindow,BOT_WAIT_MS,botWaitMs,QUEUE_LEASE_MS,RECONNECT_MS,READY_MS,band,botProfile,botName,botLoadout,power,compatible});
})();
