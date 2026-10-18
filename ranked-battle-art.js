/* Ranked-only procedural arena; weapon and enemy geometry comes from normal mode. */
(() => {
  const C=SpaceTowerCatalog,R=SpaceTowerRanked,TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const backgrounds=new WeakMap(),fields=new Map(),projectileSprites=new Map(),enemySprites=new Map(),impactSprites=new Map(),vipSprites=new Map();
  const launchAngles=new WeakMap();
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
  function weaponPose(g,u,angle=u.angle,barrel=0){
    const d=C.byId.get(u.id),[px,py]=R.positions[u.slot],tips=rankedTurretMuzzles(d,g.size);
    const axis=Math.atan2(tips.reduce((sum,p)=>sum+p[1],0),tips.reduce((sum,p)=>sum+p[0],0));
    const heading=Math.atan2(Math.sin(angle)*g.sy,Math.cos(angle)*g.sx),rotation=heading-axis;
    const [mx,my]=tips[Math.abs(barrel)%tips.length],cos=Math.cos(rotation),sin=Math.sin(rotation);
    const x=g.cx+px*g.sx,y=g.cy+py*g.sy;
    return {x,y,rotation,axis,tips,muzzleX:x+mx*cos-my*sin,muzzleY:y+mx*sin+my*cos};
  }
  function vipTurret(c,g,d,u,time){
    // Cache ornament/charge textures; rotation and muzzle flashes still update
    // on every presentation frame, independently of this cosmetic animation.
    const radius=g.size*.4,extent=radius*2.5+16,charge=Math.round(clamp(1-u.timer,0,1)*4)/4;
    const tick=Math.floor(time*30),key=[d.id,g.size,g.dpr,charge].join(':');let cached=vipSprites.get(key);
    if(!cached){
      if(vipSprites.size>=80)vipSprites.delete(vipSprites.keys().next().value);
      cached={canvas:layer(extent*2,extent*2,g.dpr||1,()=>{}),tick:-1};vipSprites.set(key,cached);
    }
    if(cached.tick!==tick){
      const ctx=cached.canvas.getContext('2d');ctx.clearRect(0,0,extent*2,extent*2);ctx.save();ctx.translate(extent,extent);
      drawVipBattleArt(ctx,d,radius,tick/30,{fireTimer:1-charge,shotInterval:1,muzzleFlash:0});ctx.restore();cached.tick=tick;
    }
    c.drawImage(cached.canvas,-extent,-extent,extent*2,extent*2);
  }
  function shotPoint(g,p){
    const x=g.cx+p.x*g.sx,y=g.cy+p.y*g.sy,owner=p.owner,position=owner&&R.positions[owner.slot];
    // Split children start at the split point, never back at their parent's gun.
    if(!position||Math.abs((p.originX??p.x)-position[0])>1e-6||Math.abs((p.originY??p.y)-position[1])>1e-6)return [x,y];
    if(!launchAngles.has(p))launchAngles.set(p,p.launchAngle??owner.angle??p.angle);
    const pose=weaponPose(g,owner,launchAngles.get(p),p.uid||0);
    const dx=(p.x-p.originX)*g.sx,dy=(p.y-p.originY)*g.sy;
    const distance=Math.hypot(((p.tx??p.displayEndX??p.x)-p.originX)*g.sx,((p.ty??p.displayEndY??p.y)-p.originY)*g.sy);
    const remaining=1-clamp(Math.hypot(dx,dy)/Math.max(1,distance),0,1);
    return [x+(pose.muzzleX-pose.x)*remaining,y+(pose.muzzleY-pose.y)*remaining];
  }
  function enemies(c,g,items,time){
    const quality=g.quality||'medium';
    for(const e of items){
      if(e.isBoss){drawRankedEnemies(c,[e],{x:g.cx,y:g.cy},1,time,quality);continue;}
      const extent=e.size*1.6+24,key=[e.kind,e.shape,e.color,e.strokeColor,e.size,g.dpr,quality,e.flash>0].join(':');
      let cached=enemySprites.get(key);
      if(!cached){
        if(enemySprites.size>=128)enemySprites.clear();
        cached=layer(extent*2,extent*2,g.dpr||1,ctx=>drawRankedEnemies(ctx,[{...e,x:extent,y:extent,wobble:0,hitKick:0,hp:e.maxHp,frostSlow:0,weakpointTime:0}],{x:extent+1,y:extent},1,0,quality));
        enemySprites.set(key,cached);
      }
      c.save();c.translate(e.x,e.y);c.rotate(Math.atan2(g.cy-e.y,g.cx-e.x)+Math.sin(e.wobble)*.05);
      const scale=1+(e.hitKick||0)*.18;c.scale(scale,scale);c.drawImage(cached,-extent,-extent,extent*2,extent*2);
      if(e.hp<e.maxHp){c.fillStyle='#ffffff38';c.fillRect(-e.size*.5,-e.size*.86,e.size,3);c.fillStyle='#fff';c.fillRect(-e.size*.5,-e.size*.86,e.size*clamp(e.hp/e.maxHp,0,1),3);}
      if(e.frostSlow>.02){c.strokeStyle=`rgba(143,244,255,${.25+clamp(e.frostSlow,0,.7)*.55})`;c.lineWidth=2;c.beginPath();c.arc(0,0,e.size*(.8+e.frostSlow*.3),0,TAU);c.stroke();}
      if(e.weakpointTime>0){c.strokeStyle='#ffef9ab0';c.lineWidth=2.5;c.beginPath();c.arc(0,0,e.size*.994,0,TAU);c.stroke();}
      c.restore();
    }
  }
  function impact(c,g,e,color,q,x,y){
    const phase=Math.min(19,Math.floor(q*20)),progress=phase/20,extent=40*g.size/28+16;
    const key=[color,e.kind,g.size,g.dpr,phase].join(':');let cached=impactSprites.get(key);
    if(!cached){
      if(impactSprites.size>=256)impactSprites.delete(impactSprites.keys().next().value);
      cached=layer(extent*2,extent*2,g.dpr||1,ctx=>{
        ctx.translate(extent,extent);ctx.globalAlpha=(1-progress)*.8;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.lineWidth=1.6;
        const radius=(e.kind==='hit'?9:23)*progress*(g.size/28);ctx.beginPath();ctx.arc(0,0,Math.max(1,radius),0,TAU);ctx.stroke();
        const count=e.kind==='kill'||e.kind==='destroy'?9:5;ctx.beginPath();
        for(let i=0;i<count;i++){const angle=i*TAU/count,r=radius*(.6+i%3*.4);ctx.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);ctx.lineTo(Math.cos(angle)*(r+4*(1-progress)),Math.sin(angle)*(r+4*(1-progress)));}ctx.stroke();
      });impactSprites.set(key,cached);
    }
    c.save();c.translate(x,y);c.rotate((e.x+e.y)*7);c.drawImage(cached,-extent,-extent,extent*2,extent*2);c.restore();
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
      const pose=weaponPose(g,u);c.save();c.rotate(pose.rotation);
      if(d.vipExclusive)vipTurret(c,g,d,u,time);
      else {const art=sprite(u.id,true),size=art.width*g.size*1.26/156;c.drawImage(art,-size/2,-size/2,size,size);}
      if(fire){c.globalAlpha=fire;c.fillStyle=d.color;for(const [mx,my]of pose.tips){c.beginPath();c.ellipse(mx,my,g.size*.16,g.size*.07,pose.axis,0,TAU);c.fill();}}c.restore();
      if(hit){c.strokeStyle=`rgba(255,155,168,${hit})`;c.lineWidth=3;c.beginPath();c.arc(0,0,g.size*.62,0,TAU);c.stroke();}
      c.font=`600 ${Math.max(8,g.size*.26)}px "Segoe UI",sans-serif`;c.textAlign='center';c.strokeStyle='#04101de0';c.lineWidth=3;c.fillStyle=u.star>1?'#ffdf9d':'#d0e8ed';c.strokeText(`★${u.star}`,0,g.size*.78);c.fillText(`★${u.star}`,0,g.size*.78);c.restore();
    }
    const visualEnemies=s.enemies.map(e=>{const[x,y]=point(e.x,e.y);return {...e,x,y,size:Math.max(7,g.size*.24)*e.sizeScale,frostSlow:e.slowUntil>time?e.slow:0,weakpointTime:e.markUntil>time?1:0,v2BuffTimer:e.buffUntil>time?1:0};});
    for(const e of s.enemies)if(e.ability==='buffer'&&e.trail.length){c.save();c.strokeStyle='#e7ff7244';c.lineWidth=5;c.beginPath();e.trail.forEach((p,i)=>{const[x,y]=point(p.x,p.y);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.restore();}
    enemies(c,g,visualEnemies,time);
    for(const e of visualEnemies){drawRankedEnemyOverlay(c,e,{x:g.cx,y:g.cy},1,g.quality);if(e.generation){c.strokeStyle='#e1b5ff55';c.lineWidth=1;c.beginPath();c.arc(e.x,e.y,e.size*.9,0,TAU);c.stroke();}}
    for(const p of s.projectiles){if(time<(p.born??0)||p.ended!==undefined&&time>=p.ended)continue;const offset=Math.sin(Math.min(1,p.age*3)*Math.PI)*(p.spread||0),[px,py]=shotPoint(g,p),x=px-Math.sin(p.angle)*offset*g.sx,y=py+Math.cos(p.angle)*offset*g.sy,angle=Math.atan2(Math.sin(p.angle)*g.sy,Math.cos(p.angle)*g.sx);projectile(c,C.byId.get(p.id),x,y,angle,Math.max(2.5,g.size*.12),time,g.dpr||1);}
    for(const b of s.beams){if(time<b.born||time>=b.until)continue;let[x,y]=point(b.x,b.y);const[tx,ty]=point(b.tx,b.ty),d=C.byId.get(b.id);
      const source=s.units.find(u=>u?.id===b.id&&Math.abs(R.positions[u.slot][0]-b.x)<1e-6&&Math.abs(R.positions[u.slot][1]-b.y)<1e-6);
      if(source){const pose=weaponPose(g,source,Math.atan2(b.ty-b.y,b.tx-b.x));x=pose.muzzleX;y=pose.muzzleY;}
      c.save();c.globalAlpha=clamp((b.until-time)/.24,0,1);
      if(d?.vipExclusive)drawVipBeamSignature(c,d.id,d.color,x,y,tx,ty,1,time,.5);
      else{c.strokeStyle=d?.color||'#ff9de1';c.shadowColor=c.strokeStyle;c.shadowBlur=12;c.lineWidth=b.arc?1.6:3;c.beginPath();c.moveTo(x,y);for(let i=1;i<=8;i++){const q=i/8,jitter=b.arc?Math.sin(i*23+time*20)*6:0;c.lineTo(x+(tx-x)*q+jitter,y+(ty-y)*q-jitter);}c.stroke();c.shadowBlur=0;c.strokeStyle='#ffffff';c.lineWidth=.7;c.stroke();}c.restore();}
    for(const e of s.impacts){if(time<e.born||time>=e.until)continue;const[x,y]=point(e.x,e.y),q=clamp((time-e.born)/(e.until-e.born),0,1),d=C.byId.get(e.id),color=e.kind==='destroy'||e.kind==='core'?'#ff809c':d?.color||'#abceff';
      if(d?.vipExclusive&&(e.kind==='hit'||e.kind==='kill')){drawVipImpactSignature(c,d.id,d.color,x,y,q,time,Math.max(.35,g.size/75));continue;}
      impact(c,g,e,color,q,x,y);
    }
    for(const p of s.popups){if(time<p.born||time>=p.until)continue;const[x,y]=point(p.x,p.y),q=(time-p.born)/.85;c.save();c.globalAlpha=Math.min(1,(1-q)*2.5);c.font=`${p.large?800:600} ${p.large?12:10}px "Segoe UI","Microsoft JhengHei",sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#07101ee0';c.fillStyle=p.color;c.strokeText(globalThis.SpaceTowerLocale?.text(p.text)||p.text,x,y-8-q*24);c.fillText(globalThis.SpaceTowerLocale?.text(p.text)||p.text,x,y-8-q*24);c.restore();}
  }
  globalThis.SpaceTowerRankedArt=Object.freeze({draw,weaponPose,shotPoint});
})();
