/* Render remote snapshots on a continuous clock. Never predicts game outcomes. */
(() => {
  const clone=value=>JSON.parse(JSON.stringify(value));
  const lerp=(a,b,q)=>a+(b-a)*q;
  class RankedRenderBuffer {
    constructor(){this.frames=[];this.view=null;this.pair=null;this.time=0;this.sampled=null;this.delay=.24;this.gaps=[];}
    push(match,now){
      if(this.frames.length&&match.elapsed<this.frames.at(-1).match.elapsed){this.frames=[];this.time=0;this.sampled=null;this.delay=.24;this.gaps=[];}
      const last=this.frames.at(-1);
      if(last?.match.elapsed===match.elapsed){last.match=match;this.pair=null;return;}
      if(last){this.gaps.push(Math.max(0,(now-last.received)/1000));this.gaps=this.gaps.slice(-6);const sorted=[...this.gaps].sort((a,b)=>a-b);this.delay=Math.max(.24,Math.min(.7,sorted[Math.floor(sorted.length*.8)]*1.15));}
      this.frames.push({match,received:now});this.frames=this.frames.slice(-6);this.pair=null;
    }
    sample(now){
      const latest=this.frames.at(-1);if(!latest)return null;
      const target=Math.max(this.frames[0].match.elapsed,latest.match.elapsed+(now-latest.received)/1000-this.delay);
      if(this.sampled===null)this.time=Math.min(latest.match.elapsed,target);
      else {const dt=Math.max(0,Math.min(.1,(now-this.sampled)/1000)),speed=Math.max(.8,Math.min(1.2,1+(target-this.time)*2));this.time=Math.min(latest.match.elapsed+.08,this.time+dt*speed);}
      this.sampled=now;
      let a=this.frames[0].match,b=a;
      for(const f of this.frames){if(f.match.elapsed<=this.time)a=f.match;else{b=f.match;break;}b=a;}
      if(b===a&&this.frames.length>1){b=latest.match;a=this.frames.at(-2).match;}
      const t=this.time,span=Math.max(.05,b.elapsed-a.elapsed),q=Math.max(0,Math.min(1.4,(t-a.elapsed)/span));
      if(!this.pair||this.pair[0]!==a||this.pair[1]!==b){
        this.pair=[a,b];this.view=clone(a);this.links=[];
        for(let side=0;side<2;side++){
          const base=a.sides[side],next=b.sides[side],view=this.view.sides[side],enemies=new Map(next.enemies.map(e=>[e.id,e]));
          view.enemies.forEach((e,i)=>{const to=enemies.get(e.id);if(to)this.links.push([e,base.enemies[i],to,['x','y','wobble','flash','hitKick']]);});
          view.units.forEach((u,i)=>{const to=next.units[i];if(u&&to?.uid===u.uid)this.links.push([u,base.units[i],to,['angle','timer']]);});
          for(const key of ['beams','impacts','popups']){
            const items=new Map();for(const f of this.frames)for(const e of f.match.sides[side][key])items.set([e.born,e.x,e.y,e.id,e.kind,e.text].join(':'),e);
            view[key]=[...items.values()].map(e=>({...e}));
          }
          const shots=new Map();
          for(const f of this.frames)for(const p of [...f.match.sides[side].projectiles,...(f.match.sides[side].spentProjectiles||[])])shots.set(p.uid,{...p,sampledAt:p.ended??f.match.elapsed});
          view.projectiles=[...shots.values()];
        }
      }
      this.view.elapsed=t;
      for(const [out,from,to,fields] of this.links)for(const key of fields)if(Number.isFinite(from[key])&&Number.isFinite(to[key])){
        const delta=key==='angle'?Math.atan2(Math.sin(to[key]-from[key]),Math.cos(to[key]-from[key])):to[key]-from[key];out[key]=from[key]+delta*q;
      }
      for(const side of this.view.sides)for(const p of side.projectiles){
        const end=p.sampledAt,start=p.born??end-p.age,progress=Math.max(0,Math.min(1.2,(t-start)/Math.max(.02,end-start)));
        // Keep the sampled endpoint separate; x/y are the current display position.
        p.displayEndX??=p.x;p.displayEndY??=p.y;
        p.x=lerp(p.originX??p.displayEndX,p.displayEndX,progress);p.y=lerp(p.originY??p.displayEndY,p.displayEndY,progress);p.age=Math.max(0,t-start);
      }
      return this.view;
    }
  }
  globalThis.SpaceTowerRankedRenderBuffer=RankedRenderBuffer;
})();
