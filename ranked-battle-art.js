/* Ranked-only procedural arena; weapon and enemy geometry comes from normal mode. */
(() => {
  const C=SpaceTowerCatalog,R=SpaceTowerRanked,TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const backgrounds=new WeakMap(),fields=new Map(),projectileSprites=new Map(),enemySprites=new Map(),impactSprites=new Map(),vipSprites=new Map();
  const launchAngles=new WeakMap();
  const enemyViews=new WeakMap(),popupLabels=new WeakMap(),textSprites=new Map();
  function layer(w,h,dpr,paint){const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(w*dpr));canvas.height=Math.max(1,Math.ceil(h*dpr));const context=canvas.getContext('2d');context.scale(dpr,dpr);paint(context);return canvas;}
  function polygon(c,x,y,r,n,a=0){c.beginPath();for(let i=0;i<n;i++){const angle=a+i*TAU/n;i?c.lineTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r):c.moveTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r);}c.closePath();}
  function label(c,text,size,weight,color,x,y,dpr=1){
    const font=`${weight} ${size}px "Segoe UI","Microsoft JhengHei",sans-serif`,key=[text,font,color,dpr].join('|');let cached=textSprites.get(key);
    if(!cached){
      c.font=font;const width=Math.ceil(c.measureText(text)?.width||text.length*size)+10,height=Math.ceil(size*1.6)+10,baseline=height-7;
      cached={width,height,baseline,canvas:layer(width,height,dpr,ctx=>{ctx.font=font;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#07101ee0';ctx.fillStyle=color;ctx.strokeText(text,width/2,baseline);ctx.fillText(text,width/2,baseline);})};
      if(textSprites.size>=256)textSprites.delete(textSprites.keys().next().value);textSprites.set(key,cached);
    }
    c.drawImage(cached.canvas,x-cached.width/2,y-cached.baseline,cached.width,cached.height);
  }
  function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
  // Same deep-space palette as normal mode, so both modes read as one world.
  function paintBackground(c,g,s,time,index) {
    const accent=index?'255,128,176':'127,241,255';
    const fill=c.createLinearGradient(0,0,g.w,g.h);fill.addColorStop(0,'#02040b');fill.addColorStop(.42,'#061325');fill.addColorStop(1,'#02030a');c.fillStyle=fill;c.fillRect(0,0,g.w,g.h);
    for(const [x,y,r,color] of [[.22,.24,.62,'53,123,245,.20'],[.78,.68,.58,index?'255,82,146,.16':'124,77,255,.10']]){const glow=c.createRadialGradient(g.w*x,g.h*y,0,g.w*x,g.h*y,Math.max(g.w,g.h)*r);glow.addColorStop(0,`rgba(${color})`);glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,g.w,g.h);}
    for(let i=0;i<70;i++){const x=((i*137.4)%1009)/1009*g.w,y=((i*83.7+31)%619)/619*g.h;c.fillStyle=`rgba(193,218,255,${.18+(i%5)*.07})`;c.fillRect(x,y,i%11?1:2,i%11?1:2);}
    const T=R.TRACK,pt=(x,y)=>[g.cx+x*g.sx,g.cy+y*g.sy],lane=Math.max(14,Math.abs(g.sx)*.17);
    const [x1,y1]=pt(-T.w,-T.h),[x2,y2]=pt(T.w,T.h),left=Math.min(x1,x2),top=Math.min(y1,y2),width=Math.abs(x2-x1),height=Math.abs(y2-y1);
    // Track band: a recessed metal lane with lit edges.
    c.save();c.lineJoin='round';
    roundRect(c,left,top,width,height,lane*.9);c.strokeStyle='rgba(4,12,24,.92)';c.lineWidth=lane*1.25;c.stroke();
    c.strokeStyle=`rgba(${accent},.10)`;c.lineWidth=lane;c.stroke();
    roundRect(c,left-lane*.55,top-lane*.55,width+lane*1.1,height+lane*1.1,lane*1.3);c.strokeStyle=`rgba(${accent},.38)`;c.lineWidth=1.2;c.stroke();
    roundRect(c,left+lane*.55,top+lane*.55,width-lane*1.1,height-lane*1.1,lane*.5);c.strokeStyle=`rgba(${accent},.22)`;c.lineWidth=1;c.stroke();
    // Inner deck behind the turret grid.
    roundRect(c,left+lane*.9,top+lane*.9,width-lane*1.8,height-lane*1.8,10);c.fillStyle='rgba(8,22,40,.55)';c.fill();
    c.restore();
  }
  function background(c,g,s,time,index){
    const key=[g.w,g.h,g.dpr||1,index,g.sx,g.sy].join(':');let cached=backgrounds.get(c);
    if(cached?.key!==key){cached={key,canvas:layer(g.w,g.h,g.dpr||1,ctx=>paintBackground(ctx,g,s,0,index)),alarm:layer(g.w,g.h,g.dpr||1,ctx=>{const gradient=ctx.createRadialGradient(g.cx,g.cy,g.h*.2,g.cx,g.cy,g.w*.7);gradient.addColorStop(0,'#ff607600');gradient.addColorStop(1,'#b42859');ctx.fillStyle=gradient;ctx.fillRect(0,0,g.w,g.h);})};backgrounds.set(c,cached);}
    c.drawImage(cached.canvas,0,0,g.w,g.h);
    // Moving chevrons show the direction of travel around the loop.
    const accent=index?'#ff9ec9':'#8ff4ff',step=.34,offset=(time*.6)%step;c.save();c.fillStyle=accent;c.globalAlpha=.35;
    for(let d=offset;d<R.PATH_LENGTH-.1;d+=step){const p=R.pathPoint(d),x=g.cx+p.x*g.sx,y=g.cy+p.y*g.sy,a=Math.atan2(Math.sin(p.heading)*g.sy,Math.cos(p.heading)*g.sx),z=Math.max(3,g.size*.13);c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(z,0);c.lineTo(-z*.6,z*.8);c.lineTo(-z*.2,0);c.lineTo(-z*.6,-z*.8);c.closePath();c.fill();c.restore();}
    c.restore();
    const pressure=Math.min(1,s.enemies.length/40);if(pressure>.3){c.save();c.globalAlpha=pressure*.18*(.8+Math.sin(time*3)*.2);c.drawImage(cached.alarm,0,0,g.w,g.h);c.restore();}
  }

  // ---- Animated landmarks: a warp vortex where enemies enter, a floating reactor where they strike.
  const glowSprites=new Map(),tileSprites=new Map();
  // Size-independent textures: rasterized once at a reference size and scaled on draw.
  function glow(color){
    let cached=glowSprites.get(color);const radius=64;
    if(!cached){if(glowSprites.size>=24)glowSprites.clear();cached=layer(radius*2,radius*2,1,ctx=>{const g=ctx.createRadialGradient(radius,radius,0,radius,radius,radius);g.addColorStop(0,color+'cc');g.addColorStop(.35,color+'55');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(0,0,radius*2,radius*2);});glowSprites.set(color,cached);}
    return cached;
  }
  function gate(c,g,time,index){
    const p=R.pathPoint(0),x=g.cx+(p.x+.03)*g.sx,y=g.cy+p.y*g.sy,r=g.size*.62,hue=index?'#ff6fae':'#b26bff';
    c.save();c.translate(x,y);
    const halo=glow(hue);c.drawImage(halo,-r*1.9,-r*1.9,r*3.8,r*3.8);
    c.fillStyle='#05020d';c.beginPath();c.arc(0,0,r*.62,0,TAU);c.fill();
    // Spiral arms pulled toward the singularity.
    c.lineCap='round';
    for(let arm=0;arm<3;arm++){const base=time*2.4+arm*TAU/3;c.strokeStyle=arm?hue:'#ffd6f4';c.globalAlpha=arm?.75:.9;c.lineWidth=arm?2:1.6;c.beginPath();
      for(let i=0;i<=16;i++){const q=i/16,a=base+q*2.6,rr=r*(1.05-q*.72);i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.8):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr*.8);}c.stroke();}
    c.globalAlpha=1;c.strokeStyle='#fff3fd';c.lineWidth=1.2;c.beginPath();c.ellipse(0,0,r*.64,r*.52,time*.8,0,TAU);c.stroke();
    // Infalling sparks.
    for(let i=0;i<7;i++){const q=((time*.7+i/7)%1),a=i*2.1+time*1.3,rr=r*(1.5-q*1.1);c.globalAlpha=q*.9;c.fillStyle='#ffe3fa';c.fillRect(Math.cos(a)*rr-1,Math.sin(a)*rr*.8-1,2,2);}
    c.restore();
  }
  // Last Stand Shield: a hex dome over the core with one pip per remaining
  // charge; it flashes when it blocks a hit and bursts open when it activates.
  function coreShield(c,g,time,s,x,y,r){
    const up=s.impacts.find(e=>e.kind==='shieldUp'&&time>=e.born&&time<e.born+.7),block=s.impacts.find(e=>e.kind==='shield'&&time>=e.born&&time<e.born+.35);
    if(!s.shieldCharges&&!up&&!block)return;
    const R=r*1.6,flash=block?1-(time-block.born)/.35:0;
    c.save();c.translate(x,y+r*.05);
    if(up){const q=(time-up.born)/.7;c.globalAlpha=1-q;c.strokeStyle='#ffffff';c.lineWidth=5*(1-q)+1;polygon(c,0,0,R*(.6+q*1.8),6,Math.PI/6);c.stroke();const halo=glow('#bff6ff');c.globalAlpha=(1-q)*.9;c.drawImage(halo,-R*2.4,-R*2.4,R*4.8,R*4.8);}
    if(s.shieldCharges>0||block){
      const halo=glow('#7fe8ff');c.globalAlpha=.7+flash*.3;c.drawImage(halo,-R*1.5,-R*1.5,R*3,R*3);
      c.globalAlpha=.3+flash*.35;c.fillStyle='#7fe8ff';polygon(c,0,0,R,6,Math.PI/6);c.fill();
      c.globalAlpha=1;c.strokeStyle=flash?'#ffffff':'#bff6ff';c.lineWidth=3+flash*3;polygon(c,0,0,R,6,Math.PI/6);c.stroke();
      c.globalAlpha=.55;c.lineWidth=1;c.strokeStyle='#e6fdff';polygon(c,0,0,R*.82,6,Math.PI/6);c.stroke();
      c.globalAlpha=.9;c.lineWidth=2;c.strokeStyle='#e6fdff';c.beginPath();c.arc(0,0,R*.93,time*1.2,time*1.2+.7);c.stroke();
      const n=s.shieldCharges,gap=r*.36;for(let i=0;i<n;i++){c.globalAlpha=1;c.fillStyle='#bff6ff';polygon(c,(i-(n-1)/2)*gap,-r*.98,r*.15,6,Math.PI/6);c.fill();c.strokeStyle='#ffffff';c.lineWidth=1;c.stroke();}
    }
    c.restore();
  }
  // Shield Generators: a pale-blue hex barrier over the core, brighter per generator,
  // rippling outward whenever the core is rammed.
  function generatorShield(c,g,time,s,x,y,r){
    const n=s.units.filter(u=>u&&C.byId.get(u.id)?.shield&&u.id!=='vip_nebula_hymn').length;if(!n)return;
    const R=r*1.9,hit=s.impacts.find(e=>e.kind==='core'&&time>=e.born&&time<e.born+.45);
    c.save();c.translate(x,y+r*.05);c.globalAlpha=Math.min(.22,.07+n*.04);c.fillStyle='#87c7ff';polygon(c,0,0,R,6,0);c.fill();
    c.globalAlpha=Math.min(.85,.35+n*.15);c.strokeStyle='#bfe2ff';c.lineWidth=1.4+n*.4;polygon(c,0,0,R,6,0);c.stroke();
    if(hit){const q=(time-hit.born)/.45;for(let k=0;k<2;k++){const qq=Math.max(0,q-k*.15);c.globalAlpha=(1-qq)*.9;c.strokeStyle='#ffffff';c.lineWidth=2*(1-qq)+.5;polygon(c,0,0,R*(.7+qq*.5),6,0);c.stroke();}}
    c.restore();
  }
  function core(c,g,time,index,s,hurt){
    const [px,py]=R.CORE,x=g.cx+px*g.sx,y=g.cy+py*g.sy,r=g.size*.58,ratio=clamp(s.hp/s.maxHp,0,1);
    const color=hurt?'#ff6d8d':index?'#ff9ec9':ratio<.3?'#ff8a7a':'#7ff1ff';
    c.save();c.translate(x,y);
    const halo=glow(index?'#ff9ec9':'#7ff1ff');c.globalAlpha=.55+Math.sin(time*3)*.15+(hurt?.35:0);c.drawImage(halo,-r*2,-r*2,r*4,r*4);c.globalAlpha=1;
    // Base pad.
    c.fillStyle='#071426';c.strokeStyle=color;c.lineWidth=1.4;polygon(c,0,r*.18,r*.95,6,Math.PI/6);c.fill();c.globalAlpha=.6;c.stroke();c.globalAlpha=1;
    // HP ring around the pad.
    c.strokeStyle='#ffffff22';c.lineWidth=3;c.beginPath();c.arc(0,r*.1,r*1.1,0,TAU);c.stroke();
    c.strokeStyle=color;c.beginPath();c.arc(0,r*.1,r*1.1,-Math.PI/2,-Math.PI/2+TAU*ratio);c.stroke();
    // Floating crystal with lit and shaded faces.
    const bob=Math.sin(time*2.2)*r*.08-r*.12,k=hurt?1.12:1;c.translate(0,bob);c.scale(k,k);
    c.fillStyle=color;c.beginPath();c.moveTo(0,-r*.72);c.lineTo(r*.42,0);c.lineTo(0,r*.5);c.lineTo(-r*.42,0);c.closePath();c.fill();
    c.fillStyle='#ffffffcc';c.beginPath();c.moveTo(0,-r*.72);c.lineTo(-r*.42,0);c.lineTo(0,-r*.06);c.closePath();c.fill();
    c.fillStyle='#00000040';c.beginPath();c.moveTo(0,r*.5);c.lineTo(r*.42,0);c.lineTo(0,-r*.06);c.closePath();c.fill();
    c.strokeStyle='#ffffff';c.lineWidth=1;c.beginPath();c.moveTo(0,-r*.72);c.lineTo(r*.42,0);c.lineTo(0,r*.5);c.lineTo(-r*.42,0);c.closePath();c.stroke();
    // Orbiting shield shards.
    for(let i=0;i<3;i++){const a=time*1.6+i*TAU/3;c.fillStyle=color;c.globalAlpha=.85;c.save();c.translate(Math.cos(a)*r*.82,Math.sin(a)*r*.3);c.rotate(a);c.fillRect(-r*.08,-r*.03,r*.16,r*.06);c.restore();}
    c.restore();
    coreShield(c,g,time,s,x,y,r);
    generatorShield(c,g,time,s,x,y,r);
  }
  // Raised turret plinths: a lit top face, darker lip and a contact shadow, rasterized once per color.
  function tile(c,g,color,occupied){
    const size=96,drawn=g.size*1.24,key=color||'empty';let cached=tileSprites.get(key);
    if(!cached){if(tileSprites.size>=40)tileSprites.clear();const pad=8;cached=layer(size+pad*2,size+pad*2,1.5,ctx=>{
      ctx.translate(pad,pad);const r=size*.18,depth=size*.09;
      ctx.fillStyle='rgba(0,0,0,.45)';roundRect(ctx,2,depth+3,size-4,size-depth,r);ctx.fill();
      ctx.fillStyle=occupied?'#0b1c30':'#081525';roundRect(ctx,0,depth,size,size-depth,r);ctx.fill();
      const top=ctx.createLinearGradient(0,0,0,size-depth);top.addColorStop(0,occupied?'#1d3a58':'#10233a');top.addColorStop(1,occupied?'#0e2238':'#0a1829');
      ctx.fillStyle=top;roundRect(ctx,0,0,size,size-depth,r);ctx.fill();
      ctx.strokeStyle=occupied?color:'#5f86a233';ctx.globalAlpha=occupied?.9:1;ctx.lineWidth=occupied?1.6:1;roundRect(ctx,.8,.8,size-1.6,size-depth-1.6,r);ctx.stroke();
      ctx.globalAlpha=occupied?.35:.15;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r,2);ctx.lineTo(size-r,2);ctx.stroke();
      if(!occupied){ctx.globalAlpha=.35;ctx.strokeStyle='#7fa6c0';ctx.beginPath();ctx.moveTo(size/2-4,(size-depth)/2);ctx.lineTo(size/2+4,(size-depth)/2);ctx.moveTo(size/2,(size-depth)/2-4);ctx.lineTo(size/2,(size-depth)/2+4);ctx.stroke();}
    });cached.pad=pad;cached.size=size;tileSprites.set(key,cached);}
    const k=drawn/size;c.drawImage(cached,(-size/2-cached.pad)*k,(-size/2-cached.pad)*k,(size+cached.pad*2)*k,(size+cached.pad*2)*k);
  }
  function field(c,g,x,y,definition,time,star){
    // Shield auras are now shown on the core itself; only slow fields draw a ring here.
    const shield=false,slow=definition.slowAura;if(!slow)return;
    const rx=g.sx*(shield?.42:.48),ry=g.sy*(shield?.42:.48),color=definition.color;
    const extent=rx+3,key=[definition.id,rx,ry,g.dpr||1].join(':');let cached=fields.get(key);
    if(!cached){if(fields.size>=20)fields.clear();cached=layer(extent*2,extent*2,g.dpr||1,ctx=>{ctx.translate(extent,extent);const glow=ctx.createRadialGradient(0,0,rx*.15,0,0,rx);glow.addColorStop(0,color+'06');glow.addColorStop(.85,color+'15');glow.addColorStop(1,color+'45');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.strokeStyle=color;ctx.globalAlpha=.36;ctx.lineWidth=1.2;ctx.stroke();if(shield){ctx.clip();ctx.strokeStyle=color+'66';ctx.lineWidth=.65;const cell=13;for(let row=-5;row<=5;row++)for(let col=-8;col<=8;col++){polygon(ctx,col*cell*1.73+(row%2)*cell*.865,row*cell*1.5,cell,6,Math.PI/6);ctx.stroke();}}});fields.set(key,cached);}
    c.save();c.translate(x,y);c.scale(1,ry/rx);c.drawImage(cached,-extent,-extent,extent*2,extent*2);c.strokeStyle=color;c.globalAlpha=.36;
    if(shield){c.globalAlpha=.7;c.lineWidth=1.8;c.beginPath();c.arc(0,0,rx,time*.35,time*.35+.75);c.stroke();}
    else{c.rotate(-time*.25);c.setLineDash([3,9]);c.lineWidth=2;c.beginPath();c.arc(0,0,rx*.9,0,TAU);c.stroke();c.setLineDash([]);for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(rx*.74,0);c.lineTo(rx*.84,0);c.stroke();}}
    // Clock hands sweep slowly across the time field.
    if(slow){c.rotate(time*.25);c.globalAlpha=.55;c.strokeStyle='#d6f3ff';c.lineCap='round';c.lineWidth=2.2;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(time*.6)*rx*.55,Math.sin(time*.6)*rx*.55);c.stroke();c.lineWidth=1.4;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(time*.05)*rx*.35,Math.sin(time*.05)*rx*.35);c.stroke();}
    c.restore();
  }
  function projectile(c,d,x,y,angle,radius,time,dpr){
    const key=[d.id,radius,dpr].join(':'),tick=Math.floor(time*24),extent=radius*10+20;let cached=projectileSprites.get(key);
    if(!cached){if(projectileSprites.size>=64)projectileSprites.clear();const canvas=layer(extent*2,extent*2,dpr,()=>{});cached={canvas,context:canvas.getContext('2d'),tick:-1};projectileSprites.set(key,cached);}
    if(cached.tick!==tick){const ctx=cached.context;ctx.clearRect(0,0,extent*2,extent*2);drawRankedProjectile(ctx,d,extent,extent,0,radius,tick/24);cached.tick=tick;}
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
      const canvas=layer(extent*2,extent*2,g.dpr||1,()=>{});cached={canvas,context:canvas.getContext('2d'),tick:-1};vipSprites.set(key,cached);
    }
    if(cached.tick!==tick){
      const ctx=cached.context;ctx.clearRect(0,0,extent*2,extent*2);ctx.save();ctx.translate(extent,extent);
      drawVipBattleArt(ctx,d,radius,tick/30,{fireTimer:1-charge,shotInterval:1,muzzleFlash:0});ctx.restore();cached.tick=tick;
    }
    c.drawImage(cached.canvas,-extent,-extent,extent*2,extent*2);
  }
  // Local matches simulate at 20 Hz; between ticks we draw ships and shells between their
  // previous and current tick positions so motion stays smooth at the display's frame rate.
  const smoothTrack=new WeakMap();let smoothAlpha=null;
  function smoothXY(o){if(smoothAlpha===null)return [o.x,o.y];let t=smoothTrack.get(o);
    if(!t){t={px:o.x,py:o.y,cx:o.x,cy:o.y,pa:o.angle,ca:o.angle};smoothTrack.set(o,t);}
    if(t.cx!==o.x||t.cy!==o.y){const jump=Math.hypot(o.x-t.cx,o.y-t.cy)>.3;t.px=jump?o.x:t.cx;t.py=jump?o.y:t.cy;t.cx=o.x;t.cy=o.y;t.pa=jump?o.angle:t.ca;t.ca=o.angle;}
    return [t.px+(t.cx-t.px)*smoothAlpha,t.py+(t.cy-t.py)*smoothAlpha];}
  // Sword light: every flying sword remembers where it has just been on screen, and a tapered streak of
  // light is drawn along that real (curved) path, so a volley reads as one flowing river of light.
  const swordTrails=new WeakMap();
  function swordStreak(c,p,x,y,pr,gold){let h=swordTrails.get(p);if(!h){h=[];swordTrails.set(p,h);}const last=h[h.length-1];
    if(!last||Math.hypot(last[0]-x,last[1]-y)>1.5){h.push([x,y]);if(h.length>12)h.shift();}if(h.length<3)return;
    c.save();c.globalCompositeOperation='lighter';c.lineCap='butt';c.lineJoin='round';
    for(let i=1;i<h.length;i++){const k=i/h.length;c.strokeStyle=gold?`rgba(255,214,120,${k*.55})`:`rgba(160,225,255,${k*.5})`;c.lineWidth=pr*(.15+k*.7);c.beginPath();c.moveTo(h[i-1][0],h[i-1][1]);c.lineTo(h[i][0],h[i][1]);c.stroke();}
    c.lineCap='round';c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=pr*.18;c.beginPath();c.moveTo(h[Math.max(0,h.length-5)][0],h[Math.max(0,h.length-5)][1]);for(let i=Math.max(1,h.length-4);i<h.length;i++)c.lineTo(h[i][0],h[i][1]);c.stroke();c.restore();}
  // Layered lightning: a wide violet glow, a gold body and a white-hot core along the same jagged path.
  function boltPath(c,pts,alpha,w){c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';
    for(const[col,lw,a]of[['#8a4dff',w*.3,.45],['#ffd36e',w*.12,.85],['#fffbe6',w*.045,1]]){c.globalAlpha=alpha*a;c.strokeStyle=col;c.lineWidth=lw;c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();}c.restore();}
  // Heading eased between ticks the same way, taking the short way round.
  function smoothAngle(o){const t=smoothAlpha===null?null:smoothTrack.get(o);if(!t||t.pa===undefined||t.ca===undefined)return o.angle;const d=Math.atan2(Math.sin(t.ca-t.pa),Math.cos(t.ca-t.pa));return t.pa+d*smoothAlpha;}
  function shotPoint(g,p){
    const [sx0,sy0]=smoothXY(p),x=g.cx+sx0*g.sx,y=g.cy+sy0*g.sy,owner=p.owner,position=owner&&R.positions[owner.slot];
    // Split children start at the split point, never back at their parent's gun.
    if(!position||Math.abs((p.originX??p.x)-position[0])>1e-6||Math.abs((p.originY??p.y)-position[1])>1e-6)return [x,y];
    if(!launchAngles.has(p))launchAngles.set(p,p.launchAngle??owner.angle??p.angle);
    const pose=weaponPose(g,owner,launchAngles.get(p),p.uid||0);
    const dx=(sx0-p.originX)*g.sx,dy=(sy0-p.originY)*g.sy;
    const distance=Math.hypot(((p.tx??p.displayEndX??p.x)-p.originX)*g.sx,((p.ty??p.displayEndY??p.y)-p.originY)*g.sy);
    const remaining=1-clamp(Math.hypot(dx,dy)/Math.max(1,distance),0,1);
    return [x+(pose.muzzleX-pose.x)*remaining,y+(pose.muzzleY-pose.y)*remaining];
  }
  function enemies(c,g,items,time){
    const quality=g.quality||'medium';let live=0;
    // Sent raids can put dozens of boss hulls on a board. Two lead bosses keep
    // their live animation; the rest use the same cached hull sprite.
    for(const e of items){
      if(e.isBoss&&!e.counter&&live++<2){drawRankedEnemies(c,[e],{x:e.x+Math.cos(e.screenHeading)*100,y:e.y+Math.sin(e.screenHeading)*100},1,time,quality);if(e.counter){c.strokeStyle='#ffb86b';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.arc(e.x,e.y,e.size*1.25,0,TAU);c.stroke();c.setLineDash([]);}continue;}
      const extent=e.size*1.6+24,key=[e.kind,e.shape,e.color,e.strokeColor,Math.round(e.size*2)/2,g.dpr,quality,e.flash>0].join(':');
      let cached=enemySprites.get(key);
      if(!cached){
        if(enemySprites.size>=128)enemySprites.clear();
        const style=globalThis.SpaceTowerEnemyStyles?.[e.kind];
        cached=style?layer(extent*2,extent*2,g.dpr||1,ctx=>{ctx.translate(extent,extent);ctx.lineJoin='round';ctx.lineWidth=Math.max(1.2,e.size*.09);ctx.fillStyle=e.flash>0?'#ffffff':e.color;ctx.strokeStyle=e.flash>0?'#ffffff':e.strokeColor;ctx.shadowColor=e.color;ctx.shadowBlur=e.flash>0?10:5;style(ctx,e.size);}):layer(extent*2,extent*2,g.dpr||1,ctx=>drawRankedEnemies(ctx,[Object.assign(Object.create(e),{x:extent,y:extent,wobble:0,hitKick:0,hp:e.maxHp,frostSlow:0,weakpointTime:0})],{x:extent+1,y:extent},1,0,quality));
        enemySprites.set(key,cached);
      }
      c.save();c.translate(e.x,e.y);c.rotate(e.screenHeading+Math.sin(e.wobble)*.05);
      if(e.counter){c.strokeStyle='#ffb86b99';c.lineWidth=1.2;c.setLineDash([3,4]);c.beginPath();c.arc(0,0,e.size*1.2,0,TAU);c.stroke();c.setLineDash([]);}
      const scale=1+(e.hitKick||0)*.18;c.scale(scale,scale);c.drawImage(cached,-extent,-extent,extent*2,extent*2);
      // Cursed (weakened) ships wear a violet rune above them and a dark veil.
      // Each burn tick (every 0.5 s) tints the hull itself red: a red copy of
      // the same cached silhouette is laid over it and fades out.
      if(e.burnFlashAt!==undefined&&time-e.burnFlashAt>=0&&time-e.burnFlashAt<.2){const tk=e.burnGreen?'green':'red';if(!cached[tk]){const red=document.createElement('canvas');red.width=cached.width;red.height=cached.height;const x=red.getContext('2d');x.drawImage(cached,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=e.burnGreen?'#3dff8a':'#ff3b2a';x.fillRect(0,0,red.width,red.height);cached[tk]=red;}
        c.save();c.globalAlpha=.8*(1-(time-e.burnFlashAt)/.2);c.drawImage(cached[tk],-extent,-extent,extent*2,extent*2);c.restore();}
      // Paralysed (chain lightning): little electric sparks crackle around the hull.
      if(e.stunUntil>time){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#d9c2ff';c.lineWidth=1.2;const f=Math.floor(time*24);for(let i=0;i<3;i++){const a=(f*1.7+i*2.1)%TAU,r1=e.size*.6,r2=e.size*1.05;c.beginPath();c.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);c.lineTo(Math.cos(a+.3)*(r1+r2)/2,Math.sin(a+.3)*(r1+r2)/2);c.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);c.stroke();}c.restore();}
      // Tidal splash on a shoved ship: a white spray cone thrown backwards.
      if(e.splashAt!==undefined&&time-e.splashAt>=0&&time-e.splashAt<.4){const k=(time-e.splashAt)/.4;c.save();c.globalAlpha=1-k;c.fillStyle='#dff0ff';for(let i=0;i<6;i++){const a=Math.PI+(i-2.5)*.35,d=e.size*(.8+k*1.6);c.beginPath();c.arc(Math.cos(a)*d,Math.sin(a)*d,e.size*.13*(1-k)+1,0,TAU);c.fill();}c.strokeStyle='#5aa0ff';c.lineWidth=2;c.beginPath();c.arc(-e.size*.6,0,e.size*(.7+k*.8),Math.PI*.65,Math.PI*1.35);c.stroke();c.restore();}
      // Burning ships trail flickering flame tongues behind the hull.
      if(e.burnUntil>time){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const f=Math.sin(time*18+i*2.3+e.id)*.25+.75,len=e.size*(1.1+i*.25)*f;c.globalAlpha=.75-i*.18;c.fillStyle=e.burnGreen?(i?'#1fd673':'#b8ffcf'):(i?'#ff6a2a':'#ffd36e');c.beginPath();c.moveTo(-e.size*.3,(i-1)*e.size*.32);c.quadraticCurveTo(-len*.7,(i-1)*e.size*.32-e.size*.25,-len-e.size*.3,(i-1)*e.size*.2);c.quadraticCurveTo(-len*.7,(i-1)*e.size*.32+e.size*.25,-e.size*.3,(i-1)*e.size*.32);c.fill();}c.restore();}
      // Slowed ships wear a pale frost coat with three small ice crystals.
      if(e.frostSlow>.02){const k=clamp(e.frostSlow,0,.7);c.fillStyle=`rgba(170,235,255,${.16+k*.35})`;c.beginPath();c.arc(0,0,e.size*.8,0,TAU);c.fill();c.strokeStyle='#e8fbff';c.lineWidth=1;c.globalAlpha=.6+k*.4;for(let i=0;i<3;i++){const a=i*TAU/3+.5,x=Math.cos(a)*e.size*.72,y=Math.sin(a)*e.size*.72,z=e.size*.2;c.beginPath();c.moveTo(x-z,y);c.lineTo(x+z,y);c.moveTo(x,y-z);c.lineTo(x,y+z);c.stroke();}c.globalAlpha=1;}
      // Vulnerability mark: a red target reticle locked on the hull.
      if(e.weakpointTime>0){c.save();c.rotate(-e.screenHeading+time*1.5);c.strokeStyle='#ff6f91';c.lineWidth=1.6;c.beginPath();c.arc(0,0,e.size*1.05,0,TAU);c.stroke();for(let k=0;k<4;k++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(e.size*.75,0);c.lineTo(e.size*1.3,0);c.stroke();}c.restore();}
      c.restore();
    }
  }
  function impact(c,g,e,color,q,x,y){
    // One reusable atlas per color/shape. Per-phase canvases used to evict
    // each other during sustained fire, allocating thousands of textures.
    // Canonical geometry also survives adaptive resolution changes.
    const style=e.kind==='hit'?'hit':['kill','destroy'].includes(e.kind)?'burst':'ring';
    const phase=Math.min(19,Math.floor(q*20)),progress=phase/20,cell=104,extent=cell/2,key=color+':'+style;let cached=impactSprites.get(key);
    if(!cached){
      if(impactSprites.size>=40)impactSprites.delete(impactSprites.keys().next().value);
      const canvas=layer(cell*5,cell*4,1,()=>{});cached={canvas,context:canvas.getContext('2d'),ready:0};
    }
    impactSprites.delete(key);impactSprites.set(key,cached);
    const sx=phase%5*cell,sy=Math.floor(phase/5)*cell;
    if(!(cached.ready&(1<<phase))){
      const ctx=cached.context;ctx.save();ctx.beginPath();ctx.rect(sx,sy,cell,cell);ctx.clip();ctx.translate(sx+extent,sy+extent);ctx.globalAlpha=(1-progress)*.8;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.lineWidth=1.6;
      const radius=(style==='hit'?9:23)*progress*(40/28);ctx.beginPath();ctx.arc(0,0,Math.max(1,radius),0,TAU);ctx.stroke();
      const count=style==='burst'?9:5;ctx.beginPath();for(let i=0;i<count;i++){const angle=i*TAU/count,r=radius*(.6+i%3*.4);ctx.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);ctx.lineTo(Math.cos(angle)*(r+4*(1-progress)),Math.sin(angle)*(r+4*(1-progress)));}ctx.stroke();ctx.restore();cached.ready|=1<<phase;
    }
    const size=cell*g.size/40*(globalThis.SpaceTowerShotStyles?.[e.id]?.impact||1);c.save();c.translate(x,y);c.rotate((e.x+e.y)*7);c.drawImage(cached.canvas,sx,sy,cell,cell,-size/2,-size/2,size,size);c.restore();
  }
  // VIP hit signatures are rasterized once per turret/scale into a 16-phase
  // atlas. Drawing them live cost thousands of blurred strokes per frame.
  const vipImpactSprites=new Map();
  function vipImpact(c,g,d,q,x,y,scale){
    const phase=Math.min(15,Math.floor(q*16)),half=Math.ceil(100*scale)+4,cell=half*2,dpr=Math.min(2,g.dpr||1),key=[d.id,Math.round(scale*40),dpr].join(':');
    let cached=vipImpactSprites.get(key);
    if(!cached){if(vipImpactSprites.size>=24)vipImpactSprites.delete(vipImpactSprites.keys().next().value);const canvas=layer(cell*4,cell*4,dpr,()=>{});cached={canvas,context:canvas.getContext('2d'),ready:0,dpr};vipImpactSprites.set(key,cached);}
    const sx=phase%4*cell,sy=Math.floor(phase/4)*cell;
    if(!(cached.ready&(1<<phase))){const ctx=cached.context;ctx.save();ctx.beginPath();ctx.rect(sx,sy,cell,cell);ctx.clip();drawVipImpactSignature(ctx,d.id,d.color,sx+half,sy+half,(phase+.5)/16,0,scale);ctx.restore();cached.ready|=1<<phase;}
    c.drawImage(cached.canvas,sx*cached.dpr,sy*cached.dpr,cell*cached.dpr,cell*cached.dpr,x-half,y-half,cell,cell);
  }
  // Keep the newest effects when a board gets crowded; old ones are already fading.
  // Split children get their own shot style ("<id>_child") while keeping the turret's colour.
  const childDefs=new Map();function childDef(id,variant='child'){const key=id+'_'+variant;let d=childDefs.get(key);if(!d){d={...C.byId.get(id),id:key};childDefs.set(key,d);}return d;}
  function newest(list,time,limit,keep=()=>true){const live=[];for(const e of list)if(time>=e.born&&time<e.until&&keep(e))live.push(e);return live.length>limit?live.slice(-limit):live;}
  // Every ship carries an upright health bar (never rotated with the hull):
  // green → yellow → red, a blue strip for shields, and a number on bosses.
  function healthBars(c,g,items){
    for(const e of items){
      const ratio=clamp(e.hp/e.maxHp,0,1),boss=e.isBoss,w=Math.max(10,e.size*(boss?2:1.4)),h=boss?4:2,x=e.x-w/2,y=e.y-e.size*(boss?1.05:.95)-h-1;
      c.fillStyle='rgba(3,8,18,.7)';c.fillRect(x-.5,y-.5,w+1,h+1);
      c.fillStyle=ratio>.6?'#5cf59a':ratio>.3?'#ffd45e':'#ff5d6c';c.fillRect(x,y,w*ratio,h);
      if(e.shieldHp>0&&e.maxShieldHp>0){c.fillStyle='#8cc8ff';c.fillRect(x,y-3,w*clamp(e.shieldHp/e.maxShieldHp,0,1),2);}
      if(boss)label(c,String(Math.ceil(e.hp)),Math.max(9,g.size*.17),800,'#ffffff',e.x,y-3,g.dpr);
    }
  }
  function draw(c,g,s,m,index,sprite){
    smoothAlpha=Number.isFinite(m.renderAlpha)?m.renderAlpha:null;
    const time=smoothAlpha===null?m.elapsed:m.elapsed-.05+smoothAlpha*.05,point=(x,y)=>[g.cx+x*g.sx,g.cy+y*g.sy];
    background(c,g,s,time,index);
    // The core remains visible under the center emplacement.
    const hurt=s.impacts.some(e=>e.kind==='core'&&time>=e.born&&time<e.born+.3);
    gate(c,g,time,index);
    core(c,g,time,index,s,hurt);
    for(let slot=0;slot<R.SLOT_COUNT;slot++){
      const u=s.units[slot],[x,y]=point(...R.positions[slot]);
      c.save();c.translate(x,y);
      const d=u&&C.byId.get(u.id);tile(c,g,d?.color,!!u);
      if(!u){c.restore();continue;}
      // Full-HP Berserker: while the core is untouched the turret burns with a
      // pulsing red-gold rage aura and flame spikes; it goes dark once hurt.
      if(d.fullHpRate){const rage=s.hp>=s.maxHp;c.save();if(rage){c.globalCompositeOperation='lighter';const aura=glow('#ff5a2a');c.globalAlpha=.55+Math.sin(time*9+slot)*.25;c.drawImage(aura,-g.size*.9,-g.size*.9,g.size*1.8,g.size*1.8);c.fillStyle='#ffcf5a';for(let i=0;i<8;i++){const a=i*TAU/8+time*2,f=.8+Math.sin(time*14+i*1.7)*.2,r1=g.size*.48,r2=g.size*(.62+.1*f);c.globalAlpha=.7;c.beginPath();c.moveTo(Math.cos(a-.12)*r1,Math.sin(a-.12)*r1);c.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);c.lineTo(Math.cos(a+.12)*r1,Math.sin(a+.12)*r1);c.closePath();c.fill();}}else{c.globalAlpha=.5;c.strokeStyle='#6b5a3a';c.lineWidth=1.5;c.setLineDash([3,4]);c.beginPath();c.arc(0,0,g.size*.52,0,TAU);c.stroke();}c.restore();}
      // Gatling heat: the barrels glow hotter (mint → orange) as they spin up.
      if(d.spinUp&&u.spin>.05){c.save();c.globalCompositeOperation='lighter';const heat=glow(u.spin>.6?'#ff9a4d':'#80ffc7');c.globalAlpha=u.spin*.85;c.drawImage(heat,-g.size*.75,-g.size*.75,g.size*1.5,g.size*1.5);c.strokeStyle=u.spin>.6?'#ffc27a':'#b8ffe0';c.lineWidth=2;c.globalAlpha=.4+u.spin*.5;c.beginPath();c.arc(0,0,g.size*.56,-Math.PI/2,-Math.PI/2+TAU*u.spin);c.stroke();c.restore();}
      // Royal Tide: water droplets orbit the turret, one more per shot, until the 4th shot releases the wave.
      if(d.tideEvery){const n=d.tideEvery,ch=u.attacks%n,R=g.size*.62;for(let k=0;k<n;k++){const on=k<ch,a=time*2+k*TAU/n;c.save();c.translate(Math.cos(a)*R,Math.sin(a)*R*.55-g.size*.05);c.globalAlpha=on?1:.35;c.fillStyle=on?'#4f93ff':'#33507f';c.beginPath();c.moveTo(0,-g.size*.1);c.quadraticCurveTo(g.size*.08,0,0,g.size*.07);c.quadraticCurveTo(-g.size*.08,0,0,-g.size*.1);c.fill();if(on){c.fillStyle='#e6f2ff';c.beginPath();c.arc(-g.size*.02,-g.size*.01,g.size*.022,0,TAU);c.fill();}c.restore();}}
      // Spirit Charger: a green spirit orb orbits the turret and grows as it charges.
      // Thousand-Blade Case: while it charges, swords appear one by one in a slowly turning halo,
      // blades pointing outward; before a Sword Formation volley the halo is gilded.
      if(d.swordVolley&&u.timerMax){const st=globalThis.SpaceTowerShotStyles,k=clamp(1-u.timer/u.timerMax,0,1),n=Math.floor(k*d.swordVolley+.001),gold=(u.attacks+1)%(d.swordFormEvery||3)===0,paint=st?.[gold?'sword_orb_gold':'sword_orb']?.paint;
        if(paint){const R=g.size*.52,r=g.size*.075;for(let i=0;i<n;i++){const a=i*TAU/d.swordVolley-Math.PI/2+time*.35;c.save();c.translate(Math.cos(a)*R,Math.sin(a)*R*.92);c.rotate(a);c.globalAlpha=i===n-1?.55:.92;paint(c,r,time+i*.3);c.restore();}}}
      if(u.prismHasteUntil>time){const k=clamp((u.prismHasteUntil-time)/2,0,1),R=g.size*.58;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35+.4*k;c.strokeStyle='#bff6ff';c.lineWidth=1.4;c.setLineDash([g.size*.1,g.size*.06]);c.rotate(time*1.5);c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.restore();}
      // Frost Bloom: a small moon above the turret waxes with each attack (new, crescent, half, full).
      if(d.fullMoon){const ph=(u.attacks||0)%d.fullMoon,R=g.size*.16,mx=g.size*.38,my=-g.size*.42;c.save();c.translate(mx,my);c.globalCompositeOperation='lighter';c.globalAlpha=.5+.15*ph;c.drawImage(glow('#9ff7ee'),-R*2,-R*2,R*4,R*4);c.globalCompositeOperation='source-over';c.globalAlpha=1;
        c.fillStyle='#eafcff';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();const lit=(ph+1)/d.fullMoon;if(lit<1){c.fillStyle='#0d1c2a';c.beginPath();c.arc(R*(lit*2-.15),0,R*1.02,0,TAU);c.fill();}c.restore();}
      if(d.vitalHeal){// Spirit Charger: six orbiting petals close in and brighten as the spirit charge fills; a breathing ring pulses out.
        const k=Math.min(1,(u.vital||0)/d.vitalEvery),R=g.size*.5,p=(Math.sin(time*3)+1)/2;c.save();c.globalCompositeOperation='lighter';
        c.globalAlpha=.25+.35*k;c.drawImage(glow('#9dff6a'),-R*1.6,-R*1.6,R*3.2,R*3.2);
        for(let i=0;i<6;i++){const a=time*1.4+i*TAU/6,r=R*(1.05-.3*k+Math.sin(time*2+i)*.05);c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r);c.rotate(a);c.globalAlpha=.55+.45*k;c.fillStyle=k>.97?'#ffffff':'#9dff6a';c.beginPath();c.ellipse(0,0,R*.2,R*.08,0,0,TAU);c.fill();c.restore();}
        c.globalAlpha=(1-p)*.6;c.strokeStyle='#9dff6a';c.lineWidth=1.5;c.beginPath();c.arc(0,0,R*(.6+p*1.7),0,TAU);c.stroke();
        c.globalAlpha=.9;c.lineWidth=2.5;c.beginPath();c.arc(0,0,R*.62,-Math.PI/2,-Math.PI/2+TAU*k);c.stroke();c.restore();}
      // Antimatter: an orb of antimatter slowly condenses above the turret as the cooldown runs.
      if(d.antimatter){const k=Math.max(0,Math.min(1,1-Math.max(0,u.timer)/(d.cooldown/2))),R=g.size*(.08+.2*k);c.save();c.translate(0,-g.size*.62);
        c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const a=time*3+i*TAU/5,rr=R*(1.8+Math.sin(time*5+i)*.3);c.globalAlpha=.5*k;c.fillStyle='#ffb3ea';c.fillRect(Math.cos(a)*rr-1,Math.sin(a)*rr*.6-1,2,2);}
        c.globalAlpha=.6+k*.4;c.drawImage(glow('#ff69ce'),-R*2.2,-R*2.2,R*4.4,R*4.4);c.globalCompositeOperation='source-over';c.fillStyle='#08020c';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.strokeStyle=k>.98?'#ffffff':'#ffd1f1';c.lineWidth=1.5;c.stroke();c.restore();}
      // Charged Laser: a charge ring fills around the turret while sparks stream into the barrel.
      if(d.beam&&d.cooldown&&!d.channel){const k=Math.max(0,Math.min(1,1-Math.max(0,u.timer)/(d.cooldown/2))),R=g.size*.62;c.save();c.lineCap='round';c.strokeStyle='#3d4a58';c.lineWidth=2.5;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
        c.strokeStyle=k>.95?'#ffffff':'#7fe3ff';c.lineWidth=2.5+k*1.5;c.beginPath();c.arc(0,0,R,-Math.PI/2,-Math.PI/2+TAU*k);c.stroke();
        if(k>.15){c.globalCompositeOperation='lighter';const pose=weaponPose(g,u),mx=pose.muzzleX-pose.x,my=pose.muzzleY-pose.y;for(let i=0;i<6;i++){const q=((time*1.8+i/6)%1),a=i*1.7+time,rr=R*1.3*(1-q);c.globalAlpha=q*k;c.fillStyle='#bff4ff';c.beginPath();c.arc(mx+Math.cos(a)*rr,my+Math.sin(a)*rr,1.6,0,TAU);c.fill();}
          c.globalAlpha=k*k*.9;c.drawImage(glow('#7fe3ff'),mx-g.size*.3*k,my-g.size*.3*k,g.size*.6*k,g.size*.6*k);}c.restore();}
      // Missile pod: six launch tubes on the turret refill as the cooldown reloads.
      if(d.missiles&&d.cooldown){const n=d.missiles,ready=Math.max(0,Math.min(n,Math.floor((1-Math.max(0,u.timer)/(d.cooldown/2))*n))),w=g.size*.13;for(let k=0;k<n;k++){const x=(k%3-1)*w*1.25,y=-g.size*.64+Math.floor(k/3)*w*1.05;c.fillStyle=k<ready?'#ffbc72':'#3d4a58';c.fillRect(x-w*.4,y-w*.4,w*.8,w*.8);if(k<ready){c.fillStyle='#fff1d6';c.fillRect(x-w*.15,y-w*.4,w*.3,w*.3);}}}
      // Capacitor: five charge pips under the turret; the 5th shot is the surge.
      if(d.capacitorEvery){const n=d.capacitorEvery,ch=u.attacks%n,gap=g.size*.17;for(let k=0;k<n;k++){const on=k<ch||ch===0&&u.attacks>0&&time-u.firedAt<.25;c.fillStyle=on?(ch===n-1||ch===0?'#fff3a0':'#ffd36e'):'#3d4a58';c.globalAlpha=on?1:.7;c.beginPath();c.arc((k-(n-1)/2)*gap,-g.size*.62,g.size*.055,0,TAU);c.fill();}c.globalAlpha=1;}
      // Reflective Bastion: three prism segments fill as rams are absorbed; brighter when nearly full.
      if(d.counterCharge){const n=d.counterCharge,ch=u.charge||0,R=g.size*.6;c.save();c.lineCap='round';for(let k=0;k<n;k++){const a0=-Math.PI/2+k*TAU/n+.12,a1=a0+TAU/n-.24,on=k<ch;c.globalAlpha=on?.95:.28;c.strokeStyle=on?['#ff8ad8','#bff6ff','#fff08a'][k%3]:'#5d7a90';c.lineWidth=on?3.2:2;c.beginPath();c.arc(0,0,R,a0,a1);c.stroke();}
        if(ch>=n-1){c.globalCompositeOperation='lighter';c.globalAlpha=.35+Math.sin(time*10)*.2;c.drawImage(glow('#bff6ff'),-R*1.3,-R*1.3,R*2.6,R*2.6);}c.restore();}
      // Gold Mining: a pickaxe swings into an ore crystal, chipping off gold sparks.
      if(d.mineEvery){const sw=Math.max(0,Math.sin(time*6+slot)),R=g.size*.55;c.save();c.translate(g.size*.18,-g.size*.12);c.rotate(-.9+sw*1.1);c.strokeStyle='#c9a26b';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,-R);c.stroke();c.strokeStyle='#e8eef4';c.lineWidth=2.6;c.beginPath();c.moveTo(-R*.45,-R*.95);c.quadraticCurveTo(0,-R*1.15,R*.45,-R*.95);c.stroke();c.restore();
        if(sw>.92){c.save();c.globalCompositeOperation='lighter';c.fillStyle='#ffe58a';for(let k=0;k<4;k++){const a=-1.2+k*.5+time,d=g.size*(.2+((time*7+k)%1)*.25);c.fillRect(Math.cos(a)*d-1,-g.size*.25+Math.sin(a)*d-1,2,2);}c.restore();}}
      // Shadow Replica: a dark violet silhouette of the turret it is copying hovers above it.
      if(d.shadow&&u.shadowOf){const art=sprite(u.shadowOf,true),size=art.width*g.size*1.32/156*.7,bob=Math.sin(time*2.5+slot)*g.size*.04;c.save();c.translate(0,-g.size*.5+bob);c.drawImage(glow('#5a3cff'),-size*.6,-size*.6,size*1.2,size*1.2);c.globalAlpha=.55;c.rotate(weaponPose(g,u).rotation);c.drawImage(art,-size/2,-size/2,size,size);c.restore();}
      // Chain Arc: tesla sparks dance over the turret.
      if(d.stunChain){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#e2d2ff';c.lineWidth=1;const f=Math.floor(time*18+slot*3);for(let i=0;i<2;i++){const a=((f*2.3+i*3.1)%TAU),r=g.size*.42;c.globalAlpha=.8;c.beginPath();c.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3-g.size*.1);c.lineTo(Math.cos(a+.5)*r*.7,Math.sin(a+.5)*r*.7-g.size*.12);c.lineTo(Math.cos(a)*r,Math.sin(a)*r-g.size*.1);c.stroke();}c.restore();}
      // Shield Generator: a pulsing energy link from the generator to the core.
      if(d.shield&&u.id!=='vip_nebula_hymn'){const[cx,cy]=point(...R.CORE);c.save();c.strokeStyle='#87c7ff';c.lineWidth=2;c.setLineDash([4,6]);c.lineDashOffset=-time*30;c.globalAlpha=.55;c.beginPath();c.moveTo(0,0);c.lineTo(cx-x,cy-y);c.stroke();c.restore();}
      // Phase Echo: a phantom twin hovers beside the turret, bobbing and flickering; it flares when its echo fires.
      if(d.phaseEcho&&!d.beam){const art=sprite(u.id,true),size=art.width*g.size*1.32/156*.72,flare=s.projectiles.some(p=>p.echo&&p.owner&&p.owner.slot===u.slot&&p.age<.15),pose=weaponPose(g,u),bob=Math.sin(time*3+slot)*g.size*.05;
        c.save();c.translate(g.size*.5,-g.size*.42+bob);c.rotate(pose.rotation);c.globalCompositeOperation='lighter';c.globalAlpha=flare?.9:.38+Math.sin(time*9+slot)*.12;c.drawImage(art,-size/2,-size/2,size,size);c.globalAlpha*=.6;c.drawImage(art,-size/2-3,-size/2,size,size);c.restore();
        c.save();c.globalAlpha=.5;c.strokeStyle='#ff9bea';c.setLineDash([2,3]);c.beginPath();c.moveTo(g.size*.18,-g.size*.15);c.lineTo(g.size*.42,-g.size*.36+bob);c.stroke();c.restore();}
      if(u.id==='emergency_shield'&&s.shieldCharges>0){const[cx,cy]=point(...R.CORE);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#9ff0ff';c.lineWidth=3;c.setLineDash([6,6]);c.lineDashOffset=-time*40;c.globalAlpha=.8;c.beginPath();c.moveTo(0,0);c.lineTo(cx-x,cy-y);c.stroke();c.restore();}
      const fire=clamp(1-(time-u.firedAt)/.16,0,1),hit=clamp(1-(time-u.hitAt)/.2,0,1);
      // Summon / merge pop: an elastic overshoot from the impact the core already records.
      const born=s.impacts.find(e=>(e.kind==='summon'||e.kind==='merge'||e.kind==='lucky')&&Math.abs(e.x-R.positions[slot][0])<1e-6&&Math.abs(e.y-R.positions[slot][1])<1e-6&&time>=e.born&&time<e.born+.5);
      const age=born?(time-born.born)/.5:1,pop=age<1?1+Math.sin(age*Math.PI*2.2)*(1-age)*.45:1;
      // Higher stars glow harder under the gun.
      if(u.star>1){const aura=glow(d.color);c.globalAlpha=.25+Math.min(.45,u.star*.05)+Math.sin(time*3+slot)*.08;c.drawImage(aura,-g.size*.75,-g.size*.82,g.size*1.5,g.size*1.5);c.globalAlpha=1;}
      const bob=Math.sin(time*2.4+slot*1.7)*g.size*.035-g.size*.06,breathe=1+Math.sin(time*2.4+slot*1.7)*.025;
      const pose=weaponPose(g,u),kick=fire*g.size*.12;
      c.save();c.translate(-Math.cos(pose.rotation+pose.axis)*kick,bob-Math.sin(pose.rotation+pose.axis)*kick);c.scale(pop*breathe*(1+fire*.06),pop*breathe*(1+fire*.06));c.rotate(pose.rotation);
      if(u.id==='emergency_shield'&&!s.shieldsUsed){c.save();c.globalAlpha=.65+Math.sin(time*3)*.3;c.strokeStyle='#bff6ff';c.lineWidth=2.5;polygon(c,0,0,g.size*.58,6,Math.PI/6);c.stroke();c.restore();}
      if(d.vipExclusive)vipTurret(c,g,d,u,time);
      else {const art=sprite(u.id,true),size=art.width*g.size*1.32/156;c.drawImage(art,-size/2,-size/2,size,size);}
      // Scatter muzzle: a wide flash fan matching the pellet spread.
      if(fire&&d.spread&&d.pellets>4&&!d.pierce){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=fire*.7;const half=Math.min(1.2,(d.pellets-1)/2*d.spread),tip=pose.tips[0],L=g.size*1.1;c.translate(tip[0],tip[1]);c.rotate(pose.axis);const fan=c.createRadialGradient(0,0,0,0,0,L);fan.addColorStop(0,'#fff6dc');fan.addColorStop(1,'rgba(255,150,70,0)');c.fillStyle=fan;c.beginPath();c.moveTo(0,0);c.arc(0,0,L,-half,half);c.closePath();c.fill();c.restore();}
      if(fire){c.globalCompositeOperation='lighter';c.globalAlpha=fire;for(const [mx,my]of pose.tips){c.fillStyle=d.color;c.beginPath();c.ellipse(mx+g.size*.06,my,g.size*.22,g.size*.1,pose.axis,0,TAU);c.fill();c.fillStyle='#ffffff';c.beginPath();c.ellipse(mx+g.size*.04,my,g.size*.1,g.size*.05,pose.axis,0,TAU);c.fill();}}
      c.restore();
      if(age<1){c.strokeStyle=d.color;c.globalAlpha=1-age;c.lineWidth=3*(1-age)+1;c.beginPath();c.arc(0,0,g.size*(.5+age*.6),0,TAU);c.stroke();c.globalAlpha=1;}
      if(hit){c.strokeStyle=`rgba(255,155,168,${hit})`;c.lineWidth=3;roundRect(c,-g.size*.62,-g.size*.62,g.size*1.24,g.size*1.12,g.size*.2);c.stroke();}
      // Star badge: a pill that turns gold from two stars.
      const bw=g.size*(u.star>9?.62:.5),bh=g.size*.26,bx=g.size*.62-bw,by=g.size*.36;
      c.fillStyle=u.star>1?'#3b2a0a':'#0c1d2e';c.strokeStyle=u.star>1?'#ffd36e':'#7fb7cf';c.lineWidth=1;roundRect(c,bx,by,bw,bh,bh/2);c.fill();c.stroke();
      label(c,`★${u.star}`,Math.max(9,g.size*.22),900,u.star>1?'#ffe39a':'#d6eef6',bx+bw/2,by+bh*.78,g.dpr);
      c.restore();
    }
    // Time fields draw above the turret tiles so no part of the clock is hidden.
    for(const u of s.units)if(u)field(c,g,...point(...R.positions[u.slot]),C.byId.get(u.id),time,u.star);
    // Crit Resonance: golden links pulse from each resonance turret to the turrets it empowers.
    for(const ru of s.units){if(!ru||!C.byId.get(ru.id)?.resonance)continue;const[rx,ry]=point(...R.positions[ru.slot]);
      for(const v of s.units){if(!v||v===ru)continue;const pv=R.positions[v.slot],pr=R.positions[ru.slot];if(Math.hypot(pv[0]-pr[0],pv[1]-pr[1])>=.42)continue;const[vx,vy]=point(...pv);
        c.save();c.strokeStyle='#ffe58a';c.globalAlpha=.45;c.lineWidth=1.4;c.setLineDash([2,4]);c.lineDashOffset=-time*20;c.beginPath();c.moveTo(rx,ry);c.lineTo(vx,vy);c.stroke();c.setLineDash([]);
        const q=(time*1.2+v.slot*.17)%1;c.globalCompositeOperation='lighter';c.globalAlpha=1-Math.abs(q-.5)*1.6;c.fillStyle='#fff3b0';c.save();c.translate(rx+(vx-rx)*q,ry+(vy-ry)*q);c.rotate(Math.PI/4);c.fillRect(-2.5,-2.5,5,5);c.restore();
        c.globalAlpha=.35+Math.sin(time*4+v.slot)*.15;c.strokeStyle='#ffe58a';c.lineWidth=1.2;c.beginPath();c.arc(vx,vy,g.size*.58,0,TAU);c.stroke();c.restore();}
      c.save();c.globalCompositeOperation='lighter';const ph=(time*.8)%1;c.globalAlpha=(1-ph)*.7;c.strokeStyle='#ffe58a';c.lineWidth=2;c.beginPath();c.arc(rx,ry,g.size*(.45+ph*.5),0,TAU);c.stroke();c.restore();}
    // Preserve live combat metadata through the prototype instead of copying
    // every enemy's large record on all 60 presentation frames.
    // Ships still queued inside the warp gate (negative path distance) stay hidden.
    const visualEnemies=s.enemies.filter(e=>!(e.s<0)).map(e=>{let visual=enemyViews.get(e);if(!visual){visual=Object.create(e);enemyViews.set(e,visual);}const[ex,ey]=smoothXY(e);visual.x=g.cx+ex*g.sx;visual.y=g.cy+ey*g.sy;visual.screenHeading=Math.atan2(Math.sin(e.heading||0)*g.sy,Math.cos(e.heading||0)*g.sx);visual.size=Math.max(7,g.size*.25)*(e.isBoss?1.45+(e.sizeScale-3.1)*.2:e.sizeScale)*(e.counter?.6:1);visual.frostSlow=e.slowUntil>time?e.slow:0;visual.weakpointTime=e.markUntil>time?1:0;visual.v2BuffTimer=e.buffUntil>time?1:0;return visual;});
    for(const e of s.enemies)if(e.ability==='buffer'&&e.trail.length){c.save();c.strokeStyle='#e7ff7244';c.lineWidth=5;c.beginPath();e.trail.forEach((p,i)=>{const[x,y]=point(p.x,p.y);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.restore();}
    // Mines: a squat hex plate with a blinking light; arming shows a pulse ring.
    for(const n of s.mines||[]){if(time<n.born)continue;const[x,y]=point(n.x,n.y),z=g.size*.2,armed=time>=n.armed;c.save();c.translate(x,y);
      c.fillStyle='#2c3038';c.strokeStyle='#ffb66e';c.lineWidth=1.4;polygon(c,0,0,z,6,Math.PI/6);c.fill();c.stroke();
      c.fillStyle=armed&&Math.floor(time*4+n.seed)%2?'#ff4d3d':'#ffd28a';c.beginPath();c.arc(0,0,z*.32,0,TAU);c.fill();
      if(armed){const ph=(time*1.2+n.seed*.3)%1;c.globalAlpha=(1-ph)*.6;c.strokeStyle='#ff9a5a';c.lineWidth=1;c.beginPath();c.arc(0,0,z*(1.2+ph*1.3),0,TAU);c.stroke();}c.restore();}
    // Fire seas: a warm scorch glow on the track, a cluster of dancing flame tongues, rising embers.
    for(const f of s.fires||[]){if(time<f.born||time>=f.until)continue;const[x,y]=point(f.x,f.y),R=f.r*Math.abs(g.sx),k=Math.min(1,(time-f.born)/.15,(f.until-time)/.4);
      c.save();c.translate(x,y);c.globalAlpha=k*.55;c.drawImage(glow('#ff6a2a'),-R*1.3,-R*1.3,R*2.6,R*2.6);c.globalAlpha=k*.35;c.fillStyle='#2a0c04';c.beginPath();c.ellipse(0,R*.15,R*.95,R*.55,0,0,TAU);c.fill();
      for(let i=0;i<7;i++){const ox=Math.sin(f.seed*3.1+i*2.4)*R*.75,oy=Math.cos(f.seed*1.7+i*1.9)*R*.38,flick=.75+Math.sin(time*(11+i)+i*1.3)*.25,h=R*(.55+(i%3)*.18)*flick,w=R*.2;
        c.globalCompositeOperation='lighter';c.globalAlpha=k*.9;c.fillStyle='#ff5a1f';c.beginPath();c.moveTo(ox-w,oy);c.quadraticCurveTo(ox-w*.6,oy-h*.55,ox+Math.sin(time*6+i)*w*.4,oy-h);c.quadraticCurveTo(ox+w*.6,oy-h*.55,ox+w,oy);c.closePath();c.fill();
        c.fillStyle='#ffd36e';c.beginPath();c.moveTo(ox-w*.45,oy);c.quadraticCurveTo(ox-w*.3,oy-h*.35,ox+Math.sin(time*6+i)*w*.25,oy-h*.6);c.quadraticCurveTo(ox+w*.3,oy-h*.35,ox+w*.45,oy);c.closePath();c.fill();}
      c.globalCompositeOperation='lighter';c.fillStyle='#ffc46b';for(let i=0;i<6;i++){const q=((time*.8+i/6+f.seed*.13)%1);c.globalAlpha=k*(1-q);c.fillRect(Math.sin(i*2.7+f.seed)*R*.7-1,-q*R*1.6-1,2,2);}
      c.restore();}
    // Void black holes: a black core, a turning violet accretion disk and infalling motes.
    // Ice Wall Barrier: a row of hexagonal ice crystals standing across the track (as in its promo art),
    // rising in, glinting while it holds ships, cracking just before it shatters.
    for(const w of s.walls||[]){if(time<w.born||time>=w.until)continue;const[x,y]=point(w.x,w.y),[hx,hy]=point(w.x+Math.cos(w.heading)*.01,w.y+Math.sin(w.heading)*.01),ang=Math.atan2(hy-y,hx-x),S=Math.abs(g.sx),rise=Math.min(1,(time-w.born)/.25),left=w.until-time,crack=left<.6?1-left/.6:0;
      c.save();c.translate(x,y);c.rotate(ang+Math.PI/2);c.globalAlpha=.6*rise;c.drawImage(glow('#8fe8ff'),-S*.2,-S*.09,S*.4,S*.18);c.globalAlpha=.5*rise;c.fillStyle='rgba(191,244,255,.35)';c.fillRect(-S*.13,-S*.012,S*.26,S*.024);c.globalAlpha=rise;
      for(let i=-2;i<=2;i++){const r=S*.036*(1+Math.sin(time*2+i)*.06)*(.4+.6*rise),bx=i*S*.055,by=Math.abs(i)*S*.012+Math.sin(time*9+i)*crack*S*.004;c.save();c.translate(bx,by);c.rotate(Math.PI/6);
        c.fillStyle='rgba(143,232,255,.42)';c.strokeStyle='#e8fbff';c.lineWidth=1.4;c.beginPath();for(let k=0;k<6;k++){const a=k*TAU/6;k?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(r,0);}c.closePath();c.fill();c.stroke();
        if(crack>0){c.strokeStyle='rgba(255,255,255,'+crack+')';c.lineWidth=1;c.beginPath();c.moveTo(-r*.6,-r*.2);c.lineTo(0,r*.1);c.lineTo(r*.5,-r*.4);c.stroke();}c.restore();}
      c.restore();}
    // Hexagram Shuriken Cannon: spinning four-bladed shuriken flying their petal loops; positions come
    // from the render clock so the loops stay perfectly smooth.
    for(const sh of s.shurikens||[]){if(time<sh.born)continue;const k=clamp((time-sh.born)/sh.dur,0,1);if(k>=1)continue;const f=sh.reach*Math.sin(Math.PI*k),l=sh.width*Math.sin(2*Math.PI*k),ca=Math.cos(sh.a),sa=Math.sin(sh.a),[x,y]=point(sh.cx+ca*f-sa*l,sh.cy+sa*f+ca*l),R=g.size*.25;
      c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=.55;c.drawImage(glow('#7affd8'),-R*1.5,-R*1.5,R*3,R*3);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.rotate(time*18+sh.a);
      c.fillStyle='#dffff6';c.strokeStyle='#2c8f78';c.lineWidth=Math.max(.6,R*.08);for(let b=0;b<4;b++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(-R*.18,-R*.18);c.quadraticCurveTo(R*.05,-R*.55,R*.12,-R);c.quadraticCurveTo(R*.2,-R*.45,R*.18,-R*.18);c.closePath();c.fill();c.stroke();}
      c.fillStyle='#0d2a26';c.beginPath();c.arc(0,0,R*.16,0,TAU);c.fill();c.restore();}
    // Pentagram Missile Pod: five missiles holding a turning regular pentagon, joined by thin light lines.
    // The formation opens up after launch and tightens over the target.
    for(const pt of s.pentas||[]){if(time<pt.born)continue;const k=clamp((time-pt.born)/pt.dur,0,1),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,[ox,oy]=point(pt.x0,pt.y0),[tx,ty]=point(pt.tx,pt.ty),x=ox+(tx-ox)*e,y=oy+(ty-oy)*e;
      const R=pt.r*Math.abs(g.sx)*(.35+.65*Math.sin(Math.min(1,k*1.4)*Math.PI/2)),spin=pt.spin+k*2.4,dir=Math.atan2(ty-oy,tx-ox),pts=[];for(let i=0;i<5;i++){const a=spin-Math.PI/2+i*TAU/5;pts.push([x+Math.cos(a)*R,y+Math.sin(a)*R]);}
      c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,170,140,.7)';c.lineWidth=1.6;c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.stroke();c.restore();
      for(const[px,py]of pts){c.save();c.translate(px,py);c.rotate(dir);const L=g.size*.28;c.globalCompositeOperation='lighter';c.globalAlpha=.8;c.drawImage(glow('#ffb36a'),-L*1.6,-L*.5,L*1.2,L);c.globalCompositeOperation='source-over';c.globalAlpha=1;
        c.fillStyle='#f3e7df';c.beginPath();c.moveTo(L*.55,0);c.lineTo(L*.15,-L*.16);c.lineTo(-L*.45,-L*.16);c.lineTo(-L*.45,L*.16);c.lineTo(L*.15,L*.16);c.closePath();c.fill();c.fillStyle='#ff9c7a';c.fillRect(-L*.55,-L*.24,L*.2,L*.48);c.restore();}}
    // Chrono Axis time stop (premium): the field takes a cold blue tint and a vast translucent clock face appears -
    // twelve ticks, an inner ring of gear teeth and two hands, still while time is stopped, whirling backwards for
    // the last instant before time resumes.
    if(s.timeStop&&time>=s.timeStop.born&&time<s.timeStop.until+.05){const ts=s.timeStop,t=time-ts.born,left=ts.until-time,fade=Math.min(1,t/.2,Math.max(0,left+.05)/.25),R=Math.min(g.w,g.h)*.36,cx=g.cx,cy=g.cy;
      c.save();c.globalAlpha=fade*.16;c.fillStyle='#4fb6e8';c.fillRect(0,0,g.w,g.h);c.globalCompositeOperation='lighter';c.globalAlpha=fade*.5;c.drawImage(glow('#43ffc4'),cx-R*1.2,cy-R*1.2,R*2.4,R*2.4);
      c.globalAlpha=fade*.75;c.strokeStyle='#bffff0';c.lineWidth=2;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();c.lineWidth=1;c.globalAlpha=fade*.5;c.beginPath();c.arc(cx,cy,R*.92,0,TAU);c.stroke();
      for(let i=0;i<12;i++){const a=i*TAU/12,r0=R*(i%3?.86:.8);c.globalAlpha=fade*.8;c.lineWidth=i%3?1.2:2.4;c.beginPath();c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);c.lineTo(cx+Math.cos(a)*R*.92,cy+Math.sin(a)*R*.92);c.stroke();}
      c.globalAlpha=fade*.35;for(let i=0;i<36;i++){const a=i*TAU/36+t*.15;c.beginPath();c.moveTo(cx+Math.cos(a)*R*.42,cy+Math.sin(a)*R*.42);c.lineTo(cx+Math.cos(a)*R*.48,cy+Math.sin(a)*R*.48);c.stroke();}
      const spin=left<.35?(.35-left)*-40:0,hA=-Math.PI/2+.9+spin*.3,mA=-Math.PI/2-.4+spin;c.globalAlpha=fade;c.lineCap='round';c.strokeStyle='#eafffa';c.lineWidth=4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(hA)*R*.45,cy+Math.sin(hA)*R*.45);c.stroke();c.lineWidth=2.5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(mA)*R*.72,cy+Math.sin(mA)*R*.72);c.stroke();
      c.fillStyle='#43ffc4';c.beginPath();c.arc(cx,cy,5,0,TAU);c.fill();c.restore();}
    // Nebula Hymn chorus (premium): a five-line nebula score flows from the Hymn through every turret in turn -
    // soft pink-violet staff lines with a gold leading edge, and glowing notes riding along them.
    for(const h of s.hymns||[]){if(time<h.born||time>=h.until)continue;const t=(time-h.born)/(h.until-h.born),pts=h.pts.map(([x,y])=>point(x,y)),n=pts.length-1,draw=Math.min(1,t*2.2),fade=Math.min(1,(1-t)*3);
      c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const segs=n*draw;
      for(let i=0;i<n&&i<segs;i++){const f=Math.min(1,segs-i),[ax,ay]=pts[i],[bx,by]=pts[i+1],dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,steps=Math.max(10,Math.round(L/5));
        for(let line=-2;line<=2;line++){c.globalAlpha=fade*(line===0?.85:.45);c.strokeStyle=line===0?'#ffd9f2':'#ff77c4';c.lineWidth=line===0?1.6:1;c.beginPath();for(let k=0;k<=steps*f;k++){const q=k/steps,wv=Math.sin(q*Math.PI*2+time*4+i)*g.size*.08,off=line*g.size*.045;const x=ax+dx*q+nx*(wv+off),y=ay+dy*q+ny*(wv+off);k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
        if(f<1){const ex=ax+dx*f,ey=ay+dy*f,R=g.size*.35;c.globalAlpha=fade;c.drawImage(glow('#ffd36e'),ex-R,ey-R,R*2,R*2);}
        for(let k=0;k<2;k++){const q=((time*.9+k*.5+i*.21)%1)*f,x=ax+dx*q+nx*Math.sin(q*Math.PI*2+time*4+i)*g.size*.08,y=ay+dy*q+ny*Math.sin(q*Math.PI*2+time*4+i)*g.size*.08;c.globalAlpha=fade;c.fillStyle='#fff3c4';c.beginPath();c.ellipse(x,y,g.size*.055,g.size*.04,-.4,0,TAU);c.fill();c.strokeStyle='#fff3c4';c.lineWidth=1.2;c.beginPath();c.moveTo(x+g.size*.05,y);c.lineTo(x+g.size*.05,y-g.size*.16);c.stroke();}}
      c.restore();}
    // Solar Judgment (premium): a blazing sun at the top of the board - white-hot disc, golden corona and slowly
    // turning rays - sweeps a colossal ray across the field: a wide amber glow, a gold body, a white-hot core,
    // shimmering heat edges and drifting embers.
    for(const sr of s.sunrays||[]){if(time<sr.born||time>=sr.until)continue;const t=time-sr.born,k=Math.min(1,t/1.1),e2=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,a=sr.a0+(sr.a1-sr.a0)*e2,fade=Math.min(1,t/.2,(sr.until-time)/.25),[ox,oy]=point(sr.ox,sr.oy),S=g.size,ang=Math.atan2(Math.sin(a)*g.sy,Math.cos(a)*g.sx),L=g.h*1.6;
      c.save();c.globalCompositeOperation='lighter';c.translate(ox,oy);
      c.save();c.rotate(ang);const W=S*.9;for(const[col,w,al]of[['rgba(255,120,40,',W,.22],['rgba(255,200,90,',W*.45,.55],['rgba(255,250,230,',W*.14,.95]]){const lg=c.createLinearGradient(0,0,L,0);lg.addColorStop(0,col+al+')');lg.addColorStop(.8,col+(al*.6)+')');lg.addColorStop(1,col+'0)');c.globalAlpha=fade;c.fillStyle=lg;c.beginPath();c.moveTo(0,-w*.35);c.lineTo(L,-w);c.lineTo(L,w);c.lineTo(0,w*.35);c.closePath();c.fill();}
        for(let i=0;i<14;i++){const q=((time*1.3+i/14)%1),d=L*q,j=Math.sin(i*7+time*5)*W*.55*q;c.globalAlpha=fade*(1-q);c.fillStyle=i%2?'#fff1c9':'#ff9a3d';c.beginPath();c.arc(d,j,S*.035,0,TAU);c.fill();}c.restore();
      const R=S*.7;c.globalAlpha=fade*.9;c.drawImage(glow('#ff7839'),-R*2.4,-R*2.4,R*4.8,R*4.8);c.drawImage(glow('#ffd36e'),-R*1.4,-R*1.4,R*2.8,R*2.8);
      for(let i=0;i<16;i++){const ra=i*TAU/16+time*.4,len=R*(1.5+.35*Math.sin(time*3+i*1.7));c.globalAlpha=fade*.55;c.strokeStyle=i%2?'#ffd36e':'#ff9a3d';c.lineWidth=S*.05;c.beginPath();c.moveTo(Math.cos(ra)*R*.85,Math.sin(ra)*R*.85);c.lineTo(Math.cos(ra)*len,Math.sin(ra)*len);c.stroke();}
      c.globalCompositeOperation='source-over';c.globalAlpha=fade;const disc=c.createRadialGradient(0,0,0,0,0,R*.8);disc.addColorStop(0,'#ffffff');disc.addColorStop(.6,'#fff1b0');disc.addColorStop(1,'#ffb03a');c.fillStyle=disc;c.beginPath();c.arc(0,0,R*.8,0,TAU);c.fill();c.restore();}
    // Singularity (premium): a black core rimmed in violet, a tilted accretion disk of hot orange-to-white light
    // turning around it, a thin gravitational-lensing ring, and motes spiralling in. It swells open, then
    // shrinks just before the supernova.
    for(const sg of s.singularities||[]){if(time<sg.born||time>=sg.until)continue;const t=time-sg.born,life=sg.until-sg.born,grow=Math.min(1,t/.4),shrink=Math.min(1,(sg.until-time)/.25),k=grow*(.35+.65*shrink),[x,y]=point(sg.x,sg.y),R=g.size*1.05*k;
      c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=.55;c.drawImage(glow('#8a4dff'),-R*2.2,-R*2.2,R*4.4,R*4.4);
      c.globalAlpha=.6;c.strokeStyle='rgba(220,200,255,.8)';c.lineWidth=1.2;c.beginPath();c.arc(0,0,R*1.45,0,TAU);c.stroke();
      c.save();c.rotate(-.35);c.scale(1,.42);for(let i=0;i<5;i++){const rr=R*(.75+i*.16),a0=time*(3.2-i*.35)+i;const col=['#fff4d6','#ffd27a','#ff9a3d','#ff5d2e','#b8336a'][i];c.globalAlpha=.75-i*.1;c.strokeStyle=col;c.lineWidth=R*(.2-i*.025);c.beginPath();c.arc(0,0,rr,a0,a0+TAU*.78);c.stroke();}c.restore();
      for(let i=0;i<14;i++){const q=((t*.7+i/14)%1),a=i*2.1+t*(4+q*6),rr=R*(1.9-q*1.6);c.globalAlpha=q*.9;c.fillStyle=i%2?'#ffd27a':'#d7b8ff';c.beginPath();c.arc(Math.cos(a)*rr,Math.sin(a)*rr*.6,g.size*.03,0,TAU);c.fill();}
      c.globalCompositeOperation='source-over';c.globalAlpha=1;const core=c.createRadialGradient(0,0,R*.1,0,0,R*.62);core.addColorStop(0,'#000000');core.addColorStop(.8,'#05010c');core.addColorStop(1,'rgba(90,40,160,.9)');c.fillStyle=core;c.beginPath();c.arc(0,0,R*.6,0,TAU);c.fill();
      c.save();c.rotate(-.35);c.scale(1,.42);c.globalCompositeOperation='lighter';c.globalAlpha=.85;c.strokeStyle='#ffe7b0';c.lineWidth=R*.08;c.beginPath();c.arc(0,0,R*.8,Math.PI*1.05+time*3.2,Math.PI*1.95+time*3.2);c.stroke();c.restore();
      c.restore();}
    // Sun sigils: a turning solar emblem (ring, inner ring, eight rays) on branded ships, brightening and spinning
    // faster as detonation nears.
    for(const e of visualEnemies){if(!(e.sunMarkAt>time))continue;const left=clamp((e.sunMarkAt-time)/1.2,0,1),heat=1-left,R=e.size*(1.25+.15*Math.sin(time*14));c.save();c.translate(e.x,e.y);c.rotate(time*(2+heat*8));c.globalCompositeOperation='lighter';
      c.globalAlpha=.4+.5*heat;c.drawImage(glow('#ff9a3d'),-R*1.5,-R*1.5,R*3,R*3);c.globalAlpha=.85;c.strokeStyle='#ffd36e';c.lineWidth=1.4;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.beginPath();c.arc(0,0,R*.6,0,TAU);c.stroke();
      for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(Math.cos(a)*R*.6,Math.sin(a)*R*.6);c.lineTo(Math.cos(a)*R*(i%2?1.25:1.45),Math.sin(a)*R*(i%2?1.25:1.45));c.stroke();}c.restore();}
    // Quantum entanglement (premium): entangled ships are joined in a ring by shimmering violet-gold quantum
    // threads (a standing wave with sparks drifting along it); a bright pulse races round the ring whenever damage
    // echoes through it; each entangled ship wears a small tilted electron orbit.
    {const ent=visualEnemies.filter(e=>e.entUntil>time);if(ent.length>=1){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const pulse=s.entPulse!==undefined?clamp(1-(time-s.entPulse)/.35,0,1):0;
      if(ent.length>=2)for(let i=0;i<ent.length;i++){const a=ent[i],b=ent[(i+1)%ent.length];if(ent.length===2&&i===1)break;const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,steps=Math.max(8,Math.round(L/6));
        for(const[col,w,al,amp]of[['#b45cff',g.size*.1,.25+.3*pulse,1],['#ffd36e',g.size*.025,.7+.3*pulse,.6]]){c.globalAlpha=al;c.strokeStyle=col;c.lineWidth=w;c.beginPath();for(let k=0;k<=steps;k++){const t=k/steps,wv=Math.sin(t*Math.PI*4-time*9)*g.size*.06*amp*Math.sin(t*Math.PI);const x=a.x+dx*t+nx*wv,y=a.y+dy*t+ny*wv;k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
        for(let k=0;k<2;k++){const t=((time*.8+k*.5+i*.13)%1);c.globalAlpha=.9;c.fillStyle='#fff3c4';c.beginPath();c.arc(a.x+dx*t,a.y+dy*t,g.size*.03,0,TAU);c.fill();}
        if(pulse>0){const t=1-pulse;c.globalAlpha=pulse;c.drawImage(glow('#ffe7a8'),a.x+dx*t-g.size*.2,a.y+dy*t-g.size*.2,g.size*.4,g.size*.4);}}
      for(const e of ent){const r=e.size*1.35;c.save();c.translate(e.x,e.y);c.rotate(.5);c.globalAlpha=.75;c.strokeStyle='#d7a8ff';c.lineWidth=1.1;c.beginPath();c.ellipse(0,0,r,r*.38,0,0,TAU);c.stroke();const a=time*5+e.id;c.fillStyle='#fff3c4';c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r*.38,g.size*.035,0,TAU);c.fill();c.restore();}
      c.restore();}}
    // Quantum Crown coronation (premium): a golden crown with gems descends in a pillar of light onto the toughest
    // ship, then the entanglement collapses - light beams lance from the crown to every entangled ship.
    for(const k of s.crowns||[]){if(time<k.born||time>=k.until)continue;const t=time-k.born,[x,y]=point(k.x,k.y),drop=Math.min(1,t/.45),ease=1-Math.pow(1-drop,3),fade=Math.min(1,(k.until-time)/.35),S=g.size,cy=y-S*(.9+(1-ease)*2.2);
      c.save();c.globalCompositeOperation='lighter';const beam=c.createLinearGradient(x,cy-S*3,x,y);beam.addColorStop(0,'rgba(255,231,168,0)');beam.addColorStop(1,'rgba(255,231,168,.45)');c.globalAlpha=fade*(.6+.4*Math.sin(t*12));c.fillStyle=beam;c.fillRect(x-S*.28,cy-S*3,S*.56,y-cy+S*3);
      if(t>.45){const col=clamp((t-.45)/.15,0,1);for(const[px,py]of k.pts.map(([a,b])=>point(a,b))){c.globalAlpha=fade*col;for(const[cl,w]of[['#b45cff',S*.14],['#ffd36e',S*.05],['#ffffff',S*.018]]){c.strokeStyle=cl;c.lineWidth=w;c.beginPath();c.moveTo(x,cy+S*.25);c.lineTo(px,py);c.stroke();}c.drawImage(glow('#ffd36e'),px-S*.35,py-S*.35,S*.7,S*.7);}}
      c.globalCompositeOperation='source-over';c.globalAlpha=fade;c.translate(x,cy);const W=S*.62,H=S*.42,gold=c.createLinearGradient(0,-H,0,H*.4);gold.addColorStop(0,'#fff6d0');gold.addColorStop(.5,'#ffc94a');gold.addColorStop(1,'#b97a12');
      c.fillStyle=gold;c.strokeStyle='#7a4a08';c.lineWidth=1.2;c.beginPath();c.moveTo(-W,H*.4);c.lineTo(-W,-H*.1);c.lineTo(-W*.55,-H*.75);c.lineTo(-W*.3,-H*.05);c.lineTo(0,-H);c.lineTo(W*.3,-H*.05);c.lineTo(W*.55,-H*.75);c.lineTo(W,-H*.1);c.lineTo(W,H*.4);c.closePath();c.fill();c.stroke();
      c.fillStyle='#7a2bd0';for(const[gx,gy,gr]of[[0,H*.12,.11],[-W*.6,H*.15,.07],[W*.6,H*.15,.07]]){c.beginPath();c.arc(gx,gy,S*gr,0,TAU);c.fill();}c.fillStyle='#fff3c4';for(const[gx,gy]of[[0,-H],[-W*.55,-H*.75],[W*.55,-H*.75]]){c.beginPath();c.arc(gx,gy,S*.05,0,TAU);c.fill();}
      c.globalCompositeOperation='lighter';c.globalAlpha=fade*.7;c.drawImage(glow('#ffe7a8'),-W*1.6,-H*2.2,W*3.2,H*3.6);c.restore();}
    // Abyssal leviathan (premium): a deep-sea serpent swims back along the track. The body follows the track
    // behind its head as a tapered ribbon - abyssal navy into teal, with a pale belly line, glowing
    // bioluminescent spots and dorsal fins - over a shimmer of caustic light on the water it disturbs.
    for(const lv of s.leviathans||[]){if(time<lv.born||time>=lv.until||!R.pathPoint)continue;const t=time-lv.born,k=Math.min(1,t/1.1),fade=Math.min(1,t/.2,(lv.until-time)/.3),head=lv.top-(lv.top-lv.low)*k,len=.85,N=26,pts=[];
      for(let i=0;i<=N;i++){const d=Math.min(lv.top+.3,head+len*i/N),p=R.pathPoint(d),[x,y]=point(p.x,p.y),[hx,hy]=point(p.x+Math.cos(p.heading)*.01,p.y+Math.sin(p.heading)*.01),a=Math.atan2(hy-y,hx-x),nx=-Math.sin(a),ny=Math.cos(a),sway=Math.sin(time*7-i*.55)*g.size*.12*(i/N);pts.push([x+nx*sway,y+ny*sway,nx,ny,i/N]);}
      c.save();c.globalAlpha=fade;
      c.globalCompositeOperation='lighter';for(let i=0;i<N;i+=3){const[x,y]=pts[i],r=g.size*(.75-i/N*.35);c.globalAlpha=fade*.45;c.drawImage(glow('#2bd7ff'),x-r,y-r,r*2,r*2);}c.globalCompositeOperation='source-over';
      const W=i=>g.size*.46*Math.sin(Math.PI*Math.min(1,.12+i*.95))*(i<.08?.75+i*3:1);
      c.beginPath();pts.forEach(([x,y,nx,ny,i],j)=>{const w=W(i);j?c.lineTo(x+nx*w,y+ny*w):c.moveTo(x+nx*w,y+ny*w);});for(let j=pts.length-1;j>=0;j--){const[x,y,nx,ny,i]=pts[j],w=W(i);c.lineTo(x-nx*w,y-ny*w);}c.closePath();
      const[hx0,hy0]=pts[0],[tx0,ty0]=pts[N],grad=c.createLinearGradient(hx0,hy0,tx0,ty0);grad.addColorStop(0,'#2a9be8');grad.addColorStop(.45,'#1a62b8');grad.addColorStop(1,'rgba(20,70,150,.25)');c.fillStyle=grad;c.fill();
      c.strokeStyle='rgba(170,245,255,.9)';c.lineWidth=2;c.stroke();
      c.strokeStyle='rgba(190,245,255,.45)';c.lineWidth=g.size*.035;c.beginPath();pts.forEach(([x,y,nx,ny,i],j)=>{const w=W(i)*.35;j?c.lineTo(x-nx*w,y-ny*w):c.moveTo(x-nx*w,y-ny*w);});c.stroke();
      for(let j=3;j<N-2;j+=4){const[x,y,nx,ny,i]=pts[j],w=W(i);c.fillStyle='rgba(60,170,240,.95)';c.beginPath();c.moveTo(x+nx*w*.8,y+ny*w*.8);c.lineTo(x+nx*w*1.7+ny*g.size*.12,y+ny*w*1.7-nx*g.size*.12);c.lineTo(x+nx*w*.8-ny*g.size*.18,y+ny*w*.8+nx*g.size*.18);c.closePath();c.fill();}
      c.globalCompositeOperation='lighter';for(let j=2;j<N-1;j+=2){const[x,y,nx,ny,i]=pts[j],w=W(i)*.45,tw=.5+.5*Math.sin(time*6+j);c.globalAlpha=fade*(.5+.5*tw);c.fillStyle='#8ff7ff';c.beginPath();c.arc(x+nx*w,y+ny*w,g.size*.035,0,TAU);c.fill();c.beginPath();c.arc(x-nx*w*.6,y-ny*w*.6,g.size*.025,0,TAU);c.fill();}
      const[hx,hy,hnx,hny]=pts[0];c.globalAlpha=fade;c.drawImage(glow('#aef6ff'),hx-g.size*.55,hy-g.size*.55,g.size*1.1,g.size*1.1);c.fillStyle='#eafdff';c.beginPath();c.arc(hx+hnx*g.size*.12,hy+hny*g.size*.12,g.size*.05,0,TAU);c.fill();c.beginPath();c.arc(hx-hnx*g.size*.12,hy-hny*g.size*.12,g.size*.05,0,TAU);c.fill();
      for(let i=0;i<8;i++){const a=i*TAU/8+time*3,r=g.size*(.35+.15*Math.sin(time*9+i));c.globalAlpha=fade*.7;c.fillStyle='#d8fbff';c.beginPath();c.arc(hx+Math.cos(a)*r,hy+Math.sin(a)*r*.7,g.size*.03,0,TAU);c.fill();}
      c.restore();}
    // Star Phoenix constellation (premium): each link draws in as a comet of light racing from ship to ship,
    // leaving a three-layer line (crimson bloom, gold body, white core); every node blooms into a lens-flare star.
    for(const k of s.constellations||[]){if(time<k.born||time>=k.until)continue;const t=(time-k.born)/(k.until-k.born),fade=Math.min(1,(1-t)*3),pts=k.pts.map(([x,y])=>point(x,y)),n=pts.length-1,per=.32/Math.max(1,n);
      c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
      for(let i=0;i<n;i++){const f=clamp((t-i*per)/per,0,1);if(f<=0)continue;const[ax,ay]=pts[i],[bx,by]=pts[i+1],ex=ax+(bx-ax)*f,ey=ay+(by-ay)*f;
        for(const[col,w,al]of[['#d8204f',g.size*.26,.22],['#ffb347',g.size*.08,.75],['#fffbe8',g.size*.025,1]]){c.globalAlpha=fade*al;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,ey);c.stroke();}
        if(f<1){const R=g.size*.32;c.globalAlpha=fade;c.drawImage(glow('#ffd27a'),ex-R,ey-R,R*2,R*2);c.fillStyle='#ffffff';c.beginPath();c.arc(ex,ey,g.size*.05,0,TAU);c.fill();}}
      pts.forEach(([x,y],i)=>{const lit=clamp((t-(i?(i-1)*per+per:0))/.12,0,1);if(lit<=0)return;const R=g.size*.5*(.6+.4*lit),tw=1+.15*Math.sin(time*18+i);c.globalAlpha=fade*lit;
        c.drawImage(glow('#ff6a4d'),x-R*1.2,y-R*1.2,R*2.4,R*2.4);c.drawImage(glow('#fff1c9'),x-R*.45,y-R*.45,R*.9,R*.9);
        for(const[len,wid,rot]of[[R*1.5*tw,g.size*.035,0],[R*1.5*tw,g.size*.035,Math.PI/2],[R*.7,g.size*.022,Math.PI/4],[R*.7,g.size*.022,-Math.PI/4]]){c.save();c.translate(x,y);c.rotate(rot);const lg=c.createLinearGradient(-len,0,len,0);lg.addColorStop(0,'rgba(255,241,201,0)');lg.addColorStop(.5,'rgba(255,255,255,.95)');lg.addColorStop(1,'rgba(255,241,201,0)');c.fillStyle=lg;c.beginPath();c.ellipse(0,0,len,wid,0,0,TAU);c.fill();c.restore();}
        c.strokeStyle='rgba(255,210,140,.6)';c.lineWidth=1;c.beginPath();c.arc(x,y,R*(.5+lit*.5),0,TAU);c.stroke();});
      c.restore();}
    // Frost Bloom full moon: a great pale moon rises at the top of the board, bathing the field in moonlight.
    for(const mo of s.moons||[]){if(time<mo.born||time>=mo.until)continue;const t=time-mo.born,k=Math.min(1,t/.5,(mo.until-time)/.6),R=g.size*1.25,mx=g.cx+g.size*1.4,my=Math.max(R*.15,g.cy-g.h/2+R*.15)+(1-Math.min(1,t/.6))*g.size*.8;
      c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*.22;const wash=c.createRadialGradient(mx,my,R,mx,my,g.size*7);wash.addColorStop(0,'#bff6ff');wash.addColorStop(1,'rgba(191,246,255,0)');c.fillStyle=wash;c.fillRect(0,0,g.w,g.h);
      c.globalAlpha=k*.9;c.drawImage(glow('#9ff7ee'),mx-R*2.2,my-R*2.2,R*4.4,R*4.4);c.globalCompositeOperation='source-over';const face=c.createRadialGradient(mx-R*.3,my-R*.3,R*.1,mx,my,R);face.addColorStop(0,'#ffffff');face.addColorStop(1,'#cdeef0');c.globalAlpha=k*.78;c.fillStyle=face;c.beginPath();c.arc(mx,my,R,0,TAU);c.fill();
      c.fillStyle='rgba(140,190,200,.35)';for(const[cx2,cy2,cr]of[[-.35,-.1,.18],[.2,.3,.14],[.3,-.35,.1],[-.1,.45,.08]]){c.beginPath();c.arc(mx+cx2*R,my+cy2*R,cr*R,0,TAU);c.fill();}c.restore();}
    // Phoenix Blaze dive: a great phoenix (the promo bird) sweeps the track against the flow, dragging a fire trail.
    for(const f of s.phoenixes||[]){if(time<f.born||time>=f.until)continue;const k=(time-f.born)/1.4,L=R.pathLength||0,S=Math.abs(g.sx),bird=globalThis.SpaceTowerShotStyles?.phoenix_orb?.bird;if(!bird||!L)continue;
      const at=d=>{const p=R.pathPoint(d),[x,y]=point(p.x,p.y),[hx,hy]=point(p.x+Math.cos(p.heading)*.01,p.y+Math.sin(p.heading)*.01);return [x,y,Math.atan2(hy-y,hx-x)+Math.PI];},ps=L*(1-k),fade=Math.min(1,k*8,(1-k)*6);
      c.save();c.globalCompositeOperation='lighter';for(let j=6;j>=1;j--){const[tx,ty]=at(Math.min(L,ps+j*.07));c.globalAlpha=fade*(1-j/7)*.7;const r=S*(.07-j*.006);c.drawImage(glow(j<3?'#ffd36e':'#ff7a3d'),tx-r,ty-r,r*2,r*2);}c.restore();
      const[x,y,a]=at(ps);c.save();c.translate(x,y);c.globalAlpha=fade;c.drawImage(glow('#ffb070'),-S*.2,-S*.2,S*.4,S*.4);c.rotate(a+Math.PI/2);bird(c,'#ff7a3d',S*.0046,time*2,false);c.restore();}
    for(const v of s.voids||[]){if(time<v.born||time>=v.until)continue;const[x,y]=point(v.x,v.y),R=v.r*Math.abs(g.sx),k=Math.min(1,(time-v.born)/.25,(v.until-time)/.35);
      c.save();c.translate(x,y);c.globalAlpha=k;c.drawImage(glow('#8e6cff'),-R*1.2,-R*1.2,R*2.4,R*2.4);
      c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){c.save();c.rotate(time*(2.2+i*.8)+i*2);c.strokeStyle=['#c9b8ff','#8e6cff','#5a3cff'][i];c.lineWidth=2.2-i*.5;c.globalAlpha=k*(.8-i*.18);c.beginPath();c.ellipse(0,0,R*(.85-i*.18),R*(.32-i*.06),0,0,TAU*.75);c.stroke();c.restore();}
      for(let i=0;i<8;i++){const q=((time*.9+i/8)%1),a=i*2.4+time*3,rr=R*(1-q*.85);c.globalAlpha=k*q;c.fillStyle='#e6dcff';c.fillRect(Math.cos(a)*rr-1,Math.sin(a)*rr*.45-1,2,2);}
      c.globalCompositeOperation='source-over';c.globalAlpha=k;c.fillStyle='#05020d';c.beginPath();c.arc(0,0,R*.26,0,TAU);c.fill();c.strokeStyle='#d9ccff';c.lineWidth=1.4;c.stroke();c.restore();}
    // Time fields: ships inside drag two fading afterimages behind them.
    const timeFields=s.units.filter(u=>u&&C.byId.get(u.id)?.slowAura).map(u=>R.positions[u.slot]);
    if(timeFields.length)for(const e of visualEnemies){const base=Object.getPrototypeOf(e);if(!timeFields.some(([fx,fy])=>Math.hypot(base.x-fx,base.y-fy)<.48))continue;const sp=enemySprites.get([e.kind,e.shape,e.color,e.strokeColor,Math.round(e.size*2)/2,g.dpr,g.quality||'medium',e.flash>0].join(':'));if(!sp)continue;const ext=e.size*1.6+24;
      for(let k=1;k<=2;k++){c.save();c.translate(e.x-Math.cos(e.screenHeading)*e.size*1.1*k,e.y-Math.sin(e.screenHeading)*e.size*1.1*k);c.rotate(e.screenHeading);c.globalAlpha=.5/k;c.globalCompositeOperation='lighter';c.drawImage(sp,-ext,-ext,ext*2,ext*2);c.restore();}}
    // Afterimage Cannon: eleven violet afterimages sweep a wide ring around each such turret (out over the lane),
    // drawn after every tile so no part of the ring is hidden; each leaves two fading copies behind it.
    for(const u of s.units){const d=u&&C.byId.get(u.id);if(!d?.afterimage||!u.orbitR)continue;const[cx,cy]=point(...R.positions[u.slot]),orb=glow('#5432e0'),r=g.size*.15;c.save();c.translate(cx,cy);
      for(let i=0;i<d.afterimage;i++)for(let k=2;k>=0;k--){const a=(time-k*.05)*1.8+i*TAU/d.afterimage,ox=Math.cos(a)*u.orbitR*g.sx,oy=Math.sin(a)*u.orbitR*g.sy;
        c.globalAlpha=k?.3/k:.8;c.drawImage(orb,ox-r*1.8,oy-r*1.8,r*3.6,r*3.6);c.globalAlpha=k?.35/k:.75+(i%3)*.12;c.fillStyle='#5432e0';c.beginPath();c.arc(ox,oy,r*.8,0,TAU);c.fill();if(!k){c.globalAlpha=.9;c.fillStyle='#9a8cff';c.beginPath();c.arc(ox,oy,r*.36,0,TAU);c.fill();}}
      c.restore();}
    enemies(c,g,visualEnemies,time);
    healthBars(c,g,visualEnemies);
    // Sniper laser sights: a thin red dotted line from the barrel tip to the locked target, re-aimed every frame.
    for(const u of s.units){if(!u||!u.lockId||!C.byId.get(u.id)?.hitscan)continue;const e=visualEnemies.find(v=>v.id===u.lockId);if(!e)continue;const pose=weaponPose(g,u);c.save();c.strokeStyle='#ff4d5e';c.globalAlpha=.55+Math.sin(time*12)*.2;c.lineWidth=1;c.setLineDash([3,3]);c.beginPath();c.moveTo(pose.muzzleX,pose.muzzleY);c.lineTo(e.x,e.y);c.stroke();c.setLineDash([]);c.fillStyle='#ff4d5e';c.beginPath();c.arc(e.x,e.y,2.2,0,TAU);c.fill();c.restore();}
    // Lock-on reticles: priority turrets mark the ship they are locked onto.
    for(const u of s.units){if(!u||!u.lockId||!C.byId.get(u.id)?.highestHp||C.byId.get(u.id)?.skyBolt)continue;const e=visualEnemies.find(v=>v.id===u.lockId);if(!e)continue;const col=C.byId.get(u.id).color,z=e.size*1.25+4;
      c.save();c.translate(e.x,e.y);c.rotate(time*1.6);c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=.9;for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(z,-z*.45);c.lineTo(z,-z);c.lineTo(z*.45,-z);c.stroke();}c.restore();}
    // Curse runes sit upright above cursed ships (never rotated with the hull).
    // Star feathers: refined molten quills lodged in the ship - white-hot tip fading through gold to crimson,
    // a fine shaft, a soft bloom and a few embers drifting up from them.
    for(const e of visualEnemies){if(!(e.featherUntil>time)||!(e.feathers>0))continue;c.save();c.translate(e.x,e.y);
      for(let i=0;i<e.feathers;i++){const a=-Math.PI/2+(i-(e.feathers-1)/2)*.5,h=e.size*1.05,pulse=.75+.25*Math.sin(time*7+i*1.7);c.save();c.rotate(a);c.translate(0,-e.size*.35);
        c.globalCompositeOperation='lighter';c.globalAlpha=.55*pulse;c.drawImage(glow('#ff6a4d'),-h*.32,-h*.95,h*.64,h*.64);
        const g2=c.createLinearGradient(0,0,0,-h*.75);g2.addColorStop(0,'rgba(200,30,70,.95)');g2.addColorStop(.55,'#ffb347');g2.addColorStop(1,'#fffbe8');c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle=g2;
        c.beginPath();c.moveTo(0,-h*.78);c.bezierCurveTo(h*.17,-h*.55,h*.12,-h*.18,0,0);c.bezierCurveTo(-h*.12,-h*.18,-h*.17,-h*.55,0,-h*.78);c.fill();
        c.strokeStyle='rgba(255,250,232,.85)';c.lineWidth=Math.max(.6,h*.03);c.beginPath();c.moveTo(0,-h*.05);c.lineTo(0,-h*.72);c.stroke();
        c.globalCompositeOperation='lighter';for(let k=0;k<2;k++){const q=((time*.9+i*.37+k*.5)%1),ex=Math.sin((i+k)*3.1+time*2)*h*.15;c.globalAlpha=(1-q)*.9;c.fillStyle='#ffd27a';c.beginPath();c.arc(ex,-h*(.8+q*.6),Math.max(.6,h*.035*(1-q)),0,TAU);c.fill();}
        c.restore();}c.restore();}
    // Full-moon frost flowers: a six-petal flower of ice opens on each moonlit ship, then fades.
    for(const e of visualEnemies){if(!(e.moonBloomAt>time-1.4)||e.moonBloomAt>time)continue;const q=(time-e.moonBloomAt)/1.4,R=e.size*(1.1+q*.6);c.save();c.translate(e.x,e.y);c.rotate(q*.8);c.globalAlpha=1-q;c.fillStyle='rgba(223,250,255,.55)';c.strokeStyle='#ffffff';c.lineWidth=1;
      for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);c.beginPath();c.ellipse(0,-R*.55,R*.2,R*.45,0,0,TAU);c.fill();c.stroke();c.restore();}c.restore();}
    // Frostbite: small ice crystals cling to the ship, one per stack; a frozen ship sits inside a pale ice block.
    for(const e of visualEnemies){const z=e.size;
      if(e.frozenUntil>time){c.save();c.translate(e.x,e.y);c.rotate(.3);c.globalAlpha=.75;c.fillStyle='rgba(190,232,255,.38)';c.strokeStyle='#eaf6ff';c.lineWidth=1.4;c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,rr=z*(1.35+(i%2)*.15);i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();
        c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;c.beginPath();c.moveTo(-z*.7,-z*.6);c.lineTo(-z*.2,-z*.9);c.moveTo(z*.3,z*.8);c.lineTo(z*.8,z*.3);c.stroke();c.restore();continue;}
      if(e.fbUntil>time&&e.fb>0){c.save();c.translate(e.x,e.y);c.fillStyle='#dff3ff';c.strokeStyle='#7fb8e6';c.lineWidth=.8;for(let i=0;i<e.fb;i++){const a=-Math.PI/2+i*TAU/5+e.id,rr=z*1.05,h=z*.32;c.save();c.translate(Math.cos(a)*rr,Math.sin(a)*rr);c.rotate(a);c.beginPath();c.moveTo(h,0);c.lineTo(0,-h*.42);c.lineTo(-h*.5,0);c.lineTo(0,h*.42);c.closePath();c.fill();c.stroke();c.restore();}c.restore();}}
    for(const e of visualEnemies)if(e.weakUntil>time){const y=e.y-e.size*.2,z=Math.max(5,e.size*.5),bob=Math.sin(time*5+e.id)*1.5;c.save();c.translate(e.x-e.size*1.35,y+bob);c.globalAlpha=.95;c.fillStyle='#2a1140';c.strokeStyle='#d8b4ff';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-z);c.lineTo(z*.85,0);c.lineTo(0,z);c.lineTo(-z*.85,0);c.closePath();c.fill();c.stroke();c.strokeStyle='#f0e0ff';c.beginPath();c.moveTo(0,-z*.45);c.lineTo(0,z*.35);c.moveTo(-z*.3,z*.05);c.lineTo(0,z*.4);c.lineTo(z*.3,z*.05);c.stroke();c.restore();}
    for(const e of visualEnemies){drawRankedEnemyOverlay(c,e,{x:e.x+Math.cos(e.screenHeading)*100,y:e.y+Math.sin(e.screenHeading)*100},1,g.quality);}
    for(const p of s.projectiles){if(time<(p.born??0)||p.ended!==undefined&&time>=p.ended)continue;const offset=Math.sin(Math.min(1,p.age*3)*Math.PI)*(p.spread||0),[px,py]=shotPoint(g,p),x=px-Math.sin(p.angle)*offset*g.sx,y=py+Math.cos(p.angle)*offset*g.sy,pa=smoothAngle(p),angle=Math.atan2(Math.sin(pa)*g.sy,Math.cos(pa)*g.sx);const styles=globalThis.SpaceTowerShotStyles||{},variant=p.child?'child':p.variant,childStyle=variant&&styles[p.id+'_'+variant],pd=childStyle?childDef(p.id,variant):C.byId.get(p.id),pr=Math.max(2.6,g.size*.11)*((childStyle||styles[p.id])?.size||1),tail=pr*4.5*Math.min(1,(p.age||0)*8+.3);/* no shared trail: each shot style draws its own tail if it has one */if(pd?.lob){// Lobbed bomb: rides a parabola above its ground shadow and tumbles end over end.
        const ox=g.cx+(p.originX??p.x)*g.sx,oy=g.cy+(p.originY??p.y)*g.sy,tx=g.cx+(p.tx??p.x)*g.sx,ty=g.cy+(p.ty??p.y)*g.sy,total=Math.hypot(tx-ox,ty-oy)||1,k=Math.min(1,Math.hypot(x-ox,y-oy)/total),h=Math.sin(k*Math.PI)*Math.min(total*.45,Math.abs(g.sx)*.22);
        c.save();c.globalAlpha=.35;c.fillStyle='#000';c.beginPath();c.ellipse(x,y,pr*1.1,pr*.45,0,0,TAU);c.fill();c.restore();projectile(c,pd,x,y-h,time*7,pr,time,g.dpr||1);continue;}
      if(p.sword&&!(p.hover&&(p.age-(p.delay||0))<p.hover.until))swordStreak(c,p,x,y,pr,p.variant==='gold');if(p.shadowCopy){c.save();c.globalAlpha=.75;c.drawImage(glow('#6a4bff'),x-pr*2.4,y-pr*2.4,pr*4.8,pr*4.8);c.restore();}projectile(c,pd,x,y,angle,pr,time,g.dpr||1);}
    for(const b of s.beams){if(time<b.born||time>=b.until)continue;
      if(b.arc&&C.byId.get(b.id)?.skyBolt){// Ground chain from a sky bolt: the same jagged, layered lightning jumping ship to ship.
        const[ax,ay]=point(b.x,b.y),[bx,by]=point(b.tx,b.ty),k=clamp((b.until-time)/.24,0,1),L=Math.hypot(bx-ax,by-ay)||1,nx=-(by-ay)/L,ny=(bx-ax)/L,seed=Math.floor(b.born*97+b.x*131+b.y*71),pts=[[ax,ay]],n=6;
        for(let i=1;i<n;i++){const t=i/n,j=((((seed+i*29)%17)+17)%17/17-.5)*Math.min(L*.35,g.size*.6)*Math.sin(t*Math.PI);pts.push([ax+(bx-ax)*t+nx*j,ay+(by-ay)*t+ny*j]);}pts.push([bx,by]);
        boltPath(c,pts,k*(.7+.3*Math.sin(time*90+seed)),g.size*.8);continue;}
      if(b.sky){// Sky lightning: a jagged bolt from above the board onto the ship — purple glow, gold-white core, flickering.
        const[ax,ay]=point(b.tx,b.ty),top=g.cy-g.h,k=clamp((b.until-time)/(b.judg?.45:.32),0,1),flick=.7+.3*Math.sin(time*90+b.seed),pts=[[ax+((b.seed*37)%11-5)*g.size*.05,top]],n=9;
        for(let i=1;i<n;i++){const t=i/n,j=(((b.seed*13+i*29)%17)/17-.5)*g.size*(.55*(1-t)+.15);pts.push([ax+j,top+(ay-top)*t]);}pts.push([ax,ay]);
        boltPath(c,pts,k*flick,g.size*(b.judg?1.5:1));c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';
        c.globalAlpha=k*.5;c.strokeStyle='#ffd36e';c.lineWidth=g.size*.035;for(let f=0;f<2;f++){const i=3+f*3,[fx,fy]=pts[i],dir=(f?1:-1);c.beginPath();c.moveTo(fx,fy);c.lineTo(fx+dir*g.size*.35,fy+g.size*.3);c.lineTo(fx+dir*g.size*.5,fy+g.size*.65);c.stroke();}
        c.restore();continue;}
      if(b.relay){// Light relay leg: a beam tinted by the turret it reaches, with a white-hot core, growing in from the source.
        const[ax,ay]=point(b.x,b.y),[bx,by]=point(b.tx,b.ty),k=clamp((b.until-time)/.34,0,1),grow=clamp((time-b.born)/.08,0,1),ex=ax+(bx-ax)*grow,ey=ay+(by-ay)*grow;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
        c.globalAlpha=k*.6;c.strokeStyle=b.relay;c.lineWidth=g.size*.16;c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,ey);c.stroke();c.globalAlpha=k;c.strokeStyle='#ffffff';c.lineWidth=g.size*.045;c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,ey);c.stroke();c.restore();continue;}let[x,y]=point(b.x,b.y);const[tx,ty]=point(b.tx,b.ty),d=C.byId.get(b.id);
      const source=s.units.find(u=>u?.id===b.id&&Math.abs(R.positions[u.slot][0]-b.x)<1e-6&&Math.abs(R.positions[u.slot][1]-b.y)<1e-6);
      if(source){const pose=weaponPose(g,source,Math.atan2(b.ty-b.y,b.tx-b.x));x=pose.muzzleX;y=pose.muzzleY;}
      c.save();c.globalAlpha=clamp((b.until-time)/.24,0,1);
      if(index)c.globalAlpha*=.6;
      if(b.vital){// Spirit stream: a ribbon of green motes flowing from the turret into the core.
        const q=(time-b.born)/(b.until-b.born);c.globalCompositeOperation='lighter';for(let k=0;k<10;k++){const qq=Math.min(1,Math.max(0,q*1.6-k*.06)),px=x+(tx-x)*qq+Math.sin(qq*9+k)*4,py=y+(ty-y)*qq+Math.cos(qq*9+k)*4;c.globalAlpha=(1-q)*(1-k/12);c.fillStyle=k%3?'#9dff6a':'#f0ffe6';c.beginPath();c.arc(px,py,g.size*(.07-k*.004),0,TAU);c.fill();}}
      else if(b.soul){// Soul wisp: a glowing ghost orb arcs from the wreck back to the core with a fading tail.
        const q=Math.min(1,(time-b.born)/(b.until-b.born)),dx=tx-x,dy=ty-y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,arc=L*.35;c.globalCompositeOperation='lighter';
        for(let k=0;k<6;k++){const qq=Math.max(0,q-k*.05),bend=Math.sin(qq*Math.PI)*arc,px=x+dx*qq+nx*bend,py=y+dy*qq+ny*bend;c.globalAlpha=(1-k/6)*(q<.95?1:(1-q)*20);c.fillStyle=k?'#85ffb6':'#f2fff6';c.beginPath();c.arc(px,py,g.size*(.11-k*.012),0,TAU);c.fill();}
        const qq=q,bend=Math.sin(qq*Math.PI)*arc;c.globalAlpha=.8*(1-q*.5);c.drawImage(glow('#85ffb6'),x+dx*qq+nx*bend-g.size*.3,y+dy*qq+ny*bend-g.size*.3,g.size*.6,g.size*.6);}
      else       if(b.fuse){const q=(time-b.born)/(b.until-b.born),px=x+(tx-x)*Math.min(1,q*1.4),py=y+(ty-y)*Math.min(1,q*1.4);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#ffb35a';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.moveTo(x,y);c.lineTo(px,py);c.stroke();c.setLineDash([]);c.fillStyle='#fff1c2';c.beginPath();c.arc(px,py,2.5,0,TAU);c.fill();}
      else       if(b.tracer){const q=(time-b.born)/(b.until-b.born);c.globalCompositeOperation='lighter';c.lineCap='round';c.globalAlpha=1-q;c.strokeStyle='#ffe583';c.lineWidth=g.size*.09*(1-q)+1;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=1.2;c.stroke();c.drawImage(glow('#ffe583'),x-g.size*.35,y-g.size*.35,g.size*.7,g.size*.7);c.drawImage(glow('#ffffff'),tx-g.size*.25,ty-g.size*.25,g.size*.5,g.size*.5);}
      else if(b.cone){const q=(time-b.born)/(b.until-b.born),src=s.units.find(u=>u?.id===b.id&&Math.abs(R.positions[u.slot][0]-b.x)<1e-6&&Math.abs(R.positions[u.slot][1]-b.y)<1e-6),pose=src?weaponPose(g,src,b.angle):null,ox=pose?pose.muzzleX:x,oy=pose?pose.muzzleY:y,a=Math.atan2(Math.sin(b.angle)*g.sy,Math.cos(b.angle)*g.sx),L=b.range*Math.abs(g.sx);
        // Flame stream: soft fire puffs billow out along the cone, growing and cooling
        // from white-yellow to orange to red, ending in a wisp of smoke — no hard edges.
        c.save();c.translate(ox,oy);c.rotate(a);
        for(let k=0;k<16;k++){const seed=(k*0.6180339)%1,life=(q*1.3+seed)%1,ang=(seed*2-1)*b.cone*.85+Math.sin(time*7+k)*.05,d=L*(.08+life*.95),rad=g.size*(.07+life*.26);
          if(life>.88){c.globalCompositeOperation='source-over';c.globalAlpha=(1-life)*1.6*(1-q*.5);c.fillStyle='rgba(70,60,60,.5)';}
          else{c.globalCompositeOperation='lighter';c.globalAlpha=(1-life*.9)*(1-q*.6)*.75;c.fillStyle=life<.25?'#fff1c2':life<.55?'#ffb347':'#ff5a28';}
          c.beginPath();c.arc(Math.cos(ang)*d,Math.sin(ang)*d,rad,0,TAU);c.fill();}
        c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.8;c.drawImage(glow('#ffd28a'),-g.size*.3,-g.size*.3,g.size*.6,g.size*.6);
        c.restore();}
      else       if(b.id==='charged_laser'){const q=(time-b.born)/(b.until-b.born);c.globalCompositeOperation='lighter';c.lineCap='round';c.globalAlpha=1-q;c.strokeStyle='rgba(120,220,255,.5)';c.lineWidth=g.size*.28*(1-q*.5);c.beginPath();c.moveTo(x,y);c.lineTo(x+(tx-x)*1.35,y+(ty-y)*1.35);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=g.size*.09;c.stroke();c.drawImage(glow('#bff4ff'),x-g.size*.4,y-g.size*.4,g.size*.8,g.size*.8);}
      else if(b.channel&&b.frost){const fade=Math.min(1,(time-b.born)/.06,(b.until-time)/.08),dx=tx-x,dy=ty-y,ex=x+dx*1.2,ey=y+dy*1.2,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
        // Freezing ray: a thin pale-cyan beam with a white core, frost crystals drifting along it.
        c.globalAlpha=fade;c.globalCompositeOperation='lighter';c.lineCap='round';c.strokeStyle='rgba(157,244,255,.35)';c.lineWidth=g.size*.16;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.strokeStyle='#dffcff';c.lineWidth=g.size*.05;c.stroke();
        c.strokeStyle='#ffffff';c.lineWidth=1;for(let i=0;i<5;i++){const q=((time*1.5+i/5)%1),px=x+(ex-x)*q,py=y+(ey-y)*q,z=g.size*.07;c.globalAlpha=fade*(1-Math.abs(q-.5));c.beginPath();c.moveTo(px-z,py);c.lineTo(px+z,py);c.moveTo(px,py-z);c.lineTo(px,py+z);c.moveTo(px+nx*z*.7,py+ny*z*.7);c.lineTo(px-nx*z*.7,py-ny*z*.7);c.stroke();}}
      else if(b.channel){const life=b.until-b.born,age=time-b.born,fade=Math.min(1,age/.08,(b.until-time)/.2),heat=Math.min(8,b.pulses||0),dx=tx-x,dy=ty-y,L=Math.hypot(dx,dy)||1,ex=x+dx*1.35,ey=y+dy*1.35;
        // Annihilation beam: a thick magenta lance that swells and whitens as it heats up.
        c.globalAlpha=fade;c.globalCompositeOperation='lighter';c.lineCap='round';const w=g.size*(.16+.03*heat)*(1+Math.sin(time*40)*.08);
        c.strokeStyle='rgba(255,90,180,.35)';c.lineWidth=w*2.2;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();
        c.strokeStyle='#ff74bd';c.lineWidth=w;c.stroke();c.strokeStyle=heat>4?'#ffffff':'#ffd6ee';c.lineWidth=w*.38;c.stroke();
        const flare=glow(heat>4?'#ffffff':'#ff74bd');c.globalAlpha=fade*.9;c.drawImage(flare,tx-w*2.2,ty-w*2.2,w*4.4,w*4.4);c.drawImage(flare,x-w*1.6,y-w*1.6,w*3.2,w*3.2);}
      else       if(b.id==='reflect_bastion'){const q=(time-b.born)/(b.until-b.born);c.globalCompositeOperation='lighter';c.lineCap='round';const nx=-(ty-y),ny=tx-x,L=Math.hypot(nx,ny)||1;
        for(const [k,col] of [[-1,'#ff8ad8'],[0,'#bff6ff'],[1,'#fff08a']]){const o=k*3*(1-q);c.strokeStyle=col;c.lineWidth=k?1.6:3;c.globalAlpha=(1-q)*(k?.8:1);c.beginPath();c.moveTo(x+nx/L*o,y+ny/L*o);c.lineTo(tx+nx/L*o,ty+ny/L*o);c.stroke();}
        c.globalAlpha=1-q;c.fillStyle='#ffffff';c.save();c.translate(tx,ty);c.rotate(q*4);c.beginPath();c.moveTo(0,-7);c.lineTo(5,0);c.lineTo(0,7);c.lineTo(-5,0);c.closePath();c.fill();c.restore();}
      else       if(d?.vipExclusive)drawVipBeamSignature(c,d.id,d.color,x,y,tx,ty,1,time,.36,false);
      else if(b.arc&&d){// Lightning: a jagged bolt (re-rolled each frame) with a fork, glow and node sparks.
        const seg=9,dx=tx-x,dy=ty-y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,jit=Math.min(10,L*.12),f=Math.floor(time*30);const pts=[[x,y]];for(let i=1;i<seg;i++){const q=i/seg,r=Math.sin(f*12.9898+i*78.233+b.born*99)*43758.5453%1;pts.push([x+dx*q+nx*r*jit,y+dy*q+ny*r*jit]);}pts.push([tx,ty]);
        c.globalCompositeOperation='lighter';c.lineJoin='round';c.strokeStyle=d.color;c.globalAlpha*=.45;c.lineWidth=5;c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();c.globalAlpha/=.45;c.strokeStyle='#ffffff';c.lineWidth=1.6;c.stroke();
        const m=pts[4];c.strokeStyle=d.color;c.lineWidth=1.1;c.beginPath();c.moveTo(m[0],m[1]);c.lineTo(m[0]+nx*jit*1.6+dx*.08,m[1]+ny*jit*1.6+dy*.08);c.lineTo(m[0]+nx*jit*2.4+dx*.15,m[1]+ny*jit*2.4+dy*.15);c.stroke();
        c.drawImage(glow(d.color),tx-g.size*.25,ty-g.size*.25,g.size*.5,g.size*.5);}
            else{c.strokeStyle=d?.color||'#ff9de1';c.globalAlpha*=.9;c.lineWidth=(b.arc?1.4:2.2)*2.4;c.globalAlpha*=.35;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.globalAlpha/=.35;c.lineWidth=b.arc?1.3:2;c.beginPath();c.moveTo(x,y);for(let i=1;i<=8;i++){const q=i/8,jitter=b.arc?Math.sin(i*23+time*20)*6:0;c.lineTo(x+(tx-x)*q+jitter,y+(ty-y)*q-jitter);}c.stroke();c.shadowBlur=0;c.strokeStyle='#ffffff';c.lineWidth=.7;c.stroke();}c.restore();}
    const fx=index?.6:1;c.save();c.globalAlpha=fx;
    for(const e of newest(s.impacts,time,index?24:44)){if(e.kind==='shield'||e.kind==='shieldUp')continue;const[x,y]=point(e.x,e.y),q=clamp((time-e.born)/(e.until-e.born),0,1),d=C.byId.get(e.id),color=e.kind==='destroy'||e.kind==='core'?'#ff809c':d?.color||'#abceff';
      if(d?.vipExclusive&&(e.kind==='hit'||e.kind==='kill')){const qq=q*1.35;if(qq<1)vipImpact(c,g,d,qq,x,y,Math.max(.26,g.size/105));continue;}
      // Arcane Core: the blast draws a rotating rune circle the size of its real splash radius.
      if(e.id==='arcane_core'&&(e.kind==='hit'||e.kind==='kill')){const R=Math.min(.55,86/260)*Math.abs(g.sx),open=1-Math.pow(1-Math.min(1,q*2.2),3),fade=q<.55?1:1-(q-.55)/.45;
        c.save();c.translate(x,y);c.globalCompositeOperation='lighter';
        // soft violet bloom filling the blast radius
        const halo=glow('#8f6bff');c.globalAlpha=.55*fade;c.drawImage(halo,-R*1.15,-R*1.15,R*2.3,R*2.3);
        // expanding shock ring
        c.globalAlpha=(1-q)*.9;c.strokeStyle='#efe8ff';c.lineWidth=2.5*(1-q)+.5;c.beginPath();c.arc(0,0,R*(.35+q*.75),0,TAU);c.stroke();
        // outer rune ring with glyph ticks, turning clockwise
        c.save();c.rotate(q*2.4);c.globalAlpha=.95*fade;c.strokeStyle='#c9b8ff';c.lineWidth=1.8;c.beginPath();c.arc(0,0,R*open,0,TAU);c.stroke();
        c.lineWidth=1;c.beginPath();c.arc(0,0,R*open*.88,0,TAU);c.stroke();
        for(let k=0;k<12;k++){c.rotate(TAU/12);c.beginPath();c.moveTo(R*open*.88,0);c.lineTo(R*open,0);c.stroke();if(k%3===0){c.fillStyle='#ffffff';c.beginPath();c.arc(R*open*.94,0,1.6,0,TAU);c.fill();}}
        c.restore();
        // inner hexagram, counter-rotating
        c.save();c.rotate(-q*3.2);c.globalAlpha=.85*fade;c.strokeStyle='#a98cff';c.lineWidth=1.4;const H=R*open*.7;
        for(const off of [0,Math.PI/3]){c.beginPath();for(let k=0;k<3;k++){const a=off+k*TAU/3-Math.PI/2;k?c.lineTo(Math.cos(a)*H,Math.sin(a)*H):c.moveTo(Math.cos(a)*H,Math.sin(a)*H);}c.closePath();c.stroke();}
        c.beginPath();c.arc(0,0,H*.42,0,TAU);c.stroke();c.restore();
        // runes orbiting on the circle
        c.globalAlpha=fade;c.fillStyle='#f3eeff';for(let k=0;k<4;k++){const a=k*TAU/4+q*5;c.save();c.translate(Math.cos(a)*R*open,Math.sin(a)*R*open);c.rotate(a);c.fillRect(-2.2,-2.2,4.4,4.4);c.restore();}
        c.restore();continue;}
      // Capacitor surge: a crackling electric starburst.
      // Royal tide wave: a rolling water crest with white foam and splash droplets, sized to the real radius.
      if(e.kind==='tide'){const reach=Math.min(.55,96/260)*Math.abs(g.sx),ease=1-Math.pow(1-q,2),R=reach*(.2+ease*.8);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';
        // A bright sapphire wave front rushing outward: thick crest, white foam lip, trailing wash.
        c.globalAlpha=(1-q)*.5;c.drawImage(glow('#2f7bff'),-R*1.1,-R*1.1,R*2.2,R*2.2);
        c.globalAlpha=(1-q);c.strokeStyle='#3d86ff';c.lineWidth=g.size*.22*(1-q)+2;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
        c.strokeStyle='#9fd0ff';c.lineWidth=g.size*.09*(1-q)+1.2;c.beginPath();c.arc(0,0,R+g.size*.08,0,TAU);c.stroke();
        c.strokeStyle='#ffffff';c.lineWidth=1.6;c.setLineDash([6,5]);c.lineDashOffset=-q*40;c.beginPath();c.arc(0,0,R+g.size*.14,0,TAU);c.stroke();c.setLineDash([]);
        c.fillStyle='#e8f4ff';for(let k=0;k<14;k++){const a=k*TAU/14+e.x*7,h=Math.sin(q*Math.PI)*g.size*.45*(k%2?.6:1);c.beginPath();c.arc(Math.cos(a)*(R+g.size*.16),Math.sin(a)*(R+g.size*.16)-h,g.size*.045,0,TAU);c.fill();}
        c.restore();continue;}
      if(e.kind==='surge'){const reach=.24*Math.abs(g.sx);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';
        // Electromagnetic pulse: three rings ripple out to the wave's real reach, with a hot core flash.
        for(let k=0;k<3;k++){const qq=Math.max(0,Math.min(1,(q-k*.12)/.7));if(qq<=0||qq>=1)continue;const R=reach*qq;c.globalAlpha=(1-qq)*.95;c.strokeStyle=k?'#ffe066':'#fff8d0';c.lineWidth=(3.2-k*.8)*(1-qq)+.6;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
          c.lineWidth=1;for(let a=0;a<10;a++){const ang=a*TAU/10+k;c.beginPath();c.moveTo(Math.cos(ang)*R*.92,Math.sin(ang)*R*.92);c.lineTo(Math.cos(ang+.06)*R*1.06,Math.sin(ang+.06)*R*1.06);c.stroke();}}
        if(q<.35){c.globalAlpha=(1-q/.35);c.drawImage(glow('#ffe066'),-reach*.4,-reach*.4,reach*.8,reach*.8);}
        c.restore();continue;}
      // Execution: a red X slash across the finished ship.
      if(e.kind==='execute'){const R=g.size*(.16+q*.08);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#ff6f91';c.lineWidth=2*(1-q)+.8;c.lineCap='round';c.beginPath();c.moveTo(-R,-R);c.lineTo(R,R);c.moveTo(R,-R);c.lineTo(-R,R);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=.8;c.stroke();c.restore();continue;}
      // Coin fountain: gold coins pop up and arc out of the mine.
      if(e.kind==='coins'){c.save();c.translate(x,y);for(let k=0;k<6;k++){const a=-Math.PI/2+(k-2.5)*.35,v=g.size*(1.1+(k%3)*.25),px=Math.cos(a)*v*q,py=Math.sin(a)*v*q+g.size*1.6*q*q;c.globalAlpha=Math.min(1,(1-q)*2);c.fillStyle='#ffd36e';c.strokeStyle='#a8731f';c.lineWidth=1;c.beginPath();c.ellipse(px,py,g.size*.13*Math.abs(Math.cos(time*12+k))+1.5,g.size*.13,0,0,TAU);c.fill();c.stroke();}c.restore();continue;}
      // Annihilation: a black sphere swells then collapses into a white flash ring.
      if(e.kind==='annihilate'){const R=.22*Math.abs(g.sx)*(.4+q*.6);c.save();c.translate(x,y);if(q<.45){c.fillStyle='#05010a';c.globalAlpha=1;c.beginPath();c.arc(0,0,R*(q/.45),0,TAU);c.fill();c.strokeStyle='#ff69ce';c.lineWidth=2;c.stroke();}else{const k=(q-.45)/.55;c.globalCompositeOperation='lighter';c.globalAlpha=1-k;c.drawImage(glow('#ffffff'),-R*1.2,-R*1.2,R*2.4,R*2.4);c.strokeStyle='#ffd1f1';c.lineWidth=3*(1-k)+.5;c.beginPath();c.arc(0,0,R*(.6+k*.8),0,TAU);c.stroke();}c.restore();continue;}
      // Spirit burst: a wide green ring rolls out from the full core.
      if(e.kind==='timeResume'){// Time resumes: a glassy shock ring bursts from the centre of the field.
        const cx=g.cx,cy=g.cy,R=Math.min(g.w,g.h)*(.2+q*.6);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#bffff0';c.lineWidth=3*(1-q)+1;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();c.globalAlpha=(1-q)*.5;c.drawImage(glow('#43ffc4'),cx-R,cy-R,R*2,R*2);c.restore();continue;}
      if(e.kind==='timeCrack'){// Stored damage released: the ship's frozen moment cracks like glass.
        const S=g.size*.55;c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#eafffa';c.lineWidth=1.4;for(let i=0;i<6;i++){const a=i*TAU/6+.4,r1=S*(.4+q*.5);c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r1*.55,Math.sin(a)*r1*.55);c.lineTo(Math.cos(a+.25)*r1,Math.sin(a+.25)*r1);c.stroke();}c.globalAlpha=(1-q)*.7;c.drawImage(glow('#43ffc4'),-S,-S,S*2,S*2);c.restore();continue;}
      if(e.kind==='hymnBeat'){// A beat of the hymn: a soft pink-violet nebula ring and a note rising from the Hymn.
        const S=g.size,R=S*(.45+q*.75);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.6;c.drawImage(glow('#ff77c4'),-R,-R,R*2,R*2);c.globalAlpha=(1-q)*.85;c.strokeStyle='#ffc4e8';c.lineWidth=1.4;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
        c.globalAlpha=1-q;c.fillStyle='#fff3c4';const ny2=-S*(.5+q*.6),nx2=S*.25;c.beginPath();c.ellipse(nx2,ny2,S*.07,S*.05,-.4,0,TAU);c.fill();c.strokeStyle='#fff3c4';c.lineWidth=1.3;c.beginPath();c.moveTo(nx2+S*.065,ny2);c.lineTo(nx2+S*.065,ny2-S*.22);c.quadraticCurveTo(nx2+S*.16,ny2-S*.18,nx2+S*.14,ny2-S*.08);c.stroke();c.restore();continue;}
      if(e.kind==='chorus'){// A turret joining the chorus: a gold ring opening at its feet and a brief bloom.
        const S=g.size,R=S*(.4+q*.35);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.7;c.drawImage(glow('#ffd36e'),-R*1.2,-R*1.2,R*2.4,R*2.4);c.globalAlpha=1-q;c.strokeStyle='#ffe7a8';c.lineWidth=2*(1-q)+.6;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.restore();continue;}
      if(e.kind==='sunFlare'){// Sigil detonation: a solar flare - white core, amber bloom, a corona ring and curling flame tongues.
        const S=g.size,R=S*(.35+q*.9);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,1-q*1.6);c.drawImage(glow('#ffffff'),-S*.5,-S*.5,S,S);c.globalAlpha=(1-q)*.85;c.drawImage(glow('#ff7839'),-R*1.4,-R*1.4,R*2.8,R*2.8);
        c.strokeStyle='#ffd36e';c.lineWidth=S*.05*(1-q)+.6;c.globalAlpha=1-q;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
        for(let i=0;i<8;i++){const a=i*TAU/8+q*1.5;c.save();c.rotate(a);const fg=c.createLinearGradient(R*.3,0,R*1.25,0);fg.addColorStop(0,'rgba(255,241,201,.95)');fg.addColorStop(1,'rgba(255,120,57,0)');c.fillStyle=fg;c.beginPath();c.moveTo(R*.3,-S*.05);c.quadraticCurveTo(R*.8,-S*.2,R*1.25,0);c.quadraticCurveTo(R*.8,S*.05,R*.3,S*.05);c.fill();c.restore();}
        c.restore();continue;}
      if(e.kind==='supernova'){// Supernova (premium): a white-hot flash, a blue outer shock ring, an orange inner ring and long light rays.
        const S=g.size,R=S*(.4+q*2.2);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,1-q*2);c.drawImage(glow('#ffffff'),-S*1.2,-S*1.2,S*2.4,S*2.4);
        c.globalAlpha=Math.max(0,1-q*1.1)*.8;c.drawImage(glow('#8a4dff'),-R*1.2,-R*1.2,R*2.4,R*2.4);c.globalAlpha=1-q;c.strokeStyle='#9fd8ff';c.lineWidth=S*.06*(1-q)+1;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.strokeStyle='#ffb36a';c.lineWidth=S*.1*(1-q)+.5;c.beginPath();c.arc(0,0,R*.72,0,TAU);c.stroke();
        for(let i=0;i<12;i++){const a=i*TAU/12+.13,L=R*(1.1+(i%3)*.25);const lg=c.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);lg.addColorStop(0,'rgba(255,255,255,.9)');lg.addColorStop(1,'rgba(255,255,255,0)');c.strokeStyle=lg;c.lineWidth=S*.03;c.globalAlpha=1-q;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*L,Math.sin(a)*L);c.stroke();}
        c.restore();continue;}
      if(e.kind==='breach'){// The leviathan breaking the surface: a ring of foam, a deep blue swell and rising spray.
        const S=g.size,R=S*(.4+q*1.1);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.8;c.drawImage(glow('#2bd7ff'),-R,-R,R*2,R*2);c.strokeStyle='#d8fbff';c.lineWidth=2*(1-q)+.5;c.beginPath();c.ellipse(0,0,R*.8,R*.5,0,0,TAU);c.stroke();
        c.fillStyle='#eafdff';for(let i=0;i<10;i++){const a=i*TAU/10,d=R*.6,hgt=S*.7*Math.sin(Math.PI*q);c.globalAlpha=(1-q);c.beginPath();c.arc(Math.cos(a)*d,Math.sin(a)*d*.5-hgt*(.5+.5*Math.sin(i*3)),S*.04,0,TAU);c.fill();}c.restore();continue;}
      if(e.kind==='starBurst'){// Ignition (premium): a white-gold bloom, a thin gold ring and a soft crimson ring expanding,
        // and twelve flame-feather shards fanning out with gradient tails.
        const S=g.size,R=S*(.3+q*.85);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';
        c.globalAlpha=Math.max(0,1-q*1.6);c.drawImage(glow('#fff1c9'),-S*.55,-S*.55,S*1.1,S*1.1);c.globalAlpha=Math.max(0,1-q*1.2)*.8;c.drawImage(glow('#ff6a4d'),-R*1.3,-R*1.3,R*2.6,R*2.6);
        c.globalAlpha=1-q;c.strokeStyle='#ffd27a';c.lineWidth=1.4;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.strokeStyle='rgba(216,32,79,.6)';c.lineWidth=S*.08*(1-q);c.beginPath();c.arc(0,0,R*.8,0,TAU);c.stroke();
        for(let i=0;i<12;i++){const a=i*TAU/12+(e.x*7%1),d=S*(.15+q*.75),L=S*.28*(1-q*.5);c.save();c.rotate(a);c.translate(d,0);const fg=c.createLinearGradient(-L,0,L*.4,0);fg.addColorStop(0,'rgba(216,32,79,0)');fg.addColorStop(.6,'#ffb347');fg.addColorStop(1,'#fffbe8');
          c.fillStyle=fg;c.beginPath();c.moveTo(L*.4,0);c.quadraticCurveTo(-L*.2,-L*.18,-L,0);c.quadraticCurveTo(-L*.2,L*.18,L*.4,0);c.fill();c.restore();}
        c.restore();continue;}
      if(e.kind==='thunderStrike'){// Ground strike: a flash, an electric ring and sparks jumping outward.
        const S=g.size*(e.judg?1.3:1),R=S*(.3+q*.7);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,1-q*1.4);c.drawImage(glow('#ffd36e'),-S*.7,-S*.7,S*1.4,S*1.4);
        c.globalAlpha=1-q;c.strokeStyle='#c99bff';c.lineWidth=2.5*(1-q)+.6;c.beginPath();c.arc(0,0,R*.8,0,TAU);c.stroke();c.strokeStyle='#fff3c4';c.lineWidth=1.3;
        for(let i=0;i<7;i++){const a=i*TAU/7+q,r0=R*.5,r1=R*1.05;c.beginPath();c.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);c.lineTo(Math.cos(a+.18)*(r0+r1)/2,Math.sin(a+.18)*(r0+r1)/2);c.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);c.stroke();}c.restore();continue;}
      if(e.kind==='prismNode'){// Crystal node over a relaying turret: a turning diamond prism that flashes in the turret's colour.
        const R=g.size*.36*(1-q*.25),col=e.color||'#51e5ff';c.save();c.translate(x,y-g.size*.1);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.drawImage(glow(col),-R*1.6,-R*1.6,R*3.2,R*3.2);c.rotate(q*3);
        c.fillStyle='rgba(234,252,255,.9)';c.beginPath();c.moveTo(0,-R);c.lineTo(R*.55,0);c.lineTo(0,R);c.lineTo(-R*.55,0);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=1.5;c.stroke();c.restore();continue;}
      if(e.kind==='freeze'){// Ice closing in: a pale hex ring snaps shut around the ship.
        const R=g.size*.55*(1.4-q*.6);c.save();c.translate(x,y);c.globalAlpha=1-q;c.strokeStyle='#eaf6ff';c.lineWidth=2;c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;i?c.lineTo(Math.cos(a)*R,Math.sin(a)*R):c.moveTo(Math.cos(a)*R,Math.sin(a)*R);}c.closePath();c.stroke();c.restore();continue;}
      if(e.kind==='iceCrack'){// Promo-style ice crack: six jagged cracks race outward while ice shards fly.
        const R=g.size*.9*Math.min(1,q*2.2),S=g.size;c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q*q;c.drawImage(glow('#a8d8ff'),-S*.6,-S*.6,S*1.2,S*1.2);
        c.strokeStyle='#eaf6ff';c.lineWidth=1.8*(1-q)+.6;for(let i=0;i<6;i++){const a=i*TAU/6+.3;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*R*.6,Math.sin(a)*R*.6);c.lineTo(Math.cos(a+.35)*R,Math.sin(a+.35)*R);c.stroke();}
        c.globalCompositeOperation='source-over';c.fillStyle='#dff3ff';for(let i=0;i<8;i++){const a=i*2.4,d=S*(.15+q*.9);c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);c.rotate(a+q*5);c.beginPath();c.moveTo(S*.07,0);c.lineTo(0,-S*.03);c.lineTo(-S*.05,0);c.lineTo(0,S*.03);c.closePath();c.fill();c.restore();}c.restore();continue;}
      if(e.kind==='shuriken'){// A quick mint crescent where a shuriken bites.
        const R=g.size*.28*(.6+q*.6),a=(e.x+e.y)*9;c.save();c.translate(x,y);c.rotate(a);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#bfffee';c.lineWidth=2.2*(1-q)+.6;c.beginPath();c.arc(0,0,R,-.9,.9);c.stroke();c.restore();continue;}
      if(e.kind==='pentagram'){// Pentagram seal: a glowing five-pointed star inside a ring flashes onto the ground and fades.
        const R=(e.r||.2)*Math.abs(g.sx),spin=(e.spin||0)+2.4,draw=Math.min(1,q*4);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,1-q*q);
        c.drawImage(glow('#ff9c7a'),-R*1.2,-R*1.2,R*2.4,R*2.4);c.strokeStyle='#ffd2b8';c.lineWidth=2.4*(1-q)+.8;c.beginPath();c.arc(0,0,R,0,TAU*draw);c.stroke();
        c.strokeStyle='#ff9c7a';c.lineWidth=3*(1-q)+1;c.beginPath();for(let i=0;i<=5*draw;i++){const a=spin-Math.PI/2+(i*2%5)*TAU/5;i?c.lineTo(Math.cos(a)*R,Math.sin(a)*R):c.moveTo(Math.cos(a)*R,Math.sin(a)*R);}c.stroke();c.restore();continue;}
      if(e.kind==='ink'){// Ink-wash splash: pale ink blooms outward in soft irregular blots with a few gold flecks.
        const S=g.size*.4,seed=(e.x*97+e.y*53)%1;c.save();c.translate(x,y);c.globalAlpha=(1-q)*.85;
        for(let i=0;i<6;i++){const a=i*1.9+seed*6,d=S*(.15+q*.55)*(.6+((i*37)%10)/14),rr=S*(.22-i*.022)*(.5+q*.8);c.fillStyle=i%2?'rgba(214,220,230,.55)':'rgba(240,236,224,.7)';c.beginPath();c.ellipse(Math.cos(a)*d,Math.sin(a)*d,rr,rr*.7,a,0,TAU);c.fill();}
        c.fillStyle='#f0cf7a';for(let i=0;i<4;i++){const a=i*1.6+seed*4,d=S*(.3+q*.9);c.fillRect(Math.cos(a)*d-1,Math.sin(a)*d-1,2,2);}c.restore();continue;}
      if(e.kind==='swordForm'){// Sword Formation: a gold ensō brush ring sweeps open around the turret.
        const R=g.size*(.7+q*.5);c.save();c.translate(x,y);c.lineCap='round';for(let k=0;k<3;k++){c.globalAlpha=(1-q)*(.35+k*.2);c.strokeStyle=k===2?'#fff3c8':'#e8c46a';c.lineWidth=g.size*(.09-k*.025);c.beginPath();c.arc(0,0,R+(k-1)*2,-1.2+q*2,-1.2+q*2+TAU*.85*Math.min(1,q*2.5));c.stroke();}c.restore();continue;}
      if(e.kind==='bombBlast'||e.kind==='bombChain'){// Promo-style blast: a hot flash, a thick ring and ten radial sparks.
        const S=Math.abs(g.sx),big=e.kind==='bombBlast',R=S*(big?.34:.2)*(.25+q*.75);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';
        c.globalAlpha=Math.max(0,1-q*1.6);c.drawImage(glow(big?'#ffd27a':'#ff9a4d'),-R,-R,R*2,R*2);
        c.globalAlpha=1-q;c.strokeStyle='#ffb056';c.lineWidth=(big?5:3)*(1-q)+1;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
        c.strokeStyle='#fff1c4';c.lineWidth=big?2.2:1.5;for(let i=0;i<10;i++){const a=i*TAU/10+(big?0:.3);c.beginPath();c.moveTo(Math.cos(a)*R*1.05,Math.sin(a)*R*1.05);c.lineTo(Math.cos(a)*R*(1.3+q*.3),Math.sin(a)*R*(1.3+q*.3));c.stroke();}
        c.restore();continue;}
      if(e.kind==='iceHold'){const S=Math.abs(g.sx),k=Math.min(1,q*3);c.save();c.translate(x,y);c.globalAlpha=(1-q)*.9;c.strokeStyle='#e8fbff';c.lineWidth=2;for(let i=0;i<6;i++){const a=i*TAU/6;c.beginPath();c.moveTo(Math.cos(a)*S*.012,Math.sin(a)*S*.012);c.lineTo(Math.cos(a)*S*.045*k,Math.sin(a)*S*.045*k);c.stroke();}c.restore();continue;}
      if(e.kind==='iceShatter'){const S=Math.abs(g.sx);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.drawImage(glow('#8fe8ff'),-S*.2,-S*.2,S*.4,S*.4);c.fillStyle='#e8fbff';
        for(let i=0;i<10;i++){const a=i*2.3,d=S*(.03+q*.16);c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);c.rotate(a+q*4);c.beginPath();c.moveTo(S*.014,0);c.lineTo(0,S*.006);c.lineTo(-S*.01,0);c.lineTo(0,-S*.006);c.closePath();c.fill();c.restore();}c.restore();continue;}
      if(e.kind==='vitalBurst'){const R=.5*Math.abs(g.sx)*(.3+q*.7);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#9dff6a';c.lineWidth=4*(1-q)+1;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.drawImage(glow('#9dff6a'),-R*.5,-R*.5,R,R);c.restore();continue;}
      // Mine blast: a punchy orange fireball with a shock ring sized to the real blast radius.
      if(e.kind==='mine'){const R=.16*Math.abs(g.sx)*(.35+q*.65);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.drawImage(glow('#ff8a3c'),-R*1.4,-R*1.4,R*2.8,R*2.8);c.fillStyle='#fff1c2';c.beginPath();c.arc(0,0,R*.45*(1-q),0,TAU);c.fill();c.strokeStyle='#ffc27a';c.lineWidth=3*(1-q)+.6;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.restore();continue;}
      // Bomblet detonation: a compact orange blast with a hot white core and flung sparks.
      if(e.kind==='bomblet'){const R=(e.blast||.12)*Math.abs(g.sx)*(.4+q*.6);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.drawImage(glow('#ff9a3c'),-R*1.3,-R*1.3,R*2.6,R*2.6);c.fillStyle='#fff1c2';c.beginPath();c.arc(0,0,R*.35*(1-q),0,TAU);c.fill();c.strokeStyle='#ffb35a';c.lineWidth=2*(1-q)+.5;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();for(let k=0;k<6;k++){const a=k*TAU/6+e.x*5;c.beginPath();c.moveTo(Math.cos(a)*R*.7,Math.sin(a)*R*.7);c.lineTo(Math.cos(a)*R*1.3,Math.sin(a)*R*1.3);c.stroke();}c.restore();continue;}
      // Twin Resonance: two interlocking rings and a white cross flash.
      if(e.kind==='resonance'){const R=g.size*(.35+q*.4);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.globalAlpha=1-q;c.strokeStyle='#8ff7ff';c.lineWidth=2.5*(1-q)+.8;for(const k of [-1,1]){c.beginPath();c.arc(k*R*.35,0,R*.7,0,TAU);c.stroke();}c.strokeStyle='#ffffff';c.lineWidth=2;c.rotate(Math.PI/4);c.beginPath();c.moveTo(-R,0);c.lineTo(R,0);c.moveTo(0,-R);c.lineTo(0,R);c.stroke();c.restore();continue;}
      // Counterstrike release: a prism ring bursting out to the shockwave's real reach.
      if(e.kind==='counter'){const R=.62*Math.abs(g.sx)*(.2+q*.8);c.save();c.translate(x,y);c.globalCompositeOperation='lighter';for(const [k,col] of [[0,'#ff8ad8'],[1,'#bff6ff'],[2,'#fff08a']]){c.globalAlpha=(1-q)*.9;c.strokeStyle=col;c.lineWidth=4*(1-q)+1;c.beginPath();c.arc(0,0,R*(1-k*.06),0,TAU);c.stroke();}c.globalAlpha=(1-q)*.6;c.drawImage(glow('#bff6ff'),-R*.6,-R*.6,R*1.2,R*1.2);c.restore();continue;}
      impact(c,g,e,color,q,x,y);
      if(e.kind==='lucky'||e.kind==='merge'){
        const unit=s.units.find(u=>u&&Math.abs(R.positions[u.slot][0]-e.x)<1e-6&&Math.abs(R.positions[u.slot][1]-e.y)<1e-6),star=unit?.star||1;
        if(e.kind==='lucky'||star>=3){const gold=e.kind==='lucky'||star>=5,rays=gold?12:8,reach=g.size*(.7+q*(gold?1.6:1.1));
          c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.globalAlpha=(1-q)*.95;c.strokeStyle=gold?'#ffd36e':color;c.lineWidth=2.5;c.lineCap='round';
          for(let i=0;i<rays;i++){const a=i*TAU/rays+q*1.5;c.beginPath();c.moveTo(Math.cos(a)*g.size*.45,Math.sin(a)*g.size*.45);c.lineTo(Math.cos(a)*reach,Math.sin(a)*reach);c.stroke();}
          const halo=glow(gold?'#ffd36e':color);c.globalAlpha=(1-q)*.8;c.drawImage(halo,-g.size*1.4,-g.size*1.4,g.size*2.8,g.size*2.8);c.restore();}
      }
      if(e.kind==='kill'&&q<.7){const n=6,spread=g.size*(.2+q*1.1);c.save();c.fillStyle=color;c.globalAlpha=1-q/.7;for(let i=0;i<n;i++){const a=i*TAU/n+(e.x+e.y)*9,z=g.size*.12*(1-q);c.save();c.translate(x+Math.cos(a)*spread,y+Math.sin(a)*spread);c.rotate(a+q*8);c.beginPath();c.moveTo(z,0);c.lineTo(-z*.6,z*.6);c.lineTo(-z*.4,-z*.6);c.closePath();c.fill();c.restore();}c.restore();}
    }
    c.restore();
    // Numbers: crits and big events first, then only a few plain hits on our own board.
    // Chip numbers: one tiny number per hit (our board only), sized by damage,
    // fanned sideways and gone in 0.42 s, so rapid fire reads as a stream.
    if(!index)for(const p of newest(s.popups,time,18,p=>p.chip!==undefined)){const[x,y]=point(p.x,p.y),q=(time-p.born)/.42,h=Math.abs(Math.sin(p.born*12.9898+p.x*78.233)*43758.5453),jx=(h%1)-.5,jy=((h*7.13)%1)-.5;
      c.save();c.globalAlpha=Math.min(1,(1-q)*2);const up=y>g.size*1.6;c.translate(clamp(x+jx*g.size*1.2,g.w*.08,g.w*.92),up?y-8+jy*g.size*.7-q*18:y+10+jy*g.size*.7+q*18);label(c,p.text,Math.round(clamp(7+Math.log(1+p.chip)*1.3,7,12)),700,p.color,0,0,g.dpr);c.restore();}
    const shownPopups=[...newest(s.popups,time,index?4:7,p=>p.tier||p.large),...(index?[]:newest(s.popups,time,5,p=>!p.tier&&!p.large&&p.chip===undefined))];
    for(const p of shownPopups){const[x,y]=point(p.x,p.y),q=(time-p.born)/.85,locale=globalThis.SpaceTowerLocale;let translated=popupLabels.get(p);
      if(!translated||translated.language!==locale?.language){translated={language:locale?.language,text:locale?.text(p.text)||p.text};popupLabels.set(p,translated);}
      const tier=p.tier||0,span=tier?1:.85,qq=(time-p.born)/span;
      if(tier&&qq<.35){const a=(1-qq/.35)*(index?.5:.8),len=g.size*(.7+tier*.3)*(.6+qq*1.2);c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(-.6);c.globalAlpha=a;c.fillStyle=tier===2?'#ff5d7a':'#ffe08a';c.beginPath();c.moveTo(-len,2);c.quadraticCurveTo(0,-g.size*.35*(tier+1),len,-2);c.quadraticCurveTo(0,g.size*.08,-len,2);c.fill();c.fillStyle='#ffffff';c.globalAlpha=a*.9;c.fillRect(-len*.7,-1,len*1.4,2);c.restore();}
      const pop=tier?(qq<.1?2.2-qq*12:qq<.18?.95+(qq-.1)*.6:1):(q<.12?1.6-q*5:1),rise=tier?qq*18:q*24;
      c.save();c.globalAlpha=Math.min(1,(1-(tier?qq:q))*2.5);c.translate(clamp(x,g.w*.14,g.w*.86),Math.max(56,y-8-rise));c.scale(pop,pop);if(tier)c.rotate(-.06);
      label(c,translated.text,tier===2?18:tier?15:p.large?13:p.dot?8:10,p.dot?700:900,p.color,0,0,g.dpr);c.restore();}
  }
  globalThis.SpaceTowerRankedArt=Object.freeze({draw,weaponPose,shotPoint});
})();
