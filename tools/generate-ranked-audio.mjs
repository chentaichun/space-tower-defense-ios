/* Build original ranked music and the 49-weapon audio sprite, outside gameplay. */
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import '../ranked-audio-profiles.js';
import '../ranked-audio.js';
const root=fileURLToPath(new URL('../',import.meta.url)),rate=24000;
function wav(pcm){
  const out=Buffer.alloc(44+pcm.length*2);out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(pcm.length*2,40);
  for(let i=0;i<pcm.length;i++)out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm[i]))*32767),44+i*2);
  return out;
}
const clips={},parts=[];let frames=0;
for(const [kind,id] of [...Object.entries(SpaceTowerRankedVoices).map(([id,p])=>[p.kind,id]),...['cannon','core','summon','merge','upgrade','win','loss'].map(k=>[k,''])]){
  const pcm=SpaceTowerRankedAudio.samples(kind,id,rate);clips[kind+':'+id]={offset:frames/rate,duration:pcm.length/rate};parts.push(pcm,new Float32Array(480));frames+=pcm.length+480;
}
const bank=new Float32Array(frames);let offset=0;for(const p of parts){bank.set(p,offset);offset+=p.length;}
await mkdir(resolve(root,'assets/audio'),{recursive:true});
await writeFile(resolve(root,'assets/audio/ranked-voices.wav'),wav(bank));
await writeFile(resolve(root,'assets/audio/ranked-voices.json'),JSON.stringify({version:1,rate,clips},null,2)+'\n');

// 144 BPM, sixteen bars in D minor. Circular event tails make a gapless loop.
const bpm=144,beat=60/bpm,bars=16,score=new Float32Array(Math.round(bars*4*beat*rate));
const freq=n=>440*2**((n-69)/12),tau=Math.PI*2;
let seed=21734;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
function add(at,duration,voice,gain=1){const start=Math.round(at*rate),length=Math.round(duration*rate);for(let i=0;i<length;i++){const t=i/rate,q=i/length;score[(start+i)%score.length]+=voice(t,q)*gain;}}
const roots=[38,34,43,45];
for(let b=0;b<bars*4;b++){
  const bar=Math.floor(b/4),rootNote=roots[Math.floor(bar/4)],at=b*beat;
  add(at,.24,t=>Math.sin(tau*(45*t+7*(1-Math.exp(-28*t))))*Math.exp(-18*t),.38);
  if(b%2) add(at,.15,(t,q)=>(noise()*.75+Math.sin(tau*180*t)*.25)*Math.exp(-26*t)*Math.min(1,t/.002),.2);
  for(let h=0;h<4;h++)add(at+h*beat/4,.045,(t,q)=>noise()*Math.exp(-80*t)*Math.sin(Math.PI*Math.min(1,t/.002)),h%2?.022:.032);
  for(let n=0;n<2;n++){
    const bass=freq(rootNote+(b%4===3&&n===1?7:0));
    add(at+n*beat/2,beat*.45,(t,q)=>(Math.sin(tau*bass*t)+.2*Math.sin(tau*bass*2*t))*Math.min(1,t/.008)*Math.exp(-q*2.5)*Math.min(1,(1-q)*12),.18);
  }
  const arp=[0,7,12,3,0,10,7,15],minor=rootNote===45?[0,4,7]:[0,3,7];
  for(let n=0;n<2;n++){
    const note=rootNote+24+arp[(b*2+n+(bar%4===3?2:0))%8],f=freq(note);
    add(at+n*beat/2,beat*.46,(t,q)=>(Math.sin(tau*f*t)+.22*Math.sin(tau*f*2*t))*Math.min(1,t/.012)*Math.exp(-q*4)*Math.min(1,(1-q)*15),bar%4<2?.075:.1);
  }
  if(b%4===0)for(const interval of minor){const f=freq(rootNote+12+interval);add(at,beat*4,(t,q)=>Math.sin(tau*f*t)*Math.sin(Math.PI*q)**2,.026);}
  if(b%16===15)for(let n=0;n<4;n++)add(at+(n+2)*beat/8,.08,t=>noise()*Math.exp(-45*t),.04+n*.008);
}
for(let i=0;i<score.length;i++)score[i]=Math.tanh(score[i]*1.3)*.85;
const output=resolve(root,'tmp/ranked-audio-assets');await mkdir(output,{recursive:true});
const music=resolve(output,'ranked-overdrive.wav');await writeFile(music,wav(score));
for(const [ext,codec] of [['ogg','libvorbis'],['mp3','libmp3lame']]){
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',music,'-c:a',codec,...(ext==='ogg'?['-q:a','4']:['-b:a','96k']),resolve(root,'assets/music/ranked-overdrive.'+ext)],{stdio:'inherit'});
  if(result.status!==0)throw new Error('Music encoding failed');
}
console.log(JSON.stringify({weapons:49,clips:Object.keys(clips).length,bankSeconds:frames/rate,musicBpm:bpm,musicSeconds:score.length/rate}));
