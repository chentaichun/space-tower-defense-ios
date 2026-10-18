/* Ranked-only procedural arena; weapon and enemy geometry comes from normal mode. */
(() => {
  const C=SpaceTowerCatalog,R=SpaceTowerRanked,TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const backgrounds=new WeakMap(),fields=new Map(),projectileSprites=new Map();
  function layer(w,h,dpr,paint){const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(w*dpr));canvas.height=Math.max(1,Math.ceil(h*dpr));const context=canvas.getContext('2d');context.scale(dpr,dpr);paint(context);return canvas;}
  function polygon(c,x,y,r,n,a=0){c.beginPath();for(let i=0;i<n;i++){const angle=a+i*TAU/n;i?c.lineTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r):c.moveTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r);}c.closePath();}
  function paintBackground(c,g,s,time,index) {
    const color=index?'#ba769a':'#59c9db',rgb=index?'168,96,152':'59,160,196';
    const fill=c.createLinearGradient(0,0,g.w,g.h);fill.addColorStop(0,index?'#100e23':'#05162b');fill.addColorStop(.5,'#061020');fill.addColorStop(1,index?'#1d152d':'#092331');c.fillStyle=fill;c.fillRect(0,0,g.w,g.h);
    // Separate, purpose-built orbital defense platforms share one ranked visual language.
    for(let cloud=0;cloud<3;cloud++){const x=g.w*(.16+cloud*.35)+Math.sin(time*.04+cloud)*12,y=g.h*(cloud%2?.76:.2),r=g.w*.5;const glow=c.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,`rgba(${rgb},.09)`);glow.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=glow;c.fillRect(0,0,g.w,g.h);}
    c.save();c.translate(g.cx,g.cy);c.scale(g.sx,g.sy);c.lineWidth=1/g.sx;
    const floor=c.createRadialGradient(0,0,0,0,0,1);floor.addColorStop(0,'#13294338');floor.addColorStop(.75,'#10203359');floor.addColorStop(1,'#07111e00');c.fillStyle=floor;c.beginPath();c.ellipse(0,0,.97,.97,0,0,TAU);c.fill();
    // Broad engraved orbital rings and interrupted light strips, not a UI grid.
    for(const r of [.38,.76,.9,1.04]){c.strokeStyle=`rgba(${rgb},${r===.76?.25:.12})`;c.lineWidth=(r===.76?6:1)/g.sx;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
    for(let i=0;i<12;i++){const a=i*TAU/12+.03;c.strokeStyle=`rgba(${rgb},.38)`;c.lineWidth=2/g.sx;c.beginPath();c.arc(0,0,.91,a,a+.09);c.stroke();c.strokeStyle=`rgba(${rgb},.12)`;c.lineWidth=1/g.sx;c.beginPath();c.moveTo(Math.cos(a)*.8,Math.sin(a)*.8);c.lineTo(Math.cos(a),Math.sin(a));c.stroke();}
    c.restore();
    // Mechanical perimeter brackets frame each combat zone and leave the center quiet.
    c.strokeStyle=`rgba(${rgb},.35)`;c.lineWidth=1;
    for(const [x,dir] of [[14,1],[g.w-14,-1]]){c.beginPath();c.moveTo(x+dir*24,16);c.lineTo(x+dir*7,16);c.lineTo(x,23);c.lineTo(x,50);c.moveTo(x,g.h-50);c.lineTo(x,g.h-23);c.lineTo(x+dir*7,g.h-16);c.lineTo(x+dir*24,g.h-16);c.stroke();}
    c.fillStyle=color;c.globalAlpha=.24;c.font='8px "Segoe UI",sans-serif';c.textAlign='right';c.fillText(index?'SECTOR 02 / RIVAL':'SECTOR 01 / DEFENSE',g.w-22,g.h-13);c.globalAlpha=1;
  }
  function background(c,g,s,time,index){
    const key=[g.w,g.h,g.dpr||1,index].join(':');let cached=backgrounds.get(c);
    if(cached?.key!==key){cached={key,canvas:layer(g.w,g.h,g.dpr||1,ctx=>paintBackground(ctx,g,s,0,index)),alarm:layer(g.w,g.h,g.dpr||1,ctx=>{const gradient=ctx.createRadialGradient(g.cx,g.cy,g.h*.15,g.cx,g.cy,g.w*.6);gradient.addColorStop(0,'#ff607600');gradient.addColorStop(1,'#b42859');ctx.fillStyle=gradient;ctx.fillRect(0,0,g.w,g.h);})};backgrounds.set(c,cached);}
    c.drawImage(cached.canvas,0,0,g.w,g.h);
    for(let i=0;i<75;i++){const x=((i*137.4+time*(i%3+1)*.5)%1009)/1009*g.w,y=((i*83.7+31)%619)/619*g.h;c.fillStyle=`rgba(193,218,255,${.2+Math.sin(time*.8+i)*.13})`;c.fillRect(x,y,i%11?1:2,i%11?1:2);}
    c.save();c.translate(g.cx,g.cy);c.scale(g.sx,g.sy);c.lineWidth=1/g.sx;c.strokeStyle=index?'#a860984d':'#3ba0c44d';for(let i=0;i<4;i++){const a=time*.025+i*Math.PI/2;c.beginPath();c.arc(0,0,1.04,a,a+.24);c.stroke();}c.restore();
    const pressure=Math.min(1,s.enemies.length/45);if(pressure>.3){c.save();c.globalAlpha=pressure*.16*(.8+Math.sin(time*3)*.2);c.drawImage(cached.alarm,0,0,g.w,g.h);c.restore();}
  }
  function field(c,g,x,y,definition,time,star){
    const shield=definition.shield,slow=definition.slowAura;if(!shield&&!slow)return;
    const rx=g.sx*(shield?.42:.48),ry=g.sy*(shield?.42:.48),color=definition.color;
    const extent=rx+3,key=[definition.id,rx,ry,g.dpr||1].join(':');let cached=fields.get(key);
    if(!cached){if(fields.size>=20)fields.clear();cached=layer(extent*2,extent*2,g.dpr||1,ctx=>{ctx.translate(extent,extent);const glow=ctx.createRadialGradient(0,0,rx*.15,0,0,rx);glow.addColorStop(0,color+'06');glow.addColorStop(.85,color+'15');glow.addColorStop(1,color+'45');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.strokeStyle=color;ctx.globalAlpha=.36;ctx.lineWidth=1.2;ctx.stroke();if(shield){ctx.clip();ctx.strokeStyle=color+'66';ctx.lineWidth=.65;const cell=13;for(let row=-5;row<=5;row++)for(let col=-8;col<=8;col++){polygon(ctx,col*cell*1.73+(row%2)*cell*.865,row*cell*1.5,cell,6,Math.PI/6);ctx.stroke();}}});fields.set(key,cached);}
    c.save();c.translate(x,y);c.scale(1,ry/rx);c.drawImage(cached,-extent,-extent,extent*2,extent*2);c.strokeStyle=color;c.globalAlpha=.36;
    if(shield){c.globalAlpha=.7;c.lineWidth=1.8;c.beginPath();c.arc(0,0,rx,time*.35,time*.35+.75);c.stroke();}
    else{c.rotate(-time*.25);c.setLineDash([3,9]);c.lineWidth=2;c.beginPath();c.arc(0,0,rx*.9,0,TAU);c.stroke();c.setLineDash([]);for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(rx*.74,0);c.lineTo(rx*.84,0);c.stroke();}}
    c.restore();
  }
  function projectile(c,d,x,y,angle,radius,time,dpr){
    const key=[d.id,radius,dpr].join(':'),tick=Math.floor(time*24),extent=radius*10+20;let cached=projectileSprites.get(key);
    if(!cached){if(projectileSprites.size>=64)projectileSprites.clear();cached={canvas:layer(extent*2,extent*2,dpr,()=>{}),tick:-1};projectileSprites.set(key,cached);}
    if(cached.tick!==tick){const ctx=cached.canvas.getContext('2d');ctx.clearRect(0,0,extent*2,extent*2);drawRankedProjectile(ctx,d,extent,extent,0,radius,tick/24);cached.tick=tick;}
    c.save();c.translate(x,y);c.rotate(angle);c.drawImage(cached.canvas,-extent,-extent,extent*2,extent*2);c.restore();
  }
  function draw(c,g,s,m,index,sprite){
    const time=m.elapsed,point=(x,y)=>[g.cx+x*g.sx,g.cy+y*g.sy];
    background(c,g,s,time,index);
    for(const u of s.units)if(u)field(c,g,...point(...R.positions[u.slot]),C.byId.get(u.id),time,u.star);
    // The core remains visible under the center emplacement.
    c.save();c.translate(g.cx,g.cy);c.rotate(time*.2);c.strokeStyle=index?'#cf85aa88':'#70dcfaaa';c.lineWidth=1.2;polygon(c,0,0,g.size*.78,6);c.stroke();c.rotate(-time*.4);polygon(c,0,0,g.size*.66,6,Math.PI/6);c.stroke();c.shadowColor=index?'#ff87bb':'#75eaff';c.shadowBlur=14;c.fillStyle=index?'#cf80ac':'#7ae9ff';polygon(c,0,0,g.size*.2,4);c.fill();c.restore();
    for(let slot=0;slot<13;slot++){
      const u=s.units[slot],[x,y]=point(...R.positions[slot]);
      c.save();c.translate(x,y);c.fillStyle='#061424b8';c.strokeStyle=u?'#7294ae70':'#668eaa30';c.lineWidth=1;c.beginPath();c.arc(0,0,g.size*.54,0,TAU);c.fill();c.stroke();
      if(!u){c.strokeStyle='#759db133';c.beginPath();c.moveTo(-3,0);c.lineTo(3,0);c.moveTo(0,-3);c.lineTo(0,3);c.stroke();c.restore();continue;}
      const d=C.byId.get(u.id),fire=clamp(1-(time-u.firedAt)/.16,0,1),hit=clamp(1-(time-u.hitAt)/.2,0,1);
      c.strokeStyle=u.hp/u.maxHp<.3?'#ff8a9c':d.color;c.lineWidth=2;c.beginPath();c.arc(0,0,g.size*.55,-Math.PI/2,-Math.PI/2+TAU*u.hp/u.maxHp);c.stroke();
      c.save();c.rotate(u.angle+Math.PI/2);
      if(d.vipExclusive)drawVipBattleArt(c,d,g.size*.4,time,{fireTimer:u.timer,shotInterval:1,muzzleFlash:fire});else c.drawImage(sprite(u.id),-g.size*.63,-g.size*.63,g.size*1.26,g.size*1.26);
      if(fire){c.globalAlpha=fire;c.fillStyle=d.color;c.shadowBlur=15;c.shadowColor=d.color;c.beginPath();c.ellipse(0,-g.size*.48,g.size*.1,g.size*.2,0,0,TAU);c.fill();}c.restore();
      if(hit){c.strokeStyle=`rgba(255,155,168,${hit})`;c.lineWidth=3;c.beginPath();c.arc(0,0,g.size*.62,0,TAU);c.stroke();}
      c.font=`600 ${Math.max(8,g.size*.26)}px "Segoe UI",sans-serif`;c.textAlign='center';c.strokeStyle='#04101de0';c.lineWidth=3;c.fillStyle=u.star>1?'#ffdf9d':'#d0e8ed';c.strokeText(`★${u.star}`,0,g.size*.78);c.fillText(`★${u.star}`,0,g.size*.78);c.restore();
    }
    const visualEnemies=s.enemies.map(e=>{const[x,y]=point(e.x,e.y);return {...e,x,y,size:Math.max(7,g.size*.24)*e.sizeScale,frostSlow:e.slowUntil>time?e.slow:0,weakpointTime:e.markUntil>time?1:0,v2BuffTimer:e.buffUntil>time?1:0};});
    for(const e of s.enemies)if(e.ability==='buffer'&&e.trail.length){c.save();c.strokeStyle='#e7ff7244';c.lineWidth=5;c.beginPath();e.trail.forEach((p,i)=>{const[x,y]=point(p.x,p.y);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.restore();}
    drawRankedEnemies(c,visualEnemies,{x:g.cx,y:g.cy},1,time);
    for(const e of visualEnemies){drawRankedEnemyOverlay(c,e,{x:g.cx,y:g.cy},1);if(e.generation){c.strokeStyle='#e1b5ff55';c.lineWidth=1;c.beginPath();c.arc(e.x,e.y,e.size*.9,0,TAU);c.stroke();}}
    for(const p of s.projectiles){if(time<(p.born??0)||p.ended!==undefined&&time>=p.ended)continue;const offset=Math.sin(Math.min(1,p.age*3)*Math.PI)*(p.spread||0),[x,y]=point(p.x-Math.sin(p.angle)*offset,p.y+Math.cos(p.angle)*offset),angle=Math.atan2(Math.sin(p.angle)*g.sy,Math.cos(p.angle)*g.sx);projectile(c,C.byId.get(p.id),x,y,angle,Math.max(2.5,g.size*.12),time,g.dpr||1);}
    for(const b of s.beams){if(time<b.born||time>=b.until)continue;const[x,y]=point(b.x,b.y),[tx,ty]=point(b.tx,b.ty),d=C.byId.get(b.id);c.save();c.globalAlpha=clamp((b.until-time)/.24,0,1);
      if(d?.vipExclusive)drawVipBeamSignature(c,d.id,d.color,x,y,tx,ty,1,time,.5);
      else{c.strokeStyle=d?.color||'#ff9de1';c.shadowColor=c.strokeStyle;c.shadowBlur=12;c.lineWidth=b.arc?1.6:3;c.beginPath();c.moveTo(x,y);for(let i=1;i<=8;i++){const q=i/8,jitter=b.arc?Math.sin(i*23+time*20)*6:0;c.lineTo(x+(tx-x)*q+jitter,y+(ty-y)*q-jitter);}c.stroke();c.shadowBlur=0;c.strokeStyle='#ffffff';c.lineWidth=.7;c.stroke();}c.restore();}
    for(const e of s.impacts){if(time<e.born||time>=e.until)continue;const[x,y]=point(e.x,e.y),q=clamp((time-e.born)/(e.until-e.born),0,1),d=C.byId.get(e.id),color=e.kind==='destroy'||e.kind==='core'?'#ff809c':d?.color||'#abceff';
      if(d?.vipExclusive&&(e.kind==='hit'||e.kind==='kill')){drawVipImpactSignature(c,d.id,d.color,x,y,q,time,Math.max(.35,g.size/75));continue;}
      c.save();c.globalAlpha=(1-q)*.8;c.strokeStyle=color;c.fillStyle=color;c.shadowColor=color;c.shadowBlur=10;const radius=(e.kind==='hit'?9:23)*q*(g.size/28);
      c.lineWidth=1.6;c.beginPath();c.arc(x,y,Math.max(1,radius),0,TAU);c.stroke();
      const count=e.kind==='kill'||e.kind==='destroy'?9:5;for(let i=0;i<count;i++){const angle=i*TAU/count+(e.x+e.y)*7,r=radius*(.6+i%3*.4);c.beginPath();c.moveTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r);c.lineTo(x+Math.cos(angle)*(r+4*(1-q)),y+Math.sin(angle)*(r+4*(1-q)));c.stroke();}c.restore();
    }
    for(const p of s.popups){if(time<p.born||time>=p.until)continue;const[x,y]=point(p.x,p.y),q=(time-p.born)/.85;c.save();c.globalAlpha=Math.min(1,(1-q)*2.5);c.font=`${p.large?800:600} ${p.large?12:10}px "Segoe UI","Microsoft JhengHei",sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#07101ee0';c.fillStyle=p.color;c.strokeText(globalThis.SpaceTowerLocale?.text(p.text)||p.text,x,y-8-q*24);c.fillText(globalThis.SpaceTowerLocale?.text(p.text)||p.text,x,y-8-q*24);c.restore();}
  }
  globalThis.SpaceTowerRankedArt=Object.freeze({draw});
})();
