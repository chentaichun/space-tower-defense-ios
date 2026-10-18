import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import '../turret-catalog.js';
import '../ranked-audio-profiles.js';
import '../ranked-audio.js';
import '../ranked-ranks.js';
const A=SpaceTowerRankedAudio,C=SpaceTowerCatalog;
test('all 49 turrets have authored, distinct, audible and bounded PCM signatures',()=>{
  assert.equal(Object.keys(SpaceTowerRankedVoices).length,49);const hashes=new Set(),voices=new Set();
  for(const d of C.turrets){
    const profile=SpaceTowerRankedVoices[d.id];assert.ok(profile,d.id);voices.add(JSON.stringify(profile));
    const pcm=A.samples(A.family(d),d.id);let peak=0,energy=0;
    for(const value of pcm){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value;}
    assert.ok(peak<=.9&&peak>.05,d.id+' peak');assert.ok(Math.sqrt(energy/pcm.length)>.01,d.id+' audible');
    hashes.add(createHash('sha256').update(Buffer.from(pcm.buffer)).digest('hex'));
  }
  assert.equal(hashes.size,49);assert.equal(voices.size,49);
  assert.notEqual(A.family(C.byId.get('gatling')),A.family(C.byId.get('vip_star_phoenix')));
  assert.notEqual(A.family(C.byId.get('royal_tide')),A.family(C.byId.get('shield_generator')));
});
test('ranked has its own quieter battle loop and does not reset the home music selection',()=>{
  const progress={equippedMusic:'ion_islands',ownedMusic:['ion_islands']};
  assert.equal(A.musicUrl(progress),'assets/music/ranked-overdrive.mp3');
  assert.equal(A.musicUrl({},'android'),'assets/music/ranked-overdrive.ogg');
  assert.equal(A.musicUrl({},'ios'),'assets/music/ranked-overdrive.mp3');
  assert.equal(progress.equippedMusic,'ion_islands');assert.equal(A.MUSIC_LEVEL,.14);
});
test('duplicate network presentation frames do not replay weapon and support sounds',()=>{
  const audio=new A.RankedAudio(),played=[];audio.active=true;audio.play=(...args)=>played.push(args);
  const side={units:[{uid:1,id:'gatling',firedAt:6},{uid:2,id:'shield_generator',firedAt:-1}],impacts:[{kind:'core',born:6,x:0,y:0}]};
  const match={elapsed:6.05,sides:[side,{units:[],impacts:[]}]};
  for(let i=0;i<30;i++)audio.update(match);
  assert.deepEqual(played.map(p=>p[0]),['gatling','shield','core']);
  match.elapsed=6.15;side.units[0].firedAt=6.1;audio.update(match);assert.equal(played.length,4);
  audio.active=false;side.units[0].firedAt=6.15;audio.update(match);assert.equal(played.length,4);
});
test('rank badges change at exact thresholds, remain localized and never change combat stats',()=>{
  const R=SpaceTowerRanks;
  for(const tier of R.tiers){
    assert.equal(R.describe(tier.min).index,tier.index);
    if(tier.min)assert.equal(R.describe(tier.min-1).index,tier.index-1);
    for(const lang of ['zh','en','ja','ko','ru','es'])assert.ok(R.describe(tier.min,lang).name);
    assert.ok(R.badge(tier.index).includes('<svg'));assert.ok(!('damage' in tier));
  }
  assert.equal(R.describe(-100).cups,0);assert.equal(R.describe(1000000).cups,100000);
  assert.equal(R.describe(6000).progress,1);assert.equal(R.describe(1200).next,1500);
  assert.equal(new Set(R.tiers.map(t=>R.badge(t.index))).size,7);
});

test('retained mobile shots play at their displayed firing times and a salvo sounds only once',()=>{
  const audio=new A.RankedAudio(),played=[];audio.active=true;audio.play=(...args)=>played.push(args);
  const shots=[0,.1,.2].map((born,i)=>({uid:i,id:'gatling',born,originX:.5,originY:0}));
  const side={units:[],impacts:[],projectiles:[...shots,{...shots[1],uid:99}],beams:[]},match={elapsed:0,sides:[side,{units:[],impacts:[],projectiles:[],beams:[]}]};
  for(let frame=0;frame<18;frame++){match.elapsed=frame/60;audio.update(match);}
  assert.equal(played.length,3);assert.ok(played.every(p=>p[0]==='gatling'));
});

