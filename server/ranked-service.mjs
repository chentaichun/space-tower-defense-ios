import '../turret-catalog.js';
import '../ranked-enemy-catalog.js';
import '../ranked-battle-core.js';
import '../ranked-matchmaking-rules.js';
export const Rules=globalThis.SpaceTowerMatchRules;
const R=globalThis.SpaceTowerRanked;
const copy=value=>JSON.parse(JSON.stringify(value));
export function validLineup(ids){return Array.isArray(ids)&&ids.length===5&&new Set(ids).size===5&&ids.every(id=>globalThis.SpaceTowerCatalog.byId.has(id));}
export function publicPilot(p){return {name:p.name,rating:p.rating};}
export class MatchQueue {
  constructor(state={entries:{},plans:{}},waitSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0]){this.state=state;this.waitSeed=waitSeed;}
  expire(now){for(const [key,e] of Object.entries(this.state.entries))if(e.status==='searching'&&now-e.seen>Rules.QUEUE_LEASE_MS)delete this.state.entries[key];}
  join(profile,now){
    this.expire(now);
    if(this.state.entries[profile.key])return this.poll(profile.key,now);
    if(!validLineup(profile.loadout))throw new Error('INVALID_LOADOUT');
    this.state.entries[profile.key]={...copy(profile),rules:Rules.VERSION,power:Rules.power(profile.loadout),joined:now,botWaitMs:Rules.botWaitMs(this.waitSeed()),seen:now,status:'searching'};
    return this.poll(profile.key,now);
  }
  poll(key,now){
    this.expire(now);const e=this.state.entries[key];
    if(!e)return {status:'idle'};
    if(e.status==='matched')return {status:'matched',roomId:e.roomId};
    e.seen=now;
    // Search for a live human first, even when the fallback deadline has passed.
    const other=Object.values(this.state.entries).filter(p=>p.status==='searching'&&Rules.compatible(e,p,now))
      .sort((a,b)=>Math.abs(a.rating-e.rating)-Math.abs(b.rating-e.rating)||a.joined-b.joined)[0];
    if(other||now-e.joined>=(e.botWaitMs??Rules.BOT_WAIT_MS)){
      const roomId=crypto.randomUUID();
      const botSeed=crypto.getRandomValues(new Uint32Array(1))[0];
      const bot=other?null:Rules.botProfile(e.rating,botSeed);
      const rival=other||{key:'bot:'+roomId,name:Rules.botName(botSeed),rating:bot.rating,streak:{wins:0,losses:0},loadout:Rules.botLoadout(e.rating,e.loadout,botSeed,bot),bot};
      const plan={id:roomId,created:now,seed:crypto.getRandomValues(new Uint32Array(1))[0],players:[copy(e),copy(rival)]};
      this.state.plans[roomId]=plan;
      for(const p of [e,other].filter(Boolean))this.state.entries[p.key]={status:'matched',roomId};
      return {status:'matched',roomId};
    }
    return {status:'searching',elapsedMs:now-e.joined,range:Rules.band(now-e.joined),rating:e.rating,loadout:e.loadout};
  }
  cancel(key){const e=this.state.entries[key];if(e?.status==='matched')return {status:'matched',roomId:e.roomId};delete this.state.entries[key];return {status:'cancelled'};}
  release(id){for(const [key,e] of Object.entries(this.state.entries))if(e.roomId===id)delete this.state.entries[key];delete this.state.plans[id];}
}
export class MatchRoom {
  constructor(plan,state){
    if(state){
      this.state=state;
      for(const side of state.match.sides){
        const units=new Map(side.units.filter(Boolean).map(u=>[u.uid,u]));
        for(const p of side.projectiles)p.owner=units.get(p.owner?.uid)||p.owner;
        for(const e of side.enemies)if(e.burnOwner)e.burnOwner=units.get(e.burnOwner.uid)||e.burnOwner;
      }
      return;
    }
    const m=R.create({loadout:plan.players[0].loadout,opponentLoadout:plan.players[1].loadout,seed:plan.seed,
      ratings:plan.players.map(p=>p.rating),streaks:plan.players.map(p=>p.streak||{wins:0,losses:0}),bots:plan.players.map(p=>p.bot||null)});
    for(let n=0;n<5;n++)for(let i=0;i<2;i++)R.summon(m,i);
    this.state={id:plan.id,created:plan.created,players:plan.players,match:m,status:'waiting',ready:[false,!!plan.players[1].bot],
      seen:[plan.created,plan.created],seq:[0,0],lastResult:[null,null],actions:[[],[]],startAt:null,simAt:null,settled:false};
  }
  finish(winner,reason){
    const s=this.state,m=s.match;if(m.status==='finished')return;
    m.status='finished';m.winner=winner;s.status='finished';s.reason=reason;
    m.results=m.sides.map((_,i)=>R.resultFor(m.ratings[i],m.ratings[1-i],m.streaks[i],winner==='draw'?'draw':winner===i?'win':'loss'));
    if(reason==='disconnect'||reason==='surrender')m.results.forEach(r=>{if(r.outcome==='loss')r.obsidian=0;});
  }
  advance(now){
    const s=this.state;if(['finished','cancelled'].includes(s.status))return;
    if(s.status==='waiting'){
      if(now-s.created>Rules.READY_MS){s.status='cancelled';s.reason='ready_timeout';return;}
      return;
    }
    if(now<s.startAt)return;
    s.status='playing';
    const missing=s.players.map((p,i)=>!p.bot&&now-s.seen[i]>Rules.RECONNECT_MS);
    if(missing.every(Boolean)){s.status='cancelled';s.reason='both_disconnected';return;}
    if(missing.some(Boolean)){this.finish(missing[0]?1:0,'disconnect');return;}
    // Every client observes the same 20 Hz simulation. A background tab cannot pause it.
    const target=Math.min(now,s.startAt+600000);
    while(s.simAt+50<=target&&s.match.status==='playing'){
      R.tick(s.match,.05,{playerAI:!!s.players[0].bot,opponentAI:!!s.players[1].bot});s.simAt+=50;
    }
    if(s.match.status==='finished'){s.status='finished';s.reason='core_destroyed';}
    else if(now-s.startAt>=600000){const h=s.match.sides.map(p=>p.hp/p.maxHp);this.finish(Math.abs(h[0]-h[1])<.00001?'draw':h[0]>h[1]?0:1,'time_limit');}
  }
  request(key,action,body={},now=Date.now()){
    const s=this.state,index=s.players.findIndex(p=>p.key===key&&!p.bot);
    if(index<0)throw new Error('NOT_IN_MATCH');
    this.advance(now);s.seen[index]=now;
    if(s.status==='waiting'){
      s.ready[index]=true;
      if(s.ready.every(Boolean)){s.status='countdown';s.startAt=now+3000;s.simAt=s.startAt;}
    }
    let result=null;
    if(action==='command'){
      if(!Number.isSafeInteger(body.seq)||body.seq<1)throw new Error('INVALID_SEQUENCE');
      if(body.seq===s.seq[index])result=s.lastResult[index];
      else if(body.seq!==s.seq[index]+1)throw new Error('STALE_COMMAND');
      else{
        s.actions[index]=s.actions[index].filter(at=>now-at<1000);
        result={ok:false,reason:'請稍候再操作'};
        if(s.status==='playing'&&s.actions[index].length<8){
          s.actions[index].push(now);
          if(body.type==='summon')result=R.summon(s.match,index);
          else if(body.type==='upgrade'&&['speed','physical','magic','hp'].includes(body.key))result=R.upgrade(s.match,index,body.key);
          else if(body.type==='merge'&&[body.from,body.to].every(n=>Number.isInteger(n)&&n>=0&&n<13))result=R.merge(s.match,index,body.from,body.to);
          else if(body.type==='surrender'){this.finish(1-index,'surrender');result={ok:true};}
          else result={ok:false,reason:'無效操作'};
        }
        s.seq[index]=body.seq;s.lastResult[index]=result;
      }
    }
    return {...this.snapshot(index,now),commandResult:result};
  }
  snapshot(index,now){
    const s=this.state,m=copy(s.match),order=[index,1-index];
    m.sides=order.map(i=>m.sides[i]);m.ratings=order.map(i=>s.match.ratings[i]);m.streaks=order.map(i=>s.match.streaks[i]);
    if(m.results)m.results=order.map(i=>s.match.results[i]);
    if(typeof m.winner==='number')m.winner=m.winner===index?0:1;
    m.transferEvents.forEach(e=>e.side=e.side===index?0:1);
    delete m.seed;delete m.nextId;m.sides.forEach(side=>{delete side.bot;for(const p of [...side.projectiles,...(side.spentProjectiles||[])])delete p.owner;});
    return {status:s.status,roomId:s.id,serverTime:now,countdownMs:Math.max(0,(s.startAt||0)-now),
      opponent:publicPilot(s.players[1-index]),player:publicPilot(s.players[index]),ackSeq:s.seq[index],
      opponentReconnecting:!s.players[1-index].bot&&now-s.seen[1-index]>3000,reason:s.reason||null,settled:s.settled,match:m};
  }
}
