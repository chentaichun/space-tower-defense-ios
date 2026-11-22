import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../v2-features.js',import.meta.url),'utf8');
test('normal combat renders persistent abilities with geometry even without particle capacity',()=>{
 let calls=0;const gradient={addColorStop(){}};const ctx=new Proxy({},{get:(_,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>gradient:(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),key+' received non-finite geometry');calls++;},set:()=>true});
 const sandbox={ctx,performance:{now:()=>1000},tower:{x:150,y:160},v2Shurikens:[{t:.4,reach:130,width:45,a:0,cx:80,cy:130}],v2Pentas:[{t:.5,dur:.75,x0:70,y0:180,tx:180,ty:80,spin:0}],v2PhoenixDives:[{start:0,life:1,r:85}],v2IceWalls:[{angle:-1.6,r:90}],v2Singularities:[{x:150,y:130}],v2Leviathans:[{start:-2,t:.8,r:100}],v2Freezes:[{enemy:{x:150,y:130,hp:100}}]};
 vm.createContext(sandbox);vm.runInContext(readFileSync(new URL('../ranked-shot-styles.js',import.meta.url),'utf8'),sandbox);
 vm.runInContext(source.slice(source.indexOf('function drawNormalAbilityArt()'),source.indexOf('const normalAbilityBaseDrawEffects')),sandbox);
 for(const key of Object.keys(sandbox).filter(k=>k.startsWith('v2'))){const saved=Object.fromEntries(Object.keys(sandbox).filter(k=>k.startsWith('v2')).map(k=>[k,sandbox[k]]));for(const k of Object.keys(saved))sandbox[k]=k===key?saved[k]:[];calls=0; sandbox.drawNormalAbilityArt();assert.ok(calls>5,key+' must draw visible geometry');Object.assign(sandbox,saved);}
});
