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
      mergeChance:stronger?.22+.10*q:.12+.10*q,upgradeChance:stronger?.97:.80+.15*q};
  }
  const names=Object.freeze(['NovaRush','Mochi_7','LunaFox','KaiZen','PixelOtter','Rin.','Skywalker','Noctis','Astra_99','ZeroGravity','OrbitCat','FrostByte','Sora','Echo_21','TinyComet','NightOwl','ゆき','そらねこ','ハル','별빛','구름','小橘不熬夜','晚風','星塵汽水','月球散步','鹽味奶蓋','路過的阿宇','光年之外','BlueMint','Neko404','Rex77','mikan','KUMA','Vela','AriaX','Drift_08','柚子茶','早安土星','銀翼','烤吐司']);
  function botName(seed){const n=Number(seed)>>>0,base=names[n%names.length];return n%3===0?base+String((n>>>8)%90+10):base;}
  function power(loadout){return loadout.reduce((sum,id)=>{const d=globalThis.SpaceTowerCatalog.byId.get(id);if(!d)return sum;
    const volleys=d.missiles||d.pellets||1,area=d.area||d.tideEvery||d.chain?1.25:1;
    return sum+globalThis.SpaceTowerCatalog.health(d)+80*(d.rankedDamage??d.damage)*(d.rankedSpeed??d.speed)*volleys*area+(d.shield?25:0)+(d.slowAura?15:0);
  },0);}
  function botLoadout(rating,playerLoadout,seed,profile=null){
    let state=Number(seed)>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const C=globalThis.SpaceTowerCatalog,playerGrade=Math.max(...playerLoadout.map(id=>C.byId.get(id).strengthGrade));
    const rankGrade=rating<700?2:rating<1500?3:rating<2500?5:8,maxGrade=Math.min(rankGrade,playerGrade+1);
    const allowVip=rating>=3000&&playerLoadout.some(id=>C.byId.get(id).vipExclusive);
    const pool=C.turrets.filter(d=>d.strengthGrade<=maxGrade&&(!d.vipExclusive||allowVip));
    const themes=[['assault','burst','control','tank',null],['tank','bruiser','assault','burst',null],['control','control','assault','burst',null]];
    const stronger=profile?.difficulty==='challenging';
    const theme=themes[state%themes.length],budget=power(playerLoadout)*(stronger?1.12:1.03),ownKey=[...playerLoadout].sort().join(','),candidates=[];
    for(let attempt=0;attempt<100;attempt++){
      const chosen=[];
      for(const role of theme){const available=pool.filter(d=>!chosen.includes(d)&&(!d.vipExclusive||!chosen.some(t=>t.vipExclusive)));const themed=available.filter(d=>d.healthRole===role);const from=themed.length?themed:available;chosen.push(from[Math.floor(random()*from.length)]);}
      const ids=chosen.map(d=>d.id),value=power(ids);
      if(chosen.filter(d=>d.damage||d.antimatter).length>=3&&value<=budget&&[...ids].sort().join(',')!==ownKey)candidates.push({ids,value});
    }
    const close=candidates.filter(c=>c.value>=budget*(stronger?.88:.78)),options=close.length?close:candidates;
    if(options.length)return options[Math.floor(random()*options.length)].ids;
    // A defensive fallback still chooses a distinct affordable roster.
    const cheapest=[...pool].sort((a,b)=>power([a.id])-power([b.id])).slice(0,5).map(d=>d.id);
    if([...cheapest].sort().join(',')===ownKey){const replacement=pool.find(d=>!cheapest.includes(d.id));if(replacement)cheapest[4]=replacement.id;}
    return cheapest;
  }
  function compatible(a,b,now){
    if(a.key===b.key||a.rules!==b.rules)return false;
    const wait=Math.max(now-a.joined,now-b.joined),limit=band(wait);
    return Math.abs(a.rating-b.rating)<=limit&&Math.max(a.power,b.power)/Math.max(1,Math.min(a.power,b.power))<=1.6;
  }
  globalThis.SpaceTowerMatchRules=Object.freeze({VERSION:1,BOT_WAIT_MS,botWaitMs,QUEUE_LEASE_MS,RECONNECT_MS,READY_MS,band,botProfile,botName,botLoadout,power,compatible});
})();
