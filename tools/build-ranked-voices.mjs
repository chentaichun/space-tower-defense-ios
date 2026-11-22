/* Rebuild only the ranked weapon/event voice sprite (assets/audio/ranked-voices.*).
   Unlike generate-ranked-audio.mjs this never touches the music track. */
import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import '../ranked-audio-profiles.js';
import '../ranked-audio.js';
const root=fileURLToPath(new URL('../',import.meta.url)),rate=24000;
function wav(pcm){
  const out=Buffer.alloc(44+pcm.length*2);out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(pcm.length*2,40);
  for(let i=0;i<pcm.length;i++)out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm[i]))*32767),44+i*2);
  return out;
}
// Recorded clips (already processed to 24 kHz mono 16-bit) that are used as-is instead of synthesis.
// phoenix-cry.wav: made from "Screaming Hawk" by PsychoBird (SoundBible, CC BY 3.0) - see CREDITS.md.
async function recorded(name){const b=await readFile(resolve(root,'assets/audio/source',name));let off=12,data=null;
  while(off+8<=b.length){const id=b.toString('ascii',off,off+4),size=b.readUInt32LE(off+4);if(id==='data')data=b.subarray(off+8,off+8+size);off+=8+size+(size&1);}
  const pcm=new Float32Array(data.length/2);for(let i=0;i<pcm.length;i++)pcm[i]=data.readInt16LE(i*2)/32768;return pcm;}
const recordings={'phoenixCry:':await recorded('phoenix-cry.wav')};
const clips={},parts=[];let frames=0;
for(const [kind,id] of [...Object.entries(SpaceTowerRankedVoices).map(([id,p])=>[p.kind,id]),...['cannon','core','summon','merge','upgrade','win','loss','phoenixCry'].map(k=>[k,''])]){
  const pcm=recordings[kind+':'+id]||SpaceTowerRankedAudio.samples(kind,id,rate);clips[kind+':'+id]={offset:frames/rate,duration:pcm.length/rate};parts.push(pcm,new Float32Array(480));frames+=pcm.length+480;
}
const bank=new Float32Array(frames);let offset=0;for(const p of parts){bank.set(p,offset);offset+=p.length;}
await writeFile(resolve(root,'assets/audio/ranked-voices.wav'),wav(bank));
await writeFile(resolve(root,'assets/audio/ranked-voices.json'),JSON.stringify({version:1,rate,clips},null,2)+'\n');
console.log('Ranked voice sprite rebuilt:',Object.keys(clips).length,'clips');
