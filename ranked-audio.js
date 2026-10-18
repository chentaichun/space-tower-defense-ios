/* Original, cached weapon voices. Audio follows presentation events, never simulation RNG. */
(() => {
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  function family(d={}){
    const id=d.id||'';
    if(globalThis.SpaceTowerRankedVoices?.[id])return SpaceTowerRankedVoices[id].kind;
    if(/phoenix/.test(id))return 'phoenix';if(/tide/.test(id))return 'tide';
    if(d.slowAura||/chrono/.test(id))return 'time';if(d.shield||id==='emergency_shield')return 'shield';
    if(/gatling|rookie_rapid|double_burst/.test(id))return 'gatling';
    if(/frost|chill/.test(id))return 'frost';if(d.beam)return 'laser';if(d.chain)return 'arc';
    if(d.missiles)return 'missile';if(/void|singularity|antimatter|soul/.test(id))return 'void';
    if(d.burn)return 'flame';if(d.pellets||/scatter|cluster/.test(id))return 'shotgun';
    if(d.damageType==='magic')return 'magic';return 'cannon';
  }
  const MUSIC_LEVEL=.14,MAX_VOICES=8;
  const lengths={cannon:.23,gatling:.085,phoenix:.58,tide:.65,time:.5,shield:.56,frost:.27,laser:.25,arc:.22,missile:.44,void:.48,flame:.4,shotgun:.24,magic:.27,sniper:.27,split:.32,echo:.38,pulse:.34,coin:.25,core:.32,summon:.22,merge:.35,upgrade:.22,win:1.1,loss:1.1};
  // Offline sound design: a mechanical transient, a low energy body and a
  // material-specific tail. Noise is band-limited; pure piercing tones are avoided.
  function samples(kind,id='',rate=24000){
    id=typeof id==='string'?id:'';
    const voice=globalThis.SpaceTowerRankedVoices?.[id],profile=voice?.kind===kind?voice:null;
    const duration=(lengths[kind]||.2)*clamp(profile?.length||1,.65,1.6),result=new Float32Array(Math.ceil(rate*duration));
    const hash=[...id].reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0)|0,17),pitch=Math.sqrt(profile?.pitch||1),tau=Math.PI*2;
    let seed=(hash>>>0)||1,low=0,air=0,body=0,phase=0,mod=0,output=0,output2=0;
    for(let i=0;i<result.length;i++){
      const t=i/rate,q=t/duration,attack=Math.min(1,t/.0025),tail=Math.min(1,(1-q)*18),s=f=>Math.sin(tau*f*t*pitch);
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
      low+=.035*(noise-low);air+=.27*(noise-air);body+=.10*(noise-body);
      const grit=air-body,rumble=low*2.5,shot=Math.exp(-q*7),punch=s(100)*Math.exp(-q*10);
      let sound=0;
      switch(kind){
        case 'gatling': phase+=tau*(155+250*Math.exp(-t*100))*pitch/rate;sound=(Math.sin(phase)*.5+grit*.7)*Math.exp(-q*9)+(s(620)*.08+grit*.12)*Math.exp(-Math.abs(q-.38)*32);break;
        case 'cannon': phase+=tau*(82+155*Math.exp(-t*38))*pitch/rate;sound=Math.sin(phase)*.6*Math.exp(-q*5)+grit*.65*Math.exp(-q*22)+(s(430)+s(713)*.3)*.065*Math.exp(-q*13);break;
        case 'shotgun': sound=(rumble*.7+grit*.9)*Math.exp(-q*8)+punch*.5+(s(330)*.08)*shot;break;
        case 'phoenix': phase+=tau*(230+430*Math.sin(q*Math.PI)**2)*pitch/rate;mod+=tau*110*pitch/rate;sound=(rumble*.95+body*.8)*Math.sin(Math.PI*q)**.7+Math.sin(phase+Math.sin(mod)*1.4)*.12*Math.sin(Math.PI*q)**2+punch*.3;break;
        case 'tide': sound=(rumble*1.5+grit*.18)*Math.sin(Math.PI*q)**.85+s(66)*.16*Math.sin(Math.PI*q)+(body*.6)*Math.exp(-Math.abs(q-.23)*12);break;
        case 'shield': phase+=tau*(175+40*Math.exp(-q*6))*pitch/rate;sound=(Math.sin(phase)*.22+s(349)*.07+s(522)*.035)*Math.sin(Math.PI*q)**.6+rumble*.3*Math.exp(-q*9);break;
        case 'time': phase+=tau*(70+330*(1-q)**2)*pitch/rate;{const tick=Math.exp(-((q*4)%1)*24);sound=Math.sin(phase+s(53)*1.1)*.22*Math.sin(Math.PI*q)+(grit*.22+s(720)*.035)*tick+rumble*.2*(1-q);}break;
        case 'frost': {const crack=Math.exp(-((q*3.6)%1)*22);sound=punch*.25+(s(832)*.08+s(1291)*.04+grit*.48)*crack*Math.exp(-q*2)+body*.25*(1-q);break;}
        case 'laser': phase+=tau*(100+480*Math.exp(-q*5))*pitch/rate;mod+=tau*(410-240*q)*pitch/rate;sound=Math.sin(phase+Math.sin(mod)*2*(1-q))*.36*Math.exp(-q*4)+punch*.2+grit*.18*Math.exp(-q*9);break;
        case 'arc': phase+=tau*180*pitch/rate;mod+=tau*(270+260*q)*pitch/rate;sound=(Math.sin(phase+Math.sin(mod)*3)*.24+grit*.42)*Math.exp(-q*4)*(.65+.35*Math.cos(q*27))+punch*.15;break;
        case 'missile': sound=(rumble*.9+body*.5)*Math.sin(Math.PI*q)*Math.exp(-q)+punch*.45+grit*.28*Math.exp(-q*17);break;
        case 'void': phase+=tau*(34+160*(1-q)**3)*pitch/rate;sound=Math.sin(phase+s(35)*.7)*.35*Math.sin(Math.PI*q)**.7+rumble*.4*(1-q)+s(92)*.08*Math.exp(-q*5);break;
        case 'flame': sound=(rumble+body*.65)*Math.sin(Math.PI*q)**.7*(.75+.25*Math.sin(q*35))+punch*.2+grit*.2*Math.exp(-q*8);break;
        case 'magic': phase+=tau*(230+320*Math.exp(-q*6))*pitch/rate;mod+=tau*171*pitch/rate;sound=Math.sin(phase+Math.sin(mod)*1.7)*.27*Math.exp(-q*5)+(s(340)*.07+s(510)*.04)*Math.exp(-q*4)+punch*.15;break;
        case 'sniper': phase+=tau*(85+220*Math.exp(-t*100))*pitch/rate;sound=(grit*.8+Math.sin(phase)*.55)*Math.exp(-q*15)+body*.4*Math.exp(-q*5)+(s(940)*.06)*Math.exp(-q*10);break;
        case 'split': {const split=Math.max(0,q-.3);sound=(punch*.45+grit*.45)*Math.exp(-q*7)+(s(225)*.17+s(339)*.11+grit*.3)*(q>.3?Math.exp(-split*15):0);break;}
        case 'echo': {const echo=Math.max(0,q-.36);sound=(s(135)*.45+grit*.45)*Math.exp(-q*12)+(s(112)*.24+body*.4)*(q>.36?Math.exp(-echo*12):0);break;}
        case 'pulse': phase+=tau*(90+210*Math.exp(-q*5))*pitch/rate;sound=Math.sin(phase+s(90)*(1-q)*2)*.38*Math.exp(-q*4)+rumble*.5*Math.exp(-Math.abs(q-.14)*18)+grit*.2*Math.exp(-q*12);break;
        case 'coin': sound=(s(710)*.13+s(1049)*.04)*Math.exp(-q*9)+grit*.25*Math.exp(-q*30)+s(180)*.15*Math.exp(-q*12);break;
        case 'core': sound=(s(65)*.55+rumble*.8)*Math.exp(-q*5)+grit*.35*Math.exp(-q*18);break;
        case 'summon': phase+=tau*(200+260*Math.exp(-q*4))/rate;sound=Math.sin(phase+s(180)*.7)*.25*Math.exp(-q*5)+grit*.25*Math.exp(-q*15);break;
        default:{const notes=kind==='loss'?[261.63,220,196]:kind==='win'?[261.63,329.63,392,523.25]:kind==='merge'?[220,330,440]:[330,440];const note=notes[Math.min(notes.length-1,Math.floor(q*notes.length))],envelope=Math.sin(Math.PI*(q*notes.length%1))**2;sound=(s(note)*.23+s(note*2)*.04)*envelope*(1-q*.5);}
      }
      if(profile){
        let texture=0;switch(profile.material){case 'metal':texture=(s(470)*.16+s(791)*.08)*Math.exp(-q*16);break;case 'crystal':texture=(s(890)*.12+s(1437)*.05)*Math.exp(-q*12);break;case 'spark':texture=grit*.3*Math.exp(-q*12);break;case 'air':texture=body*.6*Math.sin(Math.PI*q);break;case 'sub':texture=s(65)*.25*Math.exp(-q*5);break;case 'pulse':texture=s(190)*.13*Math.exp(-q*6);break;case 'breath':texture=rumble*.45*Math.sin(Math.PI*q);break;case 'ring':texture=(s(350)*.12+s(521)*.04)*Math.exp(-q*7);break;}
        sound+=texture*profile.mix;
        if(profile.pulses>1)sound*=.88+.12*Math.cos(q*Math.PI*profile.pulses);
      }
      // Two gentle low-pass stages remove brittle highs while retaining the attack.
      output+=.5*(sound-output);output2+=.5*(output-output2);
      result[i]=Math.tanh(output2*1.35)*attack*tail*.82;
    }
    if(profile?.echo){const original=result.slice(),delay=Math.round(profile.echo*rate);for(let i=delay;i<result.length;i++)result[i]=clamp(result[i]*.94+original[i-delay]*.09*(1-i/result.length),-.85,.85);}
    return result;
  }
  function musicUrl(_progress={},platform=globalThis.Capacitor?.getPlatform?.()||'web'){return 'assets/music/ranked-overdrive'+(platform==='android'?'.ogg':'.mp3');}
  const clipKey=(kind,id)=>kind+':'+(typeof id==='string'&&globalThis.SpaceTowerRankedVoices?.[id]?.kind===kind?id:'');
  async function loadAssets(){
    const read=async(url,json=false)=>{const response=await fetch(url);if(!response.ok)throw Error('Ranked audio unavailable');return json?response.json():response.arrayBuffer();};
    return Promise.allSettled([read('assets/audio/ranked-voices.json',true),read('assets/audio/ranked-voices.wav'),read(musicUrl())]);
  }
  class RankedAudio {
    constructor(loader=typeof location==='object'?loadAssets:null){
      this.context=null;this.voices=new Set();this.seen=new Map();this.support=new Map();this.last=new Map();this.clips={};
      this.settings={volume:.7,sfx:true,bgm:true};this.active=false;this.unlocked=false;this.clock=-1;this.musicOffset=0;
      try{const saved=Number(sessionStorage.getItem('spaceTowerRankedMusicOffset'));this.musicOffset=Number.isFinite(saved)?Math.max(0,saved):0;}catch{}
      // Fetch before the first gesture; decode off the main thread once unlocked.
      // No synthesis, HTML media playback or asset decoding occurs in a summon handler.
      this.assets=loader?Promise.resolve().then(loader).catch(()=>[]):Promise.resolve([]);
      this.readSettings();
    }
    readSettings(){try{const saved=JSON.parse(localStorage.getItem('spaceTowerSettings')||'{}');this.settings={volume:Number.isFinite(saved.volume)?clamp(saved.volume,0,1):.7,sfx:saved.sfx!==false,bgm:saved.bgm!==false};}catch{}return this.settings;}
    unlock(fromGesture=true){
      if(!this.settings.volume||!this.settings.sfx&&!this.settings.bgm)return Promise.resolve();
      this.unlocked=true;
      try{
        if(!this.context){
          const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AudioContext)return Promise.resolve();
          this.context=new AudioContext({latencyHint:'interactive'});
          this.gain=this.context.createGain();
          this.limiter=this.context.createDynamicsCompressor?.();
          if(this.limiter){for(const [key,value] of Object.entries({threshold:-20,knee:14,ratio:4,attack:.004,release:.16}))this.limiter[key].value=value;this.gain.connect(this.limiter);this.limiter.connect(this.context.destination);}else this.gain.connect(this.context.destination);
          this.musicGain=this.context.createGain();this.musicGain.connect(this.context.destination);
          this.gain.gain.value=this.settings.volume*.7;this.musicGain.gain.value=this.settings.volume*MUSIC_LEVEL;
        }
        if(this.context.state==='suspended'&&(!this.resuming||fromGesture&&this.autoResumePending)){
          this.autoResumePending=!fromGesture;
          this.resuming=this.context.resume().catch(()=>{}).finally(()=>{this.resuming=null;this.autoResumePending=false;this.startMusic();});
        }
        if(!this.decoding)this.decoding=this.assets.then(async([manifest,bank,music])=>{
          if(manifest?.status==='fulfilled'&&bank?.status==='fulfilled'){
            try{this.bank=await this.context.decodeAudioData(bank.value);this.clips=manifest.value.clips;}catch{/* Audio cannot stop the battle. */}
          }
          if(music?.status==='fulfilled')try{this.musicBuffer=await this.context.decodeAudioData(music.value);}catch{}
          this.startMusic();
        }).catch(()=>{});
        this.startMusic();return this.resuming||this.decoding;
      }catch{return Promise.resolve();}
    }
    prepare(){/* The complete 49-weapon bank is loaded once, including UI and core effects. */}
    startMusic(){
      const ctx=this.context;
      if(!this.unlocked||!this.active||!this.settings.bgm||!this.settings.volume||ctx?.state!=='running'||!this.musicBuffer||this.musicSource)return;
      const source=ctx.createBufferSource();source.buffer=this.musicBuffer;source.loop=true;source.connect(this.musicGain);
      this.musicSource=source;this.musicStartedAt=ctx.currentTime;source.start(0,this.musicOffset%this.musicBuffer.duration);
    }
    stopMusic(){if(!this.musicSource)return;this.musicOffset=(this.musicOffset+this.context.currentTime-this.musicStartedAt)%this.musicBuffer.duration;try{sessionStorage.setItem('spaceTowerRankedMusicOffset',String(this.musicOffset));}catch{}try{this.musicSource.stop();this.musicSource.disconnect();}catch{}this.musicSource=null;}
    stopVoices(){for(const voice of this.voices)try{voice.stop();}catch{}this.voices.clear();}
    setActive(value){value=!!value&&!this.failed;if(this.active===value)return;this.active=value;if(value){if(this.unlocked)this.unlock(false);}else{this.stopMusic();this.stopVoices();}}
    toggle(){this.readSettings();const enabled=!(this.settings.sfx||this.settings.bgm);let saved={};try{saved=JSON.parse(localStorage.getItem('spaceTowerSettings')||'{}');}catch{}localStorage.setItem('spaceTowerSettings',JSON.stringify({...saved,sfx:enabled,bgm:enabled}));this.settings.sfx=this.settings.bgm=enabled;if(enabled)this.unlock();else{this.stopMusic();this.stopVoices();}return enabled;}
    play(kind,id='',pan=0,volume=1){
      const ctx=this.context;if(!this.active||!this.settings.sfx||!this.settings.volume||ctx?.state!=='running')return false;
      const weapon=!!globalThis.SpaceTowerRankedVoices?.[id],priority=weapon?0:1;
      const now=ctx.currentTime,key=clipKey(kind,id),clip=this.clips[key],min=kind==='gatling'?.085:kind==='core'?.2:.14;
      if(!this.bank||!clip)return false;
      if(now-(this.last.get(key)??-10)<min)return false;
      if(weapon){if(now-(this.shotWindow??-1)>=.12){this.shotWindow=now;this.shotsInWindow=0;}if(this.shotsInWindow>=2)return false;}
      if(this.voices.size>=MAX_VOICES){const quiet=[...this.voices].find(v=>(v.priority||0)<priority);if(!quiet)return false;try{quiet.stop();}catch{}this.voices.delete(quiet);}
      this.last.set(key,now);if(weapon)this.shotsInWindow++;
      const source=ctx.createBufferSource(),gain=ctx.createGain();source.priority=priority;source.buffer=this.bank;gain.gain.value=volume*(weapon?.20:.24);source.connect(gain);
      this.duckUntil=now+.35;
      const stereo=ctx.createStereoPanner?.();if(stereo){stereo.pan.value=pan;gain.connect(stereo);stereo.connect(this.gain);}else gain.connect(this.gain);
      this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();stereo?.disconnect();};source.start(0,clip.offset,clip.duration);return true;
    }
    once(key,time,kind,id,pan,volume){if(this.seen.has(key))return;this.seen.set(key,time);this.play(kind,id,pan,volume);}
    update(match){
      if(this.failed)return;
      try{this.updateEffects(match);}catch(error){this.failed=true;this.setActive(false);console.warn('Ranked audio stopped; battle continues.',error);}
    }
    updateEffects(match){
      if(!match||!this.active)return;const time=match.elapsed;if(time<this.clock){this.seen.clear();this.support.clear();this.last.clear();}this.clock=time;
      if(this.musicSource){const target=this.settings.volume*MUSIC_LEVEL*(this.context.currentTime<(this.duckUntil||0)?.65:1);if(target!==this.musicTarget){this.musicTarget=target;this.musicGain.gain.setTargetAtTime(target,this.context.currentTime,.12);}}
      for(let side=0;side<2;side++){
        const board=match.sides[side],pan=side?.35:-.2,volume=side?.2:1;
        // Use the retained shot/beam events, so fast fire remains audible even
        // when a mobile snapshot arrives after several rounds have fired.
        for(const e of [...(board.projectiles||[]),...(board.beams||[])])if(time>=e.born&&time-e.born<.3){
          // Enemy beams intentionally have id:null. They are not turret fire.
          const d=SpaceTowerCatalog.byId.get(e.id);if(!d||e.enemy)continue;
          this.once(`f:${side}:${e.id}:${e.born}:${e.originX??e.x}:${e.originY??e.y}`,time,family(d),d.id,pan,volume);
        }
        for(const u of board.units)if(u){const d=SpaceTowerCatalog.byId.get(u.id),kind=family(d);if(!board.projectiles&&!board.beams&&u.firedAt>=0&&time-u.firedAt>=0&&time-u.firedAt<.3)this.once(`f:${side}:${u.uid}:${u.firedAt}`,time,kind,u.id,pan,volume);
          if((d.shield||d.slowAura)&&Math.floor(time)%6===0)this.once(`a:${side}:${u.uid}:${Math.floor(time/6)}`,time,kind,u.id,pan,volume*.35);
          const passive=u.id==='mining_gold'&&board.wave>1?board.wave:u.id==='emergency_shield'&&board.shieldsUsed?'shield':null,key=side+':'+u.uid;
          if(passive!==null&&this.support.get(key)!==passive){this.support.set(key,passive);this.play(kind,u.id,pan,volume*.6);}}
        for(const e of board.impacts)if(time>=e.born&&time-e.born<.3&&['core','summon','merge'].includes(e.kind))this.once(`e:${side}:${e.kind}:${e.born}:${e.x}:${e.y}`,time,e.kind,e.id||'',pan,volume);
      }
      if(this.seen.size>512)for(const [key,at] of this.seen)if(time-at>2)this.seen.delete(key);
    }
  }
  globalThis.SpaceTowerRankedAudio=Object.freeze({RankedAudio,family,samples,musicUrl,MUSIC_LEVEL,MAX_VOICES});
})();
