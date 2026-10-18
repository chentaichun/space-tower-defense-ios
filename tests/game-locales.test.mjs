import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const files=['v2-i18n.js','game-locale.js','game-locale-data.js','game-locale-intro.js','game-locale-ranked.js','game-locale-extra.js','game-locale-aliases.js'];
function context(){const ctx=vm.createContext({console});ctx.window=ctx;for(const file of ['turret-catalog.js',...files])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),ctx);ctx.SpaceTowerLocale.register(ctx.V2_I18N);ctx.SpaceTowerLocale.compile();return ctx;}
test('all new game messages and all 49 turret descriptions have six complete versions',()=>{
 const ctx=context(),L=ctx.SpaceTowerLocale;
 for(const [source,row] of L.entries){const params=s=>[...new Set(s.match(/\{\d+\}/g)||[])].sort();for(const lang of L.languages){assert.ok(row[lang]?.trim(),source+': '+lang);assert.deepEqual(params(row[lang]),params(source),source+': placeholders in '+lang);}}
 assert.equal(ctx.SpaceTowerCatalog.turrets.length,49);for(const lang of L.languages){const turrets=ctx.V2_I18N[lang].turrets;for(const {id} of ctx.SpaceTowerCatalog.turrets)assert.ok(turrets[id]?.[0]&&turrets[id]?.[1],lang+': '+id);}
});
test('localized dynamic HP and currency messages retain numbers and translate nested labels',()=>{
 const L=context().SpaceTowerLocale;
 for(const lang of ['en','ko','ru','es']){L.setLanguage(lang);for(const text of ['基本砲台，G1，突擊，HP 100，已出戰','G1 · 出戰','已鎖定 · 2,000 黑曜石 · 卷 0','G1 · 突擊','VIP 銀 · 輔助','VIP 星殿','排位初始 HP 100','物攻倍率 × 0.7','攻速倍率 × 1.25']){const out=L.text(text);assert.ok(!/[\u3400-\u9fff]/.test(out),lang+': '+out);for(const number of text.match(/\d[\d,]*/g)||[])assert.ok(out.includes(number));}}
 for(const lang of ['ja','ko','ru','es']){L.setLanguage(lang);for(const text of ['Ranked HP 100','Magic multiplier × 1.25','Rate multiplier × 0.7'])assert.notEqual(L.text(text),text,lang+': '+text);}
 L.setLanguage('zh');assert.equal(L.text('HP'),'HP');assert.equal(L.text('強化'),'強化');assert.equal(L.text('G1 · 出戰'),'G1 · 出戰');
});
test('locale scripts are included before game logic on both entry pages and in mobile packaging',()=>{
 for(const page of ['index.html','ranked.html']){const html=readFileSync(new URL('../'+page,import.meta.url),'utf8');for(const file of files)assert.ok(html.includes(file),page+': '+file);assert.ok(html.indexOf('game-locale.js')<html.indexOf(page==='ranked.html'?'ranked-mode.js':'game-intro.js'));}
 const packaging=readFileSync(new URL('../tools/ios-release.mjs',import.meta.url),'utf8');for(const file of files.filter(x=>x!=='v2-i18n.js'))assert.ok(packaging.includes(file),file);
 for(const preview of ['preview.html','phone-preview.html'])assert.ok(!packaging.includes("'"+preview+"'"),'Review controls must not ship: '+preview);
});
