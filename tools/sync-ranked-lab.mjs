import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import '../turret-catalog.js';
import '../ranked-enemy-catalog.js';
import '../ranked-battle-core.js';
import '../ranked-ranks.js';
import '../ranked-audio-profiles.js';
import '../ranked-audio.js';
const destination=resolve(process.argv[2]||'C:/Users/User/Documents/space tower defense/public/ranked');
await mkdir(destination,{recursive:true});
const files=['turret-catalog.js','ranked-enemy-catalog.js','ranked-battle-core.js','ranked-ranks.js','ranked-audio-profiles.js'];
const hashes={};for(const file of files){await copyFile(new URL('../'+file,import.meta.url),resolve(destination,file));hashes[file]=createHash('sha256').update(await readFile(resolve(destination,file))).digest('hex');}
const C=SpaceTowerCatalog,R=SpaceTowerRanked,loadout=C.turrets.slice(0,5).map(t=>t.id),m=R.create({loadout});m.sides[0].wave=1;m.sides[0].spawnRemaining=0;const e=R.spawn(m,0,{kind:'basic'});e.x=0;e.y=0;R.tick(m,.05,{opponentAI:false});
const manifest={revision:'20261017-core-only-audio49',delivery:'ranked service and client code bundle',enemyTarget:'core',turretsDestructible:false,coreHp:'sum of five distinct loadout turret HP values',waveSeconds:R.WAVE_SECONDS,slotCount:R.SLOT_COUNT,maxStar:R.MAX_STAR,coreCollisionCoins:m.sides[0].coins-150,bgmGain:SpaceTowerRankedAudio.MUSIC_LEVEL,combatBgmDucking:.65,turrets:C.turrets.map(t=>({id:t.id,name:t.name,hp:C.health(t),voice:SpaceTowerRankedVoices[t.id]})),ranks:SpaceTowerRanks.tiers,waves:[1,2,5,10,20].map(wave=>({wave,...R.waveStats(wave)})),hashes};
await writeFile(resolve(destination,'rules.json'),JSON.stringify(manifest,null,2));
await copyFile(new URL('./ranked-lab.html',import.meta.url),resolve(destination,'index.html'));
console.log(JSON.stringify({destination,voices:manifest.turrets.length,files:files.length,revision:manifest.revision}));
