/* Render remote snapshots on a continuous clock. Never predicts game outcomes. */
(() => {
  const lerp=(a,b,q)=>a+(b-a)*q;
  const eventKey=e=>[e.born,e.x,e.y,e.id,e.kind,e.text].join(':');
  class RankedRenderBuffer {
    constructor(){this.frames=[];this.view=null;this.pair=null;this.time=0;this.sampled=null;this.delay=.24;this.gaps=[];this.confirmed=null;this.feedback=new Map();}
    push(match,now){
      if(this.frames.length&&match.elapsed<this.frames.at(-1).match.elapsed){this.frames=[];this.time=0;this.sampled=null;this.delay=.24;this.gaps=[];this.confirmed=null;this.feedback.clear();}
      const last=this.frames.at(-1);
      if(last?.match.elapsed===match.elapsed){last.match=match;this.pair=null;return;}
      if(last){this.gaps.push(Math.max(0,(now-last.received)/1000));this.gaps=this.gaps.slice(-6);const sorted=[...this.gaps].sort((a,b)=>a-b),desired=Math.max(.24,Math.min(.7,sorted[Math.floor(sorted.length*.8)]*1.15));this.delay=Math.max(desired,this.delay-Math.max(0,now-last.received)/100000);}
      this.frames.push({match,received:now});
      // Commands also return snapshots. Keep a time window, not six packets:
      // an action burst must not evict the frame currently being displayed.
      // The server advances at 20 Hz, so equal-time coalescing bounds this to
      // about 26 records, including the interpolation anchor before the window.
      while(this.frames.length>2&&this.frames[1].match.elapsed<match.elapsed-1.2)this.frames.shift();
      this.pair=null;
    }
    confirm(match,result){
      // Only server-confirmed local commands bypass the world interpolation
      // delay. A merged-away gun must disappear before the next drag begins.
      this.confirmed={at:match.elapsed,units:match.sides[0].units};
      const position=globalThis.SpaceTowerRanked?.positions[result?.slot];
      for(const key of ['impacts','popups'])for(const e of match.sides[0][key])if(position&&e.born===match.elapsed&&e.x===position[0]&&e.y===position[1]&&(key==='impacts'&&['summon','merge'].includes(e.kind)||key==='popups'&&e.text===`★ ${result.star}`)){
        const id=key+':'+eventKey(e);
        if(!this.feedback.has(id))this.feedback.set(id,{originalUntil:e.until,event:{...e,born:this.time,until:this.time+e.until-e.born}});
      }
      for(const [key,value]of this.feedback)if(value.originalUntil<match.elapsed-1.2)this.feedback.delete(key);
      this.pair=null;
    }
    sample(now){
      const latest=this.frames.at(-1);if(!latest)return null;
      const target=Math.max(this.frames[0].match.elapsed,latest.match.elapsed+(now-latest.received)/1000-this.delay);
      if(this.sampled===null)this.time=Math.min(latest.match.elapsed,target);
      else if(now-this.sampled>1000)this.time=Math.min(latest.match.elapsed,target);
      else {const dt=Math.max(0,Math.min(.1,(now-this.sampled)/1000)),speed=Math.max(.8,Math.min(1.2,1+(target-this.time)*2));this.time=Math.max(this.frames[0].match.elapsed,Math.min(latest.match.elapsed+.08,this.time+dt*speed));}
      this.sampled=now;
      let a=this.frames[0].match,b=a;
      for(const f of this.frames){if(f.match.elapsed<=this.time)a=f.match;else{b=f.match;break;}b=a;}
      if(b===a&&this.frames.length>1){b=latest.match;a=this.frames.at(-2).match;}
      const t=this.time,span=Math.max(.001,b.elapsed-a.elapsed),q=Math.max(0,Math.min(1.4,(t-a.elapsed)/span));
      if(!this.pair||this.pair[0]!==a||this.pair[1]!==b){
        // Copy only animated records. Owner graphs, trails and static metadata
        // are read-only; serializing the whole match here wastes work on mobile.
        this.pair=[a,b];this.view={...a,sides:a.sides.map(s=>({...s,units:s.units.map(u=>u&&({...u})),enemies:s.enemies.map(e=>({...e}))}))};this.links=[];this.aims=[];this.tracks=[];
        for(let side=0;side<2;side++){
          const base=a.sides[side],next=b.sides[side],view=this.view.sides[side],enemies=new Map(next.enemies.map(e=>[e.id,e]));
          view.enemies.forEach((e,i)=>{const to=enemies.get(e.id);if(to)this.links.push([e,base.enemies[i],to,['x','y','wobble','flash','hitKick']]);});
          view.units.forEach((u,i)=>{
            const to=next.units[i];if(!u)return;
            if(to?.uid===u.uid)this.links.push([u,base.units[i],to,['timer']]);
            const events=new Map();
            for(const f of this.frames){const source=f.match.sides[side].units[i];if(source?.uid===u.uid&&source.firedAt>=0)events.set(source.firedAt,{at:source.firedAt,angle:source.angle});}
            this.aims.push([u,events]);
          });
          for(const key of ['beams','impacts','popups']){
            const items=new Map();for(const f of this.frames)for(const e of f.match.sides[side][key]){const id=eventKey(e);items.set(id,side===0?this.feedback.get(key+':'+id)?.event||e:e);}
            view[key]=[...items.values()].map(e=>({...e}));
          }
          const shots=new Map();
          for(const f of this.frames)for(const p of [...f.match.sides[side].projectiles,...(f.match.sides[side].spentProjectiles||[])]){
            let track=shots.get(p.uid);
            if(!track){
              const born=p.born??f.match.elapsed-p.age;
              const launchAngle=p.owner?.firedAt===born?p.owner.angle:Math.atan2((p.ty??p.y)-(p.originY??p.y),(p.tx??p.x)-(p.originX??p.x));
              // Public snapshots deliberately omit the simulation's owner
              // graph. Recover the gun from its launch slot and history so
              // real online shots use the same muzzle as local battles.
              let owner=p.owner;
              if(!owner){
                const slot=globalThis.SpaceTowerRanked?.positions.findIndex(([x,y])=>Math.abs(p.originX-x)<1e-6&&Math.abs(p.originY-y)<1e-6);
                if(slot>=0){
                  for(const frame of this.frames){const u=frame.match.sides[side].units[slot];if(u?.id===p.id&&(!owner||frame.match.elapsed<=born))owner=u;}
                  owner=owner||{id:p.id,slot,angle:launchAngle};
                }
              }
              track={out:{...p,born,launchAngle,owner},points:new Map([[born,{x:p.originX??p.x,y:p.originY??p.y}]])};shots.set(p.uid,track);
            }
            Object.assign(track.out,p);
            // The server advances new shots in their creation tick. Preserve
            // the exact birth point instead of overwriting it with that step.
            const observedAt=p.ended??f.match.elapsed;
            if(observedAt>track.out.born)track.points.set(observedAt,{x:p.x,y:p.y});
          }
          view.projectiles=[...shots.values()].map(track=>{
            track.samples=[...track.points].sort((a,b)=>a[0]-b[0]);this.tracks.push(track);
            const p=track.out,owner=p.owner,position=owner&&globalThis.SpaceTowerRanked?.positions[owner.slot];
            if(position&&Math.abs(p.originX-position[0])<1e-6&&Math.abs(p.originY-position[1])<1e-6){
              const events=this.aims.find(([u])=>u.uid===owner.uid)?.[1];
              if(events&&!events.has(p.born))events.set(p.born,{at:p.born,angle:p.launchAngle});
            }
            return p;
          });
        }
      }
      this.view.elapsed=t;
      for(const [out,from,to,fields] of this.links)for(const key of fields)if(Number.isFinite(from[key])&&Number.isFinite(to[key])){
        const delta=key==='angle'?Math.atan2(Math.sin(to[key]-from[key]),Math.cos(to[key]-from[key])):to[key]-from[key];out[key]=from[key]+delta*q;
      }
      for(const [u,events]of this.aims){
        let chosen=null;for(const event of events.values())if(event.at<=t&&(!chosen||event.at>chosen.at))chosen=event;
        if(chosen){u.angle=chosen.angle;u.firedAt=chosen.at;}
      }
      if(this.confirmed){
        if(t>=this.confirmed.at)this.confirmed=null;
        else this.confirmed.units.forEach((u,i)=>{if(u?.uid!==this.view.sides[0].units[i]?.uid)this.view.sides[0].units[i]=u?{...u,firedAt:-1}:null;});
      }
      for(const {out:p,samples}of this.tracks){
        let left=samples[0],right=left;
        for(const sample of samples){if(sample[0]<=t)left=sample;else{right=sample;break;}right=left;}
        if(right===left&&samples.length>1){right=samples.at(-1);left=samples.at(-2);}
        const end=right[0],sampleTime=Math.min(t,p.ended??end+.08),progress=Math.max(0,Math.min(1.4,(sampleTime-left[0])/Math.max(.001,end-left[0])));
        p.x=lerp(left[1].x,right[1].x,progress);p.y=lerp(left[1].y,right[1].y,progress);p.age=Math.max(0,t-p.born);
        const dx=right[1].x-left[1].x,dy=right[1].y-left[1].y;if(dx||dy)p.angle=Math.atan2(dy,dx);
      }
      return this.view;
    }
  }
  globalThis.SpaceTowerRankedRenderBuffer=RankedRenderBuffer;
})();