const bankManifest=JSON.parse(readFileSync(new URL('../assets/audio/ranked-voices.json',import.meta.url)));
test('the packaged sprite contains the exact 49 authored voices plus UI sounds',()=>{
  const wav=readFileSync(new URL('../assets/audio/ranked-voices.wav',import.meta.url));
  assert.equal(wav.readUInt32LE(24),24000);assert.equal(Object.keys(bankManifest.clips).length,56);
  for(const d of C.turrets){const kind=A.family(d),clip=bankManifest.clips[kind+':'+d.id],pcm=A.samples(kind,d.id);
    assert.ok(clip,d.id);assert.equal(Math.round(clip.duration*24000),pcm.length);
    for(let i=0;i<pcm.length;i+=47)assert.ok(Math.abs(wav.readInt16LE(44+Math.round(clip.offset*24000+i)*2)/32767-pcm[i])<.00004,d.id);
  }
});
test('busy combat caps voices and ducks the quieter BGM without changing saved volume',()=>{
  const audio=new A.RankedAudio();audio.active=true;audio.settings.volume=.7;
  const node=()=>({connect(){},disconnect(){},gain:{value:0,setTargetAtTime(v){this.value=v;}},pan:{value:0}});
  audio.context={state:'running',currentTime:1,createBuffer:()=>({copyToChannel(){}}),createGain:node,createStereoPanner:node,createBufferSource:()=>({...node(),start(){},stop(){this.onended();}})};
  audio.gain=node();audio.musicGain=node();audio.musicBuffer={duration:30};audio.musicStartedAt=0;
  audio.musicSource={stop(){},disconnect(){}};audio.bank={};audio.clips=bankManifest.clips;
  for(const d of C.turrets){audio.context.currentTime+=.13;audio.play(A.family(d),d.id);}
  assert.equal(audio.voices.size,8);
  assert.equal(audio.play('core'),true);assert.equal(audio.voices.size,8);
  audio.update({elapsed:1,sides:[{units:[],impacts:[]},{units:[],impacts:[]}]});
  assert.ok(audio.musicGain.gain.value<.7*A.MUSIC_LEVEL);assert.equal(audio.settings.volume,.7);
  audio.setActive(false);assert.equal(audio.voices.size,0);assert.equal(audio.musicSource,null);
});

test('enemy beams with null IDs and malformed events cannot halt the animation audio pass',()=>{
  const audio=new A.RankedAudio(),played=[];audio.active=true;audio.play=(...args)=>played.push(args);
  const match={elapsed:1,sides:[{units:[],impacts:[],beams:[{id:null,enemy:true,born:1,x:.5,y:.2},{id:33,born:1,x:.4,y:.1},{id:'gatling',born:1,x:.1,y:0}]},{units:[],impacts:[]}]};
  assert.doesNotThrow(()=>audio.update(match));assert.equal(audio.failed,undefined);
  assert.equal(played.length,1);assert.equal(played[0][1],'gatling');
  assert.doesNotThrow(()=>A.samples('cannon',null));assert.doesNotThrow(()=>A.samples('cannon',33));
});

test('repeated input never recreates playback; suspend, mute and resume preserve the loop position',async()=>{
  const prior=globalThis.AudioContext,calls={contexts:0,resumes:0,decodes:0,starts:[]};
  const node=()=>({connect(){},disconnect(){},gain:{value:0,setTargetAtTime(v){this.value=v;}},pan:{value:0}});
  globalThis.AudioContext=class {
    constructor(){calls.contexts++;this.state='suspended';this.currentTime=1;this.destination={};}
    async resume(){calls.resumes++;this.state='running';}
    async decodeAudioData(){calls.decodes++;return {duration:30};}
    createGain(){return node();} createStereoPanner(){return node();}
    createBufferSource(){return {...node(),start(...args){calls.starts.push({loop:this.loop,args});},stop(){this.onended?.();}};}
  };
  try{
    const audio=new A.RankedAudio(async()=>[bankManifest,new ArrayBuffer(4),new ArrayBuffer(4)].map(value=>({status:'fulfilled',value})));
    audio.setActive(true);for(let i=0;i<40;i++)audio.unlock();await audio.decoding;
    assert.equal(calls.contexts,1);assert.equal(calls.resumes,1);assert.equal(calls.decodes,2);
    assert.equal(calls.starts.filter(s=>s.loop).length,1);
    for(let i=0;i<20;i++){audio.context.currentTime+=.2;audio.unlock();audio.play('summon','rookie_guard');}
    assert.equal(calls.resumes,1);assert.equal(calls.decodes,2);assert.equal(calls.starts.filter(s=>s.loop).length,1);
    audio.context.currentTime=8;audio.setActive(false);assert.equal(audio.musicOffset,7);
    audio.context.currentTime=14;audio.setActive(true);assert.equal(calls.starts.filter(s=>s.loop).length,2);
    assert.equal(calls.starts.filter(s=>s.loop)[1].args[1],7);assert.equal(calls.contexts,1);
  }finally{globalThis.AudioContext=prior;}
});

test('returning from home resumes the saved track and a blocked autoplay still unlocks on a gesture',async()=>{
  const previous=globalThis.AudioContext,storage=globalThis.sessionStorage;let resumeCalls=0,firstResume,offset,starts=0,saved='6.5';
  globalThis.sessionStorage={getItem:()=>saved,setItem:(_k,value)=>saved=value};
  const node=()=>({connect(){},disconnect(){},gain:{value:0}});
  globalThis.AudioContext=class{
    constructor(){this.state='suspended';this.currentTime=10;this.destination={};}
    resume(){resumeCalls++;if(resumeCalls===1)return new Promise(resolve=>firstResume=resolve);this.state='running';firstResume();return Promise.resolve();}
    createGain(){return node();}
    async decodeAudioData(){return {duration:30};}
    createBufferSource(){return {...node(),start(_at,at){starts++;offset=at;},stop(){}};}
  };
  try{
    const audio=new A.RankedAudio(async()=>[bankManifest,new ArrayBuffer(4),new ArrayBuffer(4)].map(value=>({status:'fulfilled',value})));
    audio.setActive(true);audio.unlock(false);await audio.decoding;
    assert.equal(starts,0);audio.setActive(false);audio.setActive(true);assert.equal(resumeCalls,1);
    await audio.unlock();assert.equal(resumeCalls,2);assert.equal(starts,1);assert.equal(offset,6.5);
    audio.context.currentTime=12;audio.setActive(false);assert.equal(Number(saved),8.5);
  }finally{globalThis.AudioContext=previous;globalThis.sessionStorage=storage;}
});
